// client/src/components/Dashboard.tsx
import React from "react";
import useAppSelector from "../hooks/useAppSelector";
import useAppDispatch from "../hooks/useAppDispatch";
import {logout} from "../store/slices/authSlice";
import {Button} from "@mui/material";
import {FaSignOutAlt, FaUser} from "react-icons/fa";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="dashboard">
      <h2>
        <FaUser /> Welcome, {user?.name || "Guest"}!
      </h2>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        startIcon={<FaSignOutAlt />}
      >
        Logout
      </Button>
      {/* You can add more widgets or stats here */}
    </div>
  );
};

export default Dashboard;
