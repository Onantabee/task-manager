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
  Person as AssigneeIcon,
  CalendarToday as DueDateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PriorityHigh as PriorityHighIcon,
  LowPriority as LowPriorityIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Info as StatusIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";

const TaskCard = ({ task, onEdit, onDelete, onView, isAdmin, assignee, createdBy}) => {
  const { title, priority, dueDate, taskStatus } = task;

  const priorityIcons = {
    High: { color: "error", icon: <PriorityHighIcon color="error" /> },
    Medium: { color: "warning", icon: <HourglassEmptyIcon color="warning" /> },
    Low: { color: "success", icon: <LowPriorityIcon color="success" /> },
  };

  const [adminUser, setAdminUser] = useState("");
  const [emoployeeUser, setEmployeeUser] = useState("");

  useEffect( () => {
    const fetchCreatorName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/users/${createdBy}`
        );
        setAdminUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    }

    const fetchAssigneeName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/users/${assignee}`
        );
        setEmployeeUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    }
    fetchCreatorName()
    fetchAssigneeName()
  }, [createdBy, assignee])

  return (
    <Card
      sx={{
        minWidth: "100%",
        borderRadius: 3,
        boxShadow: 6,
        backgroundColor: "#1f1f1f",
        color: "#ddd",
        transition: "transform 0.2s, box-shadow 0.2s",
        border: "1px solid #404040",
        "&:hover": {
          boxShadow: 10,
        },
      }}
    >
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          fontWeight="bold"
          sx={{ whiteSpace: "nowrap", color:"#f0bbb5", overflow: "hidden", textOverflow: "ellipsis", background: "#333333", borderRadius: "5px", marginBottom: "12px", padding: "8px 8px" }}
        >
          {title}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <DueDateIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            Due: <strong>{new Date(dueDate).toLocaleDateString()}</strong>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <StatusIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            Status:
          </Typography>
          <Chip label={taskStatus} color="default" size="small" />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          {priorityIcons[priority]?.icon}
          <Typography variant="body2" color="textSecondary">
            Priority:
          </Typography>
          <Chip
            label={priority}
            color={priorityIcons[priority]?.color || "default"}
            size="small"
          />
        </Stack>

        {isAdmin? (
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <AssigneeIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            Assignee: <strong>{emoployeeUser.name}</strong>
          </Typography>
        </Stack>
        ):(
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <AssigneeIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            Created by: <strong>{adminUser.name}</strong>
          </Typography>
        </Stack>
        )}

        {isAdmin && (
          <>
            <Divider sx={{ backgroundColor: "#505050", marginY: 2 }} />
            <Box display="flex" padding={0} justifyContent="flex-end">
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onView}
                  sx={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: "40px" }}
                >
                  <ViewIcon />
                </Button>
                <Button
                  variant="outlined"
                  onClick={onEdit}
                >
                  <EditIcon />
                </Button>
                <Button
                  variant="outlined"
                  color="error"
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
  );
};

export default TaskCard;
