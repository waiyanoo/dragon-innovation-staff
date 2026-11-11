import { useState } from "react";
import { useTranslation } from "react-i18next";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckIcon from "@mui/icons-material/Check";

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [anchor, setAnchor] = useState(null);
  const language = i18n.resolvedLanguage === "my" ? "my" : "en";

  const choose = async (nextLanguage) => {
    setAnchor(null);
    await i18n.changeLanguage(nextLanguage);
  };

  return (
    <>
      <IconButton
        size="small"
        color="inherit"
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={t("language.change")}
        title={t("language.change")}
        sx={{ ml: 0.5 }}
      >
        <Icon fontSize="small">language</Icon>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, marginLeft: 3 }}>{language.toUpperCase()}</span>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {[{ code: "en", label: t("language.english") }, { code: "my", label: t("language.myanmar") }].map((item) => (
          <MenuItem key={item.code} selected={language === item.code} onClick={() => choose(item.code)}>
            <ListItemIcon>{language === item.code ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
