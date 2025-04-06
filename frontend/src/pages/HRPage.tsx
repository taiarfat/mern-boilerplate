import { Grid, Button, Box, CircularProgress, Typography } from '@mui/material'
import DataTable, { Column } from '../components/DataTable'
import { useState } from 'react'
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
    format: (value: unknown) => (value as { name: string })?.name || '',
  },
  {
    id: 'position',
    label: 'Position',
    minWidth: 170,
  },
  {
    id: 'salary',
    label: 'Salary',
    minWidth: 120,
    align: 'right',
    format: (value: unknown) => {
      return (value as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    },
  },
];

const HRPage = () => {
  const [open, setOpen] = useState(false)
  const { data: employees, isLoading, isError } = useGetEmployees()

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
          <DataTable columns={columns} rows={employees || []} />
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