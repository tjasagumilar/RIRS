import React, { useState, useEffect } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";

const LokacijeEdit = ({ office }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (office) {
      setFormData({
        name: office.name || "",
        address: office.address || "",
      });
    }
  }, [office]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!office || !office.id) {
      alert("Invalid office data. Cannot update.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `http://127.0.0.1:5005/offices/${office.id}`,
        formData
      );
      console.log("Office updated successfully:", response.data);
      alert("Office updated successfully");
    } catch (error) {
      console.error("Error updating office:", error);
      alert("Failed to update office");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Uredi pisarno
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Ime pisarne"
            name="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            label="Naslov pisarne"
            name="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            fullWidth
            margin="normal"
            variant="outlined"
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


LokacijeEdit.propTypes = {
    office: PropTypes.object
};
  

export default LokacijeEdit;
