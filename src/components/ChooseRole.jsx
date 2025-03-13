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
import { useNavigate } from "react-router-dom";
import {  useAuth } from "../AuthProvider";
import axios from "axios";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6A4C9C" },
  },
});

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
      navigate("/signup");
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
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              p: 3,
              width: "100%",
              maxWidth: 400,
              transition: "all 0.3s ease-in-out",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                color: "#C77BBF",
                fontWeight: "bold",
                mb: 3,
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
                  borderRadius: "10px",
                  backgroundColor: "#404040",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#595959",
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

              <Button
                fullWidth
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: "#6A4C9C",
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: "bold",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    bgcolor: "#5A3F8A",
                    transform: "scale(1.05)",
                    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                  },
                }}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ChooseRole;
