import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date)) return "";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Editing entry:", entry); // Confirm entry data
    if (entry) {
      setFormData({
        hoursWorked: entry.hours_worked || "",
        date: entry.date ? formatDate(entry.date) : "",
        description: entry.description || "",
      });
    }
  }, [entry]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!entry || !entry.id) {
      alert("Invalid entry. Cannot update.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/entries/${entry.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Entry updated successfully");
      if (onSave) onSave(); // Trigger onSave after a successful save
    } catch (error) {
      console.error("Error updating entry:", error);
      alert("Failed to update entry");
    } finally {
      setLoading(false);
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
            onChange={(e) =>
              setFormData({ ...formData, hoursWorked: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
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
            disabled={loading}
          >
            {loading ? "Shranjevanje..." : "Shrani"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

EditEntryForm.propTypes = {
  entry: PropTypes.object,
  onSave: PropTypes.func,
};

EditEntryForm.defaultProps = {
  entry: null,
};

export default EditEntryForm;
