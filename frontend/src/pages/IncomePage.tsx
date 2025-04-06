import { Grid, Box, CircularProgress, Typography, Paper, Chip, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetIncome, useGetIncomeCategories } from '../hooks';
import { useState, useMemo } from 'react';

// Interface for income data
interface Income {
  amount: number;
  yearMonth: string;
  category: {
    _id: string;
    name?: string;
  };
  project?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  [key: string]: any;
}

// Interface for category
interface Category {
  _id: string;
  name: string;
}

const IncomePage = () => {
  const { data: income, isLoading: isLoadingIncome, isError: isIncomeError } = useGetIncome();
  const { data: categories } = useGetIncomeCategories();
  const [filters, setFilters] = useState({
    period: '',
    category: '',
    project: '',
  });

  const handleFilterChange = (event: SelectChangeEvent, filterType: string) => {
    setFilters({
      ...filters,
      [filterType]: event.target.value,
    });
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!income) return { 
      periods: [] as Array<{value: string, display: string}>, 
      categoryIds: [] as string[], 
      projectNames: [] as string[] 
    };
    
    const periods = [...new Set((income as Income[]).map(item => item.yearMonth))];
    
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
    const categoryIds = [...new Set((income as Income[]).map(item => item.category?._id || ''))].filter(Boolean);
    
    // Get unique projects
    const projectNames = [...new Set((income as Income[])
      .filter(item => item.project && item.project.name)
      .map(item => item.project?.name || ''))].filter(Boolean);
    
    return {
      periods: formattedPeriods,
      categoryIds,
      projectNames,
    };
  }, [income]);

  // Get category name by ID
  const getCategoryName = (categoryId: string): string => {
    if (!categories) return '';
    const category = categories.categories.find((cat: Category) => cat._id === categoryId);
    return category ? category.name : '';
  };

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!income) return [];
    
    return (income as Income[]).filter((item) => {
      // Apply period filter
      if (filters.period && item.yearMonth !== filters.period) {
        return false;
      }
      
      // Apply category filter
      if (filters.category && item.category?._id !== filters.category) {
        return false;
      }
      
      // Apply project filter
      if (filters.project && (!item.project || item.project.name !== filters.project)) {
        return false;
      }
      
      return true;
    });
  }, [income, filters]);

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
        const category = categories.categories.find((cat: Category) => cat._id === categoryId);
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }} size="small">
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
        
        <FormControl sx={{ minWidth: 200 }} size="small">
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
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="project-filter-label">Project</InputLabel>
          <Select
            labelId="project-filter-label"
            value={filters.project}
            label="Project"
            onChange={(e) => handleFilterChange(e, 'project')}
          >
            <MenuItem value="">All Projects</MenuItem>
            {filterOptions.projectNames.map((projectName) => (
              <MenuItem key={projectName} value={projectName}>
                {projectName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
          <DataTable columns={columns} rows={filteredData || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default IncomePage;
