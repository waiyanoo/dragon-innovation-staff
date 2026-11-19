import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { Alert, Box, GlobalStyles, MenuItem, Stack, TextField, Typography } from "@mui/material";
import MDButton from "components/MDButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  DEFAULT_STICKER_SETTINGS, sanitizeStickerSettings, stickerOrderValues,
  stickerSheetSize, stickerOrigin, STICKER_FIELDS, STICKER_SETTINGS_KEY,
  STICKER_TEXT_X, STICKER_LINE_CLEARANCE,
  codCollectionLabel, stickerRemark,
} from "./stickerLayout";

// Scope these overrides to this form: the portal's legacy Select theme removes
// vertical padding and hides the arrow, collapsing a TextField select.
const controlStyles = {
  minWidth: 0,
  "& .MuiOutlinedInput-root": { minHeight: 52 },
  "& .MuiOutlinedInput-root .MuiSelect-select": {
    display: "flex", alignItems: "center", minHeight: "24px",
    padding: "14px 40px 14px 14px !important", boxSizing: "content-box",
  },
  "& .MuiSelect-select > span": { overflow: "hidden", textOverflow: "ellipsis" },
  "& .MuiSelect-icon": { display: "block", right: 12 },
  "& .MuiFormHelperText-root": { mx: 0, mt: 0.75, lineHeight: 1.5 },
};

function readSettings() {
  try { return sanitizeStickerSettings(JSON.parse(localStorage.getItem(STICKER_SETTINGS_KEY))); }
  catch { return { ...DEFAULT_STICKER_SETTINGS }; }
}

export default function PreprintedSticker({ order }) {
  const [settings, setSettings] = useState(readSettings);
  const [values, setValues] = useState(() => stickerOrderValues(order));
  const [overflow, setOverflow] = useState([]);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const fields = useRef({});
  const baselineMarkers = useRef({});
  const printGuard = useRef(false);
  const sheet = stickerSheetSize(settings);
  const origin = stickerOrigin(settings);
  const checkOverflow = () => STICKER_FIELDS.filter(({ key }) => {
    const field = fields.current[key];
    return field && (field.scrollHeight > field.clientHeight + 1 || field.scrollWidth > field.clientWidth + 1);
  }).map(({ label }) => label);
  // A zero-height inline marker sits on the first text baseline. Measuring it
  // avoids guessing font ascenders/leading, especially for Myanmar glyphs.
  const alignBaselines = () => STICKER_FIELDS.forEach(({ key }) => {
    const field = fields.current[key];
    const marker = baselineMarkers.current[key];
    if (field && marker) {
      const baseline = marker.getBoundingClientRect().top - field.getBoundingClientRect().top;
      field.style.setProperty("--sticker-baseline", `${baseline}px`);
    }
  });

  useEffect(() => {
    try { localStorage.setItem(STICKER_SETTINGS_KEY, JSON.stringify(settings)); }
    catch { /* Printing remains available when local storage is disabled. */ }
  }, [settings]);

  useEffect(() => {
    let active = true;
    const check = () => {
      if (active) { alignBaselines(); setOverflow(checkOverflow()); }
    };
    check();
    document.fonts?.ready.then(check);
    return () => { active = false; };
  }, [settings, values]);

  const print = async () => {
    if (printGuard.current) return;
    printGuard.current = true;
    setPrinting(true);
    setError("");
    try {
      await document.fonts?.ready;
      alignBaselines();
      const exceeded = checkOverflow();
      setOverflow(exceeded);
      if (exceeded.length) return;
      window.print();
    } catch {
      setError("Could not open printing. Please try again.");
    } finally {
      printGuard.current = false;
      setPrinting(false);
    }
  };

  return <>
    <GlobalStyles styles={{
      "@page": { size: `${sheet.width}mm ${sheet.height}mm`, margin: 0 },
      "@media print": {
        "html, body": { margin: "0 !important", padding: "0 !important", background: "#fff !important" },
        "body > :not(#delivery-sticker-root)": { display: "none !important" },
        "#delivery-sticker-root": { display: "block !important", margin: "0 !important", padding: "0 !important", width: `${sheet.width}mm` },
        "#delivery-sticker-root .sticker-guide": { display: "none !important" },
        "#delivery-sticker-root .sticker-sheet": { margin: "0 !important", boxShadow: "none !important", border: "none !important", background: "#fff !important", breakAfter: "avoid", breakInside: "avoid" },
      },
    }} />
    <Stack spacing={2} sx={{ width: "100%", maxWidth: 760, boxSizing: "border-box", mx: "auto", px: 2, pb: 2 }}>
      <Alert severity="info">Prints customer details only. Logos, headings, lines and footer are already on your sticker and will not print.</Alert>
      <Box component="details" sx={{
        border: "1px solid", borderColor: "grey.300", borderRadius: 2,
        "&[open] .sticker-setup-chevron": { transform: "rotate(180deg)" },
      }}>
        <Box component="summary" sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5,
          px: 2, py: 1.5, minHeight: 56, cursor: "pointer", listStyle: "none",
          "&::-webkit-details-marker": { display: "none" },
          "&:focus-visible": { outline: "2px solid", outlineColor: "info.main", outlineOffset: 2 },
        }}>
          <Box>
            <Typography variant="button" component="span" fontWeight={700}>Printer Setup &amp; Alignment</Typography>
            <Typography variant="caption" component="span" sx={{ display: "block" }}>
              {settings.paper === "4x6" ? "4 × 6 Landscape" : "Custom Paper"} · X: {settings.offsetX} mm · Y: {settings.offsetY} mm
            </Typography>
          </Box>
          <ExpandMoreIcon className="sticker-setup-chevron" sx={{ flexShrink: 0, transition: "transform 160ms" }} />
        </Box>
        <Stack spacing={2} sx={{ px: 2, pb: 2, pt: 1 }}>
      <Typography variant="body2">
        Sticker area: 120 × 90 mm (actual size). Print page: {sheet.width} × {sheet.height} mm.
        {settings.paper === "custom"
          ? " Custom size assumes the same border on every side."
          : " The label area is centered on a 4 × 6 inch landscape page without stretching."}
      </Typography>
      <Alert severity="warning">
        {settings.paper === "4x6"
          ? 'Canon G1010: choose 4" × 6" (10 × 15 cm), Landscape, and 1 page per sheet in the print dialog and printer driver.'
          : `Canon G1010: choose Custom paper size ${sheet.width} × ${sheet.height} mm in the printer driver and the same size in the print dialog.`}
        {" "}Use actual size / 100% scale, no margins, no headers or footers, and no fit-to-page or borderless expansion.
        {settings.paper === "4x6" && " Your backing is approximately 130 × 100 mm, smaller than this page setting. The driver cannot detect or correct that mismatch; use the alignment controls after a test print. If feeding or alignment fails, select the matching Custom sheet size instead."}
        {" "}Use only inkjet-compatible label stock that the printer can feed safely; do not feed peeled labels.
        Test alignment on a suitable sheet before using your printed sticker.
      </Alert>
      <TextField select fullWidth label="Printer Paper Preset" value={settings.paper}
        sx={controlStyles}
        SelectProps={{
          renderValue: (value) => <span>{value === "4x6" ? "4 × 6 inch — Landscape (152.4 × 101.6 mm)" : "Custom — Match Sticker Backing"}</span>,
          MenuProps: { PaperProps: { sx: { maxHeight: 260, "& .MuiMenuItem-root": { minHeight: 48, whiteSpace: "normal", fontSize: 14, lineHeight: 1.5 } } } },
        }}
        onChange={(event) => setSettings((prev) => ({ ...prev, paper: event.target.value }))}>
        <MenuItem value="4x6">4 × 6 inch — Landscape (152.4 × 101.6 mm)</MenuItem>
        <MenuItem value="custom">Custom — Match Sticker Backing</MenuItem>
      </TextField>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" }, gap: { xs: 2, sm: 2.5 }, pt: 0.5 }}>
        {[
          ["offsetX", "Horizontal Offset (mm)", -20, 20, 0.5, "Positive moves right; negative moves left."],
          ["offsetY", "Vertical Offset (mm)", -10, 10, 0.5, "Positive moves down; negative moves up."],
          ["border", "Backing Border (mm)", 0, 10, 0.5, settings.paper === "4x6" ? "Only applies to the Custom paper preset." : "Extra backing on each side of the sticker."],
          ["fontSize", "Text Size (pt)", 8, 13, 0.5, "Adjust text size without changing alignment."],
        ].map(([key, label, min, max, step, helper]) => <TextField key={key} label={label} type="number" fullWidth value={settings[key]}
          disabled={key === "border" && settings.paper === "4x6"}
          inputProps={{ min, max, step }} sx={controlStyles} helperText={helper}
          onChange={(event) => setSettings((prev) => sanitizeStickerSettings({ ...prev, [key]: event.target.value }))} />)}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <MDButton variant="outlined" color="dark" sx={{ width: { xs: "100%", sm: "auto" }, minHeight: 44 }}
          onClick={() => setSettings({ ...DEFAULT_STICKER_SETTINGS })}>Reset Alignment</MDButton>
      </Box>
      <Typography variant="body2">Alignment is saved on this browser only.</Typography>
      <Typography variant="caption">
        Measured from the printed border: text starts at 35 mm; dotted lines are at 25, 33, 43, 53, 63 and 71 mm from the top.
        Text baselines sit 1 mm above the lines. Printer offsets move the text only, not these reference guides.
      </Typography>
        </Stack>
      </Box>
      <Typography variant="body2">Text changes below affect this printout, not the saved order.</Typography>
      {codCollectionLabel(order) && <Alert severity="info">{codCollectionLabel(order)}. This is added automatically to the printed Remark line.</Alert>}
      {STICKER_FIELDS.map(({ key, label }) => <TextField key={key} label={label} value={values[key]} size="small" fullWidth
        multiline={key === "address" || key === "remark"} minRows={key === "address" ? 2 : 1}
        onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))} />)}
      {overflow.length > 0 && <Alert severity="error">Text does not fit: {overflow.join(", ")}. Shorten it or reduce the text size before printing. No text will be silently cut off.</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <MDButton variant="gradient" color="info" disabled={printing || overflow.length > 0} onClick={print}>
        {printing ? "Preparing print…" : "Print on Sticker"}
      </MDButton>
      <Typography variant="caption">Preview guides below are approximate and do not print. Confirm alignment with one test print.</Typography>
    </Stack>
    {createPortal(<Box id="delivery-sticker-root" sx={{ width: "100%", overflowX: "auto", pb: 3 }}>
      <Box className="sticker-sheet" sx={{
        position: "relative", width: `${sheet.width}mm`, height: `${sheet.height}mm`,
        mx: "auto", bgcolor: "#fff", color: "#000", boxShadow: "0 4px 24px #0002",
        fontFamily: 'Arial, "Noto Sans Myanmar Variable", sans-serif',
      }}>
        <Box className="sticker-guide" sx={{ position: "absolute", left: `${origin.x}mm`, top: `${origin.y}mm`, width: "120mm", height: "90mm", border: "1px dashed #999", boxSizing: "border-box" }}>
          <Typography sx={{ color: "#999", fontSize: 11, textAlign: "center", pt: "6mm" }}>Preprinted brand logos (not printed)</Typography>
          {STICKER_FIELDS.map(({ key, label, lines }) => <Box key={key}>
            <Box sx={{ position: "absolute", top: `${lines[0] - 5}mm`, left: "7mm", fontSize: "9pt", color: "#aaa" }}>{label}</Box>
            {lines.map((line) => <Box key={line} sx={{ position: "absolute", top: `${line}mm`, left: `${STICKER_TEXT_X}mm`, right: "7mm", borderTop: "1px dotted #bbb" }} />)}
          </Box>)}
          <Box sx={{ position: "absolute", bottom: 0, width: "100%", height: "8mm", bgcolor: "#eee" }} />
        </Box>
        {STICKER_FIELDS.map(({ key, lines, height }) => <Box key={key} ref={(element) => { fields.current[key] = element; }} sx={{
          position: "absolute",
          left: `${origin.x + STICKER_TEXT_X + settings.offsetX}mm`,
          top: `calc(${origin.y + lines[0] - STICKER_LINE_CLEARANCE + settings.offsetY}mm - var(--sticker-baseline, 16px))`,
          width: "73mm", height: `${height}mm`, overflow: "hidden", whiteSpace: "pre-wrap",
          overflowWrap: "anywhere", fontSize: `${settings.fontSize}pt`, fontWeight: key === "name" || (key === "remark" && order.paymentStatus === "COD") ? 600 : 400,
          lineHeight: key === "address" ? "10mm" : "6mm", color: "#000",
        }}><span aria-hidden="true" ref={(element) => { baselineMarkers.current[key] = element; }}
          style={{ display: "inline-block", width: 0, height: 0, verticalAlign: "baseline" }} />{key === "remark" ? stickerRemark(order, values.remark) : values[key]}</Box>)}
      </Box>
    </Box>, document.body)}
  </>;
}

PreprintedSticker.propTypes = { order: PropTypes.object.isRequired };
