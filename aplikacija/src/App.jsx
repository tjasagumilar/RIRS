import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header";
import EmployeeEntryForm from "./components/EmployeeEntryForm";
import EditEntryForm from "./components/EditEntryForm";
import LoginForm from "./components/LoginForm";
import EmployeeHoursTable from "./components/EmployeeHoursTable";
import EmployeeManagement from "./components/EmployeeManagement";
import Overview from "./components/Overview";
import CallbackHandler from "./components/CallbackHandler";
import Budgets from "./components/Budgets"; // Import Budgets
import Dopust from "./components/Dopust";
import DopustAdmin from "./components/DopustAdmin";
import Prihod from "./components/Prihod";
import axios from "axios";
import { decodeJwt } from "jose";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Verify token on app load
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

        if (decodedToken.exp && decodedToken.exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          return;
        }

        // Assume valid if no expiration is provided
        setIsAuthenticated(true);
        setUser({ id: decodedToken.sub, name: decodedToken.name || "User" });
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/vnesiUre" replace />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/callback"
          element={<CallbackHandler onLogin={handleLogin} />}
        />
        {isAuthenticated && (
          <Route
            path="/*"
            element={
              <AppContent
                user={user}
                selectedEntry={selectedEntry}
                handleLogout={handleLogout}
                handleEdit={handleEdit}
              />
            }
          />
        )}
      </Routes>
    </Router>
  );
};

const AppContent = ({ user, selectedEntry, handleLogout, handleEdit }) => {
  return (
    <>
      <Header userName={user?.name} onLogout={handleLogout} />
      <Routes>
        <Route path="/vnesiUre" element={<EmployeeEntryForm />} />
        <Route
          path="/mojaEvidenca"
          element={
            <EmployeeHoursTable
              employeeId={user?.id}
              onEdit={(entry) => handleEdit(entry)}
            />
          }
        />
        <Route path="/editEntry" element={<EditEntryForm entry={selectedEntry} />} />
        <Route path="/pregled" element={<Overview />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/employees" element={<EmployeeManagement />} />
      </Routes>
    </>
  );
};

export default App;
