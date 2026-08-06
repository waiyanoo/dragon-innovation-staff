import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import PropTypes from "prop-types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";

export const RANGE_PRESETS = [
  { id: "thisMonth", display: "This Month" },
  { id: "previousMonth", display: "Previous Month" },
  { id: "previousQuarter", display: "Previous Quarter" },
  { id: "thisYear", display: "This Year" },
  { id: "previousYear", display: "Previous Year" },
  { id: "custom", display: "Custom Range" },
];

function DateRangeSelector({
  preset,
  onPresetChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) {
  // An end date earlier than the start would silently return nothing, so say so.
  const invalidRange =
    preset === "custom" && startDate && endDate && endDate.isBefore(startDate, "day");

  return (
    <MDBox>
      <MDBox
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent={{ xs: "stretch", md: "flex-end" }}
      >
        <FormControl variant="outlined" sx={{ minWidth: { xs: "100%", md: 200 } }}>
          <InputLabel id="range-select-label">Date Range</InputLabel>
          <Select
            labelId="range-select-label"
            id="range-select"
            variant="outlined"
            value={preset}
            label="Date Range"
            onChange={(event) => onPresetChange(event.target.value)}
            sx={{ lineHeight: "3rem" }}
          >
            {RANGE_PRESETS.map((range) => (
              <MenuItem key={range.id} value={range.id}>
                {range.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {preset === "custom" && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                format="DD/MMM/YYYY"
                onChange={onStartDateChange}
                maxDate={endDate || undefined}
                slotProps={{ textField: { sx: { minWidth: { xs: "100%", sm: 180 } } } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                format="DD/MMM/YYYY"
                onChange={onEndDateChange}
                minDate={startDate || undefined}
                slotProps={{ textField: { sx: { minWidth: { xs: "100%", sm: 180 } } } }}
              />
            </MDBox>
          </LocalizationProvider>
        )}
      </MDBox>

      {preset === "custom" && (!startDate || !endDate) && (
        <MDBox mt={1} textAlign={{ xs: "left", md: "right" }}>
          <MDTypography variant="caption" color="text">
            Pick both a start and end date to see figures.
          </MDTypography>
        </MDBox>
      )}
      {invalidRange && (
        <MDBox mt={1} textAlign={{ xs: "left", md: "right" }}>
          <MDTypography variant="caption" color="error">
            End date is before the start date.
          </MDTypography>
        </MDBox>
      )}
    </MDBox>
  );
}

DateRangeSelector.defaultProps = {
  startDate: null,
  endDate: null,
};

DateRangeSelector.propTypes = {
  preset: PropTypes.string.isRequired,
  onPresetChange: PropTypes.func.isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
};

export default DateRangeSelector;
