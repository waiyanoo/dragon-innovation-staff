import { useSearchBox } from "react-instantsearch";
import MDBox from "../../../../components/MDBox";
import MDInput from "../../../../components/MDInput";
import MDButton from "../../../../components/MDButton";
import { useState } from "react";

function SearchOrder() {
  const { query, refine } = useSearchBox();
  const [input, setInput] = useState(query);

  const handleSubmit = (e) => {
    e.preventDefault();
    refine(input);
  };

  return (
    <MDBox component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <MDInput
        fullWidth
        variant="outlined"
        label="Search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <MDButton color="info" variant="contained" type="submit">
        Search
      </MDButton>
    </MDBox>
  );
}

export default SearchOrder;
