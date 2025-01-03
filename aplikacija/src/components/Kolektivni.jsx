import React, { useState } from 'react';
import { TextField, Button, Grid, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the Close icon
import axios from 'axios';

const Kolektivni = ({ onClose }) => {
  const [zacetek, setZacetek] = useState('');
  const [konec, setKonec] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!zacetek) newErrors.zacetek = 'Začetek je obvezen';
    if (!konec) newErrors.konec = 'Konec je obvezen';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newKolektivni = { zacetek, konec };

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
      <Typography variant="h6" style={{ marginBottom: '20px' }}>Kolektivni Dopust</Typography>
      {/* Close button */}
      <IconButton
        onClick={onClose} // Close the form when clicked
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: '#000',
        }}
      >
        <CloseIcon />
      </IconButton>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Začetek date picker */}
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

          {/* Konec date picker */}
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

          {/* Submit button */}
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
