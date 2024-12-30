import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import EmployeeEntryForm from "./components/EmployeeEntryForm";
import EditEntryForm from "./components/EditEntryForm";
import LoginForm from "./components/LoginForm";
import EmployeeHoursTable from "./components/EmployeeHoursTable";
import Overview from "./components/Overview";
import CallbackHandler from "./components/CallbackHandler";
import axios from "axios";
import { decodeJwt } from "jose";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
  
      try {
        const decodedToken = decodeJwt(token);
        const now = Date.now() / 1000;
  
        if (decodedToken.exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          return;
        }
  
        // Assume verification is successful without redundant API calls
        setIsAuthenticated(true);
        setEmployeeId(decodedToken.uid);
        setUserName(decodedToken.sub);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };
  
    verifyToken();
  }, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setEmployeeId(null);
    setUserName(null);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        userName={userName}
        employeeId={employeeId}
        selectedEntry={selectedEntry}
        handleLogout={handleLogout}
        handleEdit={handleEdit}
      />
    </Router>
  );
};

const AppContent = ({ isAuthenticated, userName, employeeId, selectedEntry, handleLogout, handleEdit }) => {
  const navigate = useNavigate();

  const handleNavigate = (view) => {
    navigate(view);
  };

  return (
    <>
      {isAuthenticated && <Header userName={userName} onNavigate={handleNavigate} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/vnesiUre" replace /> : <LoginForm />} />
        <Route path="/callback" element={<CallbackHandler />} />
        {isAuthenticated ? (
          <>
            <Route path="/vnesiUre" element={<EmployeeEntryForm />} />
            <Route
              path="/mojaEvidenca"
              element={<EmployeeHoursTable employeeId={employeeId} onEdit={handleEdit} />}
            />
            <Route path="/pregled" element={<Overview employeeId={employeeId} />} />
            <Route
              path="/editEntry"
              element={<EditEntryForm entry={selectedEntry || {}} />}
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </>
  );
};

export default App;
