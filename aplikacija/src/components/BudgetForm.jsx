import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";

const BudgetForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({ department: "", total_budget: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/budgets", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Proračun je bil uspešno shranjen!");
      setFormData({ department: "", total_budget: "" });
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      console.error("Napaka pri shranjevanju proračuna:", error);
      alert("Shranjevanje proračuna ni uspelo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Ustvari proračun
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Oddelek"
            name="department"
            value={formData.department}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Skupni proračun"
            name="total_budget"
            value={formData.total_budget}
            onChange={handleChange}
            fullWidth
            margin="normal"
            type="number"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? "Shranjevanje..." : "Shrani"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default BudgetForm;
