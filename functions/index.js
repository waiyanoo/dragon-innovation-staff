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
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const adminApp = initializeApp();
const db = getFirestore(adminApp);
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

export const monthlyReport = onSchedule(
  {
    schedule: "0 5 1 * *", // Every 1st day of the month at midnight
    timeZone: "Asia/Yangon", // Set your timezone
  },
  async (_) => {
    const now = new Date();

    // Compute the previous month
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth(); // 1-12

    const start = new Date(year, month - 1, 1); // Start of last month
    const end = new Date(year, month, 1); // Start of the current month

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const snapshot = await db
      .collection("orders")
      .where("createdAt", ">=", startTimestamp)
      .where("createdAt", "<", endTimestamp)
      .get();

    const reportData = {};
    snapshot.forEach((doc) => {
      const { brand, amount = 0, createdBy } = doc.data();
      if (!brand) return;

      // Initialize a brand group
      if (!reportData[brand]) {
        reportData[brand] = {
          totalAmount: 0,
          orderCount: 0,
          createdByCount: {}, // createdBy: count
        };
      }

      // Update totals
      reportData[brand].totalAmount += +amount;
      reportData[brand].orderCount += 1;
      reportData.createAt = serverTimestamp();

      // Count per createdBy
      if (createdBy) {
        if (!reportData[brand].createdByCount[createdBy]) {
          reportData[brand].createdByCount[createdBy] = 0;
        }
        reportData[brand].createdByCount[createdBy] += 1;
      }
    });
    const reportId = `${year}_${month.toString().padStart(2, "0")}`;
    await setDoc(doc(db, "monthlyReports", reportId), reportData);
  }
);
