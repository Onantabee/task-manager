import React from "react";
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
} from "@mui/icons-material";

const TaskCard = ({ task, onEdit, onDelete, isAdmin }) => {
  const { title, priority, dueDate, taskStatus } = task;

  const priorityIcons = {
    High: { color: "error", icon: <PriorityHighIcon color="error" /> },
    Medium: { color: "warning", icon: <HourglassEmptyIcon color="warning" /> },
    Low: { color: "success", icon: <LowPriorityIcon color="success" /> },
  };

  return (
    <Card
      sx={{
        maxWidth: 360,
        borderRadius: 3,
        boxShadow: 6,
        backgroundColor: "#1f1f1f",
        color: "#ddd",
        transition: "transform 0.2s, box-shadow 0.2s",
        border: "1px solid #404040",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: 10,
        },
        padding: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
          {title}
        </Typography>

        <Divider sx={{ backgroundColor: "#505050", marginY: 1 }} />

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

        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <AssigneeIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary">
            Assignee: <strong>{"assignee"}</strong>
          </Typography>
        </Stack>

        {isAdmin && (
          <>
            <Divider sx={{ backgroundColor: "#505050", marginY: 2 }} />
            <Box display="flex" padding={0} justifyContent="flex-end">
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  color="error"
                  onClick={onDelete}
                >
                  Delete
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
