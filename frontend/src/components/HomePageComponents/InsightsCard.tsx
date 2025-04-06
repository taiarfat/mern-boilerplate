import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface InsightsCardProps {
  title: string;
  content: string;
}

const InsightsCard: React.FC<InsightsCardProps> = ({ title, content }) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
