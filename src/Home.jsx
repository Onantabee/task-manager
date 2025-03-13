import React, { useEffect, useState } from "react";
import {
  Button,
  ThemeProvider,
  createTheme,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskCard from "./components/TaskCard";
import { useAuth } from "./AuthProvider";
import axios from "axios";

export default function Home() {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        paper: "#121212",
      },
      text: {
        primary: "#ffffff",
      },
      divider: "#424242",
    },
  });

  const { userEmail } = useAuth();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState(null);
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    taskStatus: "PENDING",
    createdById: null,
    assigneeId: "",
  });
  const [nonAdminUsers, setNonAdminUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchTasks = async () => {
    try {
      const tasksResponse = await axios.get("http://localhost:8080/task");
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `http://localhost:8080/users/${userEmail}`
        );
        setUser(userResponse.data);

        if (userResponse.data.userRole === "ADMIN") {
          setIsAdmin(true);
        }

        const nonAdminUsersResponse = await axios.get(
          "http://localhost:8080/users/non-admin"
        );
        setNonAdminUsers(nonAdminUsersResponse.data);

        await fetchTasks(); // Fetch tasks initially
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    if (userEmail) {
      fetchUserData();
    }

    // Set up polling to fetch tasks every 5 seconds
    const intervalId = setInterval(fetchTasks, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [userEmail]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/task/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      setSnackbarMessage("Task deleted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting task:", error);
      setSnackbarMessage("Failed to delete task. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAssigneeChange = (event) => {
    const selectedEmail = event.target.value;
    setTaskDetails((prevDetails) => ({
      ...prevDetails,
      assigneeId: selectedEmail || "",
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTaskDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const taskData = {
        title: taskDetails.title,
        description: taskDetails.description,
        dueDate: taskDetails.dueDate,
        priority: taskDetails.priority,
        taskStatus: taskDetails.taskStatus,
        createdById: user.email,
        assigneeId: taskDetails.assigneeId,
      };

      await axios.post("http://localhost:8080/task/create-task", taskData);

      setSnackbarMessage("Task created successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Reset the form
      setTaskDetails({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        taskStatus: "PENDING",
        createdById: null,
        assigneeId: "",
      });

      handleClose();

      // Fetch tasks immediately after creating a new task
      await fetchTasks();
    } catch (error) {
      console.error("Error creating task:", error);
      setSnackbarMessage("Failed to create task. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const sxStyles = {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused fieldset": { borderColor: "#C77BBF" },
      "& fieldset": { borderWidth: "2px", borderColor: "#666666" },
      "&:hover fieldset": { borderColor: "#C77BBF", borderWidth: "2px" },
      backgroundColor: "#4d4d4d",
      borderRadius: "10px",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#C77BBF" },
  };

  return (
    <ThemeProvider theme={darkTheme}>
      {isAdmin ? (
        <div className="p-5">
          <Button
            size="small"
            endIcon={<AddIcon />}
            onClick={handleClickOpen}
            sx={{
              position: "relative",
              backgroundColor: "#b30000",
              color: "white",
              overflow: "visible",
              border: "2px solid transparent",
              "&:hover": {
                backgroundColor: "red",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: "-10px",
                left: "-10px",
                right: "-10px",
                bottom: "-10px",
                border: "3px solid #ff3333",
                borderRadius: "6px",
                opacity: 1,
                transform: "scale(1)",
                transition: "opacity 0.3s ease, transform 0.3s ease",
                zIndex: 1,
              },
              "&:not(:hover)::after": {
                opacity: 0,
                transform: "scale(0.5)",
              },
            }}
          >
            Add Task
          </Button>
        </div>
      ) : null}

      <div className="text-5xl text-white">
        Welcome, {user ? user.name : "Guest"}
      </div>

      <div className="p-5 grid grid-cols-3 grid-row-3 gap-4">
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <TaskCard
              key={index}
              task={task}
              onEdit={() => console.log("Edit task:", task.title)}
              onDelete={() => handleDeleteTask(task.id)}
              loggedInUser={user}
              isAdmin={isAdmin}
            />
          ))
        ) : (
          <Typography color="gray">No tasks available</Typography>
        )}
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "hsla(0, 0%, 0%, 0.5)",
          },
          "& .MuiPaper-root": {
            backgroundColor: "#0d0d0d",
          },
        }}
      >
        <DialogTitle>
          <Typography
            className="text-gray-300"
            sx={{
              fontSize: "15px",
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            <span className="text-2xl">A</span>dd{" "}
            <span className="text-2xl">T</span>ask
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Name"
            name="title"
            fullWidth
            required
            value={taskDetails.title}
            onChange={handleChange}
            sx={sxStyles}
          />
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={3}
            value={taskDetails.description}
            onChange={handleChange}
            sx={sxStyles}
          />
          <div className="flex flex-row gap-4">
            <div className="w-full">
              <Typography
                className="text-gray-300"
                sx={{
                  fontSize: "15px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  paddingLeft: "10px",
                }}
              >
                Priority
              </Typography>
              <FormControl fullWidth margin="dense">
                <Select
                  name="priority"
                  value={taskDetails.priority}
                  onChange={handleChange}
                  sx={{
                    borderRadius: "10px",
                    backgroundColor: "#4d4d4d",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#666666",
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
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="w-full">
              <Typography
                className="text-gray-300"
                sx={{
                  fontSize: "15px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  paddingLeft: "10px",
                }}
              >
                Status
              </Typography>
              <FormControl fullWidth margin="dense">
                <Select
                  name="taskStatus"
                  value={taskDetails.taskStatus}
                  onChange={handleChange}
                  sx={{
                    borderRadius: "10px",
                    backgroundColor: "#4d4d4d",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#666666",
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
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="INPROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
          <TextField
            margin="dense"
            label="Due Date"
            name="dueDate"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={taskDetails.dueDate}
            onChange={handleChange}
            sx={sxStyles}
          />
          <div className="w-full">
            <Typography
              className="text-gray-300"
              sx={{
                fontSize: "15px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                paddingLeft: "10px",
              }}
            >
              Assign To
            </Typography>
            <FormControl fullWidth margin="dense">
              <Select
                id="assignee"
                name="assigneeId"
                value={taskDetails.assigneeId || ""}
                onChange={handleAssigneeChange}
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "#4d4d4d",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#666666",
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
                <MenuItem value="" disabled>
                  Select an assignee
                </MenuItem>
                {nonAdminUsers.length === 0 ? (
                  <MenuItem value="">No users available</MenuItem>
                ) : (
                  nonAdminUsers.map((user) => (
                    <MenuItem key={user.email} value={user.email}>
                      {user.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

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
    </ThemeProvider>
  );
}