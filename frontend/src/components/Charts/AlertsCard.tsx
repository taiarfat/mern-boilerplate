import React from 'react';
import { Card, CardContent, Typography, Alert, Stack } from '@mui/material';

const AlertsCard: React.FC = () => {
  return (
    <Card sx={{ height: '100%', overflow: 'auto' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Anomaly Alerts
        </Typography>
        <Stack spacing={2}>
          <Alert severity="error" sx={{ display: 'flex' }}>
            <Typography variant="body2" fontWeight="bold">
              Revenue Drop Alert
            </Typography>
            <Typography variant="body2">Expected: $500K</Typography>
            <Typography variant="body2">Actual: $420K</Typography>
          </Alert>
          <Alert severity="warning" sx={{ display: 'flex' }}>
            <Typography variant="body2" fontWeight="bold">
              Expense Spikes
            </Typography>
            <Typography variant="body2">at 04/25/2024 02:10 PM</Typography>
          </Alert>
          <Alert severity="info" sx={{ display: 'flex' }}>
            <Typography variant="body2" fontWeight="bold">
              Attrition Surges
            </Typography>
            <Typography variant="body2">at 04/23/2024 02:10 PM</Typography>
          </Alert>
          <Alert severity="success" sx={{ display: 'flex' }}>
            <Typography variant="body2" fontWeight="bold">
              Revenue Growth
            </Typography>
            <Typography variant="body2">at 04/23/2024 02:10 PM</Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AlertsCard; 