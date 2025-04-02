import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";

const TaskList = ({
  task,
  onEdit,
  onDelete,
  onView,
  isAdmin,
  assignee,
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
  const [employeeUser, setEmployeeUser] = useState("");

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
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px",
        backgroundColor: "#1f1f1f",
        borderRadius: "8px",
        border: "1px solid #404040",
        width: "100%",
        transition: "all 0.3s ease",
        "& .action-button": {
            color: "#595959",
          },
        "&:hover": {
          //   backgroundColor: "#2a2a2a",
          "& .title": {
            color: "#cccccc",
          },
        },
      }}
    >
      <Box sx={{ flex: 2 }}>
        <Typography
          className="title"
          sx={{
            color: "#a6a6a6",
            fontSize: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
            fontWeight: 500,
            transition: "color 0.3s ease",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, display: "flex", gap: 1 }}>
        <Chip
          sx={{
            ...statusColors[taskStatus],
            minWidth: "90px",
            height: "24px",
            fontSize: "12px",
          }}
          label={taskStatus}
        />
        <Chip
          sx={{
            ...priorityColors[priority],
            minWidth: "80px",
            height: "24px",
            fontSize: "12px",
          }}
          label={priority}
        />
      </Box>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
        {isAdmin ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
            sx={{
              bgcolor: "#C77BBF",
              width: 28,
              height: 28,
              fontSize: "14px",
            }}
          >
            {employeeUser.name?.charAt(0) || "U"}
          </Avatar>
          <Typography variant="body2" sx={{ color: "#999999" }}>
            {employeeUser.name}
          </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: "#999999" }}>
            {adminUser.name}
          </Typography>
        )}
        <Divider orientation="vertical" flexItem sx={{ bgcolor: "#404040" }} />
        <Typography variant="body2" sx={{ color: "#999999" }}>
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date(dueDate))}
        </Typography>
      </Box>

      {isAdmin && (
        <Box sx={{ flex: 0.5, display: "flex", justifyContent: "flex-end" }}>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={onView}
              className="action-button"
              sx={{
                minWidth: 0,
                padding: "4px !important",
                color: "transparent",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: "transparent",
                },
              }}
            >
              <ViewIcon fontSize="small" />
            </Button>
            <Button
              onClick={onEdit}
              className="action-button"
              sx={{
                minWidth: 0,
                padding: "4px !important",
                color: "transparent",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "info.main",
                  backgroundColor: "transparent",
                },
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
            <Button
              onClick={onDelete}
              sx={{
                minWidth: 0,
                padding: "4px !important",
                color: "#ff6666",
                transition: "color 0.3s ease",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "transparent",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TaskList;
