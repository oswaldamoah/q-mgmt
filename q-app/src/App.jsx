import React, { useState, useEffect, useRef } from "react";
import './App.css';

function App() {
  // State variables for queue and time stats
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [peopleInQueue, setPeopleInQueue] = useState(0);
  
  // Unit time spent is the most recent average time in seconds
  const [unitTimeSpent, setUnitTimeSpent] = useState(0);
  
  // For calculating the mean of all average times (in seconds)
  const [totalAverageTime, setTotalAverageTime] = useState(0);
  const [averageTimeCount, setAverageTimeCount] = useState(0);
  const [meanAverageTime, setMeanAverageTime] = useState(0);
  
  // Time (in seconds) predicted to empty the queue.
  const [queueEmptyTime, setQueueEmptyTime] = useState(0);
  
  // Other UI states
  const [recentUpdate, setRecentUpdate] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Utility function to format seconds into min-sec format.
  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes} min ${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds} sec`;
    }
  };

  // Update the predicted time to empty the queue whenever mean average time or peopleInQueue changes.
  useEffect(() => {
    setQueueEmptyTime(peopleInQueue > 0 ? meanAverageTime * peopleInQueue : 0);
  }, [peopleInQueue, meanAverageTime]);

  useEffect(() => {
    const connectWebSocket = () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      
      const socket = new WebSocket("ws://localhost:5000");

      socket.onopen = () => {
        console.log("Connected to WebSocket");
        setLoading(false);
        setError(null);
      };

      socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setLoading(false);
        setError("Connection closed. Reconnecting...");
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setLoading(false);
        setError("Connection error. Reconnecting...");
        socket.close();
      };

      socket.onmessage = (event) => {
        const message = event.data;
        console.log("Received message:", message);
        setMessages(prev => [...prev.slice(-9), message]);

        if (message.includes("People in queue:")) {
          // e.g., "People in queue: 3"
          const number = parseInt(message.replace("People in queue: ", ""));
          setPeopleInQueue(number);
        }

        if (message.includes("Someone joined the queue")) {
          setRecentUpdate("Someone joined the queue.");
        }

        if (message.includes("Someone left the queue")) {
          setRecentUpdate("Someone left the queue.");
        }

        if (message.includes("Average time in queue:")) {
          // e.g., "Average time in queue: 25.15 seconds"
          const latestTime = parseFloat(message.replace("Average time in queue: ", ""));
          setUnitTimeSpent(latestTime); // Most recent value as unit time

          setTotalAverageTime(prev => prev + latestTime);
          setAverageTimeCount(prev => prev + 1);

          const newTotal = totalAverageTime + latestTime;
          const newCount = averageTimeCount + 1;
          setMeanAverageTime(newTotal / newCount);
        }

        setCurrentTime(new Date().toLocaleString());
      };

      wsRef.current = socket;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [totalAverageTime, averageTimeCount]);

  return (
    <div style={{
      fontFamily: "Roboto, sans-serif",
      backgroundColor: "#fafafa",
      color: "#333",
      width: "100%",
      minHeight: "100vh",
      boxSizing: "border-box",
      overflowY: "auto",
      padding: "20px"
    }}>
      {/* Overall Container with Global Header */}
      <header style={{
        textAlign: "center",
        marginBottom: "20px"
      }}>
        <h1 style={{
          color: "#4CAF50",
          fontSize: "40px",
          fontWeight: "bold",
          margin: "0"
        }}>
          Queue Monitor
        </h1>
        <p style={{
          fontSize: "14px",
          color: "#999",
          marginTop: "5px"
        }}>Q-MGMT</p>
      </header>

      {/* Main Content: Flexbox with Stats on the Right Side */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Queue Visualization */}
        <div style={{
          flex: 1,
          maxWidth: "600px",
          textAlign: "center",
          marginRight: "30px"
        }}>
          {/* Big Number Display */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "80px",
              fontWeight: "bold",
              color: "#4CAF50"
            }}>
              {peopleInQueue}
            </div>
            <div style={{
              fontSize: "20px",
              color: "#666"
            }}>
              people in queue
            </div>
          </div>
          
          {/* Visual Representation (5 boxes) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            {[...Array(5)].map((_, index) => (
              <div key={index} style={{
                width: "50px",
                height: "50px",
                backgroundColor: index < peopleInQueue ? "#4CAF50" : "#ddd",
                margin: "10px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease"
              }} />
            ))}
          </div>
          {recentUpdate && (
            <div style={{
              marginTop: "20px",
              backgroundColor: "#e0e0e0",
              padding: "10px 20px",
              borderRadius: "8px",
              color: "#333",
              fontSize: "16px"
            }}>
              <p>{recentUpdate}</p>
            </div>
          )}
        </div>
        
        {/* Stats Panel on the Right */}
        <div style={{
          width: "300px",
          padding: "20px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: "10px",
          textAlign: "center",
          marginTop: "30px"
        }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#4CAF50",
            marginBottom: "10px"
          }}>
            Queue Stats
          </div>
          <div style={{ fontSize: "18px", lineHeight: "1.6" }}>
            <p><strong>Unit Time Spent:</strong> {formatTime(unitTimeSpent)}</p>
            <p><strong>Time to Empty Queue:</strong> {queueEmptyTime ? formatTime(queueEmptyTime) : "0s"}</p>
            <p><strong>Last Updated:</strong> {currentTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
