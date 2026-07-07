import { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";

import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton";
import MDInput from "../../../../components/MDInput";
import MDSnackbar from "../../../../components/MDSnackbar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { database } from "../../../../firebase";

const BRANDS = [
  { key: "hanskin", label: "Hanskin", color: "info" },
  { key: "sugarbear", label: "SugarBear", color: "primary" },
  { key: "mongdies", label: "Mongdies", color: "success" },
];
const LEVELS = [
  { key: "level1", label: "Level 1" },
  { key: "level2", label: "Level 2" },
  { key: "level3", label: "Level 3" },
];

const NUMERIC = { inputMode: "numeric", pattern: "[0-9]*" };

// Firestore stores numbers; the form edits strings for smooth typing.
const normalize = (targets) => {
  const out = {};
  BRANDS.forEach((brand) => {
    out[brand.key] = {};
    LEVELS.forEach((level) => {
      const cell = targets?.[brand.key]?.[level.key] || {};
      out[brand.key][level.key] = {
        amount: cell.amount != null ? String(cell.amount) : "",
        commission: cell.commission != null ? String(cell.commission) : "",
      };
    });
  });
  return out;
};

function CommissionSettings() {
  const [targets, setTargets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });

  const showSnack = (message, color = "success", icon = "check") =>
    setSnack({ open: true, message, color, icon });

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(database, "settings", "v1"));
        const data = snap.exists() ? snap.data() : {};
        setTargets(normalize(data.targets));
      } catch (e) {
        showSnack("Failed to load commission settings.", "error", "warning");
        setTargets(normalize({}));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const setField = (brand, level, field, value) => {
    setTargets((prev) => ({
      ...prev,
      [brand]: {
        ...prev[brand],
        [level]: { ...prev[brand][level], [field]: value },
      },
    }));
  };

  const save = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      const payload = {};
      BRANDS.forEach((brand) => {
        payload[brand.key] = {};
        LEVELS.forEach((level) => {
          const cell = targets[brand.key][level.key];
          payload[brand.key][level.key] = {
            amount: Number(cell.amount) || 0,
            commission: Number(cell.commission) || 0,
          };
        });
      });
      await setDoc(doc(database, "settings", "v1"), { targets: payload }, { merge: true });
      showSnack("Commission settings saved.");
    } catch (e) {
      showSnack("Could not save. Please try again.", "error", "warning");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const renderSnackBar = (
    <MDSnackbar
      color={snack.color}
      icon={snack.icon}
      title="Dragon Innovation"
      content={snack.message}
      dateTime="0 min ago"
      open={snack.open}
      onClose={() => setSnack({ ...snack, open: false })}
      close={() => setSnack({ ...snack, open: false })}
      bgWhite
    />
  );

  return (
    <Card>
      <MDBox
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        p={2}
      >
        <MDBox>
          <MDTypography variant="h5">Commission Settings</MDTypography>
          <MDTypography variant="caption" color="text">
            A brand earns commission once its monthly sales reach Level 1. The rate is the highest
            level reached, applied to total sales (excluding delivery fees).
          </MDTypography>
        </MDBox>
        <MDButton
          variant="gradient"
          color="info"
          onClick={save}
          disabled={isLoading || saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          sx={{ flexShrink: 0 }}
        >
          Save
        </MDButton>
      </MDBox>

      {isLoading || !targets ? (
        <MDBox display="flex" justifyContent="center" py={4}>
          <CircularProgress color="info" />
        </MDBox>
      ) : (
        <MDBox px={2} pb={2}>
          {BRANDS.map((brand) => (
            <MDBox key={brand.key} mb={2}>
              <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                <MDBox bgColor={brand.color} borderRadius="50%" width="0.6rem" height="0.6rem" />
                <MDTypography variant="h6">{brand.label}</MDTypography>
              </MDBox>
              {LEVELS.map((level) => (
                <Grid key={level.key} container spacing={2} alignItems="center" mb={0.5}>
                  <Grid size={{ xs: 12, sm: 2 }}>
                    <MDTypography variant="button" fontWeight="medium" color="text">
                      {level.label}
                    </MDTypography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 5 }}>
                    <MDInput
                      type="text"
                      inputProps={NUMERIC}
                      label="Target sales (MMK)"
                      variant="outlined"
                      value={targets[brand.key][level.key].amount}
                      onChange={(e) => setField(brand.key, level.key, "amount", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 5 }}>
                    <MDInput
                      type="text"
                      inputProps={NUMERIC}
                      label="Commission (%)"
                      variant="outlined"
                      value={targets[brand.key][level.key].commission}
                      onChange={(e) => setField(brand.key, level.key, "commission", e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              ))}
              <Divider />
            </MDBox>
          ))}
        </MDBox>
      )}
      {renderSnackBar}
    </Card>
  );
}

export default CommissionSettings;
