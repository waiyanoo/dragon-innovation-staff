

// Material Dashboard 2 React Base Styles
import typography from "assets/theme/base/typography";
import borders from "assets/theme/base/borders";

// Material Dashboard 2 React Helper Functions
import pxToRem from "assets/theme/functions/pxToRem";

const { fontWeightBold, size } = typography;
const { borderRadius } = borders;

const root = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: size.xs,
  fontWeight: fontWeightBold,
  borderRadius: borderRadius.lg,
  padding: `${pxToRem(6.302)} ${pxToRem(16.604)}`,
  lineHeight: 1.4,
  textAlign: "center",
  textTransform: "none",
  letterSpacing: "0.01em",
  userSelect: "none",
  backgroundSize: "150% !important",
  backgroundPositionX: "25% !important",
  transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease, transform 150ms ease",

  "&:not(:disabled):active": {
    transform: "translateY(1px)",
  },

  "&:disabled": {
    pointerEvent: "none",
    opacity: 0.65,
  },

  "& .material-icons": {
    fontSize: pxToRem(15),
    marginTop: pxToRem(-2),
  },
};

export default root;
