import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the Close icon
import axios from 'axios';

const Kolektivni = ({ onClose }) => {
  const [zacetek, setZacetek] = useState('');
  const [konec, setKonec] = useState('');
  const [errors, setErrors] = useState({});
  const [employeeIds, setEmployeeIds] = useState([]); // State for employee IDs

  useEffect(() => {
    // Fetch employee IDs when the component mounts
    const fetchEmployeeIds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/employees', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Ensure token is included
          },
        });
        const ids = response.data.map(employee => employee.id); // Extract employee IDs
        console.log(ids);
        setEmployeeIds(ids);
        console.log(employeeIds)
      } catch (error) {
        console.error('Error fetching employee IDs', error);
      }
    };

    fetchEmployeeIds();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!zacetek) newErrors.zacetek = 'Začetek je obvezen';
    if (!konec) newErrors.konec = 'Konec je obvezen';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newKolektivni = { employeeIds, zacetek, konec }; // Include employeeIds in the payload
      console.log(zacetek, konec, employeeIds)
      try {
        await axios.post('http://127.0.0.1:5001/kolektivni', newKolektivni);
        console.log('Kolektivni Dopust added:', newKolektivni);
        // You can perform additional actions here, like notifying the parent component
      } catch (error) {
        console.error('Error submitting Kolektivni Dopust', error);
      }
    }
  };

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
     

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Začetek"
              type="date"
              fullWidth
              value={zacetek}
              onChange={(e) => setZacetek(e.target.value)}
              error={!!errors.zacetek}
              helperText={errors.zacetek}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Konec"
              type="date"
              fullWidth
              value={konec}
              onChange={(e) => setKonec(e.target.value)}
              error={!!errors.konec}
              helperText={errors.konec}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} style={{ marginTop: '20px' }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Potrdi Kolektivni Dopust
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default Kolektivni;
