import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@mui/material/styles';
import Chart, { CoreChartOptions } from 'chart.js/auto';
import { Department } from '../../types/Department';
import { useGetExpenses, useGetFutureRevenue } from '../../hooks';

type ChartItem = {
  label: string;
  value: number;
};

type TimeView = 'quarterly' | 'yearly';

type FutureRevenueExpensesChartProps = {
  departments: Department[];
};

const CHART_ID = 'future-revenue-expenses-chart';
const DEFAULT_DEPARTMENT = 'all';

const FutureRevenueExpensesChart: React.FC<FutureRevenueExpensesChartProps> = ({ departments }) => {
  const theme = useTheme();
  const [timeView, setTimeView] = useState<TimeView>('quarterly');
  const [department, setDepartment] = useState<string>(DEFAULT_DEPARTMENT);

  const departmentParam = department === DEFAULT_DEPARTMENT ? undefined : department;

  const {
    data: futureRevenueByMonth,
    isLoading: isFutureRevenueByMonthLoading,
    error: futureRevenueMonthError,
  } = useGetFutureRevenue({
    department: departmentParam,
  });

  const {
    data: futureExpensesByMonth,
    isLoading: isFutureExpensesByMonthLoading,
    error: futureExpensesMonthError,
  } = useGetExpenses({
    department: departmentParam,
  });

  // Clean up chart instance on component unmount
  useEffect(() => {
    return () => {
      const chart = Chart.getChart(CHART_ID);
      if (chart) chart.destroy();
    };
  }, []);

  const isLoading = isFutureRevenueByMonthLoading || isFutureExpensesByMonthLoading;
  const hasError = futureRevenueMonthError || futureExpensesMonthError;

  // Function to calculate quarterly data from monthly data
  const calculateQuarterlyData = useMemo(() => {
    if (!futureRevenueByMonth?.chartData || !futureExpensesByMonth?.chartData) {
      return {
        labels: [],
        revenueData: [],
        expensesData: []
      };
    }

    const revenueMonthlyData = futureRevenueByMonth.chartData;
    const expensesMonthlyData = futureExpensesByMonth.chartData;
    
    // Initialize quarterly arrays
    const quarterlyLabels: string[] = [];
    const quarterlyRevenue: number[] = [];
    const quarterlyExpenses: number[] = [];
    
    // Process data in groups of 3 months (one quarter)
    for (let i = 0; i < revenueMonthlyData.length; i += 3) {
      // Extract year from the first month in the quarter (format: 'MMM YYYY')
      const dateComponents = revenueMonthlyData[i].label.split(' ');
      const year = dateComponents.length > 1 ? dateComponents[1] : new Date().getFullYear().toString();
      
      // Determine quarter number (1-4) based on the index
      const quarterNumber = Math.floor(i / 3) + 1;
      const quarterLabel = `${year}-Q${quarterNumber}`;
      
      // Calculate sum for this quarter (up to 3 months, or fewer if at the end of the array)
      let quarterRevenueSum = 0;
      let quarterExpensesSum = 0;
      
      for (let j = 0; j < 3 && (i + j) < revenueMonthlyData.length; j++) {
        quarterRevenueSum += revenueMonthlyData[i + j].value;
        quarterExpensesSum += expensesMonthlyData[i + j]?.value || 0; // Handle potential undefined
      }
      
      quarterlyLabels.push(quarterLabel);
      quarterlyRevenue.push(quarterRevenueSum);
      quarterlyExpenses.push(quarterExpensesSum);
    }
    
    return {
      labels: quarterlyLabels,
      revenueData: quarterlyRevenue,
      expensesData: quarterlyExpenses
    };
  }, [futureRevenueByMonth, futureExpensesByMonth]);

  const createChartData = useMemo(
    () => (labels: string[], revenueData: number[], expensesData: number[]) => ({
      labels,
      datasets: [
        {
          label: 'Projected Revenue (₹)',
          data: revenueData,
          borderColor: theme.palette.success.main,
          backgroundColor: `${theme.palette.success.main}33`,
          borderDash: [5, 5], // Using dotted lines for future projections
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Projected Expenses (₹)',
          data: expensesData,
          borderColor: theme.palette.secondary.main,
          backgroundColor: `${theme.palette.secondary.main}33`,
          borderDash: [5, 5], // Using dotted lines for future projections
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [theme.palette.success.main, theme.palette.secondary.main]
  );

  const quarterlyFutureData = useMemo(
    () => {
      const { labels, revenueData, expensesData } = calculateQuarterlyData;
      return createChartData(labels, revenueData, expensesData);
    },
    [createChartData, calculateQuarterlyData]
  );

  const yearlyFutureData = useMemo(
    () =>
      createChartData(
        futureRevenueByMonth?.chartData?.map((item: ChartItem) => item.label) || [],
        futureRevenueByMonth?.chartData?.map((item: ChartItem) => item.value) || [],
        futureExpensesByMonth?.chartData?.map((item: ChartItem) => item.value) || []
      ),
    [createChartData, futureRevenueByMonth, futureExpensesByMonth]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) => `₹${value.toLocaleString()}`,
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: { dataset: { label: string }; raw: number }) =>
              `${context.dataset.label}: ₹${context.raw.toLocaleString()}`,
          },
        },
        legend: {
          position: 'top' as const,
        },
      },
    }),
    []
  );

  const handleTimeViewChange = (_: React.SyntheticEvent, newValue: TimeView) => {
    setTimeView(newValue);
  };

  if (isLoading) {
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

  if (hasError) {
    return (
      <Card>
        <CardContent
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
        >
          <Typography color="error">
            Failed to load projection data. Please try again later.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Future Revenue & Expenses Projections
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150, mr: 2 }}>
            <InputLabel id="future-revenue-department-label">Department</InputLabel>
            <Select
              labelId="future-revenue-department-label"
              value={department}
              label="Department"
              onChange={e => setDepartment(e.target.value as string)}
            >
              <MenuItem value={DEFAULT_DEPARTMENT}>All Departments</MenuItem>
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
            id={CHART_ID}
            options={chartOptions as unknown as CoreChartOptions<'line'>}
            data={timeView === 'quarterly' ? quarterlyFutureData : yearlyFutureData}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FutureRevenueExpensesChart;
