import { useLocation } from "react-router-dom";
import axios from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import useWebSocket from "../hooks/useWebSocket";

export default function Task() {
  const { state } = useLocation();
  const { messages, client: stompClient, sendMessage } = useWebSocket();
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

      const res = await axios.post(
        `http://localhost:8080/comment/task/${state.task.id}`,
        commentPayload
      );
      console.log(
        "user:",
        user.email,
        "comment:",
        newComment,
        "reciepient:",
        task.assigneeId,
        "isread:",
        true
      );
      setNewComment("");

      if (commentInputRef.current) {
        commentInputRef.current.innerText = "";
        commentInputRef.current.dataset.placeholder = "Add a comment...";
      }
    } catch (error) {
      console.error("Error adding comment", error);
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-500/50",
    ONGOING: "bg-blue-500/50",
    COMPLETED: "bg-green-500/50",
    CANCELLED: "bg-gray-500/50",
  };

  const priorityColors = {
    High: "bg-red-500/50",
    Medium: "bg-orange-500/50",
    Low: "bg-yellow-500/50",
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setTaskStatus(newStatus);

    try {
      const response = await axios.put(
        `http://localhost:8080/task/${task.id}/status`,
        {
          taskStatus: newStatus,
        }
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

  return (
    <div className="flex flex-col justify-between min-h-full h-[calc(100dvh-64px)] text-gray-200 p-5">
      <div className="rounded-lg p-6 w-full max-w-3xl mx-auto">
        <div className="bg-[#333333]/50 px-6 py-4 rounded-2xl">
          <div className="mb-5">
            <p className="text-sm uppercase text-[#737373] font-semibold">
              Title
            </p>
            <h1 className="text-4xl font-bold text-white">{task.title}</h1>
          </div>

          <div className="mb-5">
            <p className="text-sm uppercase text-[#737373] font-semibold">
              Task Description
            </p>
            <h1 className="text-lg">{task.description}</h1>
          </div>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="rounded-full text-sm text-[#737373] flex items-center justify-center">
              <strong>Priority:&nbsp;</strong>
              <p
                className={`rounded-full text-gray-300 text-sm font-medium py-2 px-4 border-none ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <strong className="text-[#737373] text-sm">Status:</strong>
              {isAdmin ? (
                <span
                  className={` text-gray-300 rounded-full text-sm font-medium py-2 px-4 border-none focus:outline-none transition-all ${statusColors[taskStatus]}`}
                >
                  {taskStatus}
                </span>
              ) : (
                <select
                  value={taskStatus}
                  onChange={handleStatusChange}
                  className={`select rounded-full text-sm font-medium py-2 px-4 border-none focus:outline-none transition-all ${statusColors[taskStatus]} relative z-10`}
                >
                  {Object.keys(statusColors).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <div className="mt-4 flex flex-wrap gap-5">
              {[
                {
                  label: "Due Date",
                  value: new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(task.dueDate)),
                },
                { label: "Created By", value: adminUser.name },
                { label: "Assigned To", value: emoployeeUser.name },
              ].map(({ label, value }) => (
                <p key={label} className="flex flex-col">
                  <strong className="text-[#737373]">{label}:</strong> {value}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2">
          <h2 className="text-lg font-semibold text-gray-300">Comments</h2>
          <div
            ref={commentContainerRef}
            className="space-y-2 mt-3 max-h-[335px]  px-5 overflow-y-auto"
          >
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              [...comments].map((comment) => (
                <div key={comment.id}>
                  <div
                    className={`px-3 pb-3 rounded-lg ${
                      comment.authorEmail === user.email
                        ? "bg-blue-300/10"
                        : "bg-red-300/10"
                    }`}
                  >
                    <span
                      className={`text-xs uppercase ${
                        comment.authorEmail === user.email
                          ? "text-blue-200"
                          : "text-red-200"
                      }`}
                    >
                      {comment.authorEmail === user.email
                        ? "Me"
                        : author[comment.authorEmail]}
                    </span>
                    <p className="text-md text-gray-300">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }).format(new Date(comment.createdAt))}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="sticky bottom-5 w-full max-w-3xl mx-auto bg-[#1a1a1a] rounded-lg p-2">
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
            data-placeholder="Add a comment..."
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
            onClick={addComment}
            disabled={newComment.trim() === ""}
            className={`flex justify-center items-center border-2 h-10 w-24 font-semibold rounded-lg transition-all duration-300 ease-in-out transform ${
              newComment.trim() !== ""
                ? "bg-blue-600 border-blue-400 text-white hover:bg-blue-700"
                : "bg-gray-500 border-[#595959] text-[#404040]"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
