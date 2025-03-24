import React, { useEffect, useState } from "react";
import {
  Button,
  ThemeProvider,
  createTheme,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TaskCard from "../components/TaskCard.jsx";
import TaskDialog from "../components/TaskDialog.jsx";
import { useAuth } from "../AuthProvider.jsx";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const darkTheme = createTheme({palette: { mode: "dark", background: {paper: "#121212", }, text: {primary: "#ffffff", }, divider: "#424242",},});
  const { userEmail } = useAuth();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [nonAdminUsers, setNonAdminUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;

      try {
        const userResponse = await axios.get(
          `http://localhost:8080/users/${userEmail}`
        );
        setUser(userResponse.data);
        setIsAdmin(userResponse.data.userRole === "ADMIN");

        const nonAdminUsersResponse = await axios.get(
          "http://localhost:8080/users/non-admin"
        );
        setNonAdminUsers(nonAdminUsersResponse.data);

        await fetchTasks();
      } catch (error) {
        console.error("Error fetching data:", error);
        showSnackbar("Failed to fetch data. Please try again.", "error");
      }
    };

    fetchData();
  }, [userEmail]);

  const fetchTasks = async () => {
    try {
      const tasksResponse = await axios.get("http://localhost:8080/task");
      setTasks(tasksResponse.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      showSnackbar("Failed to fetch tasks. Please try again.", "error");
    }
  };

  const handleOpenDialog = (task = null) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/task/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      showSnackbar("Task deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting task:", error);
      showSnackbar("Failed to delete task. Please try again.", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="py-10">
        {isAdmin && (
          <Button
            size="small"
            endIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
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
        )}
      </div>

      <div className="text-5xl text-white">
        Welcome, {user ? user.name : "Guest"}
      </div>

      <div className="py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full mx-auto gap-4">
        {tasks.length > 0 ? (
          (() => {
            const userTasks = tasks.filter(
              (task) =>
                user?.email === task.createdById ||
                user?.email === task.assigneeId
            );

            return userTasks.length > 0 ? (
              userTasks.map((task) => (
                <div key={task.id} className="flex flex-col justify-between">
                  {!isAdmin ? (
                    <Link
                      to={`/task/${task.id}`}
                      state={{ task, isAdmin, user }}
                    >
                      <TaskCard
                        task={task}
                        onEdit={() => handleOpenDialog(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        loggedInUser={user}
                        isAdmin={isAdmin}
                        assignee={task.assigneeId}
                        createdBy={task.createdById}
                      />
                    </Link>
                  ) : (
                    <TaskCard
                      task={task}
                      onEdit={() => handleOpenDialog(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onView={() =>
                        navigate(`/task/${task.id}`, {
                          state: { task, isAdmin, user },
                        })
                      }
                      loggedInUser={user}
                      isAdmin={isAdmin}
                      assignee={task.assigneeId}
                      createdBy={task.createdById}
                    />
                  )}
                </div>
              ))
            ) : (
              <Typography color="gray">No tasks available</Typography>
            );
          })()
        ) : (
          <Typography color="gray">No tasks available</Typography>
        )}
      </div>

      <TaskDialog
        open={openDialog}
        onClose={handleCloseDialog}
        task={selectedTask}
        user={user}
        nonAdminUsers={nonAdminUsers}
        fetchTasks={fetchTasks}
        showSnackbar={showSnackbar}
      />

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
