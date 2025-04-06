import { Grid, Button, Box, CircularProgress, Typography, Chip, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material'
import DataTable, { Column } from '../components/DataTable'
import { useState, useMemo } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FileUploadModal from '../components/FileUploadModal'
import { useGetEmployees } from '../hooks'

// Define columns for HR page
const columns: readonly Column[] = [
  { id: 'employeeName', label: 'Name', minWidth: 170 },
  { id: 'employeeEmail', label: 'Email', minWidth: 170 },
  {
    id: 'department',
    label: 'Department',
    minWidth: 170,
    format: (value: unknown) => (value as { name: string })?.name?.charAt(0).toUpperCase() + (value as { name: string })?.name?.slice(1) || '',
  },
  {
    id: 'position',
    label: 'Position',
    minWidth: 170,
    format: (value: unknown) => (value as string)?.charAt(0).toUpperCase() + (value as string)?.slice(1) || '',
  },
  {
    id: 'projectType',
    label: 'Project Type',
    minWidth: 170,
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
    id: 'salary',
    label: 'Salary',
    minWidth: 120,
    align: 'right',
    format: (value: unknown) => {
      return (value as number).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    },
  },
];

// Interface for employee data
interface Employee {
  employeeName: string;
  employeeEmail: string;
  position: string;
  projectType: string;
  department: {
    name: string;
    _id: string;
  };
  salary: number;
  [key: string]: any;
}

const HRPage = () => {
  const [open, setOpen] = useState(false)
  const { data: employees, isLoading, isError } = useGetEmployees()
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    projectType: '',
  })

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleFilterChange = (event: SelectChangeEvent, filterType: string) => {
    setFilters({
      ...filters,
      [filterType]: event.target.value,
    })
  }

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!employees) return { departments: [] as string[], positions: [] as string[], projectTypes: [] as string[] }
    
    const departments = [...new Set((employees as Employee[]).map(emp => emp.department?.name || ''))].filter(Boolean)
    const positions = [...new Set((employees as Employee[]).map(emp => emp.position || ''))].filter(Boolean)
    const projectTypes = [...new Set((employees as Employee[]).map(emp => emp.projectType || ''))].filter(Boolean)
    
    return {
      departments,
      positions,
      projectTypes,
    }
  }, [employees])

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    if (!employees) return []
    
    return (employees as Employee[]).filter((employee) => {
      // Apply department filter
      if (filters.department && employee.department?.name !== filters.department) {
        return false
      }
      
      // Apply position filter
      if (filters.position && employee.position !== filters.position) {
        return false
      }
      
      // Apply project type filter
      if (filters.projectType && employee.projectType !== filters.projectType) {
        return false
      }
      
      return true
    })
  }, [employees, filters])

  const handleFileUpload = (file: File) => {
    // Process the file (implementation would go here)
    console.log('Uploading file:', file.name)
    
    // Parse CSV and update table data - this would handle the actual CSV parsing
    // This is a placeholder for the real implementation
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Example of CSV parsing (simplified)
        // In a real implementation, you would use a CSV parsing library
        const csvContent = event.target.result as string;
        
        // Mock processing - in real implementation, parse CSV into HRData objects
        console.log('Processing CSV content:', csvContent.substring(0, 100) + '...');
      }
    };
    
    reader.readAsText(file);
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                value={filters.department}
                label="Department"
                onChange={(e) => handleFilterChange(e, 'department')}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel id="position-filter-label">Position</InputLabel>
              <Select
                labelId="position-filter-label"
                value={filters.position}
                label="Position"
                onChange={(e) => handleFilterChange(e, 'position')}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.positions.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel id="project-type-filter-label">Project Type</InputLabel>
              <Select
                labelId="project-type-filter-label"
                value={filters.projectType}
                label="Project Type"
                onChange={(e) => handleFilterChange(e, 'projectType')}
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.projectTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={handleOpen}
            startIcon={<CloudUploadIcon />}
            sx={{
              backgroundColor: '#f58220',
              color: 'white',
            }}
          >
            Upload Data
          </Button>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">
            Error loading employee data. Please try again later.
          </Typography>
        ) : (
          <DataTable columns={columns} rows={filteredData || []} />
        )}
        
        <FileUploadModal 
          open={open}
          onClose={handleClose}
          onUpload={handleFileUpload}
          title="Upload CSV File"
          acceptedFileTypes=".csv"
          dropzoneText="Drag and drop a CSV file here, or click to browse"
          acceptedFileTypesText="Only CSV files are accepted"
        />
      </Grid>
  )
}

export default HRPage