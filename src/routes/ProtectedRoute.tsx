// client/src/routes/ProtectedRoute.tsx
import React from "react";
import {Navigate} from "react-router-dom";
import useAppSelector from "../hooks/useAppSelector";

const ProtectedRoute: React.FC<{children: JSX.Element}> = ({children}) => {
  const isLoggedIn = useAppSelector(
    (state: {auth: {isLoggedIn: boolean}}) => state.auth.isLoggedIn
  );

  return isLoggedIn ? children : <Navigate to="/chat" />;
};

export default ProtectedRoute;
