import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Typography,
  Button,
} from "@mui/material";
import axios from "axios";
import useWebSocket from "../hooks/useWebSocket";

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

const TaskDialog = ({
  open,
  onClose,
  task,
  user,
  nonAdminUsers = [], 
  fetchTasks,
  showSnackbar,
}) => {
  const [taskDetails, setTaskDetails] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    taskStatus: "PENDING",
    assigneeId: "",
  });

  const { sendTask, sendTaskUpdate } = useWebSocket();

  useEffect(() => {
    if (!open) {
      setTaskDetails({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        taskStatus: "PENDING",
        assigneeId: "",
      });
    }
  }, [open]);

  useEffect(() => {
    if (task && open) {
      setTaskDetails({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate?.split("T")[0] || "",
        taskStatus: task.taskStatus,
        assigneeId: task.assigneeId || "",
      });
    }
  }, [task, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const taskData = {
        ...taskDetails,
        createdById: user.email,
      };

      const res = await axios.post("http://localhost:8080/task/create-task", taskData);
      showSnackbar("Task created successfully!", "success");
      fetchTasks();
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      showSnackbar("Failed to create task. Please try again.", "error");
    }
  };

  const handleUpdate = async () => {
    try {
      const taskData = {
        ...taskDetails,
        createdById: user.email,
      };

      const res = await axios.put(
        `http://localhost:8080/task/update-task/${task.id}`,
        taskData
      );
      showSnackbar("Task updated successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error updating task:", error);
      showSnackbar("Failed to update task. Please try again.", "error");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      sx={{
        "& .MuiBackdrop-root": {
          backgroundColor: "hsla(0, 0%, 0%, 0.5)"
        },
        "& .MuiPaper-root": {
          backgroundColor: "#0d0d0d",
          borderRadius: "15px"
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
          <span className="text-2xl">{task ? "U" : "A"}</span>
          {task ? "PDATE" : "DD"} <span className="text-2xl">T</span>ask
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
                <MenuItem value="ONGOING">Ongoing</MenuItem>
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
          onClick={(e) => e.target.showPicker && e.target.showPicker()}
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
              
              {Array.isArray(nonAdminUsers) && nonAdminUsers.length > 0 ? (
                nonAdminUsers.map((user) => (
                  <MenuItem key={user.email} value={user.email}>
                    {user.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No users available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </div>
        <DialogActions sx={{padding: "20px 0 0"}}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={task ? handleUpdate : handleSave}
        >
          {task ? "Update" : "Save"}
        </Button>
      </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;