import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import { TrendingUp, TrendingDown, BarChart, AccessTime } from '@mui/icons-material';

interface InsightsCardProps {
  title: string;
  content: string;
  impact: string;
  effort: string;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ title, content, impact, effort }) => {
  // Impact color mapping
  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  // Effort color mapping
  const getEffortColor = (effort: string) => {
    switch (effort.toLowerCase()) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  // Icon for the insight
  const getInsightIcon = () => {
    if (title.toLowerCase().includes('growth') || title.toLowerCase().includes('increase')) {
      return <TrendingUp color="success" />;
    } else if (title.toLowerCase().includes('decrease') || title.toLowerCase().includes('drop')) {
      return <TrendingDown color="error" />;
    } else if (title.toLowerCase().includes('cost') || title.toLowerCase().includes('expense')) {
      return <AccessTime color="warning" />;
    } else {
      return <BarChart color="primary" />;
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1 }}>{getInsightIcon()}</Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, flexGrow: 1 }}
        >
          {content}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Chip 
            label={`Impact: ${impact}`} 
            size="small" 
            color={getImpactColor(impact)} 
            variant="outlined"
          />
          <Chip 
            label={`Effort: ${effort}`} 
            size="small" 
            color={getEffortColor(effort)} 
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
