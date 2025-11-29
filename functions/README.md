# Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the project.

## Overview

This project uses Firebase Cloud Functions to handle scheduled tasks and background processes that run independently of the main Next.js application.

## Functions

### Scheduled Functions

#### `runEveryMinute`

**Type**: Scheduled Function  
**Schedule**: Every 1 minute  
**Purpose**: Orchestrates all functions that need to run every minute

**Functions called**:

- `checkAssignmentTimeouts` - Monitors and processes staff assignment timeouts

**Adding new functions**: See [SCHEDULED_FUNCTIONS_GUIDE.md](./SCHEDULED_FUNCTIONS_GUIDE.md)

#### `checkAssignmentTimeouts`

**Type**: Business Logic Function  
**Called by**: `runEveryMinute`  
**Purpose**: Monitors staff assignment requests and handles timeouts

**What it does**:

1. Queries pending assignments older than the configured timeout period
2. Marks timed-out assignments as "timeout" status
3. Marks the assigned staff member as inactive
4. Sends WhatsApp notification to the staff member
5. Notifies receptionists via FCM push notification and WhatsApp

**Configuration**:

- Default timeout: 10 minutes (configurable per business)
- Batch size: 500 assignments per execution

### `helloWorld`

**Type**: Callable Function  
**Purpose**: Simple test function for verifying Cloud Functions deployment

## Setup

### Prerequisites

- Node.js 24 or higher
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project configured

### Environment Variables

Set the following environment variables in Firebase Functions config:

```bash
# WhatsApp API Key
firebase functions:config:set whatsapp.api_key="YOUR_WHATSAPP_API_KEY"
```

Or use `.env` file for local development:

```env
WHATSAPP_API_KEY=your_whatsapp_api_key_here
```

### Installation

```bash
cd functions
npm install
```

## Development

### Build

```bash
npm run build
```

### Build and Watch (Auto-rebuild on changes)

```bash
npm run build:watch
```

### Local Testing with Emulator

```bash
npm run serve
```

This starts the Firebase Emulator Suite for testing functions locally.

### Linting

```bash
npm run lint
```

## Deployment

### Deploy All Functions

```bash
npm run deploy
```

Or from project root:

```bash
firebase deploy --only functions
```

### Deploy Specific Function

```bash
firebase deploy --only functions:runEveryMinute
```

## Important Guides

📖 **[SCHEDULED_FUNCTIONS_GUIDE.md](./SCHEDULED_FUNCTIONS_GUIDE.md)** - How to add new scheduled functions

📖 **[FIRESTORE_INDEXES_GUIDE.md](./FIRESTORE_INDEXES_GUIDE.md)** - Firestore indexing requirements

## Firestore Indexes

**IMPORTANT**: This project uses complex Firestore queries that require composite indexes.

### When Adding New Queries

If you add queries with:

- Multiple field filters (equality + range)
- Array-contains with other filters
- In/Not-in with other filters

**You MUST update Firestore indexes**. See the detailed guide above.

### Quick Index Deployment

```bash
# From project root
firebase deploy --only firestore:indexes
```

The index configuration is in `/firestore.indexes.json` at the project root.

## Monitoring and Logs

### View Logs

```bash
npm run logs
```

Or view logs in Firebase Console:  
https://console.firebase.google.com/project/YOUR_PROJECT/functions/logs

### Monitor Performance

Firebase Console > Functions > Dashboard

## Project Structure

```
functions/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── config.ts                   # Configuration constants
│   ├── types.ts                    # TypeScript interfaces
│   ├── functions/
│   │   ├── run-every-minute.ts    # 1-minute scheduler
│   │   └── check-assignment-timeouts.ts  # Timeout logic
│   └── services/
│       ├── whatsapp.service.ts    # WhatsApp messaging
│       ├── staff.service.ts       # Staff management
│       └── notification.service.ts # Notifications
├── lib/                            # Compiled JavaScript (generated)
├── SCHEDULED_FUNCTIONS_GUIDE.md    # How to add scheduled functions
├── FIRESTORE_INDEXES_GUIDE.md      # Firestore indexing guide
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── .eslintrc.js                    # ESLint configuration
└── README.md                       # This file
```

## Key Dependencies

- `firebase-admin`: ^13.6.0 - Firebase Admin SDK for backend operations
- `firebase-functions`: ^7.0.0 - Cloud Functions SDK

## TypeScript Configuration

The project uses TypeScript with strict mode enabled. All functions are written in TypeScript and compiled to JavaScript before deployment.

## Troubleshooting

### "The query requires an index" Error

See [FIRESTORE_INDEXES_GUIDE.md](./FIRESTORE_INDEXES_GUIDE.md) for detailed instructions.

### Function Timeout

Default timeout is 60 seconds. For longer operations, configure in the function definition:

```typescript
export const myFunction = onSchedule(
  {
    schedule: "every 1 minutes",
    timeoutSeconds: 300,
  },
  async () => {
    // Your code
  }
);
```

### Cold Start Issues

Cloud Functions may experience cold starts. Consider:

- Optimizing initialization code
- Using minimum instances for critical functions (paid feature)

### WhatsApp API Errors

Verify:

- `WHATSAPP_API_KEY` is correctly configured
- WhatsApp phone number ID is correct in the code
- Phone numbers are in international format (e.g., `918851280284`)

## Best Practices

1. **Always test locally** using Firebase Emulator before deploying
2. **Monitor function execution** in Firebase Console
3. **Set up alerts** for function failures
4. **Keep dependencies updated** but test thoroughly
5. **Document new functions** in this README
6. **Update Firestore indexes** when adding complex queries
7. **Use TypeScript types** for better code safety
8. **Handle errors gracefully** and log appropriately

## Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

## Support

For questions or issues, contact the development team or refer to the main project documentation.
