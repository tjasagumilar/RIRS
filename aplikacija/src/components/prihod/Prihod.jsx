import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {Container, Button, Typography, Card, CardContent, Grid} from '@mui/material';
import PrihodiTable from './PrihodiTable';
import PrihodiDelete from './PrihodiDelete';


const Prihod = ({ employeeId }) => {
  const [completedTimes, setCompletedTimes] = useState({
    prihod: false,
    malicaZacetek: false,
    malicaKonec: false,
    odhod: false,
  });
  const [currentTimes, setCurrentTimes] = useState({
    prihod: '',
    malicaZacetek: '',
    malicaKonec: '',
    odhod: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    console.log(employeeId)
    const checkTimesForToday = async () => {
      const currentDate = new Date().toISOString().split('T')[0]; 
      try {
        const prihodResponse = await axios.get(
          `http://127.0.0.1:5002/prihod/${currentDate}/${employeeId}`
        );
        if (prihodResponse.data && prihodResponse.data.prihod) {
          setCurrentTimes((prev) => ({ ...prev, prihod: prihodResponse.data.prihod }));
          setCompletedTimes((prev) => ({ ...prev, prihod: true }));
        }

        const malicaZacetekResponse = await axios.get(
          `http://127.0.0.1:5002/malicazacetek/${currentDate}/${employeeId}`
        );
        if (malicaZacetekResponse.data && malicaZacetekResponse.data.malicaZacetek) {
          setCurrentTimes((prev) => ({ ...prev, malicaZacetek: malicaZacetekResponse.data.malicaZacetek }));
          setCompletedTimes((prev) => ({ ...prev, malicaZacetek: true }));
        }

        const malicaKonecResponse = await axios.get(
          `http://127.0.0.1:5002/malicakonec/${currentDate}/${employeeId}`
        );
        if (malicaKonecResponse.data && malicaKonecResponse.data.malicaKonec) {
          setCurrentTimes((prev) => ({ ...prev, malicaKonec: malicaKonecResponse.data.malicaKonec }));
          setCompletedTimes((prev) => ({ ...prev, malicaKonec: true }));
        }

        const odhodResponse = await axios.get(
          `http://127.0.0.1:5002/odhod/${currentDate}/${employeeId}`
        );
        if (odhodResponse.data && odhodResponse.data.odhod) {
          setCurrentTimes((prev) => ({ ...prev, odhod: odhodResponse.data.odhod }));
          setCompletedTimes((prev) => ({ ...prev, odhod: true }));
        }
      } catch (err) {
        console.log('Error checking times for today:', err);
      }
    };

    checkTimesForToday();
  }, [employeeId]);

  const handlePrihodDomaButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); 
      const response = await axios.post('http://127.0.0.1:5002/prihod/odDoma', {
        idZaposlenega: employeeId,
        prihod: currentTime,
      });
      setCurrentTimes((prev) => ({ ...prev, prihod: currentTime }));
      setCompletedTimes((prev) => ({ ...prev, prihod: true }));
      setSuccess('Prihod time saved successfully!');
    } catch (err) {
      setError('Error saving prihod time');
    }
  };

  const handlePrihodPisarnaButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); 
      const response = await axios.post('http://127.0.0.1:5002/prihod/pisarna', {
        idZaposlenega: employeeId,
        prihod: currentTime,
      });
      setCurrentTimes((prev) => ({ ...prev, prihod: currentTime }));
      setCompletedTimes((prev) => ({ ...prev, prihod: true }));
      setSuccess('Prihod time saved successfully!');
    } catch (err) {
      setError('Error saving prihod time');
    }
  };

  const handleMalicaZacetekButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); 
      const currentDate = currentTime.split('T')[0]; 

      const response = await axios.put(
        `http://127.0.0.1:5002/malicazacetek/${currentDate}/${currentTime}`
      );

      setCurrentTimes((prev) => ({
        ...prev,
        malicaZacetek: currentTime,
      }));

      setCompletedTimes((prev) => ({ ...prev, malicaZacetek: true }));

      setSuccess('Malica Začetek time saved successfully!');
    } catch (err) {
      setError('Error saving malicaZacetek time');
    }
  };

  const handleMalicaKonecButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString();
      const currentDate = currentTime.split('T')[0];

      const response = await axios.put(
        `http://127.0.0.1:5002/malicakonec/${currentDate}/${currentTime}`,
        {
          malicaKonec: currentTime, 
        }
      );

      setCurrentTimes((prev) => ({
        ...prev,
        malicaKonec: currentTime,
      }));

      setCompletedTimes((prev) => ({ ...prev, malicaKonec: true }));

      setSuccess('Malica Konec time saved successfully!');
    } catch (err) {
      setError('Error saving malicaKonec time');
    }
  };

  const handleOdhodButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); 
      const currentDate = currentTime.split('T')[0]; 

      const response = await axios.put(
        `http://127.0.0.1:5002/odhod/${currentDate}/${currentTime}`,
        {
          odhod: currentTime,
        }
      );

      setCurrentTimes((prev) => ({
        ...prev,
        odhod: currentTime,
      }));

      setCompletedTimes((prev) => ({ ...prev, odhod: true }));

      setSuccess('Odhod time saved successfully!');
    } catch (err) {
      setError('Error saving odhod time');
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      
      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Prihod</Typography>
              {!completedTimes.prihod ? (
                <Container>
                  <Button variant="contained" onClick={handlePrihodDomaButtonClick}>
                  Prihod - od doma
                </Button>
                <Button variant="contained" onClick={handlePrihodPisarnaButtonClick}>
                Prihod - pisarna
              </Button>
                </Container>
                
              ) : (
                <Typography>{currentTimes.prihod}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Malica - začetek</Typography>
              {!completedTimes.malicaZacetek ? (
                <Button
                  variant="contained"
                  onClick={handleMalicaZacetekButtonClick}
                >
                  Malica - začetek
                </Button>
              ) : (
                <Typography>{currentTimes.malicaZacetek}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Malica - konec</Typography>
              {!completedTimes.malicaKonec ? (
                <Button
                  variant="contained"
                  onClick={handleMalicaKonecButtonClick}
                >
                  Malica - konec
                </Button>
              ) : (
                <Typography>{currentTimes.malicaKonec}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Odhod</Typography>
              {!completedTimes.odhod ? (
                <Button variant="contained" onClick={handleOdhodButtonClick}>
                  Odhod
                </Button>
              ) : (
                <Typography>{currentTimes.odhod}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <h2>Zgodovina</h2>
      <PrihodiTable employeeId={employeeId} />
      <PrihodiDelete employeeId={employeeId} />

    </Container>
  );
};

export default Prihod;
