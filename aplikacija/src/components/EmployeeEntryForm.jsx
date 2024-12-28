import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  MenuItem,
  FormControl,
} from "@mui/material";
import axios from "axios";

const EmployeeEntryForm = () => {
  const [formData, setFormData] = useState({
    employeeId: "",
    hoursWorked: "",
    date: "",
    description: "",
  });

  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Unauthorized. Please log in again.");
          localStorage.removeItem("token");
          window.location.reload();
        } else {
          console.error("Error fetching employees:", error);
        }
      }
    };

    fetchEmployees();
  }, []);

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
      await axios.post("http://localhost:5000/api/entries", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Data submitted successfully");
      setFormData({
        employeeId: "",
        hoursWorked: "",
        date: "",
        description: "",
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("Unauthorized. Please log in again.");
        localStorage.removeItem("token");
        window.location.reload();
      } else {
        console.error("Error submitting data:", error);
        alert("Error submitting data");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Vnos podatkov o zaposlenih
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" variant="outlined">
            <TextField
              select
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              label="Izberite zaposlenega"
              required
              InputLabelProps={{
                shrink: true, // Ensures the label stays shrunk when a value is selected
              }}
            >
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>
          <TextField
            label="Število opravljenih ur"
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
            label="Opis"
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
            Pošlji
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default EmployeeEntryForm;
