import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const Lokacije = ({ onEdit }) => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5005/offices");
      setOffices(response.data);
    } catch (error) {
      console.error("Error fetching offices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this office?")) {
      try {
        await axios.delete(`http://localhost:5005/offices/${id}`);
        setOffices(offices.filter((office) => office.id !== id));
      } catch (error) {
        console.error("Error deleting office:", error);
      }
    }
  };

  const handleEdit = (office) => {
    console.log("Edit office:", office);
    onEdit(office);
  };

  const navigate = useNavigate();

  const handleAdd = () => {
    console.log("Add new office");
    navigate("/lokacijeAdd")
  };

  const handleViewLogs = () => {
    navigate("/dnevnik"); 
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "30px" }}>
      <Typography variant="h4" style={{ marginBottom: "20px" }}>
        Lokacije pisarn
      </Typography>

      <Grid container justifyContent="flex-end" style={{ marginBottom: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Dodaj pisarno
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ marginLeft: "10px" }}
          onClick={handleViewLogs}
        >
          Spremembe
        </Button>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Ime</strong></TableCell>
              <TableCell><strong>Naslov</strong></TableCell>
              <TableCell><strong>Uredi</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : offices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Ni bilo najdenih pisarn.
                </TableCell>
              </TableRow>
            ) : (
              offices.map((office) => (
                <TableRow key={office.id}>
                  <TableCell>{office.name}</TableCell>
                  <TableCell>{office.address}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(office)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(office.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Lokacije;
