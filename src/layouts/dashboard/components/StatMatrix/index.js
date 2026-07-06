import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import PropTypes from "prop-types";

function HeaderCell({ children, first }) {
  return (
    <MDTypography
      variant="caption"
      color="text"
      fontWeight="medium"
      textTransform="uppercase"
      sx={{
        textAlign: first ? "left" : "right",
        fontSize: "0.6rem",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </MDTypography>
  );
}

HeaderCell.propTypes = {
  children: PropTypes.node,
  first: PropTypes.bool,
};

function StatMatrix({ title, icon, color, columns, rows, totalRow }) {
  const gridColumns = `minmax(0, 1.4fr) repeat(${columns.length}, minmax(2.4rem, 1fr))`;

  return (
    <Card>
      <MDBox display="flex" alignItems="center" pt={2} px={2} mt={-3}>
        <MDBox
          variant="gradient"
          bgColor={color}
          color="white"
          coloredShadow={color}
          borderRadius="xl"
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="3.5rem"
          height="3.5rem"
        >
          <Icon fontSize="medium">{icon}</Icon>
        </MDBox>
        <MDTypography variant="h6" ml={2}>
          {title}
        </MDTypography>
      </MDBox>

      <MDBox px={2} pt={2} pb={2}>
        <MDBox
          display="grid"
          gridTemplateColumns={gridColumns}
          alignItems="center"
          rowGap={1.25}
          columnGap={1}
        >
          <HeaderCell first>&nbsp;</HeaderCell>
          {columns.map((col) => (
            <HeaderCell key={col.key}>{col.label}</HeaderCell>
          ))}

          {rows.map((row) => (
            <MDBox key={row.label} display="contents">
              <MDBox display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                {row.dotColor && (
                  <MDBox
                    bgColor={row.dotColor}
                    borderRadius="50%"
                    width="0.6rem"
                    height="0.6rem"
                    flexShrink={0}
                  />
                )}
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  sx={{ lineHeight: 1.2, wordBreak: "break-word" }}
                >
                  {row.label}
                </MDTypography>
              </MDBox>
              {row.values.map((value, i) => (
                <MDTypography
                  key={columns[i].key}
                  variant="button"
                  fontWeight="bold"
                  color={value > 0 ? "dark" : "secondary"}
                  sx={{ textAlign: "right" }}
                >
                  {value}
                </MDTypography>
              ))}
            </MDBox>
          ))}

          {totalRow && (
            <MDBox key="total" display="contents">
              <MDBox
                gridColumn={`1 / span ${columns.length + 1}`}
                sx={{ borderTop: "1px solid", borderColor: "grey.300", mt: 0.5 }}
              />
              <MDTypography variant="button" fontWeight="medium" color="text">
                {totalRow.label}
              </MDTypography>
              {totalRow.values.map((value, i) => (
                <MDTypography
                  key={columns[i].key}
                  variant="button"
                  fontWeight="bold"
                  color={color}
                  sx={{ textAlign: "right" }}
                >
                  {value}
                </MDTypography>
              ))}
            </MDBox>
          )}
        </MDBox>
      </MDBox>
    </Card>
  );
}

StatMatrix.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  columns: PropTypes.arrayOf(
    PropTypes.shape({ key: PropTypes.string, label: PropTypes.string })
  ).isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      dotColor: PropTypes.string,
      values: PropTypes.arrayOf(PropTypes.number),
    })
  ).isRequired,
  totalRow: PropTypes.shape({
    label: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.number),
  }),
};

StatMatrix.defaultProps = {
  color: "info",
  totalRow: null,
};

export default StatMatrix;
