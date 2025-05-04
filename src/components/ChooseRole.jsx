import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Stack,
  Typography,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
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

const ChooseRole = () => {
  const [option, setOption] = useState("admin");
  const { userEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setOption(event.target.value);
  };

  const handleSubmit = async () => {
    if (!userEmail) {
      console.warn("No email found, redirecting...");
      navigate("/");
      return;
    }

    try {
      await axios.post("http://localhost:8080/users/update-role", {
        email: userEmail,
        userRole: option.toUpperCase(),
      });
      navigate("/home");
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <>
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
                  <h1 className="text-4xl text-[#9966ff] font-semibold">
                    Rhine
                  </h1>
                  <p className="font-semibold text-[#808080]">
                    . .Task Manger. .
                  </p>
                </div>
              </motion.div>
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
                Choose Your Role
              </Typography>
              <Stack spacing={3}>
                <Select
                  fullWidth
                  value={option}
                  onChange={handleChange}
                  sx={{
                    borderRadius: "16px",
                    backgroundColor: "rgba(77, 77, 77, 0.2)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#333333",
                      borderWidth: "2px",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C77BBF !important",
                      borderWidth: "2px",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#C77BBF",
                    },
                  }}
                >
                  <MenuItem value="admin">ADMIN</MenuItem>
                  <MenuItem value="employee">EMPLOYEE</MenuItem>
                </Select>

                <motion.div
                  variants={itemVariants}
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
                    onClick={handleSubmit}
                  >
                    Submit
                  </Button>
                </motion.div>
              </Stack>
            </motion.div>
          </Box>
        </Container>
      </ThemeProvider>
      <div className="absolute bottom-0 left-0 w-full flex justify-center">
        <div className="py-2 px-5 ">
          <h1 className="text-[#4d4d4d]">
            Made by Onanta Bassey {/* "(godKing)" */}
          </h1>
        </div>
      </div>
    </>
  );
};

export default ChooseRole;
