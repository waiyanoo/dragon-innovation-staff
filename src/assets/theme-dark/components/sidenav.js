

// Material Dashboard 2 React base styles
import colors from "assets/theme-dark/base/colors";
import borders from "assets/theme-dark/base/borders";

// Material Dashboard 2 React helper functions
import pxToRem from "assets/theme-dark/functions/pxToRem";

const { background } = colors;
const { borderRadius } = borders;

const sidenav = {
  styleOverrides: {
    root: {
      width: pxToRem(250),
      whiteSpace: "nowrap",
      border: "none",
    },

    paper: {
      width: pxToRem(250),
      backgroundColor: background.sidenav,
      height: `calc(100vh - ${pxToRem(32)})`,
      // 100vh is the LARGE viewport on mobile: it counts the space behind the
      // address bar, pushing the bottom of the menu out of reach. dvh tracks
      // the visible viewport instead.
      "@supports (height: 100dvh)": {
        height: `calc(100dvh - ${pxToRem(32)})`,
      },
      margin: pxToRem(16),
      borderRadius: borderRadius.xl,
      border: "none",
      // The nav list scrolls internally (see Sidenav), so the paper itself
      // must not, or the header and close button scroll away with it.
      overflow: "hidden",
    },

    paperAnchorDockedLeft: {
      borderRight: "none",
    },
  },
};

export default sidenav;
