import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import GlobalStyles from "@mui/material/GlobalStyles";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

import { database } from "../../firebase";
import companyLogo from "assets/images/DragonInnovationDark.png";
import BrandedErrorState from "components/BrandedErrorState";
import BrandedLoader from "components/BrandedLoader";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { BRAND_LABELS } from "../../data/common";
import { formattedAmount } from "../../functions/common-functions";

const deliveryLabels = { 1: "Doorstep", 2: "Car Gate", 3: "Pickup" };

const Field = ({ label, children, strong = false }) => (
  <MDBox className="waybill-field">
    <span className="waybill-label">{label}</span>
    <span className={strong ? "waybill-value strong" : "waybill-value"}>{children || "—"}</span>
  </MDBox>
);

Field.defaultProps = { children: null, strong: false };
Field.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
  strong: PropTypes.bool,
};

function Waybill() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const orderType = searchParams.get("type") === "wholesale" ? "wholesale" : "retail";
  const collectionName = orderType === "wholesale" ? "ws_orders" : "orders";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!id) {
        setLoadError(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(false);
      try {
        const snapshot = await getDoc(doc(database, collectionName, id));
        if (!snapshot.exists()) throw new Error("Order not found");
        if (!cancelled) setOrder({ id: snapshot.id, ...snapshot.data() });
      } catch (error) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [collectionName, id, refreshKey]);

  if (loading) return <BrandedLoader label="Preparing waybill…" fullPage />;
  if (loadError || !order) {
    return (
      <BrandedErrorState
        title="Could not prepare waybill"
        description="The order could not be found or loaded. Check your connection and try again."
        onRetry={() => setRefreshKey((value) => value + 1)}
      />
    );
  }

  const unpaidCod = order.paymentStatus === "COD" && order.paymentMode === "NoPay";
  const collectAmount = unpaidCod ? Number(order.amount) || 0 : 0;
  const printedAt = new Date();
  const orderReference = order.invoiceNumber || "Not assigned";
  const destination = [order.city, order.state].filter(Boolean).join(", ");
  const phones = [...new Set([order.primaryPhone, order.secondaryPhone].filter(Boolean))].join(" / ");

  return (
    <>
      <GlobalStyles
        styles={{
          "@page": { size: "A5 portrait", margin: 0 },
          "@media print": {
            "body *": { visibility: "hidden !important" },
            "#waybill-print, #waybill-print *": { visibility: "visible !important" },
            "#waybill-print": {
              position: "absolute !important",
              inset: "0 auto auto 0 !important",
              width: "148mm !important",
              minHeight: "210mm !important",
              margin: "0 !important",
              boxShadow: "none !important",
              border: "none !important",
            },
            ".waybill-controls": { display: "none !important" },
          },
        }}
      />

      <MDBox className="waybill-controls" display="flex" justifyContent="center" gap={1.5} py={2} px={2}>
        <MDButton variant="outlined" color="dark" onClick={() => window.close()}>
          Close
        </MDButton>
        <MDButton variant="gradient" color="info" onClick={() => window.print()}>
          <Icon sx={{ mr: 0.75 }}>print</Icon>
          Print waybill
        </MDButton>
      </MDBox>

      <MDBox
        id="waybill-print"
        mx="auto"
        mb={3}
        sx={{
          width: "min(148mm, calc(100% - 24px))",
          minHeight: "210mm",
          background: "#fff",
          color: "#171717",
          border: "2px solid #171717",
          boxShadow: "0 18px 45px rgba(42, 11, 16, 0.18)",
          fontFamily: 'Arial, "Noto Sans Myanmar", sans-serif',
          "& .waybill-section": { borderTop: "1.5px solid #171717" },
          "& .waybill-grid": { display: "grid", gridTemplateColumns: "1fr 1fr" },
          "& .waybill-grid > *:nth-of-type(odd)": { borderRight: "1.5px solid #171717" },
          "& .waybill-field": { padding: "6px 9px", minHeight: 44 },
          "& .waybill-label": {
            display: "block",
            marginBottom: 2,
            color: "#555",
            fontSize: 8.5,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          },
          "& .waybill-value": { display: "block", fontSize: 11.5, lineHeight: 1.25, whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
          "& .waybill-value.strong": { fontSize: 15, fontWeight: 800 },
          "@media (max-width: 600px)": {
            "& .waybill-grid": { gridTemplateColumns: "1fr" },
            "& .waybill-grid > *:nth-of-type(odd)": { borderRight: 0 },
            "& .waybill-grid > * + *": { borderTop: "1px solid #171717" },
          },
          "@media print": {
            "& .waybill-grid": { gridTemplateColumns: "1fr 1fr" },
            "& .waybill-grid > *:nth-of-type(odd)": { borderRight: "1.5px solid #171717" },
            "& .waybill-grid > * + *": { borderTop: 0 },
          },
        }}
      >
        <MDBox display="flex" alignItems="center" justifyContent="space-between" px={1.5} py={0.5}>
          <MDBox component="img" src={companyLogo} alt="Dragon Innovation" width={62} height={62} sx={{ objectFit: "contain" }} />
          <MDBox textAlign="right">
            <MDTypography sx={{ fontFamily: "inherit", fontSize: 18, fontWeight: 900, color: "#D7192D" }}>
              WAYBILL
            </MDTypography>
            <MDTypography sx={{ fontFamily: "inherit", fontSize: 9.5, color: "#333" }}>
              {orderType === "wholesale" ? "Wholesale Order" : "Retail Order"}
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox className="waybill-section waybill-grid">
          <Field label="Order reference" strong>{orderReference}</Field>
          <Field label="Created / printed">
            {order.createdAt?.toDate?.().toLocaleDateString("en-GB") || "—"} / {printedAt.toLocaleDateString("en-GB")}
          </Field>
        </MDBox>

        <MDBox className="waybill-section waybill-grid">
          <Field label="Payment" strong>{unpaidCod ? "Receiver Pay / COD" : "Prepaid"}</Field>
          <Field label="To collect" strong>{formattedAmount(collectAmount)}</Field>
        </MDBox>

        <MDBox className="waybill-section" px={1.1} py={0.75}>
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>
            DELIVER TO
          </MDTypography>
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 20, fontWeight: 900, mt: 0.25 }}>
            {order.name || "—"}
          </MDTypography>
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 15, fontWeight: 800, mt: 0.25 }}>
            {phones || "—"}
          </MDTypography>
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 11.5, lineHeight: 1.28, mt: 0.5, whiteSpace: "pre-wrap" }}>
            {order.address || "—"}
          </MDTypography>
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 14, fontWeight: 900, mt: 0.5 }}>
            {destination || "—"}
          </MDTypography>
        </MDBox>

        <MDBox className="waybill-section waybill-grid">
          <Field label="Delivery mode">{deliveryLabels[Number(order.deliveryType)] || "—"}</Field>
          <Field label="Brand">{BRAND_LABELS[order.brand] || order.brand || "—"}</Field>
        </MDBox>

        <MDBox className="waybill-section">
          <Field label="Content description">{(order.items || "Items").replace(/"/g, "")}</Field>
        </MDBox>

        <MDBox className="waybill-section">
          <Field label="Special instruction">{order.remark || "None"}</Field>
        </MDBox>

        <MDBox className="waybill-section" px={1.25} py={0.5} textAlign="center">
          <MDTypography sx={{ fontFamily: "inherit", fontSize: 8.5, color: "#555" }}>
            Please verify the receiver, phone number, collection amount and parcel contents before dispatch.
          </MDTypography>
        </MDBox>
      </MDBox>
    </>
  );
}

export default Waybill;
