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
import { motion } from "framer-motion";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";
import axios from "axios";
import CircleContainer from "./CirlcleContainer";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6A4C9C" },
  },
});

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5 + i * 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

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

  const capitalizeWords = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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

    try {
      await axios.post("http://localhost:8080/users/register", {
        name: capitalizeWords(trimmedName),
        email: trimmedEmail,
        pwd: password,
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
      "&.Mui-focused fieldset": { borderColor: "#C77BBF", borderWidth: "2px" },
      "& fieldset": { borderWidth: "2px", borderColor: "#333333" },
      "&:hover fieldset": { borderColor: "#C77BBF", borderWidth: "2px" },
      backgroundColor: "rgba(77, 77, 77, 0.2)",
      borderRadius: "16px",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C77BBF" },
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: "transparent",
          width: "100%",
          justifyContent: "space-between",
          margin: 0,
          padding: 2,
          alignItems: "center",
        }}
        className="relative flex flex-col justify-center items-center lg:flex-row"
      >
        <CircleContainer />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{
            borderRadius: "16px",
            padding: "20px",
            width: "100%",
            maxWidth: "500px",
          }}
          className=" z-30 h-[500px] lg:h-auto bg-[#1a1a1a]/95 border-2 border-[#4d4d4d] outline-8 lg:outline-0 outline-[#4d4d4d]/30 lg:border-0 xl:bg-transparent xl:backdrop-blur-none backdrop-blur-lg"
        >
          <motion.div
            className="flex lg:hidden justify-center items-center mb-10 bg-[#9966ff]/0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="flex flex-col justify-center items-center bg-gradient-to-r border-2 border-[#9966ff]/50 from-[#220066]/5 to-[#9966ff]/5 backdrop-blur-2xl py-5 px-12 rounded-2xl">
              <h1 className="text-4xl text-[#9966ff] font-semibold">Rhine</h1>
              <p className="font-semibold text-[#808080]">. .Task Manger. .</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} custom={0}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                color: "#4d4d4d",
                fontWeight: "bold",
                marginBottom: "20px",
              }}
            >
              {isSignup ? "Create an account" : "Welcome back"}
            </Typography>
          </motion.div>

          <form>
            <Stack spacing={3}>
              <Stack spacing={1}>
                {isSignup && (
                  // <motion.div variants={itemVariants} custom={1}>
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
                  // </motion.div>
                )}

                <motion.div variants={itemVariants} custom={isSignup ? 2 : 1}>
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
                </motion.div>

                <motion.div variants={itemVariants} custom={isSignup ? 3 : 2}>
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
                </motion.div>
              </Stack>

              <motion.div
                variants={itemVariants}
                custom={isSignup ? 4 : 3}
                className="flex justify-center"
              >
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "hsla(260, 100%, 70%, 0.5)",
                    width: "70%",
                    padding: "12px",
                    borderRadius: "16px",
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#5a3f8a",
                      boxShadow: "none",
                    },
                    transition: "all 0.3s ease",
                  }}
                  onClick={isSignup ? handleSignup : handleLogin}
                >
                  {isSignup ? "Sign Up" : "Log In"}
                </Button>
              </motion.div>
            </Stack>
          </form>
        </motion.div>
      </Box>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        TransitionComponent={Slide}
        TransitionProps={{ direction: "up" }}
        sx={{ position: "absolute" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%", borderRadius: "16px" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div className="absolute bottom-0 w-full flex justify-center">
        <div className="py-2 px-5 ">
          <h1 className="text-[#4d4d4d]">
            Made by Onanta Bassey {/* "(godKing)" */}
          </h1>
        </div>
      </div>
    </>
  );
};

const RegistrationForm = ({ isSignup }) => {
  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="none"
        disableGutters
        sx={{
          height: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Form isSignup={isSignup} />
      </Container>
    </ThemeProvider>
  );
};

export default RegistrationForm;
