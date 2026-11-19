import PropTypes from "prop-types";
import { Box, Chip, Typography } from "@mui/material";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

export const formatChangeValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (["amount", "deliveryFees"].includes(field) && Number.isFinite(Number(value))) {
    return `${Number(value).toLocaleString("en-US")} MMK`;
  }
  return String(value);
};

export default function ChangeComparison({ field, label, current, proposed, darkMode = false }) {
  const text = darkMode ? "#F3F4F6" : "#243042";
  const muted = darkMode ? "#C0CAD8" : "#536175";
  return (
    <Box component="section" aria-label={`${label} comparison`} sx={{ minWidth: 0 }}>
      <Typography component="h3" sx={{ color: text, fontSize: 15, fontWeight: 700, mb: 1 }}>{label}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 24px minmax(0, 1fr)" }, gap: 1, alignItems: "stretch" }}>
        {[false, true].map((isProposed) => (
          <Box key={String(isProposed)} role="group" aria-label={isProposed ? "Proposed value" : "Current value"} sx={{
            gridColumn: { md: isProposed ? 3 : 1 }, gridRow: { md: 1 },
            p: { xs: 1.5, sm: 2 }, minWidth: 0, borderRadius: 2, border: "1px solid",
            borderColor: isProposed ? (darkMode ? "#446D9C" : "#ADC9EB") : (darkMode ? "#465366" : "#D8DFE7"),
            bgcolor: isProposed ? (darkMode ? "#172F49" : "#EDF5FF") : (darkMode ? "#252F3C" : "#F4F6F8"),
            borderLeftWidth: isProposed ? 4 : 1,
          }}>
            <Chip size="small" label={isProposed ? "PROPOSED · REQUESTED CHANGE" : "CURRENT · SAVED ORDER"} sx={{
              height: "auto", mb: 1, maxWidth: "100%", fontWeight: 700, fontSize: 10, letterSpacing: ".04em",
              color: isProposed ? (darkMode ? "#CDE4FF" : "#174C84") : muted,
              bgcolor: isProposed ? (darkMode ? "#24486D" : "#DCEBFD") : (darkMode ? "#354255" : "#E5EAF0"),
              "& .MuiChip-label": { whiteSpace: "normal", py: 0.5 },
            }} />
            <Typography component="div" sx={{
              color: text, whiteSpace: "pre-wrap", overflowWrap: "anywhere",
              fontSize: ["amount", "deliveryFees"].includes(field) ? 20 : 14,
              fontWeight: isProposed ? 600 : 400, lineHeight: 1.75,
              fontVariantNumeric: "tabular-nums",
            }}>{formatChangeValue(field, isProposed ? proposed : current)}</Typography>
          </Box>
        ))}
        <Box aria-hidden="true" sx={{ display: { xs: "none", md: "flex" }, gridColumn: 2, gridRow: 1, alignItems: "center", justifyContent: "center", color: muted }}>
          <ArrowForwardOutlinedIcon fontSize="small" />
        </Box>
      </Box>
    </Box>
  );
}

ChangeComparison.propTypes = {
  field: PropTypes.string.isRequired, label: PropTypes.string.isRequired,
  current: PropTypes.any, proposed: PropTypes.any, darkMode: PropTypes.bool,
};
