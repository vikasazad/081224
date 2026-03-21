import SKUInsightsCard from '@/app/modules/inventory/intelligence/components/SKUInsightsCard'
import { InventoryItem, SKUIntelligenceData } from '@/types/inventory'
import React from 'react'

const page = () => {
    const items:InventoryItem = {
        sku: "", // Primary identifier
  name: "",
  category: "",
  quantity: 0, // Fix: was string
  quantityUnit: "",
  quantityType: "",
  unitPrice: 0,
  amount: 0,
  reorderLevel: 0, // Fix: was string
  supplier: "", // Supplier name (legacy)
  supplierId: "", // New: supplier ID reference
  supplierGst: "",
  batchNo: "",
  date: "",
  paymentMode: "",
  description: "",
  status: "In Stock",
  updatedBy: "",
  lastUpdated: "",
  // New fields for enhanced features:
  trackedInPOId: "", // Which recurring PO tracks this item
  expiryDate: "", // For expiry tracking
  maxStockLevel: 0, // For overstocked detection
  lastStockOutDate: "", // For sl
    }
    const intelligence:SKUIntelligenceData = {
        avgDailyUsage: 0,
        usageLast30Days: [],
        suggestedReorderLevel: 0,
        suggestedOrderQty: 0,
        lastOrderDate: "",
        avgLeadTimeDays: 0,
        leadTimeHistory: [],
        lastPurchasePrice: 0,
        priceHistory: [],
        preferredSupplierId: "",
        supplierScores: [],
        lastCalculated: "",
    }
  return (
    <div><SKUInsightsCard 
      item={items}
      intelligence={intelligence}/></div>
  )
}

export default page