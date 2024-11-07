import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import axios from "axios";

const EmployeeHoursTable = ({ employeeId, onEdit }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/entries?employeeId=${employeeId}`);
        setEntries(response.data); // Assuming response.data is an array of entries
      } catch (error) {
        console.error("Error fetching entries:", error);
      }
    };

    if (employeeId) {
      fetchEntries();
    }
  }, [employeeId]);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Hours Worked</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.date}</TableCell>
              <TableCell>{entry.hours_worked}</TableCell>
              <TableCell>{entry.description}</TableCell>
              <TableCell>
                <button onClick={() => onEdit(entry)}>Posodobi</button> {/* Change 'Edit' to 'Posodobi' */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EmployeeHoursTable;
