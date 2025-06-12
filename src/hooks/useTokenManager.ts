"use client";

import { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useNotification } from "./useFcmToken";
import TokenManager from "@/utils/token-manager";

interface UseTokenManagerOptions {
  autoSaveOnMount?: boolean;
  forceAfterMinutes?: number;
  skipTimeCheck?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for managing notification tokens with automatic saving
 * and session storage caching to avoid unnecessary saves
 */
export const useTokenManager = (options: UseTokenManagerOptions = {}) => {
  const { data: session, status } = useSession();
  const { token } = useNotification();

  const {
    autoSaveOnMount = true,
    forceAfterMinutes = 60,
    skipTimeCheck = false,
    onSuccess,
    onError,
  } = options;

  /**
   * Save token with change detection
   */
  const saveTokenIfChanged = useCallback(async () => {
    if (status !== "authenticated" || !session || !token) {
      console.log("Not ready to save token:", {
        status,
        hasSession: !!session,
        hasToken: !!token,
      });
      return { success: false, error: "Not authenticated or no token" };
    }

    try {
      const result = await TokenManager.saveTokenIfChanged(token, {
        forceAfterMinutes,
        skipTimeCheck,
      });

      if (result.success && !result.skipped) {
        onSuccess?.(result);
      } else if (!result.success) {
        onError?.(result.error || "Unknown error");
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [
    status,
    session,
    token,
    forceAfterMinutes,
    skipTimeCheck,
    onSuccess,
    onError,
  ]);

  /**
   * Force save token (bypass cache check)
   */
  const forceSaveToken = useCallback(async () => {
    if (!token) {
      return { success: false, error: "No token available" };
    }

    try {
      const result = await TokenManager.forceSaveToken(token);

      if (result.success) {
        onSuccess?.(result);
      } else {
        onError?.(result.error || "Unknown error");
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [token, onSuccess, onError]);

  /**
   * Clear stored token cache
   */
  const clearTokenCache = useCallback(() => {
    TokenManager.clearStoredToken();
  }, []);

  /**
   * Get token information for debugging
   */
  const getTokenInfo = useCallback(() => {
    return TokenManager.getTokenInfo();
  }, []);

  /**
   * Auto-save token on component mount if enabled
   */
  useEffect(() => {
    if (autoSaveOnMount && status === "authenticated" && session && token) {
      const timeoutId = setTimeout(() => {
        saveTokenIfChanged().catch(console.error);
      }, 1000); // Wait 1 second for everything to be ready

      return () => clearTimeout(timeoutId);
    }
  }, [autoSaveOnMount, status, session, token, saveTokenIfChanged]);

  return {
    saveTokenIfChanged,
    forceSaveToken,
    clearTokenCache,
    getTokenInfo,
    isReady: status === "authenticated" && !!session && !!token,
    token: token ? `${token.slice(0, 10)}...` : null,
  };
};
