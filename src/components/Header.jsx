import React, { useContext, useState, useRef, useEffect } from "react";
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
  Paper,
  MenuList,
  MenuItem,
  Typography,
  Grow,
  Popper,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext, useAuth } from "../AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Search, X } from "lucide-react";

const Header = ({ setIsSignup }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const {
    isLoggedIn,
    logout,
    userName,
    searchTerm,
    setSearchTerm,
    userData,
    isAdmin,
  } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const location = useLocation();

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
    setProfileDropdownOpen(false);
  };

  const handleLogoutConfirm = () => {
    logout();
    setMobileOpen(false);
    setLogoutDialogOpen(false);
    navigate("/");
    setIsSignup(false);
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          padding: "12px",
        },
      }}
    >
      <div className="flex justify-end  pr-2">
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
          <div className="flex flex-col justify-center items-center">
            <div className="bg-[#333333] w-full flex p-2 flex-col justify-center items-center rounded-lg">
              <div
                className="profile w-15 h-15 mb-3 bg-[#C77BBF] rounded-full flex justify-center items-center text-4xl cursor-pointer"
                onClick={toggleProfileDropdown}
              >
                <span>{userName?.charAt(0) || "U"}</span>
              </div>
              <Typography
                sx={{
                  fontWeight: "semibold",
                  fontSize: "25px",
                  color: "#8c8c8c",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {userName}
              </Typography>
              {isAdmin && (
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: "#8c8c8c",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  (Admin)
                </Typography>
              )}
            </div>
            <Divider
              sx={{
                backgroundColor: "#333333",
                margin: "16px 0",
                width: "100%",
                height: "2px",
              }}
            />
            <ListItem disablePadding>
              <ListItemButton
                sx={{
                  backgroundColor: "#ff3333",
                  borderRadius: "8px",
                  display: "flex",
                  gap: "10px",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#ff0000",
                  },
                }}
                onClick={handleLogoutClick}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </ListItemButton>
            </ListItem>
          </div>
        )}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar
        position="static"
        className="px-5 sm:px-8 md:px-12 lg:px-16 mb-5"
        sx={{ backgroundColor: "#2A2A2A", boxShadow: "none" }}
      >
        <Toolbar sx={{padding: "0 !important"}}>
          <div className="w-full justify-center max-w-[1240px] mx-auto items-center hidden md:flex space-x-4 gap-4">
            <h1 className="text-xl font-bold text-gray-500 w-fit">Rhine</h1>
            {!isLoggedIn ? (
              <div className="w-full flex justify-end gap-5">
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
              </div>
            ) : (
              <div className="flex w-full justify-between items-center gap-4">
                <div className="w-full flex justify-center items-center">
                  {location.pathname === "/home" && (
                    <div className="flex items-center justify-center w-[30rem] pl-6 pr-1 bg-[#4d4d4d] py-1 rounded-[15px]">
                      <input
                        type="text"
                        placeholder="Search tasks..."
                        className="text-[16px] w-full text-gray-300 py-1 focus:outline-0"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <div
                        className={`rounded-full p-1 cursor-pointer flex items-center justify-center ${
                          searchTerm &&
                          "bg-[#4d4d4d] hover:bg-[#ff3333] transition-colors duration-300 group"
                        }`}
                        onClick={
                          searchTerm ? () => setSearchTerm("") : undefined
                        }
                      >
                        {searchTerm ? (
                          <X
                            className="text-[#ff8080] group-hover:text-[#404040]"
                            size={25}
                          />
                        ) : (
                          <Search color="#C77BBF" size={25} />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={profileRef}>
                  <div
                    className="profile w-10 h-10 bg-[#C77BBF] rounded-full flex justify-center items-center text-3xl cursor-pointer"
                    onClick={toggleProfileDropdown}
                  >
                    <span>{userName?.charAt(0) || "U"}</span>
                  </div>
                  <Popper
                    open={profileDropdownOpen}
                    anchorEl={profileRef.current}
                    placement="bottom-end"
                    transition
                    disablePortal
                    sx={{ zIndex: 1 }}
                  >
                    {({ TransitionProps }) => (
                      <Grow {...TransitionProps}>
                        <Paper
                          sx={{
                            minWidth: 250,
                            padding: "10px",
                            backgroundColor: "#333333",
                            color: "#E0E0E0",
                            border: "1px solid #444",
                            marginTop: "8px",
                            borderRadius: "15px",
                            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.25)",
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "semibold",
                              fontSize: "20px",
                              color: "#8c8c8c",
                              display: "flex",
                              justifyContent: "center",
                              ...(!isAdmin && { marginBottom: "10px" }),
                            }}
                          >
                            {userName}
                          </Typography>
                          {isAdmin && (
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: "#8c8c8c",
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "10px",
                              }}
                            >
                              (Admin)
                            </Typography>
                          )}
                          <MenuList
                            sx={{
                              padding: 0,
                            }}
                          >
                            <MenuItem
                              onClick={handleLogoutClick}
                              sx={{
                                backgroundColor: "#ff3333",
                                display: "flex",
                                textTransform: "uppercase",
                                fontWeight: "semibold",
                                justifyContent: "start",
                                borderRadius: "15px",
                                padding: "10px",
                                gap: "10px",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  backgroundColor: "#ff0000",
                                },
                              }}
                            >
                              <LogOut size={18} />
                              <span>Logout</span>
                            </MenuItem>
                          </MenuList>
                        </Paper>
                      </Grow>
                    )}
                  </Popper>
                </div>
              </div>
            )}
          </div>
          <div className="md:hidden w-full justify-between items-center flex gap-4">
            <h1 className="text-xl font-bold text-gray-500 w-fit">Rhine</h1>
            <IconButton edge="end" onClick={handleDrawerToggle}>
              <MenuIcon className="text-gray-300" />
            </IconButton>
          </div>
        </Toolbar>
        {drawer}
      </AppBar>

      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#2A2A2A",
            minWidth: "250px",
            width: "400px",
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
            You are about to logout.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleLogoutCancel}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            onClick={handleLogoutConfirm}
            color="error"
            autoFocus
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
