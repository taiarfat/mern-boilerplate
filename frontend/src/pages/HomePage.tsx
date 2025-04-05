import React from 'react';
import { 
  Container, 
  Box, 
  Typography, 
} from '@mui/material';

const HomePage: React.FC = () => {


  return (
    <Container component="main">
        <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome to the Bac Hack
          </Typography>
        </Box>
      </Container>
  );
};

export default HomePage; 