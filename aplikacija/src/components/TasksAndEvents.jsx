import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
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
    CircularProgress,
    Alert,
    IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";

const TasksAndEvents = () => {
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        event_time: "",
        color: "#1E90FF",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const testAPI = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5420/test");
            console.log(response.data);
        } catch (err) {
            console.error("API Test Failed:", err);
        }
    };
    useEffect(() => {
        testAPI();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5420/api/tasks", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch tasks");
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://localhost:5420/api/events", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(
                response.data.map((event) => ({
                    id: event.id,
                    title: event.name,
                    start: event.event_time,
                    backgroundColor: event.color,
                }))
            );
        } catch (err) {
            setError("Failed to fetch events");
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchEvents();
    }, []);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5420/api/events", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Event added successfully!");
            setFormData({ name: "", description: "", event_time: "", color: "#1E90FF" });
            fetchEvents();
        } catch (err) {
            setError("Failed to add event");
        }
    };

    const handleDeleteTask = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5420/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Task deleted successfully");
            fetchTasks();
        } catch (err) {
            setError("Failed to delete task");
        }
    };

    const handleEditEvent = async (id, updatedEvent) => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(`http://localhost:5069/api/events/${id}`, updatedEvent, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Event updated successfully!");
            fetchEvents(); // Refresh the events to reflect the update
        } catch (err) {
            console.error("Failed to update event:", err);
            alert("Failed to update event.");
        }
    };


    const handleDeleteEvent = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5420/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("Event deleted successfully");
            fetchEvents();
        } catch (err) {
            setError("Failed to delete event");
        }
    };

    const promptForEventDetails = (event) => {
        const name = prompt("Enter new event name:", event.title);
        if (!name) return null;

        const description = prompt("Enter new description:", event.extendedProps?.description || "");
        const event_time = prompt("Enter new event time (YYYY-MM-DD HH:mm:ss):", event.startStr);
        const color = prompt("Enter new color (hex):", event.backgroundColor);

        return { name, description, event_time, color };
    };

    return (
        <Container maxWidth="lg" style={{ marginTop: "30px", paddingBottom: "20px" }}>
            <Typography variant="h4" style={{ marginBottom: "30px" }}>
                Tasks and Events Management
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Typography variant="h6">Interactive Calendar</Typography>
                    <Paper style={{ padding: "20px" }}>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            editable={true}
                            selectable={true}
                            eventClick={({ event }) => {
                                const action = window.prompt(
                                    "What would you like to do?\nType 'edit' to update the event or 'delete' to remove it:"
                                );

                                if (action === "edit") {
                                    const updatedEvent = promptForEventDetails(event); // Call a function to get new details
                                    if (updatedEvent) {
                                        handleEditEvent(event.id, updatedEvent);
                                    }
                                } else if (action === "delete") {
                                    if (window.confirm("Are you sure you want to delete this event?")) {
                                        handleDeleteEvent(event.id);
                                    }
                                } else {
                                    alert("Invalid action. Please type 'edit' or 'delete'.");
                                }
                            }}
                        />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6">Add New Event</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            label="Event Name"
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
                        />
                        <TextField
                            label="Event Time"
                            name="event_time"
                            type="datetime-local"
                            value={formData.event_time}
                            onChange={(e) =>
                                setFormData({ ...formData, event_time: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            label="Color"
                            name="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            fullWidth
                            margin="normal"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ marginTop: "10px" }}
                        >
                            Add Event
                        </Button>
                    </form>
                </Grid>
            </Grid>

            <Typography variant="h6" style={{ marginTop: "30px" }}>
                Tasks List
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
                                <TableCell><strong>Title</strong></TableCell>
                                <TableCell><strong>Due Date</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Priority</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.map((task) => (
                                <TableRow key={task.id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>
                                        {new Date(task.due_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{task.status}</TableCell>
                                    <TableCell>{task.priority}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            onClick={() => handleDeleteTask(task.id)}
                                            color="error"
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

export default TasksAndEvents;
