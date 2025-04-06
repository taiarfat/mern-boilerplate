import { Grid, Box, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import DataTable, { Column } from '../components/DataTable';
import { useGetProjects } from '../hooks';

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
          color={type === 'fixed' ? 'info' : 'success'} 
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
            Error loading project data. Please try again later.
          </Typography>
        ) : (
          <DataTable columns={columns} rows={projects || []} />
        )}
      </Paper>
    </Grid>
  );
};

export default ProjectsPage;
