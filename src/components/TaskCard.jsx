import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";
import useWebSocket from "../hooks/useWebSocket";

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onView,
  isAdmin,
  assignee,
  loggedInUser,
  createdBy,
  searchTerm,
}) => {
  const { title, priority, dueDate, taskStatus } = task;

  const statusColors = {
    PENDING: { backgroundColor: "rgba(234, 179, 8, 0.6)" },
    ONGOING: { backgroundColor: "rgba(59, 130, 246, 0.6)" },
    COMPLETED: { backgroundColor: "rgba(34, 197, 94, 0.6)" },
    CANCELLED: { backgroundColor: "rgba(107, 114, 128, 0.6)" },
    OVERDUE: { backgroundColor: "rgba(128, 128, 128, 0.6)" },
  };

  const priorityColors = {
    Low: { backgroundColor: "rgba(0, 230, 0, 0.6)" },
    Medium: { backgroundColor: "rgba(255, 165, 0, 0.6)" },
    High: { backgroundColor: "rgba(255, 0, 0, 0.6)" },
    OVERDUE: { backgroundColor: "rgba(128, 128, 128, 0.6)" },
  };

  const [adminUser, setAdminUser] = useState("");
  const [employeeUser, setEmployeeUser] = useState("");
  const [unreadCountByRecipient, setUnreadCountByRecipient] = useState(0);
  const [taskIsNew, setTaskIsNew] = useState(false);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
  const { client, isConnected } = useWebSocket();
  const [dueDateStatus, setDueDateStatus] = useState(null);

  useEffect(() => {
    if (taskStatus === "COMPLETED" || taskStatus === "CANCELLED") {
      setDueDateStatus(null);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      setDueDateStatus("OVERDUE");
    } else if (diffDays === 0) {
      setDueDateStatus("DUE_TODAY");
    } else if (diffDays === 1) {
      setDueDateStatus("DUE_TOMORROW");
    } else if (diffDays === 2) {
      setDueDateStatus("DUE_IN_2_DAYS");
    } else {
      setDueDateStatus(null);
    }
  }, [dueDate, taskStatus]);

  const highlightSearchMatch = (text) => {
    if (!searchTerm || searchTerm.trim() === "") return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span
          key={index}
          style={{
            backgroundColor: "#c77bbf8b",
            color: "white",
            padding: "0 3px",
            borderRadius: "3px",
            fontWeight: "bold",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    if (!isConnected || !client) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/comment/count-unread-by-recipient/${task.id}/${loggedInUser.email}`
        );
        setUnreadCountByRecipient(res.data);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    const fetchTaskNewState = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/task/${task.id}/is-new`
        );
        setTaskIsNew(response.data.isNew);
      } catch (error) {
        console.error("Failed to fetch task's new state:", error);
        return false;
      }
    };

    fetchTaskNewState();
    fetchUnreadCount();

    const subscription = client.subscribe(
      `/topic/unread-count/${loggedInUser.email}/${task.id}`,
      (message) => {
        try {
          const update = JSON.parse(message.body);
          setUnreadCountByRecipient(update.count);
        } catch (error) {
          console.error("Error parsing unread count update:", error);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [task.id, loggedInUser?.email, client, isConnected]);

  useEffect(() => {
    const fetchCreatorName = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/users/${createdBy}`);
        setAdminUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    const fetchAssigneeName = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/users/${assignee}`);
        setEmployeeUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };
    fetchCreatorName();
    fetchAssigneeName();
  }, [createdBy, assignee]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (deleteTaskDialogOpen && event.key === "Enter") {
        event.preventDefault();
        onDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteTaskDialogOpen]);

  const handleDeleteTaskClick = () => {
    setDeleteTaskDialogOpen(true);
  };

  const handleDeleteTaskDialogCancel = () => {
    setDeleteTaskDialogOpen(false);
  };

  const fullName = String(employeeUser?.name);
  const names = fullName.split(/\s+/);
  const firstName = names[0];
  const lastName = names[1];

  const getCardBackground = () => {
    if (taskStatus === "COMPLETED") {
      return "rgba(0, 51, 0, 0.1)";
    }
    if (taskStatus === "CANCELLED") {
      return "rgba(51, 0, 51, 0.1)";
    }

    switch (dueDateStatus) {
      case "DUE_IN_2_DAYS":
        return "rgba(51, 51, 0, 0.2)";
      case "DUE_TOMORROW":
        return "rgba(51, 33, 0, 0.2)";
      case "DUE_TODAY":
        return "rgba(51, 0, 0, 0.2)";
      case "OVERDUE":
        return "rgba(128, 128, 128, 0.1)";
      default:
        return "#1f1f1f";
    }
  };

  const dueDateStatusConfig = {
    OVERDUE: {
      text: "Overdue",
      className: "bg-[#666666]/30 border-[#808080] text-[#bfbfbf]",
    },
    DUE_TODAY: {
      text: "Due",
      className: "bg-[#ff0000]/30 border-[#ff0000] text-[#ff9999]",
    },
    DUE_TOMORROW: {
      text: "Due Tomorrow",
      className: "bg-[#805300]/30 border-[#805300] text-[#ffa600]",
    },
    DUE_IN_2_DAYS: {
      text: "Due in 2 Days",
      className: "bg-[#808000]/30 border-[#808000] text-[#cccc00]",
    },
  };

  const getDueDateText = () => {
    if (["COMPLETED", "CANCELLED"].includes(taskStatus)) {
      return formatDate(dueDate);
    }

    if (dueDateStatusConfig[dueDateStatus]) {
      return dueDateStatusConfig[dueDateStatus].text;
    }

    return formatDate(dueDate);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const shouldGrayOut = () => {
    return dueDateStatus === "OVERDUE" || taskStatus === "CANCELLED";
  };

  return (
    <div className="relative">
      <div>
        {unreadCountByRecipient > 0 && (
          <button
            onClick={onView}
            className="absolute h-4 w-4 rounded-full transition-transform duration-300 ease-in-out hover:scale-125 cursor-pointer bg-red-500 text-shadow text-gray-300 text-[14px] border-[1px] border-[#fb5059] flex justify-center items-center -right-2 -top-2 p-3"
          >
            {unreadCountByRecipient}
          </button>
        )}
        {!isAdmin && taskIsNew && (
          <button
            onClick={onView}
            className={`absolute h-4 w-14 rounded-full cursor-pointer bg-[#ff6600] text-gray-300 text-[14px] border-[1px] border-[#ff751a] flex justify-center items-center ${
              unreadCountByRecipient > 0 ? "right-7" : "-right-2"
            } -top-2 p-3`}
          >
            New
          </button>
        )}
      </div>
      <div className="absolute w-full h-full bg-[#1f1f1f] rounded-[15px] -z-10 -top-0 -left-0" />
      <Card
        sx={{
          minWidth: "100%",
          padding: "10px",
          borderRadius: "15px",
          backgroundColor: getCardBackground(),
          color: "#ddd",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          border:
            taskStatus === "COMPLETED"
              ? "2px solid rgba(34, 197, 94, 0.7)"
              : taskStatus === "CANCELLED"
              ? "2px solid rgba(64, 64, 64, 0.7)"
              : dueDateStatus === "DUE_TODAY"
              ? "2px solid rgba(255, 0, 0, 0.7)"
              : dueDateStatus === "DUE_TOMORROW"
              ? "2px solid rgba(128, 83, 0, 0.7)"
              : dueDateStatus === "DUE_IN_2_DAYS"
              ? "2px solid rgba(128, 128, 0, 0.7)"
              : "2px solid #404040",
          "&:hover": {
            "& .action-button": {
              color: "#595959",
            },
            "& .title": {
              color: "#cccccc",
            },
          },
        }}
      >
        <CardContent
          sx={{
            padding: "0 !important",
          }}
        >
          <Typography
            gutterBottom
            fontWeight="bold"
            sx={{
              whiteSpace: "nowrap",
              fontSize: "16px",
              color: taskStatus === "CANCELLED" ? "#808080" : "#a6a6a6",
              textDecoration:
                taskStatus === "CANCELLED" ? "line-through" : "none",
              fontStyle:
                taskStatus === "CANCELLED" ? "italic" : "none",
              textWrap: "wrap",
              borderRadius: "10px",
              marginBottom: "0px",
              paddingTop: "8px",
              transition: "color 0.3s ease-in-out",
            }}
            className="title"
          >
            {highlightSearchMatch(title)}
          </Typography>
          <Divider sx={{ backgroundColor: "#333333", marginY: 2 }} />
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Chip
                sx={{
                  ...(shouldGrayOut()
                    ? statusColors.OVERDUE
                    : statusColors[taskStatus]),
                  minWidth: "90px",
                  minHeight: "20px",
                }}
                label={taskStatus}
                size="small"
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Chip
                sx={{
                  ...(shouldGrayOut()
                    ? priorityColors.OVERDUE
                    : priorityColors[priority]),
                  minWidth: "80px",
                  minHeight: "20px",
                }}
                label={priority}
                size="small"
              />
            </Box>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            {isAdmin ? (
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                {taskStatus === "COMPLETED" || taskStatus === "CANCELLED" ? (
                  <div
                    className={`px-3 py-2 font-semibold border-[1px] text-sm  rounded-full flex justify-center items-center cursor-pointer ${
                      taskStatus === "CANCELLED"
                        ? "bg-[#666666]/30 border-[#666666] text-[#8c8c8c]"
                        : "bg-[#C77BBF]/30 border-[#C77BBF] text-[#e8c9e5]"
                    }`}
                  >
                    <span>{firstName ? firstName : "User"}</span>
                    <span className={`${lastName ? "ml-1" : "ml-0"}`}>
                      {lastName ? lastName : ""}
                    </span>
                  </div>
                ) : (
                  <div className="w-6 h-6 p-4 border-[1px] border-[#C77BBF] bg-[#C77BBF]/30 text-[#e8c9e5] rounded-full flex justify-center items-center text-sm cursor-pointer">
                    <span>{firstName?.charAt(0) || "U"}</span>
                    <span>{lastName?.charAt(0) || ""}</span>
                  </div>
                )}
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="flex flex-col"
                >
                  <span className="text-[#666666] pl-3 mb-1">Creator</span>{" "}
                  <span
                    className={`px-3 py-1 border-[1px] text-sm rounded-full flex justify-center items-center cursor-pointer font-medium ${
                      taskStatus === "CANCELLED"
                        ? "bg-[#666666]/30 border-[#666666] text-[#8c8c8c]"
                        : "bg-[#5d8bf4]/20 border-[#5d8bf4] text-[#b7cbfa]"
                    }`}
                  >
                    {adminUser.name}
                  </span>
                </Typography>
              </Stack>
            )}
            {!(taskStatus === "COMPLETED" || taskStatus === "CANCELLED") && (
              <>
                <div className="bg-[#4d4d4d] w-1 h-1 rounded-full"></div>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    className="flex flex-col"
                  >
                    {!isAdmin && (
                      <span className="text-[#666666] pl-3 mb-1">Due</span>
                    )}
                    <span
                      className={`px-3 py-1 border-[1px] text-sm rounded-full flex justify-center items-center cursor-pointer font-medium italic ${
                        dueDateStatus && dueDateStatusConfig[dueDateStatus]
                          ? `${dueDateStatusConfig[dueDateStatus].className} italic`
                          : "bg-[#333333]/30 border-[#4d4d4d] text-[#a6a6a6]"
                      }`}
                    >
                      {getDueDateText()}
                    </span>
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>

          {isAdmin && (
            <>
              <Divider sx={{ backgroundColor: "#333333", marginY: 2 }} />
              <Box display="flex" padding={0} justifyContent="flex-end">
                <Stack direction="row" spacing={1}>
                  <Button
                    onClick={onView}
                    className="action-button"
                    sx={{
                      borderRadius: "5px",
                      minWidth: 0,
                      padding: "2px 5px !important",
                      color: "transparent",
                      transition: "color 0.3s ease-in-out",
                      "&:hover": {
                        color: (theme) =>
                          `${theme.palette.primary.main} !important`,
                        backgroundColor: "transparent !important",
                        "& .MuiTouchRipple-root": {
                          display: "none",
                        },
                      },
                    }}
                  >
                    <ViewIcon />
                  </Button>
                  <Button
                    className="action-button"
                    sx={{
                      borderRadius: "5px",
                      minWidth: 0,
                      padding: "2px 5px !important",
                      color: "transparent",
                      transition: "color 0.3s ease-in-out",
                      "&:hover": {
                        color: (theme) =>
                          `${theme.palette.info.main} !important`,
                        backgroundColor: "transparent !important",
                        "& .MuiTouchRipple-root": {
                          display: "none",
                        },
                      },
                    }}
                    onClick={onEdit}
                  >
                    <EditIcon />
                  </Button>
                  <Button
                    sx={{
                      borderRadius: "5px",
                      minWidth: 0,
                      padding: "2px 5px !important",
                      color: "#ff6666",
                      transition: "color 0.3s ease-in-out",
                      "&:hover": {
                        color: (theme) => theme.palette.error.main,
                        backgroundColor: "transparent !important",
                        "& .MuiTouchRipple-root": {
                          display: "none",
                        },
                      },
                    }}
                    onClick={handleDeleteTaskClick}
                  >
                    <DeleteIcon />
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteTaskDialogOpen}
        onClose={handleDeleteTaskDialogCancel}
        aria-labelledby="task-delete-dialog-title"
        aria-describedby="logout-dialog-description"
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#2A2A2A",
            borderRadius: "15px",
            minWidth: "250px",
            width: "400px",
            color: "#E0E0E0",
          },
        }}
      >
        <DialogTitle
          id="task-delete-dialog-title"
          sx={{ color: "#b3b3b3", fontWeight: "bold" }}
        >
          Delete Task?
        </DialogTitle>
        <DialogContent sx={{ padding: "0 24px" }}>
          <DialogContentText
            id="logout-dialog-description"
            sx={{ color: "#E0E0E0" }}
          >
            You are about to delete a task
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: "24px" }}>
          <Button
            variant="contained"
            onClick={handleDeleteTaskDialogCancel}
            sx={{
              backgroundColor: "#404040",
              color: "#E0E0E0",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#4d4d4d",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onDelete}
            color="error"
            autoFocus
            sx={{
              backgroundColor: "#ff3333",
              color: "#E0E0E0",
              borderRadius: "8px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#ff0000",
                boxShadow: "none",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TaskCard;
