import { Grid, Box, CircularProgress, Typography, Paper, Chip, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetProjects } from '../hooks';
import { useState, useMemo } from 'react';

// Interface for project data
interface Project {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: 'fixed' | 'dedicated';
  status: 'active' | 'completed' | 'cancelled' | 'on-hold';
  team: unknown[];
  [key: string]: any;
}

// Define columns for Projects page
const columns: readonly Column[] = [
  { id: 'name', label: 'Project Name', minWidth: 170 },
  { id: 'description', label: 'Description', minWidth: 200 },
  {
    id: 'startDate',
    label: 'Start Date',
    minWidth: 120,
    format: (value: unknown) => new Date(value as string).toLocaleDateString(),
  },
  {
    id: 'endDate',
    label: 'End Date',
    minWidth: 120,
    format: (value: unknown) => value ? new Date(value as string).toLocaleDateString() : 'Ongoing',
  },
  {
    id: 'type',
    label: 'Type',
    minWidth: 100,
    format: (value: unknown) => {
      const type = value as string;
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
    renderCustom: (value: unknown) => {
      const type = value as string;
      return (
        <Chip 
          label={type.charAt(0).toUpperCase() + type.slice(1)} 
          color={type === 'fixed' ? 'primary' : 'secondary'} 
          size="small" 
        />
      );
    },
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value: unknown) => {
      const status = value as string;
      return status.charAt(0).toUpperCase() + status.slice(1);
    },
    renderCustom: (value: unknown) => {
      const status = value as string;
      let color: 'success' | 'error' | 'warning' | 'default' | 'primary' | 'secondary' = 'default';
      
      switch(status) {
        case 'active':
          color = 'success';
          break;
        case 'completed':
          color = 'primary';
          break;
        case 'cancelled':
          color = 'error';
          break;
        case 'on-hold':
          color = 'warning';
          break;
      }
      
      return (
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          color={color} 
          size="small" 
        />
      );
    },
  },
  {
    id: 'team',
    label: 'Team Size',
    minWidth: 100,
    align: 'center',
    format: (value: unknown) => (value as unknown[]).length.toString(),
  },
];

const ProjectsPage = () => {
  const { data: projects, isLoading, isError } = useGetProjects();
  const [filters, setFilters] = useState({
    type: '',
    status: '',
  });

  const handleFilterChange = (event: SelectChangeEvent, filterType: string) => {
    setFilters({
      ...filters,
      [filterType]: event.target.value,
    });
  };

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!projects) return { types: [] as string[], statuses: [] as string[] };
    
    const types = [...new Set((projects as Project[]).map(project => project.type))];
    const statuses = [...new Set((projects as Project[]).map(project => project.status))];
    
    return {
      types,
      statuses,
    };
  }, [projects]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!projects) return [];
    
    return (projects as Project[]).filter((project) => {
      // Apply type filter
      if (filters.type && project.type !== filters.type) {
        return false;
      }
      
      // Apply status filter
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      
      return true;
    });
  }, [projects, filters]);

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
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="type-filter-label">Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={filters.type}
            label="Type"
            onChange={(e) => handleFilterChange(e, 'type')}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.types.map((type) => (
              <MenuItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 150 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={filters.status}
            label="Status"
            onChange={(e) => handleFilterChange(e, 'status')}
          >
            <MenuItem value="">All</MenuItem>
            {filterOptions.statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
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
            Error loading project data. Please try again later.
          </Typography>
        ) : (
          <DataTable columns={columns} rows={filteredData || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default ProjectsPage;
