import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField } from '@mui/material';
import DopustForm from './DopustForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Dopust = ({ employeeId }) => {
  const [showForm, setShowForm] = useState(false);
  const [employeeHours, setEmployeeHours] = useState([]);
  const [filteredEmployeeHours, setFilteredEmployeeHours] = useState([]);
  const [editingRow, setEditingRow] = useState(null); // To track the row being edited
  const [editedData, setEditedData] = useState({}); // To track changes in the row being edited

  const handleDodajDopustClick = () => {
    setShowForm(true);
  };

  const handleDopustAdded = (newDopust) => {
    setEmployeeHours((prevHours) => [...prevHours, newDopust]);
    setFilteredEmployeeHours((prevHours) => [...prevHours, newDopust]);
    setShowForm(false);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleEditClick = (entry) => {
    setEditingRow(entry.id); // Set the row that is being edited
    setEditedData(entry); // Populate the form with the current data
  };

  const handleSaveChanges = () => {
    axios.put(`http://127.0.0.1:5001/dopusti/${editedData.id}`, editedData)
      .then(response => {
        // On success, update the employee hours list with the new data
        setEmployeeHours(prev => prev.map(item => item.id === editedData.id ? editedData : item));
        setFilteredEmployeeHours(prev => prev.map(item => item.id === editedData.id ? editedData : item));
        setEditingRow(null); // Clear the editing state
      })
      .catch(error => {
        console.error('Error updating data:', error);
      });
  };

  const handleDeleteClick = (id) => {
    axios.delete(`http://127.0.0.1:5001/dopusti/${id}`)
      .then(response => {
        // On success, remove the deleted entry from the state
        setEmployeeHours(prev => prev.filter(item => item.id !== id));
        setFilteredEmployeeHours(prev => prev.filter(item => item.id !== id));
      })
      .catch(error => {
        console.error('Error deleting data:', error);
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end - start;
    return Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert to days
  };

  useEffect(() => {
    console.log(employeeId); // Preverite, ali je employeeId pravilen
    axios.get('http://127.0.0.1:5001/dopusti')
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          console.log(response.data)
          const filteredData = response.data.filter(item => item.idZaposlenega == employeeId);
          setEmployeeHours(filteredData);
          console.log(filteredData)
          setFilteredEmployeeHours(filteredData);
        } else {
          console.error('Invalid data format received from server');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, [employeeId]);

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px', paddingBottom: '20px' }}>
      <Typography variant="h4" style={{ marginBottom: '30px' }}>
        Pregled dopusta
      </Typography>

      <Grid container spacing={3} style={{ marginTop: '20px' }}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Začetek</strong></TableCell>
                  <TableCell><strong>Konec</strong></TableCell>
                  <TableCell><strong>Št. dni</strong></TableCell>
                  <TableCell><strong>Opis</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployeeHours.length > 0 ? (
                  filteredEmployeeHours.map((entry, index) => {
                    const daysDifference = calculateDays(entry.zacetek, entry.konec);
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {editingRow === entry.id ? (
                            <TextField
                              name="zacetek"
                              value={editedData.zacetek || ''}
                              onChange={handleChange}
                            />
                          ) : (
                            entry.zacetek
                          )}
                        </TableCell>
                        <TableCell>
                          {editingRow === entry.id ? (
                            <TextField
                              name="konec"
                              value={editedData.konec || ''}
                              onChange={handleChange}
                            />
                          ) : (
                            entry.konec
                          )}
                        </TableCell>
                        <TableCell>{daysDifference}</TableCell>
                        <TableCell>
                          {editingRow === entry.id ? (
                            <TextField
                              name="opis"
                              value={editedData.opis || ''}
                              onChange={handleChange}
                            />
                          ) : (
                            entry.opis
                          )}
                        </TableCell>
                        <TableCell>{entry.status}</TableCell>
                        <TableCell>
                          {entry.status === 'v čakanju' && editingRow !== entry.id && (
                            <Button color="primary" startIcon={<EditIcon />} onClick={() => handleEditClick(entry)} />
                          )}
                          {editingRow === entry.id && (
                            <Button color="primary" onClick={handleSaveChanges}>Save</Button>
                          )}
                          {entry.status === 'v čakanju' && editingRow !== entry.id && (
                          <Button color="secondary" startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(entry.id)} />
                        )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12} md={4}>
          <Button variant="contained" color="primary" onClick={handleDodajDopustClick} fullWidth>
            Dodaj Dopust
          </Button>
          {showForm && (
            <DopustForm employeeId={employeeId} onDopustAdded={handleDopustAdded} onClose={handleCloseForm} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dopust;
