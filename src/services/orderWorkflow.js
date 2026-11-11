import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { database } from "../firebase";

export const FULFILMENT = {
  PENDING: "pending",
  PACKED: "packed",
  SHIPPED: "shipped",
  CANCELLED: "cancelled",
};

export const INVOICE_STATUS = {
  NOT_REQUIRED: "not_required",
  REQUESTED: "requested",
  DRAFT: "draft",
  ISSUED: "issued",
};

export const fulfilmentFromOrder = (order = {}) => {
  if (order.cancelledAt || order.isArchived || order.fulfilmentStatus === FULFILMENT.CANCELLED) {
    return FULFILMENT.CANCELLED;
  }
  if (order.fulfilmentStatus) return order.fulfilmentStatus;
  if (order.status === 1) return FULFILMENT.PACKED;
  if (order.status === 2 || order.status === 3) return FULFILMENT.SHIPPED;
  return FULFILMENT.PENDING;
};

export const legacyStatusFor = (status) => ({
  [FULFILMENT.PENDING]: 0,
  [FULFILMENT.PACKED]: 1,
  [FULFILMENT.SHIPPED]: 2,
  [FULFILMENT.CANCELLED]: 4,
}[status] ?? 0);

export const invoiceStatusFromOrder = (order = {}) =>
  order.invoiceStatus || (order.invoiceNumber ? INVOICE_STATUS.ISSUED : INVOICE_STATUS.NOT_REQUIRED);

export const isActiveOrder = (order = {}) => fulfilmentFromOrder(order) !== FULFILMENT.CANCELLED;

export const actorFrom = (authUser, userData) => ({
  uid: authUser?.uid || "",
  name: userData?.name || userData?.email || "Staff",
});

export const auditRef = () => doc(collection(database, "auditLogs"));

export const auditPayload = ({ actor, action, orderId, collectionName, before = null, after = null, metadata = null }) => ({
  actorUid: actor.uid,
  actorName: actor.name,
  action,
  entityType: "order",
  entityId: orderId,
  collectionName,
  before,
  after,
  metadata,
  createdAt: serverTimestamp(),
});

export const updateOrderWithAudit = async ({ collectionName, orderId, updates, actor, action, before = null, metadata = null }) => {
  const batch = writeBatch(database);
  batch.update(doc(database, collectionName, orderId), updates);
  batch.set(auditRef(), auditPayload({
    actor,
    action,
    orderId,
    collectionName,
    before,
    after: updates,
    metadata,
  }));
  await batch.commit();
};
