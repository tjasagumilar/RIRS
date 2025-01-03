import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Typography, Container} from '@mui/material';

const PrihodiTable = ({ employeeId }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'datum', direction: 'asc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:5002/prihod/${employeeId}`);
        setData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Prišlo je do napake pir pirdobivanju podatkov'
        );
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];
      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sortedData);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '30px' }}>
    
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'datum'}
                  direction={sortConfig.key === 'datum' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('datum')}
                >
                  Datum
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'prihod'}
                  direction={sortConfig.key === 'prihod' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('prihod')}
                >
                  Prihod
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'odhod'}
                  direction={sortConfig.key === 'odhod' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('odhod')}
                >
                  Odhod
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'malicaZacetek'}
                  direction={sortConfig.key === 'malicaZacetek' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('malicaZacetek')}
                >
                  Malica - začetek
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'malicaKonec'}
                  direction={sortConfig.key === 'malicaKonec' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('malicaKonec')}
                >
                  Malica - konec
                </TableSortLabel>
              </TableCell>
              <TableCell>
               Lokacija
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.datum}</TableCell>
                  <TableCell>
                    {item.prihod ? new Date(item.prihod).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.odhod ? new Date(item.odhod).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.malicaZacetek
                      ? new Date(item.malicaZacetek).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.malicaKonec
                      ? new Date(item.malicaKonec).toLocaleString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>{item.lokacija}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Ni podatkov
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PrihodiTable;
