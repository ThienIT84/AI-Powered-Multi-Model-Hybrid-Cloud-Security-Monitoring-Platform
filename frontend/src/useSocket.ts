import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, TrafficData } from "./types";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [traffic, setTraffic] = useState<TrafficData[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}`);
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case "INITIAL_DATA":
          setAlerts(message.data);
          break;
        case "NEW_ALERT":
          setAlerts((prev) => [message.data, ...prev].slice(0, 50));
          break;
        case "TRAFFIC_UPDATE":
          setTraffic((prev) => [...prev, message.data].slice(-100));
          break;
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  return { isConnected, alerts, traffic };
}
