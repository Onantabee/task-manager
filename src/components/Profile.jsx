import {
  Alert,
  Box,
  Button,
  createTheme,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Visibility,
  VisibilityOff,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../AuthProvider";

export default function Profile({ setEditProfileOpen }) {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: { paper: "#121212" },
      text: { primary: "#ffffff" },
      divider: "#424242",
    },
  });

  const [userDetails, setUserDetails] = useState({
    email: "",
    name: "",
    userRole: "",
    list: false,
  });

  const [passwordDetails, setPasswordDetails] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [activeSection, setActiveSection] = useState("profile");
  const [slideDirection, setSlideDirection] = useState("right");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { userEmail } = useAuth();

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const sxStyles = {
    backgroundColor: "rgba(77, 77, 77, 0.4)",
    textTransform: "capitalize",
    borderRadius: "16px",
    "& .MuiOutlinedInput-root": {
      color: "#E0E0E0",
      "&.Mui-focused fieldset": {
        borderColor: "#C77BBF",
        backgroundColor: "rgba(199, 123, 191, 0.1)",
        borderWidth: "1px",
      },
      "& fieldset": { borderWidth: "1px", borderColor: "#666666" },
      "&:hover fieldset": {
        borderColor: "#C77BBF",
        backgroundColor: "rgba(199, 123, 191, 0.1)",
        borderWidth: "1px",
      },
      backgroundColor: "rgba(77, 77, 77, 0.1)",
      borderRadius: "16px",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C77BBF" },
    "& .MuiInputLabel-root": { color: "#8c8c8c" },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordDetails((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleSection = () => {
    setSlideDirection(activeSection === "profile" ? "right" : "left");
    setActiveSection(activeSection === "profile" ? "password" : "profile");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Shite");
        const res = await axios.get(`http://localhost:8080/users/${userEmail}`);
        setUserDetails(res.data);
        console.log(res.data);
        console.log(res.data.userRole);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [userEmail]);

  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleUpdateProfile = async () => {
    const trimmedName = userDetails.name.trim();
    try {
      await axios.put(`http://localhost:8080/users/update/${userEmail}`, {
        name: capitalizeWords(trimmedName),
      });
      showSnackbar("User profile updated.", "success");
      // setEditProfileOpen(false)
    } catch (error) {
      showSnackbar("An error occured.", "error");
    }
  };

  const handleChangePassword = async () => {
    try {
      if (
        !passwordDetails.oldPassword ||
        !passwordDetails.newPassword ||
        !passwordDetails.confirmPassword
      ) {
        showSnackbar("All password fields are required", "error");
        return;
      }
      if (passwordDetails.newPassword.length < 6) {
        showSnackbar("Password must be at least 6 characters", "error");
        return;
      }
      if (passwordDetails.newPassword !== passwordDetails.confirmPassword) {
        showSnackbar("New passwords don't match", "error");
        return;
      }

      const res = await axios.put(
        `http://localhost:8080/users/change-password/${userEmail}`,
        {
          currentPassword: passwordDetails.oldPassword,
          newPassword: passwordDetails.newPassword,
        }
      );

      setPasswordDetails({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showSnackbar(res.data, "success");
    } catch (error) {
      showSnackbar(error.response.data.message, "error");
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minWidth: "320px",
          width: "500px",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "24px",
          backgroundColor: "#2A2A2A",
          borderRadius: "16px",
          border: "1px solid #333",
          overflow: "hidden",
          position: "relative",
          minHeight: "500px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#E0E0E0",
            mb: 1,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Edit Profile
        </Typography>

        <Box
          sx={{
            position: "absolute",
            width: "calc(100% - 48px)",
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
            transform:
              activeSection === "profile"
                ? "translateX(100)"
                : slideDirection === "right"
                ? "translateX(-100%)"
                : "translateX(100%)",
            opacity: activeSection === "profile" ? 1 : 0,
            pointerEvents: activeSection === "profile" ? "auto" : "none",
          }}
        >
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#C77BBF",
                mb: 2,
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Personal Information
            </Typography>

            <TextField
              margin="normal"
              label="Full Name"
              name="name"
              fullWidth
              value={userDetails.name}
              onChange={handleChange}
              sx={sxStyles}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            width: "calc(100% - 48px)",
            transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
            transform:
              activeSection === "password"
                ? "translateX(0%)"
                : slideDirection === "left"
                ? "translateX(100%)"
                : "translateX(-100%)",
            opacity: activeSection === "password" ? 1 : 0,
            pointerEvents: activeSection === "password" ? "auto" : "none",
          }}
        >
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#C77BBF",
                mb: 2,
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Change Password
            </Typography>

            <TextField
              margin="normal"
              label="Current Password"
              name="oldPassword"
              type={showPassword.old ? "text" : "password"}
              fullWidth
              value={passwordDetails.oldPassword}
              onChange={handlePasswordChange}
              sx={sxStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("old")}
                      edge="end"
                      sx={{ color: "#8c8c8c" }}
                    >
                      {showPassword.old ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              label="New Password"
              name="newPassword"
              type={showPassword.new ? "text" : "password"}
              fullWidth
              value={passwordDetails.newPassword}
              onChange={handlePasswordChange}
              sx={sxStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("new")}
                      edge="end"
                      sx={{ color: "#8c8c8c" }}
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              fullWidth
              value={passwordDetails.confirmPassword}
              onChange={handlePasswordChange}
              sx={sxStyles}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("confirm")}
                      edge="end"
                      sx={{ color: "#8c8c8c" }}
                    >
                      {showPassword.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: "absolute",
            bottom: "80px",
            width: "calc(100% - 48px)",
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={toggleSection}
            endIcon={
              activeSection === "profile" ? <ChevronRight /> : <ChevronLeft />
            }
            sx={{
              color: "#C77BBF",
              borderColor: "#666666",
              "&:hover": {
                borderColor: "#C77BBF",
                backgroundColor: "rgba(199, 123, 191, 0.1)",
              },
              py: 1,
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            {activeSection === "profile"
              ? "Change Password"
              : "Back to Profile"}
          </Button>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{
            position: "absolute",
            bottom: "24px",
            width: "calc(100% - 48px)",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              color: "#E0E0E0",
              borderColor: "#666666",
              "&:hover": {
                borderColor: "#C77BBF",
                backgroundColor: "rgba(199, 123, 191, 0.1)",
              },
              px: 3,
              py: 1,
              borderRadius: "10px",
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={
              activeSection === "profile"
                ? handleUpdateProfile
                : handleChangePassword
            }
            sx={{
              backgroundColor: "#C77BBF",
              color: "white",
              "&:hover": {
                backgroundColor: "#B569AD",
              },
              px: 3,
              py: 1,
              borderRadius: "10px",
            }}
          >
            {activeSection === "profile" ? "Save Changes" : "Change Password"}
          </Button>
        </Stack>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
