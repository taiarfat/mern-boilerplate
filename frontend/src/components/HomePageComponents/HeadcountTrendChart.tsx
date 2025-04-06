/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
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
  CircularProgress,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Department } from '../../types/Department';
import { useGetHeadcount } from '../../hooks';
import { transformHeadCountDataForChart } from '../../types/HeadCount';

type HeadcountTrendChartProps = {
  departments: Department[];
};

const HeadcountTrendChart: React.FC<HeadcountTrendChartProps> = ({ departments }) => {
  const { data: headCountByQuarter, isLoading: isHeadCountByQuarterLoading } = useGetHeadcount({
    period: 'last-year',
    groupBy: 'quarter',
  });

  const { data: headCountByMonth, isLoading: isHeadCountByMonthLoading } = useGetHeadcount({
    period: 'last-year',
    groupBy: 'month',
  });

  const [timeView, setTimeView] = useState('quarterly');
  const [department, setDepartment] = useState('all');

  const handleTimeViewChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTimeView(newValue);
  };

  const handleDepartmentChange = (event: SelectChangeEvent<string>) => {
    setDepartment(event.target.value as string);
  };

  const quarterlyHeadcountData = useMemo(
    () => transformHeadCountDataForChart(headCountByQuarter, department),
    [headCountByQuarter, department]
  );

  const yearlyHeadcountData = useMemo(
    () => transformHeadCountDataForChart(headCountByMonth, department),
    [headCountByMonth, department]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Headcount',
          },
        },
        x: {
          title: {
            display: true,
            text: timeView === 'quarterly' ? 'Quarter' : 'Month',
          },
        },
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: (context: { dataset: { label: string; }; raw: number; }) => `${context.dataset.label}: ${context.raw} employees`,
          },
        },
      },
    }),
    [timeView]
  );

  if (isHeadCountByQuarterLoading || isHeadCountByMonthLoading) {
    return (
      <Card>
        <CardContent
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
        >
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Headcount Trend by Department</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="headcount-department-label">Department</InputLabel>
            <Select
              labelId="headcount-department-label"
              value={department}
              label="Department"
              onChange={handleDepartmentChange}
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tabs value={timeView} onChange={handleTimeViewChange} aria-label="time period tabs">
            <Tab label="Quarterly" value="quarterly" />
            <Tab label="Yearly" value="yearly" />
          </Tabs>
        </Box>
        <Box sx={{ height: 400 }}>
          <Line
            options={chartOptions as any}
            data={timeView === 'quarterly' ? quarterlyHeadcountData : yearlyHeadcountData as any}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default HeadcountTrendChart;
