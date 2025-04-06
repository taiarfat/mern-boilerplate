import { Grid } from '@mui/material';
import InsightsCard from './InsightsCard';

const InsightsList = () => {
  return (
    <Grid size={{ xs: 12 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 3 }}>
          <InsightsCard
            title="Revenue Growth"
            content="Revenue has increased by 15% compared to the last quarter."
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <InsightsCard
            title="Expense Management"
            content="Expenses are on track, but marketing costs have spiked."
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <InsightsCard
            title="Profit Margins"
            content="Profit margins are improving, indicating better cost management."
          />
        </Grid>
        <Grid size={{ xs: 3 }}>
          <InsightsCard
            title="Customer Satisfaction"
            content="Customer satisfaction ratings have improved by 10%."
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default InsightsList;
