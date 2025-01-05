import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CircularProgress, Box, Typography } from "@mui/material";

const CallbackHandler = () => {
  const navigate = useNavigate();
  const hasHandledCallback = useRef(false); // Prevent duplicate executions

  useEffect(() => {
    const handleCallback = async () => {
      if (hasHandledCallback.current) {
        return;
      }
      hasHandledCallback.current = true;

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        console.error("No authorization code found.");
        alert("No authorization code found. Please try logging in again.");
        navigate("/", { replace: true });
        return;
      }

      try {
        // Exchange authorization code for tokens
        const response = await axios.get(`http://localhost:5000/api/callback?code=${code}`);
        const { accessToken, user } = response.data;

        // Save token and user info in localStorage
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        console.log("User info received:", user);

        navigate("/vnesiUre", { replace: true });
        window.location.reload();
      } catch (error) {
        console.error("Error exchanging authorization code:", error.response?.data || error.message);
        alert("Failed to log in. Please try again.");
        navigate("/", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <CircularProgress size={80} />
      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Loading
      </Typography>
    </Box>
  );
};

export default CallbackHandler;
