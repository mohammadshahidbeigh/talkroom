// client/src/App.tsx
import React from "react";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import ChatRoom from "./components/Chat/ChatRoom";
import VideoRoom from "./components/Video/VideoRoom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video"
          element={
            <ProtectedRoute>
              <VideoRoom />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Login />} /> {/* Add a default route */}
      </Routes>
    </Router>
  );
};

export default App;
