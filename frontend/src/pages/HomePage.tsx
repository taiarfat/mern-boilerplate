import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  AppBar, 
  Toolbar 
} from '@mui/material';

const HomePage: React.FC = () => {


  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container component="main">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to the Bac Hack
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default HomePage; 