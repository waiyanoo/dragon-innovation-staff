import { useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";

import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import MDButton from "../../../../components/MDButton";
import MDInput from "../../../../components/MDInput";
import MDBadge from "../../../../components/MDBadge";
import MDSnackbar from "../../../../components/MDSnackbar";
import { useAuth } from "../../../../context/AuthContext";
import { ROLES } from "../../../../data/common";
import { createUser, listUsers, setUserStatus, updateUser } from "../../../../services/userService";
import BrandedErrorState from "../../../../components/BrandedErrorState";

const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({ value, label }));

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "page_admin",
  mobile: "",
  position: "",
};

function UserManagement() {
  const { authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // "create" | "edit" | null
  const [editingUid, setEditingUid] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const savingRef = useRef(false);
  const [snack, setSnack] = useState({ open: false, message: "", color: "success", icon: "check" });

  const showSnack = (message, color = "success", icon = "check") =>
    setSnack({ open: true, message, color, icon });

  const loadUsers = async () => {
    setIsLoading(true);
    setLoadError(false);
    try {
      const data = await listUsers();
      data.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setUsers(data);
    } catch (e) {
      setLoadError(true);
      showSnack("Failed to load users.", "error", "warning");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingUid(null);
    setDialogMode("create");
  };

  const openEdit = (user) => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "page_admin",
      mobile: user.mobile || "",
      position: user.position || "",
    });
    setEditingUid(user.uid);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogMode(null);
    setEditingUid(null);
  };

  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isEdit = dialogMode === "edit";
  const editingSelf = isEdit && editingUid === authUser?.uid;

  const canSubmit =
    form.name.trim() !== "" &&
    form.role !== "" &&
    (isEdit || (form.email.trim() !== "" && form.password.length >= 6));

  const submitForm = async () => {
    if (savingRef.current || !canSubmit) return;
    savingRef.current = true;
    setSaving(true);
    try {
      if (isEdit) {
        await updateUser(editingUid, {
          name: form.name.trim(),
          role: form.role,
          mobile: form.mobile.trim(),
          position: form.position.trim(),
        });
        showSnack("User updated.");
      } else {
        await createUser({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          role: form.role,
          mobile: form.mobile.trim(),
          position: form.position.trim(),
        });
        showSnack("User created.");
      }
      setDialogMode(null);
      setEditingUid(null);
      await loadUsers();
    } catch (e) {
      const message =
        e.code === "auth/email-already-in-use"
          ? "That email is already registered."
          : e.code === "auth/invalid-email"
            ? "That email address is invalid."
            : "Could not save the user. Please try again.";
      showSnack(message, "error", "warning");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const confirmStatusChange = async () => {
    const target = statusTarget;
    setStatusTarget(null);
    if (!target) return;
    const nextStatus = target.status === "suspended" ? "active" : "suspended";
    try {
      await setUserStatus(target.uid, nextStatus);
      showSnack(nextStatus === "suspended" ? "User suspended." : "User reactivated.");
      await loadUsers();
    } catch (e) {
      showSnack("Could not update the account status.", "error", "warning");
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
        <MDTypography variant="h5">User Management</MDTypography>
        <MDButton variant="gradient" color="info" onClick={openCreate}>
          Add User
        </MDButton>
      </MDBox>

      {isLoading ? (
        <MDBox px={2} pb={3} aria-label="Loading users">
          {[0, 1, 2, 3].map((row) => (
            <MDBox key={row} display="flex" gap={2} py={1}>
              <Skeleton variant="rounded" width="28%" height={34} />
              <Skeleton variant="rounded" width="34%" height={34} />
              <Skeleton variant="rounded" width="18%" height={34} />
              <Skeleton variant="rounded" width="20%" height={34} />
            </MDBox>
          ))}
        </MDBox>
      ) : loadError ? (
        <BrandedErrorState
          title="Could not load users"
          description="Check your connection and try loading the user list again."
          onRetry={loadUsers}
        />
      ) : (
        <MDBox px={1} pb={2} sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 640 }}>
            <TableBody>
              <TableRow>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    NAME
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    EMAIL
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    ROLE
                  </MDTypography>
                </TableCell>
                <TableCell>
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    STATUS
                  </MDTypography>
                </TableCell>
                <TableCell align="right">
                  <MDTypography variant="caption" fontWeight="bold" color="text">
                    ACTIONS
                  </MDTypography>
                </TableCell>
              </TableRow>
              {users.map((user) => {
                const suspended = user.status === "suspended";
                const isSelf = user.uid === authUser?.uid;
                return (
                  <TableRow key={user.uid}>
                    <TableCell>
                      <MDTypography variant="button" fontWeight="medium">
                        {user.name || "—"}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="button" color="text">
                        {user.email}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDTypography variant="button" color="text">
                        {ROLES[user.role] || user.role}
                      </MDTypography>
                    </TableCell>
                    <TableCell>
                      <MDBadge
                        badgeContent={suspended ? "suspended" : "active"}
                        color={suspended ? "error" : "success"}
                        variant="gradient"
                        size="sm"
                        container
                      />
                    </TableCell>
                    <TableCell align="right">
                      <MDBox display="flex" gap={1} justifyContent="flex-end">
                        <MDButton
                          variant="text"
                          color="info"
                          size="small"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </MDButton>
                        <MDButton
                          variant="text"
                          color={suspended ? "success" : "error"}
                          size="small"
                          disabled={isSelf}
                          onClick={() => setStatusTarget(user)}
                        >
                          {suspended ? "Reactivate" : "Suspend"}
                        </MDButton>
                      </MDBox>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <MDTypography variant="button" color="text">
                      No users found.
                    </MDTypography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </MDBox>
      )}

      <Dialog open={dialogMode !== null} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <MDTypography variant="h5" component="span" fontWeight="medium">
            {isEdit ? "Edit User" : "Add User"}
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox pt={1} display="flex" flexDirection="column" gap={2}>
            <MDInput
              name="name"
              label="Name"
              variant="outlined"
              value={form.name}
              onChange={handleField}
              required
              fullWidth
            />
            <MDInput
              type="email"
              name="email"
              label={isEdit ? "Email (can't be changed)" : "Email"}
              variant="outlined"
              value={form.email}
              onChange={handleField}
              required={!isEdit}
              InputProps={isEdit ? { readOnly: true } : undefined}
              fullWidth
            />
            {!isEdit && (
              <MDInput
                type="password"
                name="password"
                label="Temporary Password (min 6 chars)"
                variant="outlined"
                value={form.password}
                onChange={handleField}
                required
                fullWidth
              />
            )}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="user-role-label">Role</InputLabel>
              <Select
                labelId="user-role-label"
                name="role"
                label="Role"
                value={form.role}
                onChange={handleField}
                disabled={editingSelf}
                sx={{ lineHeight: "3rem" }}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <MDInput
              name="position"
              label="Position (optional)"
              variant="outlined"
              value={form.position}
              onChange={handleField}
              fullWidth
            />
            <MDInput
              type="tel"
              name="mobile"
              label="Mobile (optional)"
              variant="outlined"
              value={form.mobile}
              onChange={handleField}
              fullWidth
            />
            {editingSelf && (
              <MDTypography variant="caption" color="text">
                You can&apos;t change your own role.
              </MDTypography>
            )}
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={closeDialog} disabled={saving}>
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color="info"
            onClick={submitForm}
            disabled={!canSubmit || saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {isEdit ? "Save" : "Create"}
          </MDButton>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(statusTarget)} onClose={() => setStatusTarget(null)}>
        <DialogTitle>
          <MDTypography variant="h5" component="span" fontWeight="medium">
            {statusTarget?.status === "suspended" ? "Reactivate" : "Suspend"} this user?
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ width: { xs: "320px", md: "420px" } }}>
          <MDTypography variant="body2" color="text">
            {statusTarget
              ? statusTarget.status === "suspended"
                ? `"${statusTarget.name}" will be able to sign in again.`
                : `"${statusTarget.name}" will be blocked from signing in until reactivated. Their data is kept.`
              : ""}
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="gradient" color="light" onClick={() => setStatusTarget(null)}>
            Cancel
          </MDButton>
          <MDButton
            variant="gradient"
            color={statusTarget?.status === "suspended" ? "success" : "error"}
            onClick={confirmStatusChange}
          >
            {statusTarget?.status === "suspended" ? "Reactivate" : "Suspend"}
          </MDButton>
        </DialogActions>
      </Dialog>

      {renderSnackBar}
    </Card>
  );
}

export default UserManagement;
