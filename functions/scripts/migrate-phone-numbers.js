import { applicationDefault, deleteApp, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || "dg-auth-e9448";
const COLLECTIONS = ["orders", "ws_orders"];
const APPLY = process.argv.includes("--apply");
const BATCH_LIMIT = 400;
const MYANMAR_DIGITS = "၀၁၂၃၄၅၆၇၈၉";

const toAsciiDigits = (value) =>
  String(value || "").replace(/[၀-၉]/g, (digit) => String(MYANMAR_DIGITS.indexOf(digit)));

const normalizeMyanmarPhone = (value) => {
  const original = String(value || "").trim();
  if (!original) return "";

  let digits = toAsciiDigits(original).replace(/\D/g, "");
  if (digits.startsWith("0095")) digits = digits.slice(2);
  if (digits.startsWith("95")) digits = `0${digits.slice(2)}`;
  else if (digits.startsWith("9")) digits = `0${digits}`;

  return /^09\d{7,9}$/.test(digits) ? digits : null;
};

const app = initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore(app);

const summary = {
  mode: APPLY ? "apply" : "dry-run",
  projectId: PROJECT_ID,
  scanned: 0,
  changedDocuments: 0,
  changedFields: 0,
  invalidFields: 0,
  invalidSamples: [],
};

let batch = db.batch();
let pendingWrites = 0;

const flush = async () => {
  if (!APPLY || pendingWrites === 0) return;
  await batch.commit();
  batch = db.batch();
  pendingWrites = 0;
};

for (const collectionName of COLLECTIONS) {
  const snapshot = await db.collection(collectionName).get();
  for (const document of snapshot.docs) {
    summary.scanned += 1;
    const data = document.data();
    const updates = {};

    for (const field of ["primaryPhone", "secondaryPhone"]) {
      const current = data[field];
      if (current == null) continue;

      const normalized = normalizeMyanmarPhone(current);
      if (normalized === null || (field === "primaryPhone" && normalized === "")) {
        summary.invalidFields += 1;
        if (summary.invalidSamples.length < 50) {
          summary.invalidSamples.push({ collection: collectionName, id: document.id, field, value: current });
        }
        continue;
      }
      if (normalized !== current) {
        updates[field] = normalized;
        summary.changedFields += 1;
      }
    }

    if (Object.keys(updates).length === 0) continue;
    summary.changedDocuments += 1;
    if (APPLY) {
      batch.update(document.ref, {
        ...updates,
        phoneNormalizedAt: FieldValue.serverTimestamp(),
      });
      pendingWrites += 1;
      if (pendingWrites >= BATCH_LIMIT) await flush();
    }
  }
}

await flush();
console.log(JSON.stringify(summary, null, 2));

if (!APPLY) {
  console.log("Dry run only. Review invalidSamples, then rerun with --apply to write changes.");
}

await deleteApp(app);
