# Firestore Indexes Guide

## Overview

This guide explains how to manage Firestore composite indexes for this project. Composite indexes are required when querying on multiple fields with specific combinations of filters.

## When Do You Need a Composite Index?

Firestore **automatically creates single-field indexes**, but you must manually create composite indexes for:

### ✅ Requires Composite Index

- **Equality + Range on different fields**
  ```typescript
  .where("status", "==", "pending")
  .where("timestamp", "<=", cutoffTime)
  ```

- **Range + OrderBy on different fields**
  ```typescript
  .where("price", ">", 100)
  .orderBy("name")
  ```

- **Array-contains with other filters**
  ```typescript
  .where("tags", "array-contains", "tech")
  .where("published", "==", true)
  ```

- **In/Not-In with other filters**
  ```typescript
  .where("status", "in", ["active", "pending"])
  .where("role", "==", "admin")
  ```

### ❌ No Index Needed

- **Multiple equality filters**
  ```typescript
  .where("status", "==", "active")
  .where("role", "==", "admin")
  ```

- **Single field queries**
  ```typescript
  .where("timestamp", "<=", cutoffTime)
  ```

## How to Add a New Composite Index

### Option 1: Quick Fix (Recommended for Testing)

When you encounter an index error in production:

1. **Check the error message** - it will contain a direct link
2. **Click the link** - it takes you to Firebase Console
3. **Create the index** - one-click process
4. **Wait 5-10 minutes** - index creation takes time

### Option 2: Manual Configuration (Recommended for Production)

When you add a new complex query to the codebase:

#### Step 1: Update `firestore.indexes.json`

Located at the **project root**: `/firestore.indexes.json`

Add your new index to the `indexes` array:

```json
{
  "indexes": [
    {
      "collectionGroup": "your_collection_name",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "field1",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "field2",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

#### Step 2: Deploy the Indexes

```bash
firebase deploy --only firestore:indexes
```

#### Step 3: Wait for Completion

- Index creation typically takes **5-10 minutes**
- You'll receive an email when it's ready
- Check status in Firebase Console > Firestore > Indexes

## Current Indexes

### 1. Assignments Collection

**Query**: Find timed-out pending assignments

```typescript
db.collection(`${businessEmail}/webhook/assignments`)
  .where("status", "==", "pending")
  .where("timestamp", "<=", cutoffTime)
```

**Index Definition**:
- Collection: `assignments`
- Fields: `status` (ASC), `timestamp` (ASC)
- Purpose: Used by Cloud Function `checkAssignmentTimeouts`

## Best Practices

1. **Develop First, Index Later**: Build your queries, let Firestore tell you what indexes are needed
2. **Use the Error Link**: The error message provides the exact index configuration
3. **Document New Indexes**: Add comments in this file when you add new indexes
4. **Test Locally**: Use Firebase Emulator Suite to test indexes before deploying
5. **Monitor Usage**: Review index usage in Firebase Console periodically

## Troubleshooting

### Error: "The query requires an index"

**Solution**: Follow Option 1 or Option 2 above

### Index Creation is Taking Too Long

**Normal**: 5-10 minutes for small collections
**Large Collections**: Can take hours for millions of documents
**Check Status**: Firebase Console > Firestore > Indexes tab

### Query Still Fails After Creating Index

**Wait**: Index might still be building
**Check**: Verify the index exists in Firebase Console
**Fields Match**: Ensure field names and order match your query exactly

### Index Already Exists Error

**Solution**: The index is already created, no action needed

## Firebase CLI Commands

```bash
# Deploy only indexes
firebase deploy --only firestore:indexes

# Deploy indexes for specific project
firebase deploy --only firestore:indexes --project your-project-id

# List current indexes
firebase firestore:indexes:list

# View index deployment status
# Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes
```

## Resources

- [Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Query Limitations](https://firebase.google.com/docs/firestore/query-data/queries#query_limitations)
- [Index Best Practices](https://firebase.google.com/docs/firestore/query-data/index-overview)

## Notes for Developers

- **Always commit** `firestore.indexes.json` changes to version control
- **Test queries** in development/staging before production
- **Monitor costs**: Indexes consume storage (usually minimal)
- **Keep this file updated** when adding new complex queries

