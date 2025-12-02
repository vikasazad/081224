"use client";
import { db } from "@/config/db/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import {
  sendKitchenAlertToManager,
  sendDeliveryReadinessRequest,
  sendOrderEscalationToManager,
} from "@/app/modules/staff/utils/whatsapp-staff-manager";
import { OrderStatus } from "@/types/kitchen";
import { getOnlineStaff } from "@/app/modules/staff/utils/staffData";

export interface KitchenTimerConfig {
  waitingAlertMinutes: number;
  totalPreparationMinutes: number;
  deliveryReadinessMinutes: number;
  onTimeThresholdMinutes: number;
  delayedThresholdMinutes: number;
  escalationTimeoutMinutes: number;
}

class KitchenTimerService {
  private static instance: KitchenTimerService;
  private intervalRef: NodeJS.Timeout | null = null;
  private unsubscribe: (() => void) | null = null;
  private configUnsubscribe: (() => void) | null = null;
  private orders: any = {};
  private alertedOrders = new Set<string>();
  private escalatedOrders = new Set<string>();
  private deliveryReadinessTriggered = new Set<string>();
  private configListeners: ((config: KitchenTimerConfig) => void)[] = [];
  private deliveryAlertListeners: ((
    orderId: string,
    deliveryPartner: { name: string; contact: string }
  ) => void)[] = [];
  private kitchenTimerConfig: KitchenTimerConfig = {
    waitingAlertMinutes: 10, // Alert after 10 minutes if order hasn't been started
    totalPreparationMinutes: 20, // Total time for order preparation
    deliveryReadinessMinutes: 10, // Minutes remaining when to send delivery readiness request
    onTimeThresholdMinutes: 30, // Orders completed within this time are "on time"
    delayedThresholdMinutes: 30, // Orders taking longer than this are "delayed"
    escalationTimeoutMinutes: 40, // Total time before escalating to manager
  };

  private constructor() {
    this.initializeConfig();
  }

  static getInstance(): KitchenTimerService {
    if (!KitchenTimerService.instance) {
      KitchenTimerService.instance = new KitchenTimerService();
    }
    return KitchenTimerService.instance;
  }

  private initializeConfig() {
    console.log("Initializing Kitchen Timer Config from database...");

    // Set up Firestore listener for real-time config updates
    const infoRef = doc(db, "vikumar.azad@gmail.com", "info");
    this.configUnsubscribe = onSnapshot(
      infoRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const dbConfig = data?.business?.kitchenTimerConfig;

          if (dbConfig) {
            // Merge DB config with defaults (in case some fields are missing)
            this.kitchenTimerConfig = {
              waitingAlertMinutes:
                dbConfig.waitingAlertMinutes ??
                this.kitchenTimerConfig.waitingAlertMinutes,
              totalPreparationMinutes:
                dbConfig.totalPreparationMinutes ??
                this.kitchenTimerConfig.totalPreparationMinutes,
              deliveryReadinessMinutes:
                dbConfig.deliveryReadinessMinutes ??
                this.kitchenTimerConfig.deliveryReadinessMinutes,
              onTimeThresholdMinutes:
                dbConfig.onTimeThresholdMinutes ??
                this.kitchenTimerConfig.onTimeThresholdMinutes,
              delayedThresholdMinutes:
                dbConfig.delayedThresholdMinutes ??
                this.kitchenTimerConfig.delayedThresholdMinutes,
              escalationTimeoutMinutes:
                dbConfig.escalationTimeoutMinutes ??
                this.kitchenTimerConfig.escalationTimeoutMinutes,
            };
            console.log(
              "Kitchen Timer Config updated from database:",
              this.kitchenTimerConfig
            );
            // Notify all listeners about the config update
            this.notifyConfigListeners();
          } else {
            console.log(
              "No kitchenTimerConfig found in database, using defaults"
            );
            // Still notify listeners even with defaults
            this.notifyConfigListeners();
          }
        }
      },
      (error) => {
        console.error(
          "Kitchen Timer Service: Error getting config updates:",
          error
        );
        console.log("Continuing with default configuration");
      }
    );
  }

  getConfig(): KitchenTimerConfig {
    return this.kitchenTimerConfig;
  }

  // Subscribe to config changes
  onConfigChange(listener: (config: KitchenTimerConfig) => void): () => void {
    this.configListeners.push(listener);
    // Immediately call listener with current config
    listener(this.kitchenTimerConfig);

    // Return unsubscribe function
    return () => {
      this.configListeners = this.configListeners.filter((l) => l !== listener);
    };
  }

  // Notify all listeners about config changes
  private notifyConfigListeners() {
    this.configListeners.forEach((listener) => {
      listener(this.kitchenTimerConfig);
    });
  }

  // Subscribe to delivery alert events
  onDeliveryAlert(
    listener: (
      orderId: string,
      deliveryPartner: { name: string; contact: string }
    ) => void
  ): () => void {
    this.deliveryAlertListeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.deliveryAlertListeners = this.deliveryAlertListeners.filter(
        (l) => l !== listener
      );
    };
  }

  // Notify all listeners about delivery alerts
  private notifyDeliveryAlertListeners(
    orderId: string,
    deliveryPartner: { name: string; contact: string }
  ) {
    this.deliveryAlertListeners.forEach((listener) => {
      listener(orderId, deliveryPartner);
    });
  }

  start() {
    if (this.intervalRef) {
      console.log("Kitchen Timer Service already running");
      return; // Already running
    }

    console.log("Starting Kitchen Timer Service...");

    // Set up Firestore listener for real-time updates
    const hotelRef = doc(db, "vikumar.azad@gmail.com", "hotel");
    this.unsubscribe = onSnapshot(
      hotelRef,
      (snap) => {
        if (snap.exists()) {
          this.orders = snap.data().kitchen?.orders || {};
          console.log(
            `Kitchen Timer Service: Updated orders, total: ${
              Object.keys(this.orders).length
            }`
          );
        }
      },
      (error) => {
        console.error("Kitchen Timer Service: Error getting updates:", error);
      }
    );

    // Start timer interval - check every 30 seconds
    this.intervalRef = setInterval(() => {
      this.checkForWaitingOrders();
      this.checkForEscalatedOrders();
      this.checkForDeliveryReadiness();
    }, 30000);

    console.log("Kitchen Timer Service started successfully");
  }

  stop() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.configUnsubscribe) {
      this.configUnsubscribe();
      this.configUnsubscribe = null;
    }
    console.log("Kitchen Timer Service stopped");
  }

  private async checkForWaitingOrders() {
    const now = new Date().getTime();
    const alertThreshold =
      this.kitchenTimerConfig.waitingAlertMinutes * 60 * 1000;

    for (const order of Object.values(this.orders) as any[]) {
      if (
        order.status === OrderStatus.New &&
        !this.alertedOrders.has(order.id) &&
        order.createdAt
      ) {
        const orderCreatedTime = new Date(order.createdAt).getTime();
        const waitingTime = now - orderCreatedTime;

        if (waitingTime >= alertThreshold) {
          try {
            this.alertedOrders.add(order.id);
            await sendKitchenAlertToManager(
              order.id,
              order.customerName,
              order.totalAmount,
              order.items,
              Math.floor(waitingTime / 60000)
            );
            console.log(
              `Kitchen Timer Service: Alert sent for order ${
                order.id
              } after ${Math.floor(waitingTime / 60000)} minutes`
            );
          } catch (error) {
            console.error(
              `Kitchen Timer Service: Failed to send alert for order ${order.id}:`,
              error
            );
          }
        }
      }
    }
  }

  private async checkForEscalatedOrders() {
    const now = new Date().getTime();
    const escalationThreshold =
      this.kitchenTimerConfig.escalationTimeoutMinutes * 60 * 1000;

    for (const order of Object.values(this.orders) as any[]) {
      if (
        (order.status === OrderStatus.New ||
          order.status === OrderStatus.InPreparation) &&
        !this.escalatedOrders.has(order.id) &&
        order.createdAt
      ) {
        const orderCreatedTime = new Date(order.createdAt).getTime();
        const totalTime = now - orderCreatedTime;

        if (totalTime >= escalationThreshold) {
          try {
            this.escalatedOrders.add(order.id);
            await sendOrderEscalationToManager(
              order.id,
              order.customerName,
              order.totalAmount,
              order.items,
              order.status,
              Math.floor(totalTime / 60000),
              this.kitchenTimerConfig.escalationTimeoutMinutes
            );
            console.log(
              `Kitchen Timer Service: Escalation sent for order ${
                order.id
              } after ${Math.floor(totalTime / 60000)} minutes`
            );
          } catch (error) {
            console.error(
              `Kitchen Timer Service: Failed to send escalation for order ${order.id}:`,
              error
            );
          }
        }
      }
    }
  }

  private async checkForDeliveryReadiness() {
    console.log("checkForDeliveryReadiness");
    const now = new Date().getTime();

    for (const order of Object.values(this.orders) as any[]) {
      // Only check orders that are in preparation
      // console.log("order", order);

      // For delivery orders (DEL), attendant info is optional - we'll fetch delivery partner
      const isDeliveryOrder = order.id?.includes("DEL");
      const hasAttendantInfo = order.attendantName && order.attendantContact;

      if (
        order.status === OrderStatus.InPreparation &&
        !this.deliveryReadinessTriggered.has(order.id) &&
        order.startedAt &&
        (hasAttendantInfo || isDeliveryOrder) // Allow delivery orders without attendant
      ) {
        console.log("HERE 1");
        const startedTime = new Date(order.startedAt).getTime();
        const elapsedTime = now - startedTime;
        const totalDuration =
          this.kitchenTimerConfig.totalPreparationMinutes * 60 * 1000;
        const remaining = Math.max(0, totalDuration - elapsedTime);
        const deliveryReadinessThreshold =
          this.kitchenTimerConfig.deliveryReadinessMinutes * 60 * 1000;

        // Trigger when remaining time is less than or equal to threshold
        if (
          remaining <= deliveryReadinessThreshold &&
          remaining > deliveryReadinessThreshold - 60 * 1000 // 1 minute window
        ) {
          console.log("HERE 2");
          try {
            const deliveryPartner = {
              name: "",
              contact: "",
              notificationToken: "",
              orders: [],
            };
            // For delivery orders, fetch an available delivery partner
            if (order.id.includes("DEL")) {
              const res = await getOnlineStaff("delivery");
              if (res) {
                deliveryPartner.name = res.name;
                deliveryPartner.contact = res.contact;
              }
            }

            // Determine final recipient
            const recipientName = order.attendantName?.trim()
              ? order.attendantName
              : deliveryPartner.name;
            const recipientContact = order.attendantContact?.trim()
              ? order.attendantContact
              : deliveryPartner.contact;

            // Notify listeners about the delivery partner assignment
            if (deliveryPartner.name && deliveryPartner.contact) {
              this.notifyDeliveryAlertListeners(order.id, {
                name: deliveryPartner.name,
                contact: deliveryPartner.contact,
              });
            }

            this.deliveryReadinessTriggered.add(order.id);
            await sendDeliveryReadinessRequest(
              order.id,
              recipientName,
              recipientContact,
              order.customerName,
              `Order ${order.id}`,
              this.kitchenTimerConfig.deliveryReadinessMinutes
            );
            console.log(
              `Kitchen Timer Service: Delivery readiness request sent for order ${order.id} to ${recipientName}`
            );
          } catch (error) {
            console.error(
              `Kitchen Timer Service: Failed to send delivery readiness for order ${order.id}:`,
              error
            );
          }
        }
      }
    }
  }

  // Method to clear alerts when order status changes
  clearOrderAlerts(orderId: string) {
    this.alertedOrders.delete(orderId);
    this.escalatedOrders.delete(orderId);
    this.deliveryReadinessTriggered.delete(orderId);
    console.log(`Kitchen Timer Service: Cleared alerts for order ${orderId}`);
  }

  // Method to manually trigger a check (useful for immediate feedback)
  triggerImmediateCheck() {
    console.log("Kitchen Timer Service: Manual check triggered");
    this.checkForWaitingOrders();
    this.checkForEscalatedOrders();
    this.checkForDeliveryReadiness();
  }

  // Get current orders (useful for debugging)
  getOrders() {
    return this.orders;
  }

  // Check if service is running
  isRunning(): boolean {
    return this.intervalRef !== null;
  }
}

export default KitchenTimerService;
