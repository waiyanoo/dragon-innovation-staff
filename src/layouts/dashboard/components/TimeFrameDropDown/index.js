import { FormControl, InputLabel, Select } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import PropTypes from "prop-types";

const timeFrameList = [
  {id: 'thisMonth', display: 'This Month'},
  {id: 'thisYear', display: 'This Year'},
  {id: 'previousMonth', display: 'Previous Month'},
  {id: 'previousQuarter', display: 'Previous Quarter'},
  {id: 'previousYear', display: 'Previous year'},
]

const shortTimeFrameList = [
  {id: 'thisMonth', display: 'This Month'},
  {id: 'previousMonth', display: 'Previous Month'}
]

function TimeFrameDropDown({ value, changeHandler, isShort }) {
  return (
    <FormControl variant="outlined">
      <InputLabel id="date-select-label">Date Range</InputLabel>
      <Select
        labelId="date-select-label"
        id="date-select"
        variant="outlined"
        name="date"
        value={value}
        label="Date Range"
        onChange={(event) => changeHandler(event.target.value)}
        sx={{ lineHeight: "3rem", width: 200 }}
      >
        {
          !isShort && timeFrameList.map((timeFrame) =>
            <MenuItem key={timeFrame.id} value={timeFrame.id}>{timeFrame.display}</MenuItem>)
        }
        {
          isShort && shortTimeFrameList.map((timeFrame) =>
            <MenuItem key={timeFrame.id} value={timeFrame.id}>{timeFrame.display}</MenuItem>)
        }
      </Select>
    </FormControl>
  );
}

TimeFrameDropDown.defaultProps = {
  isShort : false,
}

TimeFrameDropDown.propTypes = {
  value: PropTypes.string.isRequired,
  changeHandler: PropTypes.func.isRequired,
  isShort : PropTypes.bool
};

export default TimeFrameDropDown;
