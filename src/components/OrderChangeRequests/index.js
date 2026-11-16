import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { collection, getDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { database } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { actorFrom, fulfilmentFromOrder } from "../../services/orderWorkflow";
import { canChangeOrder, decideOrderChange, EDIT_FIELDS, loadOrderForReview, matchesOrderBasis, ORDER_CHANGES } from "../../services/orderChanges";
import BrandedLoader from "../BrandedLoader";
import MDButton from "../MDButton";

export default function OrderChangeRequests({ review = false }) {
  const { authUser, userData } = useAuth();
  const uid = authUser?.uid;
  const reviewer = review && userData.role === "super_admin";
  const [requests, setRequests] = useState(null);
  const [listError, setListError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const deciding = useRef(false);

  useEffect(() => {
    if (!uid || (review && !reviewer)) return undefined;
    const requestQuery = query(collection(database, ORDER_CHANGES),
      reviewer ? where("status", "==", "pending") : where("requesterUid", "==", uid));
    setListError(false);
    return onSnapshot(requestQuery, (snapshot) => {
      setRequests(snapshot.docs.map((entry) => ({ ...entry.data(), id: entry.id }))
        .sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    }, () => setListError(true));
  }, [review, reviewer, uid, retry]);

  useEffect(() => {
    if (!selected || !reviewer) return undefined;
    let active = true;
    Promise.all([
      loadOrderForReview(selected),
      getDoc(doc(database, "users", selected.requesterUid)).catch(() => null),
    ]).then(([order, requester]) => {
      if (active) setDetails({ order, name: requester?.data()?.name || selected.requesterUid });
    }).catch(() => {
      if (active) setDetails({ error: true });
    });
    return () => { active = false; };
  }, [selected, reviewer]);

  const decide = async (decision) => {
    if (!reviewer || deciding.current || !selected) return;
    deciding.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await decideOrderChange(selected.id, decision, actorFrom(authUser, userData));
      setMessage({ severity: "success", text: decision === "approved" ? "Request approved and order updated." : "Request rejected. The order was not changed." });
      setSelected(null);
    } catch (error) {
      setMessage({ severity: "error", text: error.code === "permission-denied" ? "The request could not be reviewed. Reload the queue and check your access." : error.message });
    } finally {
      deciding.current = false;
      setBusy(false);
    }
  };

  if (listError) return <Alert severity="error" action={<MDButton onClick={() => setRetry((value) => value + 1)}>Try again</MDButton>}>Order requests could not be loaded.</Alert>;
  if (!requests) return <BrandedLoader />;
  const eligible = selected && details && canChangeOrder(details.order, selected.kind) && matchesOrderBasis(details.order, selected.base);
  return (
    <Stack spacing={2}>
      {reviewer && <Typography variant="body2" color="text.secondary">Review pending edit and void requests. The order changes only when approved.</Typography>}
      {message && <Alert severity={message.severity} role="status">{message.text}</Alert>}
      {!requests.length && <Typography variant="body2">{reviewer ? "No requests awaiting approval." : "You haven’t submitted any requests."}</Typography>}
      {requests.map((entry) => {
        const isSelected = selected?.id === entry.id;
        const type = entry.orderCollection === "orders" ? "retail" : "wholesale";
        return (
          <Paper key={entry.id} variant="outlined" sx={{ p: 2, minWidth: 0, overflowWrap: "anywhere" }}>
            <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap alignItems="center">
              <Typography variant="subtitle2">{entry.kind === "void" ? "Void Request" : "Edit Request"} · {type === "retail" ? "Retail" : "Wholesale"}</Typography>
              <Chip size="small" label={entry.status === "pending" ? "Pending approval" : entry.status === "approved" ? "Approved" : "Rejected"} color={entry.status === "approved" ? "success" : entry.status === "rejected" ? "error" : "warning"} />
            </Stack>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>{entry.reason}</Typography>
            <Typography variant="caption" component="div" color="text.secondary">{entry.createdAt?.toDate().toLocaleString()}</Typography>
            <MDButton component={Link} to={`/details?type=${type}&id=${entry.orderId}`} color="info" variant="text" size="small">View Order</MDButton>
            {reviewer && <MDButton variant="outlined" color="info" size="small" disabled={busy} onClick={() => { setDetails(null); setSelected(isSelected ? null : entry); setMessage(null); }}>{isSelected ? "Close Review" : "Review Request"}</MDButton>}
            {reviewer && isSelected && (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {!details && <BrandedLoader />}
                {details?.error && <Alert severity="error">Could not load the order. Close and reopen this review to try again.</Alert>}
                {details && !details.error && <>
                  <Typography variant="body2">Requested by: {details.name}</Typography>
                  {details.order && <Typography variant="body2">{details.order.name || "Customer"} · {fulfilmentFromOrder(details.order)} · {Number(details.order.amount || 0).toLocaleString()} MMK</Typography>}
                  {!eligible && <Alert severity="warning">The order has changed or is no longer eligible. Reject this request and ask for a new one.</Alert>}
                  {details.order?.invoiceNumber && <Alert severity="warning">Official invoice: {details.order.invoiceNumber}. Approval does not update Zoho Books or issue refunds.</Alert>}
                  {entry.kind === "void" && details.order && <Alert severity="info">Voiding removes the order from active fulfilment and sales. It stays in order history.</Alert>}
                  {entry.kind === "edit" && details.order && Object.entries(entry.changes).map(([key, value]) => (
                    <Box key={key} sx={{ whiteSpace: "pre-wrap" }}>
                      <Typography variant="subtitle2">{EDIT_FIELDS[key]}</Typography>
                      <Typography variant="body2" color="text.secondary">Current: {String(details.order[key] ?? "") || "—"}</Typography>
                      <Typography variant="body2">Proposed: {String(value) || "—"}</Typography>
                    </Box>
                  ))}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <MDButton variant="outlined" color="error" disabled={busy} onClick={() => decide("rejected")}>Reject Request</MDButton>
                    <MDButton variant="gradient" color="success" disabled={busy || !eligible} onClick={() => decide("approved")}>
                      {busy ? "Saving…" : entry.kind === "void" ? "Approve Void" : "Approve Edit"}
                    </MDButton>
                  </Stack>
                </>}
              </Stack>
            )}
          </Paper>
        );
      })}
    </Stack>
  );
}

OrderChangeRequests.propTypes = { review: PropTypes.bool };
