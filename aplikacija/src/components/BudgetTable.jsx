import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Typography,
  CircularProgress,
  Button,
  TextField,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import axios from "axios";

const BudgetTable = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetById, setBudgetById] = useState(null);
  const [getId, setGetId] = useState("");
  const [newBudgets, setNewBudgets] = useState([{ department: "", total_budget: "" }]);
  const [updateBudgets, setUpdateBudgets] = useState([{ id: "", department: "", total_budget: "" }]);
  const [bulkDeleteIds, setBulkDeleteIds] = useState("");

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/budgets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(response.data);
    } catch (error) {
      console.error("Napaka pri pridobivanju proračunov:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetById = async () => {
    if (!getId.trim()) {
      alert("Vnesite veljaven ID!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`/api/budgets/${getId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgetById(response.data);
    } catch (error) {
      console.error("Napaka pri pridobivanju proračuna po ID:", error);
      alert("Proračun z danim ID ni bil najden.");
    }
  };

  const handleBulkCreate = async () => {
    if (newBudgets.some((b) => !b.department.trim() || !b.total_budget)) {
      alert("Izpolnite vsa polja za dodane proračune!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/budgets/bulk", { budgets: newBudgets }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Proračuni uspešno ustvarjeni!");
      setNewBudgets([{ department: "", total_budget: "" }]);
      fetchBudgets();
    } catch (error) {
      console.error("Napaka pri množičnem ustvarjanju proračunov:", error);
      alert("Prišlo je do napake pri množičnem ustvarjanju proračunov.");
    }
  };

  const handleBulkUpdate = async () => {
    if (updateBudgets.some((b) => !b.id || !b.department || !b.total_budget)) {
      alert("Please fill out all fields for each budget update!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
  
      // Ensure id is an integer and total_budget is a number
      const updates = updateBudgets.map((b) => ({
        id: parseInt(b.id, 10),
        department: b.department,
        total_budget: parseFloat(b.total_budget),
      }));
  
      console.log("Sending updates:", updates);
  
      await axios.put("/api/budgets/bulk", { updates }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("Budgets updated successfully!");
      setUpdateBudgets([{ id: "", department: "", total_budget: "" }]);
      fetchBudgets();
    } catch (error) {
      console.error("Error updating budgets:", error);
      alert("Failed to update budgets. Please check the console for details.");
    }
  };
  
  
  

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Proračun uspešno izbrisan!");
      fetchBudgets();
    } catch (error) {
      console.error("Napaka pri brisanju proračuna:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const ids = bulkDeleteIds
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id));
      if (ids.length === 0) {
        alert("Vnesite veljavne ID-je za brisanje.");
        return;
      }
      await axios.delete("/api/budgets/bulk", {
        headers: { Authorization: `Bearer ${token}` },
        data: { ids },
      });
      alert("Več proračunov je bilo uspešno izbrisanih!");
      setBulkDeleteIds("");
      fetchBudgets();
    } catch (error) {
      console.error("Napaka pri množičnem brisanju proračunov:", error);
      alert("Prišlo je do napake pri množičnem brisanju.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Proračuni
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Oddelek</TableCell>
                <TableCell>Skupni proračun</TableCell>
                <TableCell>Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.id}</TableCell>
                  <TableCell>{budget.department}</TableCell>
                  <TableCell>{budget.total_budget}</TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleDelete(budget.id)}>
                      Izbriši
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Fetch Budget by ID */}
      <Box>
        <Typography variant="h6">Pridobi proračun po ID</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            label="ID"
            value={getId}
            onChange={(e) => setGetId(e.target.value)}
          />
          <Button variant="contained" onClick={fetchBudgetById}>
            Pridobi
          </Button>
        </Box>
        {budgetById && (
          <Box sx={{ mt: 2 }}>
            <Typography>ID: {budgetById.id}</Typography>
            <Typography>Oddelek: {budgetById.department}</Typography>
            <Typography>Skupni proračun: {budgetById.total_budget}</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Add Multiple Budgets */}
      <Box>
        <Typography variant="h6">Ustvari več proračunov</Typography>
        {newBudgets.map((budget, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Oddelek"
              value={budget.department}
              onChange={(e) =>
                setNewBudgets(
                  newBudgets.map((b, i) =>
                    i === index ? { ...b, department: e.target.value } : b
                  )
                )
              }
            />
            <TextField
              label="Skupni proračun"
              type="number"
              value={budget.total_budget}
              onChange={(e) =>
                setNewBudgets(
                  newBudgets.map((b, i) =>
                    i === index ? { ...b, total_budget: e.target.value } : b
                  )
                )
              }
            />
            <IconButton onClick={() => setNewBudgets(newBudgets.filter((_, i) => i !== index))}>
              <Remove />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() => setNewBudgets([...newBudgets, { department: "", total_budget: "" }])}
          sx={{ mt: 2 }}
        >
          Dodaj proračun
        </Button>
        <Button variant="contained" color="primary" onClick={handleBulkCreate} sx={{ mt: 2 }}>
          Ustvari
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Update Multiple Budgets */}
      <Box>
        <Typography variant="h6">Posodobi več proračunov</Typography>
        {updateBudgets.map((budget, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="ID"
              value={budget.id}
              onChange={(e) =>
                setUpdateBudgets(
                  updateBudgets.map((b, i) =>
                    i === index ? { ...b, id: e.target.value } : b
                  )
                )
              }
            />
            <TextField
              label="Oddelek"
              value={budget.department}
              onChange={(e) =>
                setUpdateBudgets(
                  updateBudgets.map((b, i) =>
                    i === index ? { ...b, department: e.target.value } : b
                  )
                )
              }
            />
            <TextField
              label="Skupni proračun"
              type="number"
              value={budget.total_budget}
              onChange={(e) =>
                setUpdateBudgets(
                  updateBudgets.map((b, i) =>
                    i === index ? { ...b, total_budget: e.target.value } : b
                  )
                )
              }
            />
            <IconButton onClick={() => setUpdateBudgets(updateBudgets.filter((_, i) => i !== index))}>
              <Remove />
            </IconButton>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() => setUpdateBudgets([...updateBudgets, { id: "", department: "", total_budget: "" }])}
          sx={{ mt: 2 }}
        >
          Dodaj posodobitev
        </Button>
        <Button variant="contained" color="primary" onClick={handleBulkUpdate} sx={{ mt: 2 }}>
          Posodobi
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Delete Multiple Budgets */}
      <Box>
        <Typography variant="h6">Izbriši več proračunov</Typography>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <TextField
            label="ID-ji (ločeni z vejico)"
            value={bulkDeleteIds}
            onChange={(e) => setBulkDeleteIds(e.target.value)}
          />
          <Button variant="contained" color="error" onClick={handleBulkDelete}>
            Izbriši več
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BudgetTable;
