import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Anomaly } from '../../types/Anomaly';
import { useGetAnomalies } from '../../hooks';

const RISK_LEVELS = {
  ALL: 'all',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const AnomalyAlertsCardList: React.FC = () => {
  const { data: anomaliesData, isLoading, isError } = useGetAnomalies();
  const [filter, setFilter] = useState<string>(RISK_LEVELS.ALL);
  const [filteredAnomalies, setFilteredAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    if (filter === RISK_LEVELS.ALL) {
      setFilteredAnomalies(anomaliesData?.predictedAnomalies || []);
    } else {
      setFilteredAnomalies(
        anomaliesData?.predictedAnomalies?.filter(anomaly => anomaly.riskLevel === filter) || []
      );
    }
  }, [anomaliesData?.predictedAnomalies, filter]);

  const mapRiskLevelToSeverity = (riskLevel: string) => {
    switch (riskLevel) {
      case RISK_LEVELS.HIGH:
        return 'error';
      case RISK_LEVELS.MEDIUM:
        return 'warning';
      case RISK_LEVELS.LOW:
        return 'info';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CardContent>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CardContent>
          <Typography variant="body1" align="center">
            Error loading anomalies
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Anomaly Alerts</Typography>
          <Tabs
            value={filter}
            onChange={(_, newValue) => setFilter(newValue)}
            aria-label="anomaly filter"
          >
            <Tab label="All" value={RISK_LEVELS.ALL} />
            <Tab label="Low" value={RISK_LEVELS.LOW} />
            <Tab label="Medium" value={RISK_LEVELS.MEDIUM} />
            <Tab label="High" value={RISK_LEVELS.HIGH} />
          </Tabs>
        </Box>
        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {filteredAnomalies.length > 0 ? (
            <Grid container spacing={2}>
              {filteredAnomalies.map((anomaly, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Alert
                    severity={mapRiskLevelToSeverity(anomaly.riskLevel)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      height: '100%',
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {anomaly.description}
                    </Typography>
                    <Typography variant="body2">Period: {anomaly.period}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Early Warning Indicators:
                    </Typography>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      {anomaly.earlyWarningIndicators.map((indicator, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{indicator}</Typography>
                        </li>
                      ))}
                    </ul>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Preventative Measures:
                    </Typography>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                      {anomaly.preventativeMeasures.map((measure, idx) => (
                        <li key={idx}>
                          <Typography variant="body2">{measure}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" align="center">
              No anomalies matching the selected filter
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnomalyAlertsCardList;
