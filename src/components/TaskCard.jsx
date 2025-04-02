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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onView,
  isAdmin,
  assignee,
  loggedInUser,
  createdBy,
}) => {
  const { title, priority, dueDate, taskStatus } = task;

  const statusColors = {
    PENDING: { backgroundColor: "rgba(234, 179, 8, 0.6)" },
    ONGOING: { backgroundColor: "rgba(59, 130, 246, 0.6)" },
    COMPLETED: { backgroundColor: "rgba(34, 197, 94, 0.6)" },
    CANCELLED: { backgroundColor: "rgba(107, 114, 128, 0.6)" },
  };

  const priorityColors = {
    Low: { backgroundColor: "rgba(0, 230, 0, 0.6)" },
    Medium: { backgroundColor: "rgba(255, 165, 0, 0.6)" },
    High: { backgroundColor: "rgba(255, 0, 0, 0.6)" },
  };

  const [adminUser, setAdminUser] = useState("");
  const [emoployeeUser, setEmployeeUser] = useState("");
  const [unreadCountByAuthor, setUnreadCountByAuthor] = useState(0);
  const [unreadCountByRecipient, setUnreadCountByRecipient] = useState(0);

  // In TaskCard.js
  useEffect(() => {
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

    if (loggedInUser?.email && task?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 500);

      return () => clearInterval(interval);
    }
  }, [task.id, loggedInUser?.email]);

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

  return (
    <div className="relative">
      {unreadCountByRecipient > 0 && (
        <div className="absolute h-4 w-4 rounded-full bg-red-500 text-gray-300 text-lg flex justify-center items-center -right-2 -top-2 p-3">
          {unreadCountByRecipient}
        </div>
      )}
      <Card
        sx={{
          minWidth: "100%",
          padding: "10px",
          borderRadius: "15px",
          backgroundColor: "#1f1f1f",
          color: "#ddd",
          transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
          border: "2px solid #404040",
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
              color: "#a6a6a6",
              textWrap: "wrap",
              borderRadius: "10px",
              marginBottom: "0px",
              paddingTop: "8px",
              transition: "color 0.3s ease-in-out",
            }}
            className="title"
          >
            {title}
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
                  ...statusColors[taskStatus],
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
                  ...priorityColors[priority],
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
                <div className="w-6 h-6 bg-[#C77BBF] text-[#1f1f1f] rounded-full flex justify-center items-center text-lg cursor-pointer">
                  {emoployeeUser.name?.charAt(0) || "U"}
                </div>
              </Stack>
            ) : (
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="flex flex-col"
                >
                  <span className="text-[#4d4d4d]">Creator</span>{" "}
                  <span className="text-[#999999]">{adminUser.name}</span>
                </Typography>
              </Stack>
            )}
            <div className="bg-[#4d4d4d] w-1 h-1 rounded-full"></div>
            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex flex-col"
              >
                {!isAdmin && <span className="text-[#4d4d4d]">Due</span>}
                <span className="text-[#999999]">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(dueDate))}
                </span>
              </Typography>
            </Stack>
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
                    onClick={onDelete}
                  >
                    <DeleteIcon />
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCard;
