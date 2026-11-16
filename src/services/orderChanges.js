import { arrayUnion, collection, doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { database } from "../firebase";
import { auditPayload, auditRef, fulfilmentFromOrder } from "./orderWorkflow";

export const ORDER_CHANGES = "orderChangeRequests";
export const EDIT_FIELDS = {
  name: "Customer", primaryPhone: "Primary phone", secondaryPhone: "Secondary phone",
  address: "Address", state: "State", city: "Township / city", items: "Items",
  amount: "Amount (MMK)", deliveryFees: "Delivery fees (MMK)", deliveryType: "Delivery type",
  paymentStatus: "Payment status", paymentMode: "Payment method", remark: "Remark", brand: "Brand",
};

export const canRequestOrderChange = (role, orderCollection) =>
  (role === "page_admin" && orderCollection === "orders") ||
  (role === "sales" && orderCollection === "ws_orders");

export const canChangeOrder = (order, kind) => {
  if (!order || !["edit", "void"].includes(kind)) return false;
  if (!(kind === "edit" ? [0] : [0, 1]).includes(order.status ?? 0)) return false;
  const state = fulfilmentFromOrder(order);
  return state === "pending" || (kind === "void" && state === "packed");
};

const basis = (order) => ({
  status: order.status ?? 0,
  fulfilment: order.fulfilmentStatus ?? "",
  invoice: order.invoiceNumber ?? "",
  revision: order.lastChangeRequestId ?? "",
  historyLength: (order.updateHistory || []).length,
});

export const matchesOrderBasis = (order, base) =>
  Boolean(order && Object.entries(basis(order)).every(([key, value]) => value === base[key]));

export const loadOrderForReview = async ({ orderCollection, orderId }) => {
  const snapshot = await getDoc(doc(database, orderCollection, orderId));
  return snapshot.data();
};

export async function submitOrderChange({ orderCollection, orderId, original, kind, reason, actor, proposed = {} }) {
  const orderRef = doc(database, orderCollection, orderId);
  const requestRef = doc(collection(database, ORDER_CHANGES));
  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length > 500) throw new Error("Enter a reason of up to 500 characters.");
  await runTransaction(database, async (transaction) => {
    const order = (await transaction.get(orderRef)).data();
    if (!canChangeOrder(order, kind) || !matchesOrderBasis(order, basis(original))) {
      throw new Error("This order has changed. Reopen it before submitting a request.");
    }
    const changes = kind === "edit" ? Object.fromEntries(
      Object.keys(EDIT_FIELDS)
        .filter((key) => key in proposed && proposed[key] !== (order[key] ?? ""))
        .map((key) => [key, proposed[key]])
    ) : {};
    if (kind === "edit" && !Object.keys(changes).length) throw new Error("Change at least one field before submitting.");
    transaction.set(requestRef, {
      orderCollection, orderId, kind, reason: trimmedReason, changes, base: basis(order),
      requesterUid: actor.uid, status: "pending", createdAt: serverTimestamp(),
    });
  });
}

export async function decideOrderChange(requestId, decision, actor) {
  const requestRef = doc(database, ORDER_CHANGES, requestId);
  await runTransaction(database, async (transaction) => {
    const change = (await transaction.get(requestRef)).data();
    if (!change || change.status !== "pending") throw new Error("This request has already been reviewed.");
    if (change.requesterUid === actor.uid) throw new Error("You cannot review your own request.");
    const { orderCollection, orderId, kind, reason, changes } = change;
    if (decision === "approved") {
      const orderRef = doc(database, orderCollection, orderId);
      const order = (await transaction.get(orderRef)).data();
      if (!canChangeOrder(order, kind) || !matchesOrderBasis(order, change.base)) {
        throw new Error("The order has changed since submission. Reject this request and ask for a new one.");
      }
      const updates = kind === "edit" ? changes : {
        status: 4, fulfilmentStatus: "cancelled", isArchived: true,
        cancelledAt: serverTimestamp(), cancelledByUid: actor.uid, cancellationReason: reason,
      };
      transaction.update(orderRef, {
        ...updates, lastChangeRequestId: requestId,
        updateHistory: arrayUnion({ updatedAt: new Date(), updatedBy: actor.name, updatedByUid: actor.uid }),
      });
      transaction.set(auditRef(), auditPayload({
        actor, action: kind === "edit" ? "order.details_updated" : "order.cancelled",
        collectionName: orderCollection, orderId,
        before: Object.fromEntries(Object.keys(updates).map((key) => [key, order[key] ?? null])),
        after: updates,
        metadata: { requestId, reason, requesterUid: change.requesterUid },
      }));
    }
    transaction.update(requestRef, { status: decision, reviewerUid: actor.uid, reviewedAt: serverTimestamp() });
  });
}
