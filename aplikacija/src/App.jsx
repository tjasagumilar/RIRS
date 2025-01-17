import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
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
        // Decode the token and check its type
        const decodedToken = decodeJwt(token);
        const now = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp < now) {
          console.log("Token expired");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          return;
        }

        // Assume valid if no expiration is provided (Okta tokens)
        setIsAuthenticated(true);
        setUser({
          id: decodedToken.uid || decodedToken.sub, // UID for old login, SUB for SSO
          name: decodedToken.name || decodedToken.sub,
          role: decodedToken.role || "employee", // Default to "employee"
        });
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
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <Router>
      <AppContent
        isAuthenticated={isAuthenticated}
        user={user}
        selectedEntry={selectedEntry}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        handleEdit={handleEdit}
      />
    </Router>
  );
};

const AppContent = ({
  isAuthenticated,
  user,
  selectedEntry,
  handleLogin,
  handleLogout,
  handleEdit,
}) => {
  const navigate = useNavigate();

  const handleNavigate = (view) => {
    navigate(view);
  };

  return (
    <>
      {isAuthenticated && (
        <Header
          userName={user?.name || "User"}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
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
        {isAuthenticated ? (
          <>
            <Route path="/vnesiUre" element={<EmployeeEntryForm />} />
            <Route
              path="/mojaEvidenca"
              element={
                <EmployeeHoursTable
                  employeeId={user?.id}
                  onEdit={(entry) => {
                    handleEdit(entry);
                    navigate("/editEntry");
                  }}
                />
              }
            />

            <Route
              path="/editEntry"
              element={<EditEntryForm entry={selectedEntry} />}
            />
            <Route
              path="/pregled"
              element={<Overview employeeId={user?.id} />}
            />
            <Route
              path="/lokacije"
              element={<Lokacije employeeId={user?.id} />}
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
