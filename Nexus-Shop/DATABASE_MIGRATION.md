# NEXUS database expansion

The typed collection contract is in `src/types/db.ts`; collection helpers are exported from `src/services/collections.js`. The schema covers the normalized commerce collections alongside existing `products`, `orders`, and `users` data.

## Safe migration

The migration is additive and preserves legacy product scores. It does not delete products, orders, users, or reviews. For products with a legacy `rating`, it copies the value to `legacyRating`, removes the old field, and initializes `avgRating` and `reviewCount` from the reviews collection. It also creates category records from current product categories, fills missing Firebase Auth user profiles without overwriting existing profiles, normalizes older reviews as unverified, and creates the `settings/store` document if absent.

1. Deploy `firestore.rules` and `firestore.indexes.json` first: `firebase deploy --only firestore:rules,firestore:indexes`.
2. Back up Firestore from the Firebase Console or Google Cloud before migration.
3. From `Nexus-Shop`, run `npm run migrate:database` with Firebase Admin credentials in `.env`.
4. Check the migration summary and confirm product counts, user counts, and calculated scores in Firestore.

Legacy product ratings are retained in `legacyRating` for reference. The storefront displays only `avgRating` calculated from user reviews. The migration is safe to run again: it merges category/profile records and recalculates aggregates from the review collection.

## Collections

The normalized collections are `users`, `addresses`, `wishlist`, `user_preferences`, `categories`, `brands`, `tags`, `product_variants`, `inventory_logs`, `cart_items`, `products`, `orders`, `order_items`, `payments`, `shipments`, `invoices`, `returns_requests`, `reviews`, `review_votes`, `notifications`, `support_tickets`, `activity_feed`, `settings`, `analytics_daily`, `audit_logs`, `promotions`, `chat_messages`.

Firestore creates collections when their first document is written; empty domain collections do not need placeholder documents.
