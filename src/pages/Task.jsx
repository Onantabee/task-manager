import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { ArrowUp, Check, MoreVerticalIcon, X } from "lucide-react";
import { differenceInSeconds, formatDistanceToNowStrict } from "date-fns";

export default function Task() {
  const { state } = useLocation();
  const { messages, client: stompClient } = useWebSocket();
  const isAdmin = state?.isAdmin || false;
  const [user, setUser] = useState(state?.user || null);
  const [author, setAuthor] = useState({});
  const [task, setTask] = useState(state?.task || null);
  const [taskStatus, setTaskStatus] = useState(
    state?.task?.taskStatus || "PENDING"
  );
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const commentInputRef = useRef(null);
  const commentContainerRef = useRef(null);
  const { tasks: wsTasks } = useWebSocket();
  const [adminUser, setAdminUser] = useState("");
  const [emoployeeUser, setEmployeeUser] = useState("");
  const location = useLocation();
  const [now, setNow] = useState(new Date());
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [editingComment, setEditingComment] = useState(null);
  const [dueDateStatus, setDueDateStatus] = useState(null);
  const isCommentingAllowed = !(!isAdmin && taskStatus === "CANCELLED");

  useEffect(() => {
    if (task?.dueDate) {
      setDueDateStatus(getDueDateStatus(task.dueDate, taskStatus));
    }
  }, [task?.dueDate, taskStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchComment = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/comment/task/${state.task.id}`
      );
      setComments(
        res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [state?.task?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!stompClient || !user?.email) return;

    const handleIncomingComment = async (message) => {
      try {
        const newComment = JSON.parse(message.body);

        setComments((prev) => {
          if (prev.some((c) => c.id === newComment.id)) {
            return prev;
          }

          const isForCurrentUser = newComment.recipientEmail === user.email;
          const isForCurrentTask = newComment.taskId === state?.task?.id;

          const processedComment =
            isForCurrentUser && isForCurrentTask
              ? { ...newComment, isReadByRecipient: true }
              : newComment;

          return [...prev, processedComment].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        if (
          newComment.recipientEmail === user.email &&
          newComment.taskId === state?.task?.id
        ) {
          try {
            await axios.post(
              `http://localhost:8080/comment/mark-as-read/${newComment.id}`,
              { userEmail: user.email }
            );
          } catch (error) {
            console.error("Failed to mark comment as read:", error);
            setComments((prev) => prev.filter((c) => c.id !== newComment.id));
          }
        }
      } catch (error) {
        console.error("Error processing comment:", error);
      }
    };

    const subscription = stompClient.subscribe(
      `/topic/comments`,
      handleIncomingComment
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient, user?.email, state?.task?.id]);

  useEffect(() => {
    if (
      (state?.task?.id && user?.email) ||
      location.pathname.startsWith("/task")
    ) {
      axios.post(
        `http://localhost:8080/comment/mark-as-read-by-recipient/${state.task.id}`,
        {
          recipientEmail: user.email,
        }
      );
      axios.put(
        `http://localhost:8080/task/task-is-new-state/${state.task.id}`,
        { isNew: false }
      );
    }
  }, [state?.task?.id, user?.email]);

  useEffect(() => {
    if (!state?.task?.id) return;

    const fetchAuthor = async () => {
      const authorsMap = {};
      for (const comment of comments) {
        try {
          const res = await axios.get(
            `http://localhost:8080/users/${comment.authorEmail}`
          );
          authorsMap[comment.authorEmail] = res.data.name;
        } catch (error) {
          console.error("Error fetching author:", error);
        }
      }
      setAuthor(authorsMap);
    };

    const fetchUser = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:8080/users/${user.email}`
        );
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/task/${state.task.id}`
        );
        setTask(response.data);
        setTaskStatus(response.data.taskStatus);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchAuthor();
    fetchUser();
    fetchTask();
  }, [state?.task?.id, user, comments]);

  useEffect(() => {
    const fetchCreatorName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/users/${task.createdById}`
        );
        setAdminUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };

    const fetchAssigneeName = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/users/${task.assigneeId}`
        );
        setEmployeeUser(res.data);
      } catch (error) {
        console.error("Error fetching author:", error);
      }
    };
    fetchCreatorName();
    fetchAssigneeName();
  }, [task.createdById, task.assigneeId]);

  useEffect(() => {
    if (wsTasks.length > 0) {
      const relevantUpdates = wsTasks.filter(
        (wsTask) => String(wsTask.id) === String(task?.id)
      );

      if (relevantUpdates.length > 0) {
        const latestUpdate = relevantUpdates[relevantUpdates.length - 1];
        if (!latestUpdate.deleted) {
          setTask((prev) => ({ ...prev, ...latestUpdate }));
          setTaskStatus(latestUpdate.taskStatus);
        }
      }
    }
  }, [wsTasks, task?.id]);

  useEffect(() => {
    if (state?.task?.id) {
      fetchComment();
    }
  }, [state?.task?.id, fetchComment]);

  useEffect(() => {
    setComments((prev) => {
      const uniqueComments = new Map(
        prev.map((comment) => [comment.id, comment])
      );
      messages.forEach((msg) => uniqueComments.set(msg.id, msg));
      return Array.from(uniqueComments.values());
    });
  }, [messages]);

  useEffect(() => {
    if (commentContainerRef.current) {
      setTimeout(() => {
        commentContainerRef.current.scrollTop =
          commentContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [comments]);

  const handleUpdateComment = async () => {
    if (!editingComment) return;

    try {
      await axios.put(`http://localhost:8080/comment/${editingComment.id}`, {
        content: newComment.trim(),
      });
      setEditingComment(null);
      setNewComment("");
      if (commentInputRef.current) {
        commentInputRef.current.innerText = "";
        commentInputRef.current.dataset.placeholder = "Add a comment...";
      }
    } catch (error) {
      console.error(
        "Error updating comment:",
        error.response?.data || error.message
      );
    }
  };

  const addComment = async () => {
    if (!user) return;

    try {
      const commentPayload = isAdmin
        ? {
            authorEmail: user.email,
            content: newComment,
            recipientEmail: task.assigneeId || null,
            isRead: true,
          }
        : {
            authorEmail: user.email,
            content: newComment,
            recipientEmail: task.createdById || null,
            isRead: true,
          };

      await axios.post(
        `http://localhost:8080/comment/task/${state.task.id}`,
        commentPayload
      );

      setNewComment("");
      if (commentInputRef.current) {
        commentInputRef.current.innerText = "";
        commentInputRef.current.dataset.placeholder = "Add a comment...";
      }
    } catch (error) {
      console.error("Error adding/updating comment", error);
    }
  };

  const nonAdminStatuses = ["PENDING", "ONGOING", "COMPLETED"];

  const statusColors = {
    PENDING: "bg-yellow-500/50",
    ONGOING: "bg-blue-500/50",
    COMPLETED: "bg-green-500/50",
    CANCELLED: "bg-gray-500/50",
    OVERDUE: "bg-gray-500/50",
  };

  const priorityColors = {
    High: "bg-red-500/50",
    Medium: "bg-orange-500/50",
    Low: "bg-yellow-500/50",
    OVERDUE: "bg-gray-500/50",
  };

  const getDueDateStatus = (dueDate, currentStatus) => {
    if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
      return null;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "OVERDUE";
    if (diffDays === 0) return "DUE_TODAY";
    if (diffDays === 1) return "DUE_TOMORROW";
    if (diffDays === 2) return "DUE_IN_2_DAYS";
    return null;
  };

  const formatDueDateText = (dueDate, status, dueDateStatus) => {
    if (status === "COMPLETED" || status === "CANCELLED") {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dueDate));
    }

    const statusConfig = {
      OVERDUE: {
        text: "Overdue",
      },
      DUE_TODAY: {
        text: "Due",
      },
      DUE_TOMORROW: {
        text: "Due Tomorrow",
      },
      DUE_IN_2_DAYS: {
        text: "Due in 2 Days",
      },
    };

    if (statusConfig[dueDateStatus]) {
      const { text, style } = statusConfig[dueDateStatus];
      return <span className={style}>{text}</span>;
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dueDate));
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment);
    setNewComment(comment.content);
    if (commentInputRef.current) {
      commentInputRef.current.innerText = comment.content;
    }
    setOpenDropdownId(null);
  };

  const handleDeleteClick = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8080/comment/${commentId}`);
      fetchComment();
      setOpenDropdownId(null);
      if (editingComment?.id === commentId) {
        setEditingComment(null);
        setNewComment("");
        if (commentInputRef.current) {
          commentInputRef.current.innerText = "";
        }
      }
    } catch (error) {
      console.error(
        "Error deleting comment:",
        error.response?.data || error.message
      );
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;

    if (!isAdmin && newStatus === "CANCELLED") {
      return;
    }

    if (newStatus === taskStatus) return;

    setTaskStatus(newStatus);

    try {
      const response = await axios.put(
        `http://localhost:8080/task/${task.id}/status`,
        { taskStatus: newStatus }
      );
      setTask(response.data);
    } catch (error) {
      console.error(
        "Error updating task status:",
        error.response?.data || error.message
      );
      setTaskStatus(task.taskStatus);
    }
  };

  const getCardBackground = (status, dueStatus) => {
    if (status === "COMPLETED") return "rgba(0, 51, 0, 0.1)";
    if (status === "CANCELLED") return "rgba(51, 0, 51, 0.1)";

    switch (dueStatus) {
      case "DUE_IN_2_DAYS":
        return "rgba(51, 51, 0, 0.2)";
      case "DUE_TOMORROW":
        return "rgba(51, 33, 0, 0.2)";
      case "DUE_TODAY":
        return "rgba(51, 0, 0, 0.2)";
      case "OVERDUE":
        return "rgba(128, 128, 128, 0.2)";
      default:
        return "#1f1f1f";
    }
  };

  const getCardBorder = (status, dueStatus) => {
    if (status === "COMPLETED") return "1px solid rgba(34, 197, 94, 0.2)";
    if (status === "CANCELLED") return "1px solid rgba(64, 64, 64, 0.2)";

    switch (dueStatus) {
      case "DUE_TODAY":
        return "1px solid rgba(255, 0, 0, 0.7)";
      case "DUE_TOMORROW":
        return "1px solid rgba(128, 83, 0, 0.7)";
      case "DUE_IN_2_DAYS":
        return "1px solid rgba(128, 128, 0, 0.7)";
      default:
        return "1px solid #404040";
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-full h-[calc(100dvh-84px)] text-gray-200 md:px-5">
      <div className="rounded-lg md:p-2 w-full max-w-3xl mx-auto">
        <div
          className="relative bg-[#333333]/50 px-6 py-4 rounded-2xl"
          style={{
            backgroundColor: getCardBackground(taskStatus, dueDateStatus),
            border: getCardBorder(taskStatus, dueDateStatus),
          }}
        >
          <div className="mb-2">
            <h1
              className={`text-4xl font-bold ${
                taskStatus === "CANCELLED"
                  ? "text-gray-500 line-through italic"
                  : "text-white"
              }`}
            >
              {task.title}
            </h1>
          </div>

          <div className="mb-2 ">
            <p className="text-sm text-[#737373] ">Description:</p>
            <div className="h-20 border-2 border-[#333333]/70 rounded-2xl px-3 py-1">
              <h1 className={`text-[15px] ${taskStatus === "CANCELLED" && "text-gray-500"}`}>{task.description}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="rounded-full text-sm text-[#737373] flex items-center justify-center">
              <span>Priority:&nbsp;</span>
              <p
                className={`rounded-full text-gray-300 text-sm font-medium py-2 px-4 border-none ${
                  dueDateStatus === "OVERDUE" || taskStatus === "CANCELLED"
                    ? priorityColors.OVERDUE
                    : priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#737373] text-sm">Status:</span>
              {isAdmin ? (
                <span
                  className={`text-gray-300 rounded-full text-sm font-medium py-2 px-4 border-none ${
                    dueDateStatus === "OVERDUE" || taskStatus === "CANCELLED"
                      ? statusColors.OVERDUE
                      : statusColors[taskStatus]
                  }`}
                >
                  {taskStatus}
                </span>
              ) : taskStatus === "CANCELLED" ? (
                <span className="text-gray-300 rounded-full text-sm font-medium py-2 px-4 border-none bg-gray-500/50">
                  CANCELLED
                </span>
              ) : (
                <select
                  value={taskStatus}
                  onChange={handleStatusChange}
                  className={`select rounded-full text-sm font-medium py-2 px-4 border-none focus:outline-none ${
                    dueDateStatus === "OVERDUE"
                      ? statusColors.OVERDUE
                      : statusColors[taskStatus]
                  }`}
                >
                  {nonAdminStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[
                {
                  label: "Due Date",
                  value: (
                    <span
                      className={`px-3 py-1 border-2 text-sm rounded-full flex justify-center items-center cursor-pointer font-medium ${
                        taskStatus === "COMPLETED"
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : taskStatus === "CANCELLED"
                          ? "bg-gray-500/10 text-gray-400 border-gray-500/30"
                          : dueDateStatus === "OVERDUE"
                          ? "bg-gray-500/10 text-gray-400 italic border-gray-300/30"
                          : dueDateStatus === "DUE_TODAY"
                          ? "bg-red-500/10 text-red-400 italic border-red-500/30"
                          : dueDateStatus === "DUE_TOMORROW"
                          ? "bg-orange-500/10 text-orange-400 italic border-orange-500/30"
                          : dueDateStatus === "DUE_IN_2_DAYS"
                          ? "bg-yellow-500/10 text-yellow-400 italic border-yellow-500/30"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {formatDueDateText(
                        task.dueDate,
                        taskStatus,
                        dueDateStatus
                      )}
                    </span>
                  ),
                },
                {
                  label: "Created By",
                  value: (
                    <span
                      className={`px-3 py-1 border-[1px] text-sm rounded-full flex justify-center items-center cursor-pointer font-medium ${
                        taskStatus === "CANCELLED"
                          ? "bg-gray-500/10 border-gray-500 text-[#8c8c8c]"
                          : "bg-[#5d8bf4]/20 border-[#5d8bf4] text-[#b7cbfa]"
                      }`}
                    >
                      {adminUser.name}
                    </span>
                  ),
                },
                {
                  label: "Assigned To",
                  value: (
                    <span
                      className={`px-3 py-1 border-[1px] text-sm rounded-full flex justify-center items-center cursor-pointer font-medium  ${
                        taskStatus === "CANCELLED"
                          ? "bg-gray-500/10 border-gray-500 text-[#8c8c8c]"
                          : "bg-[#C77BBF]/20 border-[#C77BBF] text-[#e8c9e5]"
                      }`}
                    >
                      {emoployeeUser.name}
                    </span>
                  ),
                },
              ].flatMap(({ label, value }, index, array) => [
                <p key={label} className="flex flex-col gap-2">
                  <span className="text-[#737373] text-sm">{label}:</span>{" "}
                  <span
                    className={
                      taskStatus === "CANCELLED" ? "text-gray-500" : ""
                    }
                  >
                    {value}
                  </span>
                </p>,
                index < array.length - 1 ? (
                  <div
                    key={`dot-${index}`}
                    className="w-1 h-1 rounded-full bg-[#737373] mx-5 self-center"
                  />
                ) : null,
              ])}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold text-gray-300">Comments</h2>
          <div
            ref={commentContainerRef}
            className="space-y-2 max-h-[300px] mt-3  px-5 overflow-y-auto"
          >
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              [...comments].map((comment) => (
                <div className="relative overflow-visible">
                  <div
                    className={`rounded-lg py-2 pl-2 flex group items-center gap-2 ${
                      comment.authorEmail === user.email
                        ? "bg-[#595959]/20 hover:bg-blue-300/10"
                        : "bg-red-300/10"
                    }`}
                  >
                    <div
                      className={`h-10 w-[4px] rounded-2xl ${
                        comment.authorEmail === user.email
                          ? "bg-[#595959] group-hover:bg-blue-300"
                          : "bg-red-300"
                      }`}
                    ></div>
                    <div
                      key={comment.id}
                      className={` flex justify-between w-full items-center`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs uppercase ${
                              comment.authorEmail === user.email
                                ? "text-[#737373] group-hover:text-blue-200"
                                : "text-red-200"
                            }`}
                          >
                            {comment.authorEmail === user.email
                              ? "Me"
                              : author[comment.authorEmail]}
                          </span>
                          <div className="bg-[#4d4d4d] w-1 h-1 rounded-full"></div>
                          <p
                            className={`text-xs text-gray-500 ${
                              comment.authorEmail === user.email
                                ? "text-[#4d4d4d] group-hover:text-blue-200"
                                : "text-red-200"
                            }`}
                          >
                            {differenceInSeconds(
                              now,
                              new Date(comment.createdAt)
                            ) < 60
                              ? "just now"
                              : formatDistanceToNowStrict(
                                  new Date(comment.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                          </p>
                        </div>
                        <p className="text-md text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                      {comment.authorEmail === user.email && (
                        <div className="relative top-0 opacity-0 right-0 mt-2 mr-2 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                            className="cursor-pointer transition-colors duration-300 ease-in-out rounded-full p-1 text-blue-200/50 hover:text-blue-200"
                          >
                            <MoreVerticalIcon size={25} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {openDropdownId === comment.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute py-1 gap-1 right-0 mt-0 w-36 bg-[#262626] border border-[#444] rounded-md shadow-lg z-50"
                    >
                      <div className="absolute -top-[7px] right-[17px] w-3 h-3 rotate-45 bg-[#262626] border-t border-l border-[#444] z-[-1]" />
                      {differenceInSeconds(now, new Date(comment.createdAt)) <=
                        300 &&
                        isCommentingAllowed ? (
                          <button
                            onClick={() => handleEditClick(comment)}
                            className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#333] w-full text-left"
                          >
                            Edit
                          </button>
                        ):(
                          <p className="uppercase block px-4 py-2 text-sm italic text-[#595959] w-full text-left">disabled</p>
                        )}
                      {isCommentingAllowed && (
                        <button
                          onClick={() => handleDeleteClick(comment.id)}
                          className="block px-4 py-2 text-sm text-red-400 hover:bg-[#333] w-full text-left"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 w-full max-w-3xl mx-auto bg-[#1a1a1a]/70 backdrop-blur-2xl rounded-lg pb-7 p-2">
        {isCommentingAllowed ? (
          <div className="flex gap-2 items-end bg-[#404040] rounded-2xl p-2">
            <div
              contentEditable="true"
              ref={commentInputRef}
              onInput={(e) => {
                setNewComment(e.target.innerText);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  5 * 24
                )}px`;
                e.target.dataset.placeholder =
                  e.target.innerText.trim() === "" ? "Add a comment..." : "";
              }}
              data-placeholder={!editingComment ? "Add a comment..." : ""}
              className="w-full p-2 text-gray-200 resize-none overflow-y-auto outline-none relative before:absolute before:left-2 before:top-2 before:text-gray-400 before:pointer-events-none before:content-[attr(data-placeholder)]"
              style={{
                maxHeight: `${5 * 24}px`,
                borderRadius: "8px",
                backgroundColor: "transparent",
                display: "block",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
              role="textbox"
            />
            <button
              onClick={editingComment ? handleUpdateComment : addComment}
              disabled={newComment.trim() === ""}
              className={`flex justify-center items-center border-2 h-10 font-semibold rounded-full transition-all duration-300 ease-in-out transform ${
                newComment.trim() !== ""
                  ? editingComment
                    ? "bg-green-600 border-green-400 w-12 text-white hover:bg-green-700"
                    : "bg-blue-600 border-blue-400 w-11 text-white hover:bg-blue-700"
                  : "bg-gray-500 border-[#595959] w-11 text-[#404040]"
              }`}
            >
              {editingComment ? (
                <Check className="text-[#404040]" size={24} />
              ) : (
                <ArrowUp size={24} />
              )}
            </button>
            {editingComment && (
              <button
                onClick={() => {
                  setEditingComment(null);
                  setNewComment("");
                  if (commentInputRef.current) {
                    commentInputRef.current.innerText = "";
                  }
                }}
                className="flex justify-center group items-center border-2 h-10 w-12 font-semibold rounded-full transition-all duration-300 ease-in-out transform bg-[#404040] border-[#ff0000] text-white hover:bg-[#ff0000]"
              >
                <X
                  className="text-[#ff0000] group-hover:text-[#404040]"
                  size={24}
                />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-3 text-gray-400">
            <p>Comments are disabled for this task.</p>
          </div>
        )}
      </div>
    </div>
  );
}
