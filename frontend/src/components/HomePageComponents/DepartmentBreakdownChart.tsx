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
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';

const DepartmentBreakdownChart: React.FC = () => {
  const theme = useTheme();
  const [timeView, setTimeView] = useState('quarterly');
  const [department, setDepartment] = useState('all');

  const handleTimeViewChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTimeView(newValue);
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setDepartment(event.target.value as string);
  };

  const quarterlyDepartmentData = {
    labels: ['Sales', 'Marketing', 'Operations', 'IT', 'HR'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [1470, 830, 510, 290, 140],
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Expenses (₹)',
        data: [620, 450, 730, 380, 160],
        backgroundColor: theme.palette.error.main,
      },
      {
        label: 'Profit (₹)',
        data: [850, 380, -220, -90, -20],
        backgroundColor: theme.palette.success.main,
      },
    ],
  };

  const yearlyDepartmentData = {
    labels: ['Sales', 'Marketing', 'Operations', 'IT', 'HR'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [5880, 3320, 2040, 1160, 560],
        backgroundColor: theme.palette.primary.main,
      },
      {
        label: 'Expenses (₹)',
        data: [2480, 1800, 2920, 1520, 640],
        backgroundColor: theme.palette.error.main,
      },
      {
        label: 'Profit (₹)',
        data: [3400, 1520, -880, -360, -80],
        backgroundColor: theme.palette.success.main,
      },
    ],
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Department-wise Breakdown</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
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
          {timeView === 'quarterly' && <Bar options={{}} data={quarterlyDepartmentData} />}
          {timeView === 'yearly' && <Bar options={{}} data={yearlyDepartmentData} />}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DepartmentBreakdownChart;
