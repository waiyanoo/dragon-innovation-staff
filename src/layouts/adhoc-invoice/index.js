import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { useSearchParams } from "react-router-dom";
import GlobalStyles from "@mui/material/GlobalStyles";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import companyLogo from "assets/images/DragonInnovationDark.png";
import BrandedErrorState from "components/BrandedErrorState";
import BrandedLoader from "components/BrandedLoader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDSnackbar from "components/MDSnackbar";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { useAuth } from "context/AuthContext";
import { database } from "../../firebase";
import { BRAND_LABELS } from "data/common";
import { INVOICE_PRODUCTS } from "data/invoiceProducts";
import { calculateGrandTotal, calculateInvoice, calculateLine, makeInvoiceNumber } from "./calculations";

const money = (value) => `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value || 0)} MMK`;
const blankItem = () => ({ productId: "", name: "", sku: "", quantity: 1, rate: 0, discount: 0 });
const paymentText = (order) => [order.paymentStatus, order.paymentMode, order.paymentType].filter(Boolean).join(" · ");

function AdhocInvoice() {
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const orderType = params.get("type") === "wholesale" ? "wholesale" : "retail";
  const orderCollection = orderType === "wholesale" ? "ws_orders" : "orders";
  const invoiceId = `${orderType}_${orderId}`;
  const invoiceRef = useRef(null);
  const { userData } = useAuth();
  const [order, setOrder] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [invoiceAccessError, setInvoiceAccessError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!orderId) { setLoadError(true); setLoading(false); return; }
      setLoading(true);
      setLoadError(false);
      setInvoiceAccessError(false);
      try {
        // Load the order first. A missing/undeployed adhocInvoices rule must
        // not make a valid order look missing; report that configuration
        // problem separately and still let staff review the invoice form.
        const orderSnap = await getDoc(doc(database, orderCollection, orderId));
        if (!orderSnap.exists()) throw new Error("Order not found");
        if (cancelled) return;
        const orderData = { id: orderSnap.id, ...orderSnap.data() };
        setOrder(orderData);
        setInvoiceNumber(makeInvoiceNumber(orderId));

        try {
          const invoiceSnap = await getDoc(doc(database, "adhocInvoices", invoiceId));
          if (cancelled) return;
          if (invoiceSnap.exists()) {
            const invoice = invoiceSnap.data();
            const expiresAt = invoice.expiresAt?.toMillis?.();
            if (!expiresAt || expiresAt > Date.now()) {
              setInvoiceNumber(invoice.invoiceNumber);
              setItems(invoice.items?.length ? invoice.items : [blankItem()]);
              setDeliveryFees(Number(invoice.deliveryFees) || 0);
              setAdditionalDiscount(Number(invoice.additionalDiscount) || 0);
              setSaved(true);
            }
          }
        } catch (invoiceError) {
          if (!cancelled) setInvoiceAccessError(true);
        }
      } catch (error) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [invoiceId, orderCollection, orderId, refreshKey]);

  const products = order ? (INVOICE_PRODUCTS[order.brand] || []) : [];
  const totals = useMemo(() => calculateInvoice(items), [items]);
  const grandTotal = calculateGrandTotal(totals.total, deliveryFees, additionalDiscount);
  const validItems = items.filter((item) => item.productId && Number(item.quantity) > 0);
  const destination = order ? [order.address, order.city, order.state].filter(Boolean).join(", ") : "";
  const phones = order ? [...new Set([order.primaryPhone, order.secondaryPhone].filter(Boolean))].join(" / ") : "";
  const invoiceDate = new Date().toLocaleDateString("en-GB");

  const updateItem = (index, field, value) => {
    setSaved(false);
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (field === "productId") {
        const selected = products.find((candidate) => candidate.id === value);
        return selected ? { ...item, productId: selected.id, name: selected.name, sku: selected.sku, rate: selected.rate } : blankItem();
      }
      return { ...item, [field]: value };
    }));
  };

  const saveInvoice = async () => {
    if (invoiceAccessError) {
      setSnack({ open: true, message: "Invoice storage is not available yet. Deploy the updated Firestore rules, then try again.", color: "error", icon: "warning" });
      return;
    }
    if (!validItems.length) {
      setSnack({ open: true, message: "Choose at least one item before saving.", color: "warning", icon: "warning" });
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(database, "adhocInvoices", invoiceId), {
        invoiceNumber, orderId, orderType, brand: order.brand,
        customer: { name: order.name || "", primaryPhone: order.primaryPhone || "", secondaryPhone: order.secondaryPhone || "", address: order.address || "", city: order.city || "", state: order.state || "" },
        payment: { status: order.paymentStatus || "", mode: order.paymentMode || "", type: order.paymentType || "" },
        items: validItems.map((item) => ({ ...item, quantity: Number(item.quantity), rate: Number(item.rate), discount: Number(item.discount) || 0 })),
        ...calculateInvoice(validItems), deliveryFees: Math.max(0, Number(deliveryFees) || 0),
        additionalDiscount: Math.max(0, Number(additionalDiscount) || 0),
        grandTotal: calculateGrandTotal(calculateInvoice(validItems).total, deliveryFees, additionalDiscount),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
        updatedAt: serverTimestamp(), updatedBy: userData?.name || userData?.email || "Staff",
      }, { merge: true });
      setItems(validItems);
      setSaved(true);
      setSnack({ open: true, message: "Invoice saved. It is ready to print or download.", color: "success", icon: "check" });
    } catch (error) {
      setSnack({ open: true, message: "Invoice could not be saved. Check your connection and try again.", color: "error", icon: "warning" });
    } finally { setSaving(false); }
  };

  const downloadPdf = async () => {
    if (!saved) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf().set({ margin: 0, filename: `${invoiceNumber}.pdf`, image: { type: "jpeg", quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: "mm", format: "a4", orientation: "portrait" } }).from(invoiceRef.current).save();
    } catch (error) {
      setSnack({ open: true, message: "PDF download failed. You can still use Print and choose Save as PDF.", color: "error", icon: "warning" });
    } finally { setDownloading(false); }
  };

  if (loading) return <BrandedLoader label="Preparing invoice…" fullPage />;
  if (loadError || !order) return <BrandedErrorState title="Could not prepare invoice" description="The order or saved invoice could not be loaded." onRetry={() => setRefreshKey((value) => value + 1)} />;
  if (!products.length) return <BrandedErrorState title="Product catalog unavailable" description={`No invoice item list has been added for ${BRAND_LABELS[order.brand] || order.brand}. Add its catalog before creating an invoice.`} />;

  return (
    <>
      <GlobalStyles styles={{
        "@page": { size: "A4 portrait", margin: 0 },
        "@media print": {
          "body *": { visibility: "hidden !important" },
          "#adhoc-invoice-print, #adhoc-invoice-print *": { visibility: "visible !important" },
          "#adhoc-invoice-print": { position: "absolute !important", inset: "0 auto auto 0 !important", width: "210mm !important", minHeight: "297mm !important", margin: "0 !important", boxShadow: "none !important" },
          ".invoice-editor": { display: "none !important" },
        },
      }} />
      <DashboardLayout>
      <MDBox className="invoice-editor" sx={{ maxWidth: 1180, mx: "auto", p: { xs: 1, md: 2 } }}>
        <MDBox display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} flexDirection={{ xs: "column", sm: "row" }} gap={1.5} mb={2}>
          <MDBox><MDTypography variant="h4">Ad-hoc Invoice</MDTypography><MDTypography variant="body2" color="text">Customer copy for {order.name}</MDTypography></MDBox>
          <MDBox display="flex" gap={1} flexWrap="wrap">
            <MDButton variant="outlined" color="dark" onClick={() => window.close()}>Close</MDButton>
            <MDButton variant="outlined" color="info" disabled={!saved || downloading} onClick={downloadPdf}><Icon sx={{ mr: 0.5 }}>download</Icon>{downloading ? "Creating PDF…" : "Download PDF"}</MDButton>
            <MDButton variant="gradient" color="info" disabled={!saved} onClick={() => window.print()}><Icon sx={{ mr: 0.5 }}>print</Icon>Print</MDButton>
          </MDBox>
        </MDBox>
        <MDBox sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 8px 30px rgba(45,25,30,.08)", p: { xs: 2, md: 3 }, mb: 3 }}>
          {invoiceAccessError && (
            <MDBox sx={{ bgcolor: "#fff3f4", border: "1px solid #ef9aa5", borderRadius: 1.5, p: 1.5, mb: 2 }}>
              <MDTypography variant="button" color="error">Invoice storage needs configuration</MDTypography>
              <MDTypography variant="body2" color="text">Deploy the updated Firestore rules before saving. The order loaded correctly.</MDTypography>
            </MDBox>
          )}
          <MDTypography variant="h6" mb={0.5}>Invoice items</MDTypography>
          <MDTypography variant="caption" color="text">Prices come from the supplied {BRAND_LABELS[order.brand]} catalog. Use discount for gifts or special pricing.</MDTypography>
          {items.map((item, index) => (
            <MDBox key={`${index}-${item.productId}`} display="grid" gridTemplateColumns={{ xs: "1fr 1fr", md: "minmax(280px, 1fr) 100px 130px 110px 44px" }} gap={1.25} mt={2} alignItems="center">
              <TextField
                select
                label="Item"
                value={item.productId}
                onChange={(event) => updateItem(index, "productId", event.target.value)}
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 360 } } } }}
                sx={{
                  gridColumn: { xs: "1 / -1", md: "auto" },
                  "& .MuiOutlinedInput-root": { height: 56 },
                  "& .MuiSelect-select": { display: "flex", alignItems: "center", minHeight: "0 !important", py: "0 !important" },
                }}
              >
                {products.map((option) => <MenuItem key={option.id} value={option.id}>{option.name} — {money(option.rate)}</MenuItem>)}
              </TextField>
              <TextField label="Qty" type="number" inputProps={{ min: 1 }} value={item.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} />
              <TextField label="Rate" value={money(item.rate)} InputProps={{ readOnly: true }} />
              <TextField label="Discount %" type="number" inputProps={{ min: 0, max: 100 }} value={item.discount} onChange={(event) => updateItem(index, "discount", event.target.value)} />
              <MDButton color="error" iconOnly variant="text" disabled={items.length === 1} onClick={() => { setItems((current) => current.filter((_, i) => i !== index)); setSaved(false); }}><Icon>delete</Icon></MDButton>
            </MDBox>
          ))}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={2.5} gap={2}>
            <MDButton variant="outlined" color="dark" onClick={() => { setItems((current) => [...current, blankItem()]); setSaved(false); }}><Icon sx={{ mr: 0.5 }}>add</Icon>Add item</MDButton>
            <MDBox textAlign="right"><MDTypography variant="caption" color="text">Invoice total</MDTypography><MDTypography variant="h5">{money(grandTotal)}</MDTypography></MDBox>
          </MDBox>
          <MDBox display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={1.5} mt={2.5}>
            <TextField label="Delivery fees (MMK)" type="number" inputProps={{ min: 0 }} value={deliveryFees} onChange={(event) => { setDeliveryFees(event.target.value); setSaved(false); }} />
            <TextField label="Additional discount (MMK)" type="number" inputProps={{ min: 0 }} value={additionalDiscount} onChange={(event) => { setAdditionalDiscount(event.target.value); setSaved(false); }} />
          </MDBox>
          <MDButton fullWidth variant="gradient" color="info" sx={{ mt: 2.5 }} disabled={saving || invoiceAccessError} onClick={saveInvoice}>{saving ? "Saving invoice…" : saved ? "Saved — update invoice" : "Save invoice"}</MDButton>
        </MDBox>
      </MDBox>

      <MDBox ref={invoiceRef} id="adhoc-invoice-print" mx="auto" mb={4} sx={{ width: "min(210mm, calc(100% - 24px))", minHeight: "297mm", bgcolor: "#fff", color: "#171717", boxShadow: "0 18px 45px rgba(42,11,16,.15)", p: "16mm", fontFamily: 'Arial, "Noto Sans Myanmar", sans-serif' }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" pb={3} borderBottom="3px solid #D7192D">
          <MDBox><MDBox component="img" src={companyLogo} alt="Dragon Innovation" width={92} sx={{ objectFit: "contain" }} /></MDBox>
          <MDBox textAlign="right"><MDTypography sx={{ fontSize: 30, fontWeight: 900, color: "#D7192D" }}>INVOICE</MDTypography><MDTypography sx={{ fontSize: 12, fontWeight: 700 }}>{invoiceNumber}</MDTypography></MDBox>
        </MDBox>
        <MDBox display="grid" gridTemplateColumns="1.4fr 1fr" gap={4} py={3}>
          <MDBox><MDTypography sx={{ fontSize: 9, fontWeight: 800, color: "#777", letterSpacing: 1 }}>BILL TO</MDTypography><MDTypography sx={{ fontSize: 19, fontWeight: 800, mt: .5 }}>{order.name || "—"}</MDTypography><MDTypography sx={{ fontSize: 11, mt: .5 }}>{phones || "—"}</MDTypography><MDTypography sx={{ fontSize: 11, lineHeight: 1.5, mt: .5, whiteSpace: "pre-wrap" }}>{destination || "—"}</MDTypography></MDBox>
          <MDBox sx={{ "& > div": { display: "flex", justifyContent: "space-between", gap: 2, py: .5, borderBottom: "1px solid #eee" } }}>
            <div><span>Invoice date</span><strong>{invoiceDate}</strong></div><div><span>Currency</span><strong>MMK</strong></div><div><span>Brand</span><strong>{BRAND_LABELS[order.brand] || order.brand}</strong></div><div><span>Payment</span><strong>{paymentText(order) || "—"}</strong></div>
          </MDBox>
        </MDBox>
        <MDBox component="table" width="100%" sx={{ borderCollapse: "collapse", "th": { bgcolor: "#2b1117", color: "#fff", fontSize: 10, textAlign: "left", p: 1 }, "td": { borderBottom: "1px solid #ddd", fontSize: 10.5, p: 1, verticalAlign: "top" }, "th:not(:first-of-type), td:not(:first-of-type)": { textAlign: "right" } }}>
          <thead><tr><th>Item &amp; description</th><th>Qty</th><th>Rate</th><th>Discount</th><th>Amount</th></tr></thead>
          <tbody>{validItems.map((item) => { const line = calculateLine(item); return <tr key={item.productId}><td><strong>{item.name}</strong>{item.sku && <><br /><span style={{ color: "#777" }}>SKU: {item.sku}</span></>}</td><td>{item.quantity}</td><td>{money(item.rate)}</td><td>{Number(item.discount) || 0}%</td><td><strong>{money(line.amount)}</strong></td></tr>; })}</tbody>
        </MDBox>
        <MDBox display="flex" justifyContent="flex-end" mt={3}><MDBox width="300px" sx={{ "& > div": { display: "flex", justifyContent: "space-between", py: .8 }, "& > div:last-of-type": { borderTop: "2px solid #D7192D", mt: .5, pt: 1.5, fontSize: 18, fontWeight: 900 } }}><div><span>Item subtotal</span><strong>{money(totals.subtotal)}</strong></div><div><span>Item discounts</span><strong>- {money(totals.discountTotal)}</strong></div><div><span>Delivery fees</span><strong>{money(deliveryFees)}</strong></div><div><span>Additional discount</span><strong>- {money(additionalDiscount)}</strong></div><div><span>Total</span><span>{money(grandTotal)}</span></div></MDBox></MDBox>
        <MDBox mt={6} pt={2} borderTop="1px solid #ddd"><MDTypography sx={{ fontSize: 10, color: "#666" }}>Thank you for your order. Please contact Dragon Innovation if you have any questions about this invoice.</MDTypography></MDBox>
      </MDBox>
      <MDSnackbar color={snack.color} icon={snack.icon} title={snack.message} open={snack.open} onClose={() => setSnack((current) => ({ ...current, open: false }))} close={() => setSnack((current) => ({ ...current, open: false }))} />
      </DashboardLayout>
    </>
  );
}

export default AdhocInvoice;
