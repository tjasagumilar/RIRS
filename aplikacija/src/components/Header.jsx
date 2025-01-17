import React from "react";
import PropTypes from "prop-types";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";

const Header = ({ onNavigate, onLogout, userName }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Evidenca ur za {userName || "Uporabnik"}!
        </Typography>


        <Button color="inherit" onClick={() => onNavigate("/vnesiUre")}>
          Vnesi ure
        </Button>
        <Button color="inherit" onClick={() => onNavigate("/mojaEvidenca")}>
          Moja evidenca
        </Button>
        <Button color="inherit" onClick={() => onNavigate("/pregled")}>
          Pregled
        </Button>
        <Button color="inherit" onClick={() => onNavigate("/projects")}>
          Projects
        </Button>
        <Button color="inherit" onClick={onLogout}>
          Odjava
        </Button>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  onNavigate: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  userName: PropTypes.string,
};

export default Header;
