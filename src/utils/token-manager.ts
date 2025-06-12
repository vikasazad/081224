"use client";

import { saveToken } from "@/app/modules/auth/stafflogin/utils/staffloginApi";

interface TokenSaveResult {
  success: boolean;
  message?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Manages notification token saving with session storage caching
 * to avoid unnecessary duplicate saves
 */
class TokenManager {
  private static readonly STORAGE_KEY = "notification_token";
  private static readonly LAST_SAVE_KEY = "token_last_saved";

  /**
   * Gets the stored token from session storage
   */
  private static getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(this.STORAGE_KEY);
  }

  /**
   * Sets the token in session storage
   */
  private static setStoredToken(token: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(this.STORAGE_KEY, token);
    sessionStorage.setItem(this.LAST_SAVE_KEY, Date.now().toString());
  }

  /**
   * Gets the last save timestamp
   */
  private static getLastSaveTime(): number {
    if (typeof window === "undefined") return 0;
    const timestamp = sessionStorage.getItem(this.LAST_SAVE_KEY);
    return timestamp ? parseInt(timestamp, 10) : 0;
  }

  /**
   * Forces a token save (bypasses cache check)
   */
  static async forceSaveToken(token: string): Promise<TokenSaveResult> {
    if (!token) {
      return { success: false, error: "No token provided" };
    }

    try {
      console.log("Force saving token...");
      const result = await saveToken(token);

      if (result.success) {
        this.setStoredToken(token);
        console.log("Token force saved and cached successfully");
      }

      return result;
    } catch (error) {
      console.error("Error force saving token:", error);
      return { success: false, error: "Failed to save token" };
    }
  }

  /**
   * Saves token only if it's different from the cached one or if enough time has passed
   */
  static async saveTokenIfChanged(
    token: string,
    options: {
      forceAfterMinutes?: number; // Force save after X minutes regardless
      skipTimeCheck?: boolean; // Skip time check completely
    } = {}
  ): Promise<TokenSaveResult> {
    if (!token) {
      return { success: false, error: "No token provided" };
    }

    const storedToken = this.getStoredToken();
    const { forceAfterMinutes = 60, skipTimeCheck = false } = options;

    // Check if token is the same as stored
    if (storedToken === token) {
      if (skipTimeCheck) {
        console.log("Token unchanged, skipping save (time check disabled)");
        return { success: true, message: "Token unchanged", skipped: true };
      }

      // Check if we should force save based on time
      const lastSaveTime = this.getLastSaveTime();
      const timeElapsed = Date.now() - lastSaveTime;
      const forceThreshold = forceAfterMinutes * 60 * 1000; // Convert to milliseconds

      if (timeElapsed < forceThreshold) {
        console.log(
          `Token unchanged and saved recently (${Math.round(
            timeElapsed / 60000
          )} min ago), skipping save`
        );
        return {
          success: true,
          message: "Token unchanged and recently saved",
          skipped: true,
        };
      }

      console.log(
        `Token unchanged but ${Math.round(
          timeElapsed / 60000
        )} min passed, force saving...`
      );
    }

    // Token is different or enough time has passed, save it
    try {
      console.log("Saving token (changed or time threshold reached)...");
      const result = await saveToken(token);

      if (result.success) {
        this.setStoredToken(token);
        console.log("Token saved and cached successfully");
      }

      return result;
    } catch (error) {
      console.error("Error saving token:", error);
      return { success: false, error: "Failed to save token" };
    }
  }

  /**
   * Clears the cached token (useful for logout)
   */
  static clearStoredToken(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.LAST_SAVE_KEY);
    console.log("Token cache cleared");
  }

  /**
   * Gets token info for debugging
   */
  static getTokenInfo(): {
    storedToken: string | null;
    lastSaveTime: number;
    minutesSinceLastSave: number;
  } {
    const storedToken = this.getStoredToken();
    const lastSaveTime = this.getLastSaveTime();
    const minutesSinceLastSave = lastSaveTime
      ? Math.round((Date.now() - lastSaveTime) / 60000)
      : 0;

    return {
      storedToken: storedToken ? `${storedToken.slice(0, 10)}...` : null,
      lastSaveTime,
      minutesSinceLastSave,
    };
  }
}

export default TokenManager;
