import { Grid, Box, CircularProgress, Typography, Paper, Chip, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetExpensesList, useGetIncomeCategories, useGetDepartments } from '../hooks';
import { useState, useMemo } from 'react';

// Interface for expense data
interface Expense {
  amount: number;
  yearMonth: string;
  department?: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name?: string;
  };
  type: string;
  createdAt: string;
  [key: string]: any;
}

// Interface for category
interface Category {
  _id: string;
  name: string;
}

// Interface for department
interface Department {
  _id: string;
  name: string;
}

const ExpensesPage = () => {
  const { data: expenses, isLoading, isError } = useGetExpensesList();
  const { data: categories } = useGetIncomeCategories();
  const { data: departments } = useGetDepartments();
  const [filters, setFilters] = useState({
    period: '',
    category: '',
    department: '',
    type: '',
  });

  const handleFilterChange = (event: SelectChangeEvent, filterType: string) => {
    setFilters({
      ...filters,
      [filterType]: event.target.value,
    });
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!expenses) return { 
      periods: [] as Array<{value: string, display: string}>, 
      categoryIds: [] as string[], 
      departmentIds: [] as string[],
      types: [] as string[]
    };
    
    const periods = [...new Set((expenses as Expense[]).map(item => item.yearMonth))];
    
    // Format periods for display
    const formattedPeriods = periods.map(yearMonth => {
      const [year, month] = yearMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return {
        value: yearMonth,
        display: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    }).sort((a, b) => a.value.localeCompare(b.value));
    
    // Get unique categories
    const categoryIds = [...new Set((expenses as Expense[]).map(item => item.category?._id || ''))].filter(Boolean);
    
    // Get unique departments
    const departmentIds = [...new Set((expenses as Expense[])
      .filter(item => item.department)
      .map(item => item.department?._id || ''))].filter(Boolean);
    
    // Get unique expense types
    const types = [...new Set((expenses as Expense[]).map(item => item.type))].filter(Boolean);
    
    return {
      periods: formattedPeriods,
      categoryIds,
      departmentIds,
      types,
    };
  }, [expenses]);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    if (!categories) return '';
    const category = categories.categories.find((cat: Category) => cat._id === categoryId);
    return category ? category.name : '';
  };

  // Get department name by ID
  const getDepartmentName = (departmentId: string): string => {
    if (!departments) return '';
    const department = departments.departments.find((dept: Department) => dept._id === departmentId);
    return department ? department.name : '';
  };

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!expenses) return [];
    
    return (expenses as Expense[]).filter((item) => {
      // Apply period filter
      if (filters.period && item.yearMonth !== filters.period) {
        return false;
      }
      
      // Apply category filter
      if (filters.category && item.category?._id !== filters.category) {
        return false;
      }
      
      // Apply department filter
      if (filters.department && (!item.department || item.department._id !== filters.department)) {
        return false;
      }
      
      // Apply type filter
      if (filters.type && item.type !== filters.type) {
        return false;
      }
      
      return true;
    });
  }, [expenses, filters]);

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
        const department = departments.departments.find((dept: Department) => dept._id === departmentId);
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
        const category = categories.categories.find((cat: Category) => cat._id === categoryId);
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="period-filter-label">Period</InputLabel>
          <Select
            labelId="period-filter-label"
            value={filters.period}
            label="Period"
            onChange={(e) => handleFilterChange(e, 'period')}
          >
            <MenuItem value="">All Periods</MenuItem>
            {filterOptions.periods.map((period) => (
              <MenuItem key={period.value} value={period.value}>
                {period.display}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            value={filters.category}
            label="Category"
            onChange={(e) => handleFilterChange(e, 'category')}
          >
            <MenuItem value="">All Categories</MenuItem>
            {filterOptions.categoryIds.map((categoryId) => (
              <MenuItem key={categoryId} value={categoryId}>
                {getCategoryName(categoryId)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="department-filter-label">Department</InputLabel>
          <Select
            labelId="department-filter-label"
            value={filters.department}
            label="Department"
            onChange={(e) => handleFilterChange(e, 'department')}
          >
            <MenuItem value="">All Departments</MenuItem>
            {filterOptions.departmentIds.map((departmentId) => (
              <MenuItem key={departmentId} value={departmentId}>
                {getDepartmentName(departmentId)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="type-filter-label">Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={filters.type}
            label="Type"
            onChange={(e) => handleFilterChange(e, 'type')}
          >
            <MenuItem value="">All Types</MenuItem>
            {filterOptions.types.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
          <DataTable columns={columns} rows={filteredData || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default ExpensesPage;
