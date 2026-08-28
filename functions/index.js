/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from 'firebase-admin/firestore';
// import  algoliasearch  from 'algoliasearch';
import { onSchedule } from "firebase-functions/v2/scheduler";
import { Timestamp } from "firebase-admin/firestore";

const adminApp = initializeApp();
const db = getFirestore(adminApp);

// Ad-hoc customer invoices are temporary. Delete expired records daily in
// bounded batches; downloaded PDFs live on staff devices and are not stored
// by this portal.
export const cleanupExpiredAdhocInvoices = onSchedule({
  schedule: "every day 02:00",
  timeZone: "Asia/Yangon",
}, async () => {
  let deleted = 0;
  const deleteMatching = async (field, cutoff) => {
    let snapshot;
    do {
      snapshot = await db.collection("adhocInvoices")
        .where(field, "<=", cutoff)
        .limit(400)
        .get();
      if (snapshot.empty) break;
      const batch = db.batch();
      snapshot.docs.forEach((invoice) => batch.delete(invoice.ref));
      await batch.commit();
      deleted += snapshot.size;
    } while (snapshot.size === 400);
  };

  await deleteMatching("expiresAt", Timestamp.now());
  // Covers invoices saved before expiresAt was introduced.
  await deleteMatching("updatedAt", Timestamp.fromMillis(Date.now() - 14 * 24 * 60 * 60 * 1000));

  console.log(`Deleted ${deleted} expired ad-hoc invoice(s).`);
});
// const appId = "LUQUCJ1X7P";
// const adminKey = "26bec2fffc79ba517291e2d15fea6dc4";
// const indexName = "Dragon";

// const client = algoliasearch(appId, adminKey);
// const index = client.initIndex(indexName);

// export const syncToAlgolia = onDocumentUpdated('orders/{docId}', async (event) => {
//   const after = event.data?.after?.data();
//   if (!after) return;
//
//   after.objectID = event.params.docId;
//   await index.saveObject(after);
//   console.log('Document updated in Algolia:', event.params.docId);
// });

// export const onFirestoreCreate = onDocumentCreated('orders/{docId}', async (event) => {
//   const data = event.data?.data();
//   if (!data) return;
//
//   data.objectID = event.params.docId;
//   await index.saveObject(data);
//   console.log('Document added to Algolia:', event.params.docId);
// });
