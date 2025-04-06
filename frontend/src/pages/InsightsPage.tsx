import { Box, CircularProgress, Grid } from '@mui/material';
import InsightsCard from '../components/HomePageComponents/InsightsCard';
import { useGetInsights } from '../hooks';

const InsightsPage = () => {
  const { data: insights, isLoading: isInsightsLoading } = useGetInsights();

  if (isInsightsLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 8 }}>
      <Grid container spacing={3}>
        {insights?.insights?.map((insight, index) => (
          <Grid size={{ xs: 12, md: 6 }} key={index}>
            <InsightsCard
              title={insight.title}
              content={insight.description}
              effort={insight.effort}
              impact={insight.impact}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InsightsPage;
