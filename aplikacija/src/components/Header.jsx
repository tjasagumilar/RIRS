import React from "react";
import PropTypes from "prop-types";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const Header = ({ onLogout, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Evidenca ur za {userName || "Uporabnik"}!
        </Typography>
        <Button color="inherit" component={Link} to="/vnesiUre">
          Vnesi ure
        </Button>
        <Button color="inherit" component={Link} to="/mojaEvidenca">
          Moja evidenca
        </Button>
        <Button color="inherit" component={Link} to="/pregled">
          Pregled
        </Button>
        <Button color="inherit" component={Link} to="/budgets">
          Budget
        </Button>
        <Button color="inherit" component={Link} to="/employees">
          Zaposeni
        </Button>
        <Button color="inherit" component={Link} to="/dopust">
          Dopust
        </Button>
        <Button color="inherit" component={Link} to="/dopustAdmin">
          Dopust Admin
        </Button>
        <Button color="inherit" component={Link} to="/prihod">
          Prihod
        </Button>
        <Button color="inherit" onClick={handleLogout} />       
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  onLogout: PropTypes.func.isRequired,
  userName: PropTypes.string,
};

export default Header;
