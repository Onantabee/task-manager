import { useEffect, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function useWebSocket() {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const connect = useCallback(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
        setConnectionError(null);
        setClient(stompClient);

        stompClient.subscribe("/topic/comments", (message) => {
          try {
            const newComment = JSON.parse(message.body);
            setMessages((prev) => [...prev, newComment]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });
        stompClient.subscribe("/topic/task-created", (task) => {
          try {
            const newTask = JSON.parse(task.body).payload;
            setTasks((prev) => [...prev, newTask]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });
        stompClient.subscribe("/topic/task-deleted", (task) => {
          try {
            const deletedId = JSON.parse(task.body).payload;
            setTasks(prev => [...prev, { id: deletedId, deleted: true }]);
          } catch (error) {
            console.error("Error parsing message:", error);
          }
        });
        stompClient.subscribe("/topic/task-updated", (task) => {
          try {
            const updatedTask = JSON.parse(task.body).payload;
            setTasks(prev => [...prev, updatedTask]);
          } catch (error) {
            console.error("Error parsing task update:", error);
          }
        });
        stompClient.subscribe("/topic/task-status-updated", (task) => {
          try {
            const updatedTaskStatus = JSON.parse(task.body).payload;
            setTasks(prev => [...prev, updatedTaskStatus]);
          } catch (error) {
            console.error("Error parsing task update:", error);
          }
        });
      },

      onStompError: (frame) => {
        const errorMsg = frame.headers["message"] || "Unknown STOMP error";
        console.error("Broker reported error:", errorMsg);
        setConnectionError(errorMsg);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnectionError("WebSocket connection error");
      },

      onDisconnect: () => {
        setIsConnected(false);
        setClient(null);
        console.log("Disconnected from WebSocket");
      },
    });

    stompClient.activate();
  }, []);

  useEffect(() => {
    const stompClient = connect();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [connect]);

  return {
    messages,
    tasks,
    isConnected,
    error: connectionError,
    reconnect: connect,
  };
}
