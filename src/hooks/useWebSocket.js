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
            // prev.map(task => task.id === updatedTask.id ? updatedTask : task )
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

  const sendMessage = useCallback(
    (comment) => {
      if (!client || !client.connected) {
        console.warn("Waiting for WebSocket connection...");
        setTimeout(() => sendMessage(comment), 500);
        return;
      }

      try {
        client.publish({
          destination: "/app/comment",
          body: JSON.stringify(comment),
          headers: { "content-type": "application/json" },
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [client]
  );

  const sendTaskUpdate = useCallback((updatedTask) => {
    if (!client || !client.connected) {
      console.warn("Waiting for WebSocket connection...");
      setTimeout(() => sendTaskUpdate(updatedTask), 500);
      return;
    }
    try {
      client.publish({
        destination: "/app/task-update",
        body: JSON.stringify(updatedTask),
        headers: { 'content-type': 'application/json' }
      });
    } catch (error) {
      console.error("Error sending task update:", error);
      throw error;
    }
  }, [client]);

  const sendTask = useCallback(
    (task) => {
      if (!client || !client.connected) {
        console.warn("Waiting for WebSocket connection...");
        setTimeout(() => sendTask(task), 500);
        return;
      }
      try {
        client.publish({
          destination: "/app/task",
          body: JSON.stringify({
            payload: task,
          }),
          headers: { "content-type": "application/json" },
        });
      } catch (error) {
        console.error("Error sending task:", error);
        throw error;
      }
    },
    [client]
  );

  return {
    messages,
    tasks,
    sendMessage,
    sendTask,
    sendTaskUpdate,
    isConnected,
    error: connectionError,
    reconnect: connect,
  };
}
