import React, { useState } from "react";
import { Button, Box, Typography, Paper } from "@mui/material";

const LoginForm = ({ onLogin }) => {
 const handleLoginRedirect = () => {
  console.log("Redirecting to Okta for login...");
  window.location.href = "http://localhost:5000/api/auth";
};


  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Left Side */}
      <Box
        sx={{
          width: "33%",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Še niste registrirani?
        </Typography>
        <Button type="submit" variant="outlined" color="primary">
          Registracija
        </Button>
      </Box>

      {/* Right Side */}
      <Box
        sx={{
          width: "67%",
          backgroundColor: "gray",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "white",
            borderRadius: "17px",
          }}
          elevation={3}
        >
          <Typography variant="h6" gutterBottom>
            Login
          </Typography>
          <Button
            type="button"
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLoginRedirect}
          >
            Login with Okta
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
