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

    // Assign Employee to Project
    const assignEmployee = async (projectId, employeeId) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://localhost:5069/api/projects/${projectId}/assign-employee`,
                { employeeId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Employee assigned successfully!");
            fetchProjects(); // Refresh project list
        } catch (err) {
            setError("Failed to assign employee");
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchHighBudgetProjects();
        fetchEmployees();
    }, []);

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
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
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
                            onChange={(e) =>
                                setFormData({ ...formData, start_date: e.target.value })
                            }
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
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ marginTop: "10px" }}
                        >
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
                                <TableCell><strong>Assigned Employee</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.budget}</TableCell>
                                    <TableCell>
                                        {project.start_date
                                            ? new Date(project.start_date).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        {project.end_date
                                            ? new Date(project.end_date).toLocaleDateString()
                                            : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            select
                                            size="small"
                                            fullWidth
                                            value={project.assigned_employee_id || ""}
                                            onChange={(e) =>
                                                assignEmployee(project.id, e.target.value)
                                            }
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value="">-- Select Employee --</option>
                                            {employees.map((employee) => (
                                                <option key={employee.id} value={employee.id}>
                                                    {employee.name}
                                                </option>
                                            ))}
                                        </TextField>
                                    </TableCell>
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
                                                            `http://localhost:5069/api/projects/${project.id}`,
                                                            {
                                                                name: formData.name,
                                                                description: formData.description,
                                                                budget: formData.budget,
                                                            },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        alert("Project updated successfully!");
                                                        setSelectedProjects([]); // Clear editing state
                                                        fetchProjects(); // Refresh the list
                                                    } catch (err) {
                                                        setError("Failed to update project");
                                                    }
                                                }}
                                                style={{ marginRight: "8px" }}
                                            >
                                                Save
                                            </Button>
                                        ) : (
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedProjects([project.id]); // Mark project as selected for editing
                                                    setFormData({
                                                        name: project.name,
                                                        description: project.description,
                                                        budget: project.budget,
                                                    });
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
                </TableContainer>
            )}
        </Container>
    );
};

export default Projects;
