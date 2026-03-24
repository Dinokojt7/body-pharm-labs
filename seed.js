/**
 * One-time seed script — uploads product images to Firebase Storage
 * and writes all products to Firestore.
 *
 * Usage: node seed.js
 * Requires: service-account.json in project root
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = JSON.parse(fs.readFileSync("./service-account.json", "utf8"));
const products = JSON.parse(fs.readFileSync("./src/lib/data/products.json", "utf8"));

const STORAGE_BUCKET = "body-pharm-labs.firebasestorage.app";
const ADMIN_EMAIL = "tumiseeco@gmail.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

async function getAdminUid() {
  try {
    const user = await auth.getUserByEmail(ADMIN_EMAIL);
    return user.uid;
  } catch (e) {
    console.warn("  Could not find admin user:", e.message);
    return null;
  }
}

async function uploadImage(localPath, storagePath) {
  if (!fs.existsSync(localPath)) {
    console.warn(`    ⚠ Image not found: ${localPath}`);
    return null;
  }

  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  await bucket.upload(localPath, {
    destination: storagePath,
    metadata: { contentType },
  });

  // Public URL (works when Storage rules allow read: if true)
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encoded}?alt=media`;
}

async function seed() {
  // --- Step 1: get admin UID ---
  console.log("\n🔍 Looking up admin user...");
  const adminUid = await getAdminUid();
  if (adminUid) {
    console.log(`\n✅ Admin UID found: ${adminUid}`);
    console.log("   ─────────────────────────────────────────────────────");
    console.log(`   Add to .env.local:  NEXT_PUBLIC_ADMIN_UID=${adminUid}`);
    console.log("   Use this UID in Firestore + Storage rules (see below)");
    console.log("   ─────────────────────────────────────────────────────\n");
  }

  // --- Step 2: upload images + seed Firestore ---
  console.log(`📦 Seeding ${products.length} products...\n`);

  for (const product of products) {
    const imageFile = product.imageString?.replace("/images/products/", "");
    const localPath = path.join("./public/images/products", imageFile);
    const storagePath = `products/${imageFile}`;

    process.stdout.write(`  [${product.id}] ${product.name} ... `);

    let imageUrl = product.imageString; // fallback to local path
    if (imageFile) {
      const uploaded = await uploadImage(localPath, storagePath);
      if (uploaded) imageUrl = uploaded;
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    await db.collection("products").doc(product.id).set(
      {
        ...product,
        imageUrl,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    console.log("✓");
  }

  console.log("\n✅ Seed complete!");
  if (adminUid) {
    console.log("\n📋 Firestore rules — update products + orders rules to:");
    console.log(`
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == "${adminUid}";
    }

    match /orders/{orderId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || request.auth.uid == "${adminUid}");
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null &&
        (resource.data.userId == request.auth.uid || request.auth.uid == "${adminUid}");
      allow delete: if request.auth != null &&
        (request.auth.uid == resource.data.userId || request.auth.uid == "${adminUid}");
    }
    `);
    console.log("📋 Storage rules:");
    console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == "${adminUid}";
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
    `);
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error("\n❌ Seed failed:", e.message);
  process.exit(1);
});
