import React, { useState } from 'react';
import { TextField, Button, Grid, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; 
import axios from 'axios';

const DopustForm = ({ employeeId, onDopustAdded, onClose }) => {
  const [zacetek, setZacetek] = useState('');
  const [konec, setKonec] = useState('');
  const [opis, setOpis] = useState('');
  const [status, setStatus] = useState('v čakanju');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    if (!zacetek) newErrors.zacetek = 'Začetek je obvezen';
    if (!konec) newErrors.konec = 'Konec je obvezen';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const idZaposlenega = employeeId;
      const newDopust = { idZaposlenega, zacetek, konec, opis, status };
      
      try {
        await axios.post('http://127.0.0.1:5001/dopusti', newDopust);
        onDopustAdded(newDopust);
      } catch (error) {
        console.error('Error submitting form', error);
      }
    }
  };

  return (
    <div style={{ position: 'relative', padding: '20px' }}>
      <IconButton
        onClick={onClose} 
        style={{
          position: 'absolute',
          padding: '20px'
          
        }}
      >
        <CloseIcon />
      </IconButton>

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

          <Grid item xs={12}>
            <TextField
              label="Opis"
              fullWidth
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12} style={{ marginTop: '20px' }}>
            <Button variant="contained" color="primary" type="submit" fullWidth>
              Dodaj Dopust
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  );
};

export default DopustForm;
