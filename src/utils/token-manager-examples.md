# Token Manager Usage Examples

## Overview

The Token Manager system provides intelligent notification token saving with session storage caching to avoid unnecessary duplicate saves. It includes both a utility class and a React hook for easy integration.

## Files Structure

- `src/utils/token-manager.ts` - Core utility class
- `src/hooks/useTokenManager.ts` - React hook wrapper
- `src/app/modules/auth/stafflogin/utils/staffloginApi.ts` - Server-side token saving function

## Basic Usage

### 1. Simple Auto-Save (Most Common)

```tsx
import { useTokenManager } from "@/hooks/useTokenManager";

export default function MyDashboard() {
  // Automatically saves token on mount, compares with cache
  const { isReady } = useTokenManager();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Token Status: {isReady ? "Ready" : "Loading..."}</p>
    </div>
  );
}
```

### 2. Custom Settings with Callbacks

```tsx
import { useTokenManager } from "@/hooks/useTokenManager";

export default function AdminDashboard() {
  const { saveTokenIfChanged, isReady } = useTokenManager({
    autoSaveOnMount: true, // Auto-save when component mounts
    forceAfterMinutes: 30, // Force save after 30 minutes
    skipTimeCheck: false, // Don't skip time check
    onSuccess: (result) => {
      if (!result.skipped) {
        console.log("✅ Token saved successfully");
        // Show success toast, update UI, etc.
      }
    },
    onError: (error) => {
      console.error("❌ Token save failed:", error);
      // Handle error, show notification, etc.
    },
  });

  return <div>Admin Dashboard Content</div>;
}
```

### 3. Manual Token Operations

```tsx
import { useTokenManager } from "@/hooks/useTokenManager";

export default function AdvancedDashboard() {
  const { saveTokenIfChanged, forceSaveToken, clearTokenCache, getTokenInfo } =
    useTokenManager({
      autoSaveOnMount: false, // Disable auto-save
    });

  const handleManualSave = async () => {
    // Only saves if token changed or time threshold reached
    const result = await saveTokenIfChanged();
    console.log("Save result:", result);
  };

  const handleForceSave = async () => {
    // Always saves, ignoring cache
    const result = await forceSaveToken();
    console.log("Force save result:", result);
  };

  const handleDebugInfo = () => {
    // Get current token cache info
    const info = getTokenInfo();
    console.log("Token info:", info);
  };

  return (
    <div>
      <button onClick={handleManualSave}>Manual Save</button>
      <button onClick={handleForceSave}>Force Save</button>
      <button onClick={handleDebugInfo}>Debug Info</button>
    </div>
  );
}
```

## Configuration Options

### useTokenManager Options

| Option              | Type     | Default   | Description                                           |
| ------------------- | -------- | --------- | ----------------------------------------------------- |
| `autoSaveOnMount`   | boolean  | true      | Automatically save token when component mounts        |
| `forceAfterMinutes` | number   | 60        | Force save after X minutes regardless of token change |
| `skipTimeCheck`     | boolean  | false     | Skip time check (only save if token changed)          |
| `onSuccess`         | function | undefined | Callback when token save succeeds                     |
| `onError`           | function | undefined | Callback when token save fails                        |

### TokenManager Methods

| Method                               | Description                               | Returns                  |
| ------------------------------------ | ----------------------------------------- | ------------------------ |
| `saveTokenIfChanged(token, options)` | Save only if token changed or time passed | Promise<TokenSaveResult> |
| `forceSaveToken(token)`              | Always save token, bypass cache           | Promise<TokenSaveResult> |
| `clearStoredToken()`                 | Clear cached token from session storage   | void                     |
| `getTokenInfo()`                     | Get debug information about cached token  | TokenInfo                |

## Common Use Cases

### 1. Staff Dashboard (Auto-save with longer intervals)

```tsx
const { isReady } = useTokenManager({
  forceAfterMinutes: 60, // Save every hour
  onSuccess: (result) => {
    if (!result.skipped) {
      console.log("Staff token saved");
    }
  },
});
```

### 2. Admin Dashboard (More frequent saves)

```tsx
const { isReady } = useTokenManager({
  forceAfterMinutes: 30, // Save every 30 minutes
  onSuccess: (result) => {
    if (!result.skipped) {
      console.log("Admin token saved");
    }
  },
});
```

### 3. High-frequency Page (Skip time check)

```tsx
const { isReady } = useTokenManager({
  skipTimeCheck: true, // Only save if token actually changed
  onSuccess: (result) => {
    if (!result.skipped) {
      console.log("Token changed and saved");
    }
  },
});
```

### 4. Login Flow (Force save after authentication)

```tsx
// In login component after successful authentication
const { forceSaveToken } = useTokenManager({
  autoSaveOnMount: false, // Don't auto-save on mount
});

const handleLogin = async () => {
  // ... login logic ...
  if (loginSuccess && token) {
    await forceSaveToken(); // Force save new token
  }
};
```

## Session Storage Keys

The token manager uses these session storage keys:

- `notification_token` - Stores the current token
- `token_last_saved` - Stores the timestamp of last save

## Error Handling

All token operations return a structured result:

```typescript
interface TokenSaveResult {
  success: boolean;
  message?: string;
  error?: string;
  skipped?: boolean; // True if save was skipped due to cache
}
```

## Best Practices

1. **Use auto-save for dashboards** - Most pages should use `autoSaveOnMount: true`
2. **Adjust time intervals based on page importance** - Admin pages might need more frequent saves
3. **Handle errors gracefully** - Don't interrupt user experience for token save failures
4. **Use force save sparingly** - Only after login or when you know token changed
5. **Clear cache on logout** - Call `clearTokenCache()` when user logs out

## Debugging

To debug token management:

```tsx
const { getTokenInfo } = useTokenManager();

// Log current state
console.log(getTokenInfo());
// Output: {
//   storedToken: "eXaMpLe123...",
//   lastSaveTime: 1703123456789,
//   minutesSinceLastSave: 15
// }
```
