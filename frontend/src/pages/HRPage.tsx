import { Grid } from '@mui/material'
import DataTable from '../components/DataTable'

const HRPage = () => {
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
        <DataTable />
      </Grid>
  )
}

export default HRPage