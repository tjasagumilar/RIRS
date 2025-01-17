import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Grid,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    CircularProgress,
    Alert,
} from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";


const Projects = () => {
    const [employees, setEmployees] = useState([]);
    const [projects, setProjects] = useState([]);
    const [highBudgetProjects, setHighBudgetProjects] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        budget: "",
        start_date: "",
        end_date: "",
        time_running: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedProjects, setSelectedProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5069/api/projects", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch projects");
            setLoading(false);
        }
    };

    const fetchHighBudgetProjects = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                "http://localhost:5069/api/projects/budget-over-12000",
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setHighBudgetProjects(response.data);
        } catch (err) {
            setError("Failed to fetch high budget projects");
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5069/api/projects", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Project added successfully!");
            setFormData({
                name: "",
                description: "",
                budget: "",
                start_date: "",
                end_date: "",
                time_running: "",
            });
            fetchProjects();
        } catch (err) {
            setError("Failed to add project");
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5069/api/projects/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Project deleted successfully");
            fetchProjects();
        } catch (err) {
            setError("Failed to delete project");
        }
    };

    const handleDeleteMultiple = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete("http://localhost:5069/api/projects", {
                data: { ids: selectedProjects },
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Projects deleted successfully");
            setSelectedProjects([]);
            fetchProjects();
        } catch (err) {
            setError("Failed to delete multiple projects");
        }
    };

    const fetchEmployees = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get("http://localhost:5000/api/employees", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEmployees(response.data);
        } catch (err) {
          setError("Failed to fetch employees");
        }
      };
      

      useEffect(() => {
        fetchProjects();
        fetchHighBudgetProjects();
        fetchEmployees();
      }, []);

    return (
        <Container maxWidth="lg" style={{ marginTop: "30px", paddingBottom: "20px" }}>
            <Typography variant="h4" style={{ marginBottom: "30px" }}>
                Projects Management
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <Typography variant="h6">Projects with Budget Over 12000</Typography>
                    <Paper style={{ height: "300px", padding: "20px" }}>
                        <PieChart
                            series={[
                                {
                                    data: highBudgetProjects.map((project) => ({
                                        label: project.name,
                                        value: project.budget,
                                    })),
                                },
                            ]}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="h6">Add New Project</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Budget"
                            name="budget"
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Start Date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="End Date"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Time Running"
                            name="time_running"
                            type="number"
                            value={formData.time_running}
                            onChange={(e) => setFormData({ ...formData, time_running: e.target.value })}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" style={{ marginTop: "10px" }}>
                            Add Project
                        </Button>
                    </form>
                </Grid>
            </Grid>

            <Typography variant="h6" style={{ marginTop: "30px" }}>
                All Projects
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Budget</strong></TableCell>
                                <TableCell><strong>Start Date</strong></TableCell>
                                <TableCell><strong>End Date</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id} selected={selectedProjects.includes(project.id)}>
                                    <TableCell>
                                        {selectedProjects.includes(project.id) ? (
                                            <TextField
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                fullWidth
                                                variant="outlined"
                                                size="small"
                                            />
                                        ) : (
                                            project.name
                                        )}
                                    </TableCell>
                                    <TableCell>{project.budget}</TableCell>
                                    <TableCell>{project.start_date}</TableCell>
                                    <TableCell>{project.end_date || "N/A"}</TableCell>
                                    <TableCell>
                                        {selectedProjects.includes(project.id) ? (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={async () => {
                                                    try {
                                                        const token = localStorage.getItem("token");
                                                        await axios.put(
                                                            `http://localhost:5069/api/projects/${project.id}/name`,
                                                            { name: formData.name },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        alert("Project name updated successfully!");
                                                        setSelectedProjects(selectedProjects.filter((id) => id !== project.id));
                                                        fetchProjects();
                                                    } catch (err) {
                                                        setError("Failed to update project name");
                                                    }
                                                }}
                                                style={{ marginRight: "8px" }}
                                            >
                                                Save
                                            </Button>
                                        ) : (
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedProjects([project.id]);
                                                    setFormData({ ...formData, name: project.name });
                                                }}
                                                color="primary"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => handleDelete(project.id)}
                                            color="error"
                                            disabled={selectedProjects.includes(project.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeleteMultiple}
                        style={{ marginTop: "10px" }}
                        disabled={selectedProjects.length === 0}
                    >
                        Delete Selected
                    </Button>
                </TableContainer>

            )}
        </Container>
    );
};

export default Projects;
