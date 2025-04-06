import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Card,
  CardContent,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

const ForecastUncertaintyChart: React.FC = () => {
  const theme = useTheme();
  const [timeView, setTimeView] = useState('quarterly');
  const [department, setDepartment] = useState('all');

  const handleTimeViewChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTimeView(newValue);
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setDepartment(event.target.value as string);
  };

  const quarterlyForecastData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue Forecast (₹)',
        data: [120, 140, 180, 210, 250, 270],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'transparent',
        tension: 0.3,
      },
      // Add uncertainty bounds as needed
    ],
  };

  const yearlyForecastData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue Forecast (₹)',
        data: [450, 520, 680, 790],
        borderColor: theme.palette.primary.main,
        backgroundColor: 'transparent',
        tension: 0.3,
      },
      // Add uncertainty bounds as needed
    ],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Revenue Forecast with Uncertainty</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="forecast-department-label">Department</InputLabel>
            <Select
              labelId="forecast-department-label"
              value={department}
              label="Department"
              onChange={handleDepartmentChange}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="sales">Sales</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="operations">Operations</MenuItem>
            </Select>
          </FormControl>
          <Tabs value={timeView} onChange={handleTimeViewChange} aria-label="time period tabs">
            <Tab label="Quarterly" value="quarterly" />
            <Tab label="Yearly" value="yearly" />
          </Tabs>
        </Box>
        <Box sx={{ height: 400 }}>
          {timeView === 'quarterly' && <Line options={{}} data={quarterlyForecastData} />}
          {timeView === 'yearly' && <Line options={{}} data={yearlyForecastData} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ForecastUncertaintyChart;
