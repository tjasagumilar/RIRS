import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Snackbar, Alert } from '@mui/material';

const PrihodiDelete = ({ employeeId }) => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('success'); 

  const handleIzbrisi1ButtonClick = async () => {
    try {
      const response = await axios.delete(`http://127.0.0.1:5002/prihod/${employeeId}`);
      setMessage(response.data.message);
      setSeverity('success');
    } catch (err) {
      console.log('Error:', err);
      setMessage('Error deleting entries');
      setSeverity('error');
    }
  };

  const handleIzbrisi2ButtonClick = async () => {
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format
      const response = await axios.delete(`http://127.0.0.1:5002/prihod/${employeeId}/${currentDate}`);
      setMessage(response.data.message);
      setSeverity('success');
    } catch (err) {
      console.error('Error:', err);
      setMessage('Error deleting entries for today');
      setSeverity('error');
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
      

      <Snackbar
        open={message !== ''}
        autoHideDuration={6000}
        onClose={() => setMessage('')}
      >
        <Alert onClose={() => setMessage('')} severity={severity}>
          {message}
        </Alert>
      </Snackbar>
      <Button variant="contained" onClick={handleIzbrisi1ButtonClick} style={{margin: "10px"}}>Izbriši vse vnose</Button>
      <Button variant="contained" onClick={handleIzbrisi2ButtonClick}>Izbriši vnos za danes</Button>
    </Container>
  );
};

export default PrihodiDelete;
