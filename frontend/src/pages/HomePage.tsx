import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container component="main">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to the Protected Home Page
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            This page is only visible to authenticated users.
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage; 