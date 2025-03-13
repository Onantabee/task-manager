import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../AuthProvider";
import { useNavigate, useNavigation } from "react-router-dom";

const Header = ({ setIsSignup }) => {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  // const pathname = useNavigation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLoginClick = () => {
    setIsSignup(false);
    handleDrawerToggle();
  };

  const handleSignupClick = () => {
    setIsSignup(true);
    handleDrawerToggle();
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setMobileOpen(false);
    setLogoutDialogOpen(false);
    navigate("/")
    setIsSignup(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const drawer = (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      sx={{
        width: 250,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          backgroundColor: "#1E1E1E",
          color: "#E0E0E0",
          borderLeft: "1px solid #333",
        },
      }}
    >
      <div className="flex justify-end pt-2 pr-5">
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon className="text-gray-300" />
        </IconButton>
      </div>
      <List className="min-w-[250px]">
        {!isLoggedIn ? (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLoginClick}>Login</ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleSignupClick}>
                Signup
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogoutClick}>Logout</ListItemButton>
          </ListItem>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="static"
        className="shadow-md px-4 md:px-10"
        sx={{ backgroundColor: "#2A2A2A" }}
      >
        <Toolbar className="flex justify-between">
          <h1 className="text-xl font-bold text-gray-200">RhineAPP</h1>
          <div className="hidden md:flex space-x-4 gap-4">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "white",
                    color: "black",
                    padding: "10px 20px",
                  }}
                  onClick={() => {
                    setIsSignup(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#6A4C9C" }}
                  onClick={() => {
                    setIsSignup(true);
                  }}
                >
                  Signup
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                sx={{ backgroundColor: "#b30000" }}
                onClick={handleLogoutClick}
              >
                Logout
              </Button>
            )}
          </div>
          <div className="md:hidden">
            <IconButton edge="end" onClick={handleDrawerToggle}>
              <MenuIcon className="text-gray-300" />
            </IconButton>
          </div>
        </Toolbar>
        {drawer}
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#2A2A2A",
            color: "#E0E0E0",
          },
        }}
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{ color: "#C77BBF", fontWeight: "bold" }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="logout-dialog-description"
            sx={{ color: "#E0E0E0" }}
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="error" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
