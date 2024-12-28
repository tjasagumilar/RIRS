import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";

// Helper function to convert date to YYYY-MM-DD format
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EditEntryForm = ({ entry, onSave }) => {
  const [formData, setFormData] = useState({
    hoursWorked: "",
    date: "",
    description: "",
  });

  // Populate the form with the passed entry data
  useEffect(() => {
    if (entry) {
      setFormData({
        hoursWorked: entry.hours_worked || "",
        date: formatDate(entry.date) || "",
        description: entry.description || "",
      });
    }
  }, [entry]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/entries/${entry.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Entry updated successfully");
      if (onSave) onSave(); // Notify the parent component
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Uredi vnos
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Oddelane ure"
            name="hoursWorked"
            value={formData.hoursWorked}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            type="number"
            required
          />
          <TextField
            label="Datum"
            name="date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            type="date"
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Opombe"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Shrani
          </Button>
        </form>
      </Box>
    </Container>
  );
};

EditEntryForm.propTypes = {
  entry: PropTypes.object.isRequired,
  onSave: PropTypes.func,
};

export default EditEntryForm;
