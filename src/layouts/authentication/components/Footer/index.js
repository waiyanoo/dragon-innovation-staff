

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React base styles
import typography from "assets/theme/base/typography";

function Footer({company, links, light }) {
  const { href, name } = company;
  const { size } = typography;

  const renderLinks = () =>
    links.map((link) => (
      <MDBox key={link.name} component="li" px={2} lineHeight={1}>
        <Link href={link.href} target="_blank">
          <MDTypography variant="button" fontWeight="regular"  color={light ? "white" : "dark"}>
            {link.name}
          </MDTypography>
        </Link>
      </MDBox>
    ));

  return (
    <MDBox position="absolute" width="100%" bottom={0} py={4}>
      <Container>
        <MDBox
          width="100%"
          display="flex"
          flexDirection={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems="center"
          px={1.5}
        >
          <MDBox
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            color={light ? "white" : "text"}
            fontSize={size.sm}
          >
            &copy; {new Date().getFullYear()}, design
            by
            <Link href={href} target="_blank">
              <MDTypography variant="button" fontWeight="medium">
                &nbsp;{name}&nbsp;
              </MDTypography>
            </Link>
          </MDBox>
          <MDBox
            component="ul"
            sx={({ breakpoints }) => ({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              listStyle: "none",
              mt: 3,
              mb: 0,
              p: 0,

              [breakpoints.up("lg")]: {
                mt: 0,
              },
            })}
          >
            {renderLinks()}
          </MDBox>
        </MDBox>
      </Container>
    </MDBox>
  );
}

// Setting default props for the Footer
Footer.defaultProps = {
  company: { href: "https://www.dragoninnov.com/", name: "Dragon Innovation" },
  links: [
    { href: "https://www.facebook.com/dragoninnovation.mm/", name: "Dragon Innovation" },
    { href: "https://www.facebook.com/hanskinmyanmar", name: "Hanskin" },
    { href: "https://www.facebook.com/sugarbearmyanmar", name: "SugarBear" },
    { href: "https://www.facebook.com/mongdiesofficialmyanmar", name: "Mongdies" },
  ],
  light: false,
};

// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
  light: PropTypes.bool,
};

export default Footer;
