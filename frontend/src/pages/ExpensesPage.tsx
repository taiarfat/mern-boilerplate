import { Grid, Box, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetExpensesList, useGetIncomeCategories, useGetDepartments } from '../hooks';
import { useMemo } from 'react';

const ExpensesPage = () => {
  const { data: expenses, isLoading, isError } = useGetExpensesList();
  const { data: categories } = useGetIncomeCategories();
  const { data: departments } = useGetDepartments();

  // Define columns for Expenses page
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
      id: 'department',
      label: 'Department',
      minWidth: 170,
      format: (value: unknown) => {
        if (!departments || !value) return 'N/A';
        const departmentId = (value as { _id: string })?._id;
        const department = departments.departments.find((dept: any) => dept._id === departmentId);
        return department ? department.name : 'N/A';
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
      id: 'type',
      label: 'Type',
      minWidth: 130,
      format: (value: unknown) => {
        const type = value as string;
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
      renderCustom: (value: unknown) => {
        const type = value as string;
        let color: 'success' | 'error' | 'warning' | 'default' | 'primary' | 'info' | 'secondary' = 'default';
        
        switch(type) {
          case 'R&D':
            color = 'info';
            break;
          case 'marketing':
            color = 'primary';
            break;
          case 'salary':
            color = 'success';
            break;
          case 'Misc':
            color = 'warning';
            break;
          case 'operational':
            color = 'secondary';
            break;
        }
        
        return (
          <Chip 
            label={type.charAt(0).toUpperCase() + type.slice(1)} 
            color={color} 
            size="small" 
          />
        );
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
  ], [categories, departments]);

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
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            Error loading expenses data. Please try again later.
          </Typography>
        ) : (
          <DataTable columns={columns} rows={expenses || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default ExpensesPage;
