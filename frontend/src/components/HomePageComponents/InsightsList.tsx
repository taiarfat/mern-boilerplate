import { Box, CircularProgress, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InsightsCard from './InsightsCard';
import { useGetInsights } from '../../hooks';

const InsightsList = () => {
  const { data: insights, isLoading: isInsightsLoading } = useGetInsights();
  const navigate = useNavigate();

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

  // Only display the first two insights
  const displayedInsights = insights?.insights.slice(0, 2) || [];

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Key Business Insights</Typography>
        <Button 
          variant="text" 
          color="primary" 
          onClick={() => navigate('/insights')}
          sx={{ fontWeight: 'bold' }}
        >
          See More
        </Button>
      </Box>
      <Grid container spacing={3}>
        {displayedInsights.map((insight, index) => (
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

export default InsightsList;
