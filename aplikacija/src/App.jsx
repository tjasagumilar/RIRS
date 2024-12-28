import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import EmployeeEntryForm from "./components/EmployeeEntryForm";
import EditEntryForm from "./components/EditEntryForm";
import LoginForm from "./components/LoginForm";
import EmployeeHoursTable from "./components/EmployeeHoursTable";
import Overview from "./components/Overview";
import axios from "axios";
import { decodeJwt } from "jose";

const App = () => {
  const [currentView, setCurrentView] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setCurrentView("login");
        return;
      }

      try {
        const decodedToken = decodeJwt(token);
        const now = Date.now() / 1000;
        if (decodedToken.exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setCurrentView("login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setIsAuthenticated(true);
        setEmployeeId(decodedToken.sub || response.data.userId);
        setCurrentView("vnesiUre");
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCurrentView("login");
      }
    };

    verifyToken();
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleLogin = (user) => {
    if (!user || !user.id) {
      console.error("Invalid user object received:", user);
      return;
    }

    setIsAuthenticated(true);
    setEmployeeId(user.id);
    setCurrentView("vnesiUre");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setEmployeeId(null);
    setCurrentView("login");
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setCurrentView("editEntry");
  };

  return (
    <Router>
      <div>
        {currentView !== "login" && (
          <Header onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentView === "login" && <LoginForm onLogin={handleLogin} />}
        {currentView === "vnesiUre" && <EmployeeEntryForm />}
        {currentView === "mojaEvidenca" && (
          <EmployeeHoursTable employeeId={employeeId} onEdit={handleEdit} />
        )}
        {currentView === "pregled" && (
          <Overview employeeId={employeeId} onEdit={handleEdit} />
        )}
        {currentView === "editEntry" && selectedEntry && (
          <EditEntryForm
            entry={selectedEntry}
            onSave={() => setCurrentView("mojaEvidenca")}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
