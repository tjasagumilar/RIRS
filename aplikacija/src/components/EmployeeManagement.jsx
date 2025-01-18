import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import axios from "axios";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState("");
  const [highSalary, setHighSalary] = useState([]);
  const [salaryThreshold, setSalaryThreshold] = useState("");
  const [newEmployees, setNewEmployees] = useState([{ name: "", position: "", salary: "" }]);
  const [updateSalary, setUpdateSalary] = useState({ id: "", salary: "" });
  const [updatePosition, setUpdatePosition] = useState({ id: "", position: "" });
  const [positionToDelete, setPositionToDelete] = useState("");

  // Pridobi vse zaposlene
  const handleFetchAllEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:7000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Napaka pri pridobivanju vseh zaposlenih:", error);
      alert("Pridobivanje zaposlenih ni uspelo. Več podrobnosti v konzoli.");
    }
  };

  // Pridobi zaposlene z visoko plačo
  const handleHighSalaryFetch = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:7000/api/employees/high-salary/${salaryThreshold}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.length === 0) {
        alert("Za določeni prag plače ni zaposlenih.");
      } else {
        setHighSalary(response.data);
      }
    } catch (error) {
      console.error("Napaka pri pridobivanju zaposlenih z visoko plačo:", error);
      alert("Pridobivanje zaposlenih z visoko plačo ni uspelo. Več podrobnosti v konzoli.");
    }
  };

  // Skupinsko dodajanje zaposlenih
  const handleBatchCreate = async () => {
    if (newEmployees.some((e) => !e.name || !e.position || !e.salary)) {
      alert("Prosimo, izpolnite vsa polja za nove zaposlene.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:7000/api/employees/batch",
        { employees: newEmployees },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Zaposleni so bili uspešno dodani!");
      setNewEmployees([{ name: "", position: "", salary: "" }]);
    } catch (error) {
      console.error("Napaka pri ustvarjanju zaposlenih:", error);
      alert("Ustvarjanje zaposlenih ni uspelo. Več podrobnosti v konzoli.");
    }
  };

  // Posodobi plačo zaposlenega
  const handleSalaryUpdate = async () => {
    if (!updateSalary.id || !updateSalary.salary) {
      alert("Prosimo, vnesite ID zaposlenega in novo plačo.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:7000/api/employees/${updateSalary.id}/salary`,
        { salary: updateSalary.salary },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Plača je bila uspešno posodobljena!");
      setUpdateSalary({ id: "", salary: "" });
    } catch (error) {
      console.error("Napaka pri posodabljanju plače:", error);
      if (error.response && error.response.status === 404) {
        alert("Zaposleni ni bil najden. Preverite ID.");
      } else {
        alert("Posodabljanje plače ni uspelo. Več podrobnosti v konzoli.");
      }
    }
  };

  // Posodobi položaj zaposlenega
  const handlePositionUpdate = async () => {
    if (!updatePosition.id || !updatePosition.position) {
      alert("Prosimo, vnesite ID zaposlenega in nov položaj.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:7000/api/employees/${updatePosition.id}/position`,
        { position: updatePosition.position },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Položaj je bil uspešno posodobljen!");
      setUpdatePosition({ id: "", position: "" });
    } catch (error) {
      console.error("Napaka pri posodabljanju položaja:", error);
      if (error.response && error.response.status === 404) {
        alert("Zaposleni ni bil najden. Preverite ID.");
      } else {
        alert("Posodabljanje položaja ni uspelo. Več podrobnosti v konzoli.");
      }
    }
  };

  // Izbriši zaposlene po položaju
  const handleDeleteByPosition = async () => {
    if (!positionToDelete) {
      alert("Prosimo, vnesite položaj.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:7000/api/employees/position/${positionToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Zaposleni so bili uspešno izbrisani!");
      setPositionToDelete("");
    } catch (error) {
      console.error("Napaka pri brisanju zaposlenih po položaju:", error);
      alert("Brisanje zaposlenih ni uspelo. Več podrobnosti v konzoli.");
    }
  };

  // Izbriši zaposlenega po ID
  const handleDeleteEmployeeById = async () => {
    if (!employeeIdToDelete) {
      alert("Prosimo, vnesite ID zaposlenega.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:7000/api/employees/${employeeIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Zaposleni je bil uspešno izbrisan!");
      setEmployeeIdToDelete("");
      handleFetchAllEmployees(); // Osveži seznam zaposlenih
    } catch (error) {
      console.error("Napaka pri brisanju zaposlenega po ID:", error);
      if (error.response && error.response.status === 404) {
        alert("Zaposleni ni bil najden. Preverite ID.");
      } else {
        alert("Brisanje zaposlenega ni uspelo. Več podrobnosti v konzoli.");
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Upravljanje zaposlenih
      </Typography>

      {/* Pridobi vse zaposlene */}
      <Box>
        <Typography variant="h6">Pridobi vse zaposlene</Typography>
        <Button variant="contained" onClick={handleFetchAllEmployees}>
          Pridobi vse zaposlene
        </Button>
        {employees.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Ime</TableCell>
                  <TableCell>Položaj</TableCell>
                  <TableCell>Plača</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.salary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Pridobi zaposlene z visoko plačo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Pridobi zaposlene z visoko plačo</Typography>
        <TextField
          label="Prag plače"
          type="number"
          value={salaryThreshold}
          onChange={(e) => setSalaryThreshold(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleHighSalaryFetch}>
          Pridobi
        </Button>
        {highSalary.length > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Ime</TableCell>
                  <TableCell>Položaj</TableCell>
                  <TableCell>Plača</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {highSalary.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.salary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Skupinsko ustvarjanje zaposlenih */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Skupinsko ustvarjanje zaposlenih</Typography>
        {newEmployees.map((employee, index) => (
          <Box key={index} sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Ime"
              value={employee.name}
              onChange={(e) =>
                setNewEmployees(
                  newEmployees.map((emp, i) =>
                    i === index ? { ...emp, name: e.target.value } : emp
                  )
                )
              }
            />
            <TextField
              label="Položaj"
              value={employee.position}
              onChange={(e) =>
                setNewEmployees(
                  newEmployees.map((emp, i) =>
                    i === index ? { ...emp, position: e.target.value } : emp
                  )
                )
              }
            />
            <TextField
              label="Plača"
              type="number"
              value={employee.salary}
              onChange={(e) =>
                setNewEmployees(
                  newEmployees.map((emp, i) =>
                    i === index ? { ...emp, salary: e.target.value } : emp
                  )
                )
              }
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => setNewEmployees(newEmployees.filter((_, i) => i !== index))}
            >
              Odstrani
            </Button>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={() =>
            setNewEmployees([...newEmployees, { name: "", position: "", salary: "" }])
          }
          sx={{ mt: 2 }}
        >
          Dodaj zaposlenega
        </Button>
        <Button variant="contained" color="primary" onClick={handleBatchCreate} sx={{ mt: 2 }}>
          Ustvari
        </Button>
      </Box>

      {/* Posodobi plačo zaposlenega */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Posodobi plačo zaposlenega</Typography>
        <TextField
          label="ID zaposlenega"
          value={updateSalary.id}
          onChange={(e) => setUpdateSalary({ ...updateSalary, id: e.target.value })}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Nova plača"
          type="number"
          value={updateSalary.salary}
          onChange={(e) => setUpdateSalary({ ...updateSalary, salary: e.target.value })}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handleSalaryUpdate}>
          Posodobi plačo
        </Button>
      </Box>

      {/* Posodobi položaj zaposlenega */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Posodobi položaj zaposlenega</Typography>
        <TextField
          label="ID zaposlenega"
          value={updatePosition.id}
          onChange={(e) => setUpdatePosition({ ...updatePosition, id: e.target.value })}
          sx={{ mr: 2 }}
        />
        <TextField
          label="Nov položaj"
          value={updatePosition.position}
          onChange={(e) => setUpdatePosition({ ...updatePosition, position: e.target.value })}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" onClick={handlePositionUpdate}>
          Posodobi položaj
        </Button>
      </Box>

      {/* Izbriši zaposlene po položaju */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Izbriši zaposlene po položaju</Typography>
        <TextField
          label="Položaj"
          value={positionToDelete}
          onChange={(e) => setPositionToDelete(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="error" onClick={handleDeleteByPosition}>
          Izbriši
        </Button>
      </Box>

      {/* Izbriši zaposlenega po ID */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Izbriši zaposlenega po ID</Typography>
        <TextField
          label="ID zaposlenega"
          value={employeeIdToDelete}
          onChange={(e) => setEmployeeIdToDelete(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button variant="contained" color="error" onClick={handleDeleteEmployeeById}>
          Izbriši
        </Button>
      </Box>
    </Container>
  );
};

export default EmployeeManagement;
