import { Grid, Button, Box } from '@mui/material'
import DataTable, { Column } from '../components/DataTable'
import { useState } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FileUploadModal from '../components/FileUploadModal'

// Sample data for HR page
const columns: readonly Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'code', label: 'Employee ID', minWidth: 100 },
  {
    id: 'department',
    label: 'Department',
    minWidth: 170,
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

interface HRData {
  name: string;
  code: string;
  department: string;
  position: string;
  salary: number;
  [key: string]: unknown;
}

// Sample HR data
const hrData: HRData[] = [
  { name: 'John Doe', code: 'EMP001', department: 'Engineering', position: 'Senior Developer', salary: 110000 },
  { name: 'Jane Smith', code: 'EMP002', department: 'HR', position: 'HR Manager', salary: 95000 },
  { name: 'Mike Johnson', code: 'EMP003', department: 'Marketing', position: 'Marketing Specialist', salary: 85000 },
  { name: 'Sarah Williams', code: 'EMP004', department: 'Sales', position: 'Sales Executive', salary: 92000 },
  { name: 'David Brown', code: 'EMP005', department: 'Engineering', position: 'Developer', salary: 90000 },
  { name: 'Emily Davis', code: 'EMP006', department: 'Finance', position: 'Financial Analyst', salary: 88000 },
  { name: 'Robert Wilson', code: 'EMP007', department: 'Engineering', position: 'QA Engineer', salary: 87000 },
  { name: 'Jessica Miller', code: 'EMP008', department: 'HR', position: 'Recruiter', salary: 78000 },
  { name: 'Thomas Moore', code: 'EMP009', department: 'Operations', position: 'Operations Manager', salary: 98000 },
  { name: 'Lisa Taylor', code: 'EMP010', department: 'Marketing', position: 'Content Writer', salary: 75000 },
  { name: 'Kevin Anderson', code: 'EMP011', department: 'Sales', position: 'Sales Associate', salary: 82000 },
  { name: 'Michelle Jackson', code: 'EMP012', department: 'Finance', position: 'Accountant', salary: 79000 },
];

const HRPage = () => {
  const [open, setOpen] = useState(false)
  const [tableData, setTableData] = useState<HRData[]>(hrData)

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
        
        // Example of updating data (with the same data for demo purposes)
        // In a real implementation, this would be the parsed CSV data
        setTableData([...hrData]);
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
        <DataTable columns={columns} rows={tableData} />
        
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