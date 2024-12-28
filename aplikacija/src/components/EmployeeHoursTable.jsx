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
  Grid,
  Button,
  IconButton,
} from "@mui/material";
import axios from "axios";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { format } from "date-fns";
import { usePDF } from "react-to-pdf";
import PropTypes from "prop-types";

const EmployeeHoursTable = ({ employeeId, onEdit }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const source = axios.CancelToken.source();
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5000/api/entries?employeeId=${employeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cancelToken: source.token,
          }
        );
        setEntries(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Fetch entries request canceled:", error.message);
        } else {
          if (error.response && error.response.status === 401) {
            alert("Unauthorized: Please log in again.");
            localStorage.removeItem("token");
            window.location.reload();
          } else {
            console.error("Error fetching entries:", error);
          }
        }
      }
      return () => source.cancel("Fetch entries request canceled.");
    };

    if (employeeId) {
      fetchEntries();
    }
  }, [employeeId]);

  const { toPDF, targetRef } = usePDF({ filename: "employee_hours.pdf" });

  const handlePDFDownload = async () => {
    try {
      await toPDF();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Napaka pri ustvarjanju PDF-ja.");
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "30px", paddingBottom: "20px" }}>
      <Typography variant="h4" style={{ marginBottom: "30px" }}>
        Moja evidenca ur
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePDFDownload}
            style={{ height: "55px" }}
          >
            <DownloadIcon />
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} style={{ marginTop: "20px" }} ref={targetRef}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Datum</strong>
              </TableCell>
              <TableCell>
                <strong>Oddelane ure</strong>
              </TableCell>
              <TableCell>
                <strong>Opombe</strong>
              </TableCell>
              <TableCell>
                <strong>Uredi</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Trenutno ni nobenih vnosov.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {entry.date ? format(new Date(entry.date), "dd-MM-yyyy") : "Neveljaven datum"}
                  </TableCell>
                  <TableCell>{entry.hours_worked}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => onEdit(entry)} color="primary">
                      <EditIcon />
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

EmployeeHoursTable.propTypes = {
  employeeId: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default EmployeeHoursTable;
