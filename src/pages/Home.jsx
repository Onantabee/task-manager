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
import useWebSocket from "../hooks/useWebSocket.js";
import { Grid, List, Search, SearchCheck } from "lucide-react";
import { Masonry } from "react-plock";
import TaskList from "../components/TaskList.jsx";

export default function Home() {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: { paper: "#121212" },
      text: { primary: "#ffffff" },
      divider: "#424242",
    },
  });
  const { userEmail, searchTerm, setSearchTerm } = useAuth();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tasks, setTasks] = useState([]);
  const { tasks: wsTasks, isConnected } = useWebSocket();
  const [nonAdminUsers, setNonAdminUsers] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCardView, setIsCardView] = useState(true);
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

  useEffect(() => {
    if (wsTasks.length > 0) {
      setTasks((prevTasks) => {
        const taskMap = new Map(
          prevTasks.map((task) => [String(task.id), task])
        );

        wsTasks.forEach((wsTask) => {
          const taskId = String(wsTask.id);
          if (wsTask.deleted) {
            taskMap.delete(taskId);
          } else {
            taskMap.set(taskId, { ...taskMap.get(taskId), ...wsTask });
          }
        });

        return Array.from(taskMap.values());
      });
    }
  }, [wsTasks]);

  useEffect(() => {
    return () => {
      setSearchTerm(""); // Clear search when leaving the page
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const tasksResponse = await axios.get("http://localhost:8080/task");
      if (!isConnected || wsTasks.length === 0) {
        setTasks(tasksResponse.data);
      }
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

  const filterTasks = (tasks) => {
    if (!searchTerm) return tasks;

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/task/${id}`);
      showSnackbar("Task deleted successfully!", "success");
    } catch (error) {
      fetchTasks();
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
      <div className={`flex flex-col gap-3`}>
        <div className="flex flex-col">
          <div
            className={`${
              isAdmin ? "flex justify-between" : "inline"
            } border-b-2   border-[#262626] py-3 gap-2`}
          >
            <h1 className="text-3xl text-[#8c8c8c]">Tasks</h1>
            {isAdmin && (
              <Button
                size="small"
                endIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  position: "relative",
                  backgroundColor: "#ff4d4d",
                  color: "white",
                  overflow: "visible",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid transparent",
                  borderRadius: "15px",
                  padding: "6px 15px",
                  "&:hover": {
                    backgroundColor: "#ff0000",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "-10px",
                    left: "-10px",
                    right: "-10px",
                    bottom: "-10px",
                    border: "3px solid #ff3333",
                    borderRadius: "20px",
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
          <div className="flex flex-row gap-2 border-b-2   border-[#262626] py-3">
            <Button
              onClick={() => setIsCardView(true)}
              variant="contained"
              sx={{
                backgroundColor: "hsla(260, 100%, 70%, 0.1)",
                color: "#9966ff",
                border: "1px solid #9966ff",
                borderRadius: "15px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "hsla(260, 100%, 70%, 1)",
                  color: "#1a1a1a",
                  boxShadow: "none",
                },
              }}
              className="flex items-center gap-2"
            >
              <Grid size={16} />
              Card View
            </Button>
            <Button
              onClick={() => setIsCardView(false)}
              variant="contained"
              color="error"
              sx={{
                backgroundColor: "hsla(0, 0%, 45%, 0.1)",
                border: "1px solid #737373",
                color: "#737373",
                borderRadius: "15px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#737373",
                  color: "#1a1a1a",
                  boxShadow: "none",
                },
              }}
              className="flex items-center gap-2"
            >
              <List size={16} />
              List View
            </Button>
          </div>
        </div>

        {isCardView ? (
          <div>
            <Masonry
              items={(() => {
                const filtered = filterTasks(tasks);
                const userTasks = filtered.filter(
                  (task) =>
                    user?.email === task.createdById ||
                    user?.email === task.assigneeId
                );
                return userTasks.length > 0 ? userTasks : [];
              })()}
              config={{
                columns: [1, 2, 3, 4],
                gap: [16, 16, 16, 16],
                media: [640, 768, 1024, 1280],
              }}
              render={(task) => (
                <div key={task.id}>
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
                        searchTerm={searchTerm}
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
                      searchTerm={searchTerm}
                    />
                  )}
                </div>
              )}
            />

            {(() => {
              const filtered = filterTasks(tasks);
              const userTasks = filtered.filter(
                (task) =>
                  user?.email === task.createdById ||
                  user?.email === task.assigneeId
              );
              return userTasks.length === 0 ? (
                <Typography color="gray">No tasks available</Typography>
              ) : null;
            })()}
          </div>
        ) : (
          // <div className="flex flex-col w-full">
          //   <div className="grid grid-rows-1 grid-cols-[40% 20% 20% 10% 10%] text-white">
          //     <p>Description</p>
          //     <p>Status Priority</p>
          //     <p>Assignee</p>
          //     <p>Due Date</p>
          //     <p>{" "}</p>
          //   </div>
          //   <div className="flex flex-col gap-2">
          //     {tasks.length > 0 ? (
          //       (() => {
          //         const userTasks = tasks.filter(
          //           (task) =>
          //             user?.email === task.createdById ||
          //             user?.email === task.assigneeId
          //         );

          //         return userTasks.length > 0 ? (
          //           userTasks.map((task) => (
          //             <div key={task.id}>
          //               {!isAdmin ? (
          //                 <Link
          //                   to={`/task/${task.id}`}
          //                   state={{ task, isAdmin, user }}
          //                 >
          //                   <TaskList
          //                     task={task}
          //                     onEdit={() => handleOpenDialog(task)}
          //                     onDelete={() => handleDeleteTask(task.id)}
          //                     loggedInUser={user}
          //                     isAdmin={isAdmin}
          //                     assignee={task.assigneeId}
          //                     createdBy={task.createdById}
          //                   />
          //                 </Link>
          //               ) : (
          //                 <TaskList
          //                   task={task}
          //                   onEdit={() => handleOpenDialog(task)}
          //                   onDelete={() => handleDeleteTask(task.id)}
          //                   onView={() =>
          //                     navigate(`/task/${task.id}`, {
          //                       state: { task, isAdmin, user },
          //                     })
          //                   }
          //                   loggedInUser={user}
          //                   isAdmin={isAdmin}
          //                   assignee={task.assigneeId}
          //                   createdBy={task.createdById}
          //                 />
          //               )}
          //             </div>
          //           ))
          //         ) : (
          //           <Typography color="gray">No tasks available</Typography>
          //         );
          //       })()
          //     ) : (
          //       <Typography color="gray">No tasks available</Typography>
          //     )}
          //   </div>
          // </div>
          <div className="text-[#404040]/50 w-full mt-50 flex justify-center items-center">
            <h1 className="text-[10vw] sm:text-[8vw] md:text-[6vw]">
              {"<>Coming Soon!!</>"}
            </h1>
          </div>
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
