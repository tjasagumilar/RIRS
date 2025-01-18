import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Kolektivni from './Kolektivni';
import DopustStatistics from './DopustStatistics';


const DopustAdmin = () => {
  const [dopusti, setDopusti] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);


  useEffect(() => {
    // Fetch data from the new endpoint
    axios.get('http://127.0.0.1:5001/dopustiAll', )
      .then(response => {
        if (response.data && Array.isArray(response.data)) {
          console.log(response.data);
          setDopusti(response.data);
        } else {
          console.error('Invalid data format received from server');
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const handleApprove = (id) => {
    console.log(`Approve button clicked for ID: ${id}`);
    
    axios.put(`http://127.0.0.1:5001/dopusti`, null, {
      params: {
        id: id,
        status: 'Odobreno'
      }
    })
    .then(response => {
      console.log(`Leave request approved for ID: ${id}`, response.data);
      // Update the status of the specific leave request in the state
      setDopusti(prevDopusti =>
        prevDopusti.map(entry =>
          entry.id === id ? { ...entry, status: 'Odobreno' } : entry
        )
      );
    })
    .catch(error => {
      console.error(`Error approving leave request for ID: ${id}`, error);
    });
  };
  
  const handleReject = (id) => {
    console.log(`Reject button clicked for ID: ${id}`);
    
    axios.put(`http://127.0.0.1:5001/dopusti`, null, {
      params: {
        id: id,
        status: 'Zavrnjeno'
      }
    })
    .then(response => {
      console.log(`Leave request rejected for ID: ${id}`, response.data);
      // Update the status of the specific leave request in the state
      setDopusti(prevDopusti =>
        prevDopusti.map(entry =>
          entry.id === id ? { ...entry, status: 'Zavrnjeno' } : entry
        )
      );
    })
    .catch(error => {
      console.error(`Error rejecting leave request for ID: ${id}`, error);
    });
  };

  // Helper function to determine the row color based on the status
  const getRowStyle = (status) => {
    if (status === 'Odobreno') {
      return { backgroundColor: '#c8e6c9' }; // Light green for approved
    } else if (status === 'Zavrnjeno') {
      return { backgroundColor: '#ffcccb' }; // Light red for rejected
    }
    return {}; // Default style (no color change)
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDeleteRejected = () => {
    axios.delete('http://127.0.0.1:5001/zavrnjeni')
      .then(response => {
        setDopusti(prevDopusti => prevDopusti.filter(entry => entry.status !== 'Zavrnjeno'));
      })
      .catch(error => {
        console.log('Error deleting rejected leave records:', error);
      });
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px', paddingBottom: '20px' }}>
      <Typography variant="h4" style={{ marginBottom: '30px' }}>
        Pregled dopusta
      </Typography>
      <Button onClick={handleDeleteRejected} color="error" style={{ marginBottom: '20px' }}>
        Izbriši zavrnjene
      </Button>
      <Button onClick={handleOpenDialog} color="error" style={{ marginBottom: '20px' }}>
        Kolektivni dopust
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Začetek</strong></TableCell>
              <TableCell><strong>Konec</strong></TableCell>
              <TableCell><strong>Opis</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Zaposleni</strong></TableCell>
              <TableCell> </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dopusti.length > 0 ? (
              dopusti.map((entry, index) => (
                <TableRow key={index} style={getRowStyle(entry.status)}>
                  <TableCell>{entry.zacetek}</TableCell>
                  <TableCell>{entry.konec}</TableCell>
                  <TableCell>{entry.opis}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                  <TableCell>{entry.idZaposlenega}</TableCell>

                  <TableCell>
                    <Button color="success" onClick={() => handleApprove(entry.id)}>
                      <CheckIcon />
                    </Button>
                    <Button color="error" onClick={() => handleReject(entry.id)}>
                      <CloseIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Kolektivni Dopust</DialogTitle>
        <DialogContent>
          <Kolektivni onClose={handleCloseDialog} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <DopustStatistics />
    </Container>
  );
};

export default DopustAdmin;
