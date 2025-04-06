import React from 'react';
import { Container, Box, Grid, CircularProgress } from '@mui/material';
import RevenueExpensesChart from '../components/Charts/RevenueExpensesChart';
import AnomalyAlertsCardList from '../components/Charts/AnomalyAlertsCardList';
// import InsightsList from '../components/Charts/InsightsList';
import { useGetDepartments, useGetIncomeCategories } from '../hooks';
import FutureRevenueExpensesChart from '../components/Charts/FutureRevenueExpensesChart';

const HomePage: React.FC = () => {
  const { data, isLoading: isDepartmentsLoading } = useGetDepartments();
  const { data: incomeCategories, isLoading: isIncomeCategoriesLoading } = useGetIncomeCategories();

  if (isDepartmentsLoading || isIncomeCategoriesLoading) {
    return <CircularProgress />;
  }

  const departments = data?.departments || [];
  const categories = incomeCategories?.categories || [];

  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        mt: 8,
      }}
    >
      <Container maxWidth={false}>
        {/* <Grid container spacing={3}>
          <InsightsList />
        </Grid> */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <RevenueExpensesChart departments={departments} categories={categories} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FutureRevenueExpensesChart departments={departments} />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 6 }}>
            <HeadcountTrendChart departments={departments} />
          </Grid> */}
          <Grid size={{ xs: 12 }}>
            <AnomalyAlertsCardList />
          </Grid>
          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <DepartmentBreakdownChart />
          </Grid> */}
          {/* <Grid size={{ xs: 12, sm: 4 }}>
            <ForecastUncertaintyChart />
          </Grid> */}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
