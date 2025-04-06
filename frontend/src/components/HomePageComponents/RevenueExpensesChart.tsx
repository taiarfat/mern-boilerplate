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
import { useGetExpenses, useGetRevenue } from '../../hooks';
import { IncomeCategory } from '../../types/IncomeCategory';

type ChartItem = {
  label: string;
  value: number;
};

type TimeView = 'quarterly' | 'yearly';

type RevenueExpensesChartProps = {
  departments: Department[];
  categories: IncomeCategory[];
};

const CHART_ID = 'revenue-expenses-chart';
const DEFAULT_DEPARTMENT = 'all';
const DEFAULT_CATEGORY = 'all';
const DEFAULT_PROJECT_TYPE = 'all';

const RevenueExpensesChart: React.FC<RevenueExpensesChartProps> = ({ departments, categories }) => {
  const theme = useTheme();
  const [timeView, setTimeView] = useState<TimeView>('quarterly');
  const [department, setDepartment] = useState<string>(DEFAULT_DEPARTMENT);
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY);
  const [projectType, setProjectType] = useState<string>(DEFAULT_PROJECT_TYPE);

  const departmentParam = department === DEFAULT_DEPARTMENT ? undefined : department;
  const categoryParam =
    category === DEFAULT_CATEGORY ? undefined : (category as 'Software PVT' | 'System' | 'Product');
  const projectTypeParam =
    projectType === DEFAULT_PROJECT_TYPE ? undefined : (projectType as 'fixed' | 'dedicated');

  const {
    data: revenueByQuarter,
    isLoading: isRevenueByQuarterLoading,
    error: revenueQuarterError,
  } = useGetRevenue({
    categoryId: categoryParam,
    department: departmentParam,
    groupBy: 'quarter',
    period: 'last-year',
    projectType: projectTypeParam,
  });

  const {
    data: revenueByMonth,
    isLoading: isRevenueByMonthLoading,
    error: revenueMonthError,
  } = useGetRevenue({
    categoryId: categoryParam,
    department: departmentParam,
    groupBy: 'month',
    period: 'last-year',
    projectType: projectTypeParam,
  });

  const {
    data: expensesByQuarter,
    isLoading: isExpensesByQuarterLoading,
    error: expensesQuarterError,
  } = useGetExpenses({
    categoryId: categoryParam,
    department: departmentParam,
    groupBy: 'quarter',
    period: 'last-year',
    projectType: projectTypeParam,
  });

  const {
    data: expensesByMonth,
    isLoading: isExpensesByMonthLoading,
    error: expensesMonthError,
  } = useGetExpenses({
    categoryId: categoryParam,
    department: departmentParam,
    groupBy: 'month',
    period: 'last-year',
    projectType: projectTypeParam,
  });

  // Clean up chart instance on component unmount
  useEffect(() => {
    return () => {
      const chart = Chart.getChart(CHART_ID);
      if (chart) chart.destroy();
    };
  }, []);

  const isLoading =
    isRevenueByQuarterLoading ||
    isRevenueByMonthLoading ||
    isExpensesByQuarterLoading ||
    isExpensesByMonthLoading;

  const hasError =
    revenueQuarterError || revenueMonthError || expensesQuarterError || expensesMonthError;

  const createChartData = useMemo(
    () => (labels: string[], revenueData: number[], expensesData: number[]) => ({
      labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenueData,
          borderColor: theme.palette.primary.main,
          backgroundColor: `${theme.palette.primary.main}33`,
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Expenses (₹)',
          data: expensesData,
          borderColor: theme.palette.error.main,
          backgroundColor: `${theme.palette.error.main}33`,
          tension: 0.3,
          fill: true,
        },
      ],
    }),
    [theme.palette.primary.main, theme.palette.error.main]
  );

  const quarterlyRevenueData = useMemo(
    () =>
      createChartData(
        revenueByQuarter?.chartData?.map((item: ChartItem) => item.label) || [],
        revenueByQuarter?.chartData?.map((item: ChartItem) => item.value) || [],
        expensesByQuarter?.chartData?.map((item: ChartItem) => item.value) || []
      ),
    [createChartData, revenueByQuarter, expensesByQuarter]
  );

  const yearlyRevenueData = useMemo(
    () =>
      createChartData(
        revenueByMonth?.chartData?.map((item: ChartItem) => item.label) || [],
        revenueByMonth?.chartData?.map((item: ChartItem) => item.value) || [],
        expensesByMonth?.chartData?.map((item: ChartItem) => item.value) || []
      ),
    [createChartData, revenueByMonth, expensesByMonth]
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
          <Typography color="error">Failed to load chart data. Please try again later.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Revenue & Expenses Over Time
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="revenue-category-label">Category</InputLabel>
              <Select
                labelId="revenue-category-label"
                value={category}
                label="Category"
                onChange={e => setCategory(e.target.value as string)}
              >
                <MenuItem value={DEFAULT_CATEGORY}>All Categories</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="revenue-department-label">Department</InputLabel>
              <Select
                labelId="revenue-department-label"
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
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="revenue-project-type-label">Project Type</InputLabel>
              <Select
                labelId="revenue-project-type-label"
                value={projectType}
                label="Project Type"
                onChange={e => setProjectType(e.target.value as string)}
              >
                <MenuItem value={DEFAULT_PROJECT_TYPE}>All Project Types</MenuItem>
                <MenuItem value="fixed">Fixed</MenuItem>
                <MenuItem value="dedicated">Dedicated</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Tabs value={timeView} onChange={handleTimeViewChange} aria-label="time period tabs">
            <Tab label="Quarterly" value="quarterly" />
            <Tab label="Yearly" value="yearly" />
          </Tabs>
        </Box>
        <Box sx={{ height: 400 }}>
          <Line
            id={CHART_ID}
            options={chartOptions as unknown as CoreChartOptions<'line'>}
            data={timeView === 'quarterly' ? quarterlyRevenueData : yearlyRevenueData}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default RevenueExpensesChart;
