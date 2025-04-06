import { Grid, Box, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetIncome, useGetIncomeCategories } from '../hooks';
import { useMemo } from 'react';

const IncomePage = () => {
  const { data: income, isLoading: isLoadingIncome, isError: isIncomeError } = useGetIncome();
  const { data: categories } = useGetIncomeCategories();

  // Define columns for Income page
  const columns: readonly Column[] = useMemo(() => [
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 120,
      format: (value: unknown) => {
        return (value as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      },
    },
    {
      id: 'yearMonth',
      label: 'Period',
      minWidth: 100,
      format: (value: unknown) => {
        const yearMonth = value as string;
        const [year, month] = yearMonth.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      },
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 170,
      format: (value: unknown) => {
        if (!categories) return '';
        const categoryId = (value as { _id: string })?._id;
        const category = categories.categories.find((cat: any) => cat._id === categoryId);
        return category ? category.name : '';
      },
    },
    {
      id: 'project',
      label: 'Project',
      minWidth: 170,
      format: (value: unknown) => {
        return value ? (value as { name: string })?.name || 'N/A' : 'N/A';
      },
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      minWidth: 130,
      format: (value: unknown) => {
        return new Date(value as string).toLocaleDateString();
      },
    },
  ], [categories]);

  return (
    <Grid
      container
      sx={{
        marginTop: 8,
        marginBottom: 4,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoadingIncome ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isIncomeError ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            Error loading income data. Please try again later.
          </Typography>
        ) : (
          <DataTable columns={columns} rows={income || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default IncomePage;
