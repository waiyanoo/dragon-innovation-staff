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
