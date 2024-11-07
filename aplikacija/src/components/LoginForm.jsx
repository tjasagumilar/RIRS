import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import axios from "axios";

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post("http://localhost:5000/api/login", {
            username,
            password,
        });
        if (response.data.success) {
            onLogin(response.data.user); // Call the onLogin callback with user data
        } else {
            alert("Invalid credentials");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed");
    }
};


  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" color="primary">
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
