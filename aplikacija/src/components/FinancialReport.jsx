import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    TextField,
    Button,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import { generateClient } from 'aws-amplify/api';
import { deleteFinancialReport, listFinancialReports, getMonthlyRevenue, getAnnualSummary } from '../graphql/queries';
import { createFinancialReport } from '../graphql/mutations';
import awsconfig from './awsgraphQL/aws-exports';
import { Amplify } from 'aws-amplify';

Amplify.configure(awsconfig);

const FinancialReport = () => {
    const [reports, setReports] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [annualSummary, setAnnualSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newReport, setNewReport] = useState({
        month: '',
        Revenue: 0,
        Expenses: 0,
        NetProfit: 0,
        Description: '',
        Notes: '',
    });

    const client = generateClient();

    // Fetch reports
    const fetchReports = async () => {
        try {
            const result = await client.graphql({
                query: listFinancialReports,
            });
            setReports(result.data.listFinancialReports.items);
        } catch (err) {
            setError('Failed to fetch financial reports.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Create a new financial report
    const addReport = async () => {
        try {
            const result = await client.graphql({
                query: createFinancialReport,
                variables: {
                    input: newReport,
                },
            });
            console.log('Created Report:', result.data.createFinancialReport);
            fetchReports(); // Refresh the reports list
            setNewReport({
                month: '',
                Revenue: 0,
                Expenses: 0,
                NetProfit: 0,
                Description: '',
                Notes: '',
            }); // Reset form
        } catch (err) {
            console.error('Failed to create report:', err);
        }
    };

    const deleteReport = async (month) => {
        try {
          await client.graphql({
            query: deleteFinancialReport,
            variables: { input: { month } },
          });
          fetchReports(); // Refresh the reports list
        } catch (err) {
          console.error('Failed to delete report:', err);
        }
      };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <Container maxWidth="lg" style={{ marginTop: '30px', paddingBottom: '20px' }}>
            <Typography variant="h4" style={{ marginBottom: '30px', textAlign: 'center' }}>
                Financial Reports Management
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6">Add New Financial Report</Typography>
                    <Paper style={{ padding: '20px', marginTop: '10px' }}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                addReport();
                            }}
                        >
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Month"
                                        value={newReport.month}
                                        onChange={(e) => setNewReport({ ...newReport, month: e.target.value })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Revenue"
                                        type="number"
                                        value={newReport.Revenue}
                                        onChange={(e) => setNewReport({ ...newReport, Revenue: parseInt(e.target.value, 10) })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Expenses"
                                        type="number"
                                        value={newReport.Expenses}
                                        onChange={(e) => setNewReport({ ...newReport, Expenses: parseInt(e.target.value, 10) })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Net Profit"
                                        type="number"
                                        value={newReport.NetProfit}
                                        onChange={(e) => setNewReport({ ...newReport, NetProfit: parseInt(e.target.value, 10) })}
                                        fullWidth
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Description"
                                        value={newReport.Description}
                                        onChange={(e) => setNewReport({ ...newReport, Description: e.target.value })}
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Notes"
                                        value={newReport.Notes}
                                        onChange={(e) => setNewReport({ ...newReport, Notes: e.target.value })}
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button type="submit" variant="contained" color="primary" fullWidth>
                                        Add Report
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6" style={{ marginTop: '30px' }}>
                        All Financial Reports
                    </Typography>
                    {loading ? (
                        <CircularProgress />
                    ) : error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : (
                        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Month</strong></TableCell>
                                        <TableCell><strong>Revenue</strong></TableCell>
                                        <TableCell><strong>Expenses</strong></TableCell>
                                        <TableCell><strong>Net Profit</strong></TableCell>
                                        <TableCell><strong>Description</strong></TableCell>
                                        <TableCell><strong>Notes</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.month}>
                                            <TableCell>{report.month}</TableCell>
                                            <TableCell>${report.Revenue?.toLocaleString()}</TableCell>
                                            <TableCell>${report.Expenses?.toLocaleString()}</TableCell>
                                            <TableCell>${report.NetProfit?.toLocaleString()}</TableCell>
                                            <TableCell>{report.Description}</TableCell>
                                            <TableCell>{report.Notes}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    onClick={() => deleteReport(report.month)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default FinancialReport;
