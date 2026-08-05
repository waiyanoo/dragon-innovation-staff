/**
 * Security rules tests for firestore.rules.
 *
 * Run with:  npm run test:rules
 * (starts the Firestore emulator, runs this file, shuts the emulator down)
 *
 * IMPORTANT — fixtures must mirror real production data, not idealised data.
 * Accounts created before the user-management feature have NO `status` field.
 * A rules change that required `status == "active"` once locked every one of
 * those accounts out of every collection in production. The `legacy*` users
 * below exist to catch that class of regression, so keep them.
 */
const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
} = require("firebase/firestore");

const RULES_PATH = process.env.RULES_PATH || path.join(__dirname, "..", "firestore.rules");
const EMULATOR_PORT = Number(process.env.FIRESTORE_EMULATOR_PORT || 8080);

const results = [];
async function t(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, detail: e.message });
  }
}

// Modern profiles carry status; legacy ones predate the field entirely.
const USERS = {
  pageadmin1: { name: "Page Admin One", role: "page_admin", status: "active" },
  pageadmin2: { name: "Page Admin Two", role: "page_admin", status: "active" },
  superadmin: { name: "Boss", role: "super_admin", status: "active" },
  adminuser: { name: "Admin", role: "admin", status: "active" },
  warehouseuser: { name: "Warehouse", role: "warehouse", status: "active" },
  salesuser: { name: "Sales", role: "sales", status: "active" },
  pendinguser: { name: "New Hire", role: "pending", status: "active" },
  suspendedadmin: { name: "Gone", role: "admin", status: "suspended" },

  // No status field - must keep working.
  legacyadmin: { name: "Legacy Admin", role: "admin" },
  legacypageadmin: { name: "Legacy Page Admin", role: "page_admin" },
  legacywarehouse: { name: "Legacy Warehouse", role: "warehouse" },
  legacysales: { name: "Legacy Sales", role: "sales" },
  legacysuper: { name: "Legacy Boss", role: "super_admin" },
};

async function main() {
  const testEnv = await initializeTestEnvironment({
    projectId: "dragon-rules-test",
    firestore: {
      rules: fs.readFileSync(RULES_PATH, "utf8"),
      host: "127.0.0.1",
      port: EMULATOR_PORT,
    },
  });

  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    for (const [uid, data] of Object.entries(USERS)) {
      await setDoc(doc(db, "users", uid), { email: `${uid}@example.com`, ...data });
    }
    await setDoc(doc(db, "orders", "o1"), {
      brand: "hanskin", amount: 1000, createdBy: "Page Admin One", status: 0,
    });
    await setDoc(doc(db, "ws_orders", "w1"), {
      brand: "hanskin", amount: 1000, createdBy: "Sales", status: 0,
    });
    await setDoc(doc(db, "settings", "v1"), { targets: {} });
    await setDoc(doc(db, "monthlyCommission", "2026_07"), { hanskin: {} });
    await setDoc(doc(db, "monthlyReports", "2026_07"), { hanskin: {} });
  });

  const as = (uid) => testEnv.authenticatedContext(uid).firestore();
  const pageAdmin = as("pageadmin1");
  const superAdmin = as("superadmin");
  const adminUser = as("adminuser");
  const warehouse = as("warehouseuser");
  const sales = as("salesuser");
  const pendingUser = as("pendinguser");
  const suspended = as("suspendedadmin");
  const anon = testEnv.unauthenticatedContext().firestore();
  const legacyAdmin = as("legacyadmin");
  const legacyPageAdmin = as("legacypageadmin");
  const legacyWarehouse = as("legacywarehouse");
  const legacySales = as("legacysales");
  const legacySuper = as("legacysuper");

  // --- Profiles with no status field (guards the 2026-08-05 outage) ---
  await t("legacy admin (no status field) CAN read orders", () =>
    assertSucceeds(getDocs(collection(legacyAdmin, "orders"))));
  await t("legacy page_admin (no status) CAN read orders", () =>
    assertSucceeds(getDocs(collection(legacyPageAdmin, "orders"))));
  await t("legacy warehouse (no status) CAN read orders", () =>
    assertSucceeds(getDocs(collection(legacyWarehouse, "orders"))));
  await t("legacy sales (no status) CAN read wholesale orders", () =>
    assertSucceeds(getDocs(collection(legacySales, "ws_orders"))));
  await t("legacy super_admin (no status) CAN list all users", () =>
    assertSucceeds(getDocs(collection(legacySuper, "users"))));
  await t("legacy page_admin (no status) CAN run dashboard staff query", () =>
    assertSucceeds(getDocs(query(collection(legacyPageAdmin, "users"), where("role", "==", "page_admin")))));
  await t("legacy admin (no status) CAN read commission settings", () =>
    assertSucceeds(getDoc(doc(legacyAdmin, "settings", "v1"))));
  await t("legacy admin (no status) CAN create an order", () =>
    assertSucceeds(addDoc(collection(legacyAdmin, "orders"), { brand: "hanskin", amount: 1, status: 0 })));
  await t("legacy admin (no status) still CANNOT self-promote", () =>
    assertFails(updateDoc(doc(legacyAdmin, "users", "legacyadmin"), { role: "super_admin" })));
  await t("explicitly suspended account is STILL denied", () =>
    assertFails(getDocs(collection(suspended, "orders"))));

  // --- Dashboard Individual Sales query ---
  await t("page_admin CAN run dashboard staff query where(role==page_admin)", () =>
    assertSucceeds(getDocs(query(collection(pageAdmin, "users"), where("role", "==", "page_admin")))));
  await t("admin CAN run dashboard staff query", () =>
    assertSucceeds(getDocs(query(collection(adminUser, "users"), where("role", "==", "page_admin")))));
  await t("warehouse CAN run dashboard staff query", () =>
    assertSucceeds(getDocs(query(collection(warehouse, "users"), where("role", "==", "page_admin")))));
  await t("dashboard staff query returns all page admins incl. legacy", async () => {
    const snap = await getDocs(query(collection(pageAdmin, "users"), where("role", "==", "page_admin")));
    const expected = Object.values(USERS).filter((u) => u.role === "page_admin").length;
    if (snap.size !== expected) throw new Error(`expected ${expected} page admins, got ${snap.size}`);
  });

  // --- Listing stays constrained for non-super-admins ---
  await t("page_admin CANNOT list ALL users (unfiltered)", () =>
    assertFails(getDocs(collection(pageAdmin, "users"))));
  await t("page_admin CANNOT query super_admin profiles", () =>
    assertFails(getDocs(query(collection(pageAdmin, "users"), where("role", "==", "super_admin")))));
  await t("super_admin CAN list all users", () =>
    assertSucceeds(getDocs(collection(superAdmin, "users"))));

  // --- Privilege escalation ---
  await t("user CANNOT promote self to super_admin", () =>
    assertFails(updateDoc(doc(pageAdmin, "users", "pageadmin1"), { role: "super_admin" })));
  await t("pending user CANNOT promote self to admin", () =>
    assertFails(updateDoc(doc(pendingUser, "users", "pendinguser"), { role: "admin" })));
  await t("super_admin CAN change a role", () =>
    assertSucceeds(updateDoc(doc(superAdmin, "users", "pageadmin2"), { role: "admin" })));
  await t("user CAN read own profile", () =>
    assertSucceeds(getDoc(doc(pendingUser, "users", "pendinguser"))));
  await t("user CANNOT read another user's profile", () =>
    assertFails(getDoc(doc(pageAdmin, "users", "superadmin"))));
  await t("self-create profile CANNOT claim admin role", () =>
    assertFails(setDoc(doc(as("brandnew"), "users", "brandnew"), { role: "admin", status: "active" })));
  await t("self-create profile CAN claim pending role", () =>
    assertSucceeds(setDoc(doc(as("brandnew2"), "users", "brandnew2"), { role: "pending", status: "active" })));

  // --- Orders ---
  await t("page_admin CAN read retail orders", () =>
    assertSucceeds(getDocs(collection(pageAdmin, "orders"))));
  await t("sales CANNOT read retail orders", () =>
    assertFails(getDocs(collection(sales, "orders"))));
  await t("sales CAN read wholesale orders", () =>
    assertSucceeds(getDocs(collection(sales, "ws_orders"))));
  await t("page_admin CANNOT read wholesale orders", () =>
    assertFails(getDocs(collection(pageAdmin, "ws_orders"))));
  await t("warehouse CAN update retail order status", () =>
    assertSucceeds(updateDoc(doc(warehouse, "orders", "o1"), { status: 1 })));
  await t("warehouse CAN update status + updateHistory (pack/ship flow)", () =>
    assertSucceeds(updateDoc(doc(warehouse, "orders", "o1"), {
      status: 2, updateHistory: [{ updatedBy: "WH" }],
    })));
  await t("warehouse CANNOT edit retail order amount", () =>
    assertFails(updateDoc(doc(warehouse, "orders", "o1"), { amount: 999999 })));
  await t("warehouse CANNOT edit retail order address", () =>
    assertFails(updateDoc(doc(warehouse, "orders", "o1"), { status: 1, address: "changed" })));
  await t("warehouse CAN advance wholesale order status", () =>
    assertSucceeds(updateDoc(doc(warehouse, "ws_orders", "w1"), { status: 1 })));
  await t("warehouse CANNOT edit wholesale order amount", () =>
    assertFails(updateDoc(doc(warehouse, "ws_orders", "w1"), { amount: 999999 })));
  await t("admin CAN edit retail order details", () =>
    assertSucceeds(updateDoc(doc(adminUser, "orders", "o1"), { amount: 5000, address: "new addr" })));
  await t("sales CAN edit wholesale order details", () =>
    assertSucceeds(updateDoc(doc(sales, "ws_orders", "w1"), { amount: 5000 })));
  await t("warehouse CANNOT delete a retail order", () =>
    assertFails(deleteDoc(doc(warehouse, "orders", "o1"))));
  await t("admin CAN create a retail order", () =>
    assertSucceeds(addDoc(collection(adminUser, "orders"), { brand: "hanskin", amount: 1, status: 0 })));
  await t("pending user CANNOT read orders", () =>
    assertFails(getDocs(collection(pendingUser, "orders"))));
  await t("anonymous CANNOT read orders", () =>
    assertFails(getDocs(collection(anon, "orders"))));

  // --- Settings / reports ---
  await t("page_admin CAN read commission settings", () =>
    assertSucceeds(getDoc(doc(pageAdmin, "settings", "v1"))));
  await t("page_admin CANNOT write commission settings", () =>
    assertFails(setDoc(doc(pageAdmin, "settings", "v1"), { targets: {} })));
  await t("super_admin CAN write commission settings", () =>
    assertSucceeds(setDoc(doc(superAdmin, "settings", "v1"), { targets: {} })));
  await t("page_admin CAN read monthlyCommission", () =>
    assertSucceeds(getDoc(doc(pageAdmin, "monthlyCommission", "2026_07"))));
  await t("super_admin CAN write monthlyReports", () =>
    assertSucceeds(setDoc(doc(superAdmin, "monthlyReports", "2026_07"), { hanskin: {} })));
  await t("page_admin CANNOT read monthlyReports", () =>
    assertFails(getDoc(doc(pageAdmin, "monthlyReports", "2026_07"))));

  await testEnv.cleanup();

  const failed = results.filter((r) => !r.ok);
  results.forEach((r) => {
    console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `\n        -> ${r.detail}`}`);
  });
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error("harness error:", e);
  process.exit(2);
});
