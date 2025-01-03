import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

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

  // Check if there are times for each event when the component is mounted
  useEffect(() => {
    const checkTimesForToday = async () => {
      const currentDate = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      try {
        // Check for 'prihod' time
        const prihodResponse = await axios.get(
          `http://127.0.0.1:5002/prihod/${currentDate}/${employeeId}`
        );
        if (prihodResponse.data && prihodResponse.data.prihod) {
          setCurrentTimes((prev) => ({ ...prev, prihod: prihodResponse.data.prihod }));
          setCompletedTimes((prev) => ({ ...prev, prihod: true }));
        }

        // Check for 'malicaZacetek' time
        const malicaZacetekResponse = await axios.get(
          `http://127.0.0.1:5002/malicazacetek/${currentDate}/${employeeId}`
        );
        if (malicaZacetekResponse.data && malicaZacetekResponse.data.malicaZacetek) {
          setCurrentTimes((prev) => ({ ...prev, malicaZacetek: malicaZacetekResponse.data.malicaZacetek }));
          setCompletedTimes((prev) => ({ ...prev, malicaZacetek: true }));
        }

        // Check for 'malicaKonec' time
        const malicaKonecResponse = await axios.get(
          `http://127.0.0.1:5002/malicakonec/${currentDate}/${employeeId}`
        );
        if (malicaKonecResponse.data && malicaKonecResponse.data.malicaKonec) {
          setCurrentTimes((prev) => ({ ...prev, malicaKonec: malicaKonecResponse.data.malicaKonec }));
          setCompletedTimes((prev) => ({ ...prev, malicaKonec: true }));
        }

        // Check for 'odhod' time
        const odhodResponse = await axios.get(
          `http://127.0.0.1:5002/odhod/${currentDate}/${employeeId}`
        );
        if (odhodResponse.data && odhodResponse.data.odhod) {
          setCurrentTimes((prev) => ({ ...prev, odhod: odhodResponse.data.odhod }));
          setCompletedTimes((prev) => ({ ...prev, odhod: true }));
        }
      } catch (err) {
        console.error('Error checking times for today:', err);
      }
    };

    checkTimesForToday();
  }, [employeeId]); // This will run when the component mounts or employeeId changes

  const handlePrihodButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); // Get current time
      const response = await axios.post('http://127.0.0.1:5002/prihod', {
        idZaposlenega: employeeId,
        prihod: currentTime, // Send current time as prihod
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
      const currentTime = new Date().toISOString(); // Get current time
      const currentDate = currentTime.split('T')[0]; // Extract only the date part (YYYY-MM-DD)

      // Send PUT request to update malicaZacetek with the correct date and time
      const response = await axios.put(
        `http://127.0.0.1:5002/malicazacetek/${currentDate}/${currentTime}`
      );

      // Update state with the new time
      setCurrentTimes((prev) => ({
        ...prev,
        malicaZacetek: currentTime,
      }));

      // Mark malicaZacetek as completed
      setCompletedTimes((prev) => ({ ...prev, malicaZacetek: true }));

      // Set success message
      setSuccess('Malica Začetek time saved successfully!');
    } catch (err) {
      setError('Error saving malicaZacetek time');
    }
  };

  const handleMalicaKonecButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); // Get current time
      const currentDate = currentTime.split('T')[0]; // Extract only the date part (YYYY-MM-DD)

      // Send PUT request to update malicaKonec with the correct date and time
      const response = await axios.put(
        `http://127.0.0.1:5002/malicakonec/${currentDate}/${currentTime}`,
        {
          malicaKonec: currentTime, // Send current time as malicaKonec
        }
      );

      // Update state with the new time
      setCurrentTimes((prev) => ({
        ...prev,
        malicaKonec: currentTime,
      }));

      // Mark malicaKonec as completed
      setCompletedTimes((prev) => ({ ...prev, malicaKonec: true }));

      // Set success message
      setSuccess('Malica Konec time saved successfully!');
    } catch (err) {
      setError('Error saving malicaKonec time');
    }
  };

  const handleOdhodButtonClick = async () => {
    try {
      const currentTime = new Date().toISOString(); // Get current time
      const currentDate = currentTime.split('T')[0]; // Extract only the date part (YYYY-MM-DD)

      // Send PUT request to update odhod with the correct date and time
      const response = await axios.put(
        `http://127.0.0.1:5002/odhod/${currentDate}/${currentTime}`,
        {
          odhod: currentTime, // Send current time as odhod
        }
      );

      // Update state with the new time
      setCurrentTimes((prev) => ({
        ...prev,
        odhod: currentTime,
      }));

      // Mark odhod as completed
      setCompletedTimes((prev) => ({ ...prev, odhod: true }));

      // Set success message
      setSuccess('Odhod time saved successfully!');
    } catch (err) {
      setError('Error saving odhod time');
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '30px' }}>
      <Typography variant="h4" style={{ marginBottom: '20px' }}>
        Delovni Časi Zaposlenega
      </Typography>

      <Grid container spacing={3} style={{ marginBottom: '30px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Prihod</Typography>
              {!completedTimes.prihod ? (
                <Button variant="contained" onClick={handlePrihodButtonClick}>
                  Prihod
                </Button>
              ) : (
                <Typography>{currentTimes.prihod}</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Malica Začetek</Typography>
              {!completedTimes.malicaZacetek ? (
                <Button
                  variant="contained"
                  onClick={handleMalicaZacetekButtonClick}
                >
                  Malica Začetek
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
              <Typography variant="h6">Malica Konec</Typography>
              {!completedTimes.malicaKonec ? (
                <Button
                  variant="contained"
                  onClick={handleMalicaKonecButtonClick}
                >
                  Malica Konec
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
    </Container>
  );
};

export default Prihod;
