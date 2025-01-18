import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  FormControl,
  MenuItem
} from "@mui/material";
import axios from "axios";

const LokacijeAdd = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.address) {
      setErrorMessage("Both fields are required.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5005/offices", formData);
      console.log("Office added successfully:", response.data);

      setFormData({
        name: "",
        address: "",
      });
      setErrorMessage(""); 
    } catch (error) {
      console.error("Error submitting office data:", error);
      setErrorMessage("There was an error submitting the form. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Vnos podatkov o pisarni
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" variant="outlined">
            <TextField
              name="name"
              value={formData.name}
              onChange={handleChange}
              label="Vnesite ime"
              required
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth margin="normal" variant="outlined">
            <TextField
              name="address"
              value={formData.address}
              onChange={handleChange}
              label="Vnesite naslov"
              required
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
            />
          </FormControl>

          {/* Error Message */}
          {errorMessage && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Pošlji
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default LokacijeAdd;
