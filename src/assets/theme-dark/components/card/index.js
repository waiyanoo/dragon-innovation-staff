

// Material Dashboard 2 React Base Styles
import colors from "assets/theme-dark/base/colors";
import borders from "assets/theme-dark/base/borders";
import boxShadows from "assets/theme-dark/base/boxShadows";

// Material Dashboard 2 React Helper Function
import rgba from "assets/theme-dark/functions/rgba";

const { white, background } = colors;
const { borderWidth, borderRadius } = borders;
const { md } = boxShadows;

const card = {
  styleOverrides: {
    root: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      minWidth: 0,
      wordWrap: "break-word",
      backgroundImage: "none",
      backgroundColor: background.card,
      backgroundClip: "border-box",
      border: `${borderWidth[1]} solid ${rgba(white.main, 0.1)}`,
      borderRadius: borderRadius.xl,
      boxShadow: md,
      overflow: "visible",
    },
  },
};

export default card;
