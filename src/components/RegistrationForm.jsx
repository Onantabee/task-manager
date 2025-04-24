import React, { useContext, useEffect, useState } from "react";
import {
  createTheme,
  ThemeProvider,
  TextField,
  Button,
  Typography,
  Box,
  Container,
  InputAdornment,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  Slide,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import axios from "axios";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6A4C9C" },
  },
});

const Form = ({ isSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const validateFields = () => {
    if (email === "" && password === "") {
      setSnackbarMessage("Email and password cannot be empty!");
      return false;
    } else if (email === "") {
      setSnackbarMessage("Email cannot be empty!");
      return false;
    } else if (password === "") {
      setSnackbarMessage("Password cannot be empty!");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateFields()) {
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      await axios.post("http://localhost:8080/users/register", {
        name: trimmedName,
        email: trimmedEmail,
        pwd: trimmedPassword,
      });

      console.log("Signup successful!");
      login(trimmedEmail);
      setName("");
      setEmail("");
      setPassword("");
      navigate("/choose-role");
    } catch (error) {
      console.error("Signup failed:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message || "Couldn't Connect to Server";

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      setSnackbarMessage("Email and password cannot be empty!");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const response = await axios.post("http://localhost:8080/users/login", {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log("Login successful!", response.data);
      login(trimmedEmail);
      setEmail("");
      setPassword("");
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message || "Couldn't Connect to Server";

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const sxStyles = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#C77BBF" },
      "& fieldset": { borderColor: "#595959" },
      "&:hover fieldset": { borderColor: "#C77BBF", borderWidth: "2px" },
      backgroundColor: "#404040",
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C77BBF" },
  };

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: 2,
        alignItems: "center",
      }}
    >
      <div
        style={{
          borderRadius: "12px",
          padding: "20px",
          width: "100%",
          maxWidth: "400px",
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: "#C77BBF", fontWeight: "bold", marginBottom: "20px" }}
        >
          {isSignup ? "Create an account" : "Welcome back"}
        </Typography>
        <form>
          <Stack spacing={3}>
            <Stack spacing={1}>
              {isSignup && (
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  color="primary"
                  required
                  sx={sxStyles}
                />
              )}
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                color="primary"
                required
                sx={sxStyles}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                color="primary"
                required
                sx={sxStyles}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: "#C77BBF" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "primary",
                padding: "12px",
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "#5a3f8a",
                  transform: "scale(1.05)",
                  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
                },
                transition: "all 0.3s ease",
              }}
              onClick={isSignup ? handleSignup : handleLogin}
            >
              {isSignup ? "Sign Up" : "Log In"}
            </Button>
          </Stack>
        </form>
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Slide}
          TransitionProps={{ direction: "down" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </Box>
  );
};

const RegistrationForm = ({ isSignup }) => {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Form isSignup={isSignup} />
      </Container>
    </ThemeProvider>
  );
};

export default RegistrationForm;
