/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions/v1");
const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');

admin.initializeApp();


exports.onValueChangeTrigger = functions.firestore.document('orders/{docId}') // replace with your collection path
  .onUpdate((change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if the specific field changed
    if (before !== after) {
      return executeFullIndexOperation(after);
    } else {
      return null;
    }
  });

function executeFullIndexOperation(data) {
  // Your logic here
  console.log('Executing full index operation for:', data);

  // Example: update another collection, reindex, etc.
  return Promise.resolve();
}

