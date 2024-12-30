import React, { useState } from "react";
import { Button, Box, Typography, Paper, TextField } from "@mui/material";
import axios from "axios";

const LoginForm = () => {
  const [isSSOLogin, setIsSSOLogin] = useState(true); // Toggle between SSO and old login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginRedirect = () => {
    console.log("Redirecting to Okta for login...");
    window.location.href = "http://localhost:5000/api/auth";
  };
  
  const handleOldLogin = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token); // Store token for old login
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Old login successful:", user);
      window.location.href = "/vnesiUre"; // Redirect to dashboard
    } catch (error) {
      console.error("Old login failed:", error.response?.data || error.message);
      alert("Invalid credentials. Please try again.");
    }
  };
  

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
      }}
    >
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
            {isSSOLogin ? "Login with Okta" : "Old Login"}
          </Typography>
          {isSSOLogin ? (
            <Button
              type="button"
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLoginRedirect}
            >
              Login Okta
            </Button>
          ) : (
            <Box>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleOldLogin}
                sx={{ marginTop: 2 }}
              >
                Login
              </Button>
            </Box>
          )}
          <Button
            type="button"
            variant="text"
            fullWidth
            onClick={() => setIsSSOLogin(!isSSOLogin)}
            sx={{ marginTop: 2 }}
          >
            {isSSOLogin ? "Stara prijava" : "SSO Prijava"}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
