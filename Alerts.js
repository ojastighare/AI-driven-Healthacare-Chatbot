import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  NotificationsActive as NotificationIcon
} from '@mui/icons-material';
import axios from 'axios';

const Alerts = ({ userId, currentLanguage, userProfile }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    sms: false,
    push: true,
    email: false
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Load notification settings
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, [userProfile]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const location = userProfile?.location || '';
      const response = await axios.get(`http://localhost:5000/api/alerts?location=${location}`);
      setAlerts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch health alerts');
      console.error('Error fetching alerts:', err);
      // Load cached alerts from localStorage
      const cachedAlerts = localStorage.getItem('cached_alerts');
      if (cachedAlerts) {
        setAlerts(JSON.parse(cachedAlerts));
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return <ErrorIcon />;
      case 'high': return <WarningIcon />;
      case 'medium': return <InfoIcon />;
      case 'low': return <CheckIcon />;
      default: return <InfoIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleNotificationSettings = () => {
    setSettingsOpen(true);
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
    setSettingsOpen(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationSettings(prev => ({ ...prev, push: true }));
      }
    }
  };

  // Sample emergency contacts and resources
  const emergencyContacts = [
    { name: 'Emergency Services', number: '108', type: 'General Emergency' },
    { name: 'Medical Emergency', number: '102', type: 'Ambulance' },
    { name: 'Poison Control', number: '1066', type: 'Poison Emergency' },
    { name: 'Mental Health Helpline', number: '9152987821', type: 'Mental Health' }
  ];

  const preventiveMeasures = [
    'Wash hands frequently with soap and water',
    'Maintain social distancing when recommended',
    'Wear masks in crowded places',
    'Get vaccinated as per schedule',
    'Stay hydrated and eat nutritious food',
    'Seek medical attention for persistent symptoms'
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          🚨 Health Alerts
        </Typography>
        <Box>
          <Tooltip title="Notification Settings">
            <IconButton onClick={handleNotificationSettings} color="primary">
              <NotificationIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Alerts">
            <IconButton onClick={fetchAlerts} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}. Showing cached alerts if available.
        </Alert>
      )}

      {/* Active Alerts */}
      <Grid container spacing={2}>
        {alerts.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" color="success.main">
                  No Active Health Alerts
                </Typography>
                <Typography color="text.secondary">
                  Your area is currently free of health emergencies
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          alerts.map((alert) => (
            <Grid item xs={12} key={alert.id}>
              <Card 
                elevation={3}
                sx={{ 
                  borderLeft: `4px solid ${
                    alert.severity === 'critical' ? '#f44336' : 
                    alert.severity === 'high' ? '#ff9800' : 
                    alert.severity === 'medium' ? '#ff9800' : '#2196f3'
                  }`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(alert.severity)}
                      <Typography variant="h6" component="h2">
                        {alert.title}
                      </Typography>
                    </Box>
                    <Chip
                      label={alert.severity.toUpperCase()}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {alert.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    {alert.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {alert.location}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(alert.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Emergency Contacts */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            🚑 Emergency Contacts
          </Typography>
          <List dense>
            {emergencyContacts.map((contact, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Typography variant="h6" color="error">
                    📞
                  </Typography>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{contact.name}</Typography>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {contact.number}
                      </Typography>
                    </Box>
                  }
                  secondary={contact.type}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* General Preventive Measures */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            🛡️ General Preventive Measures
          </Typography>
          <List dense>
            {preventiveMeasures.map((measure, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={measure} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Notification Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Notification Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose how you want to receive health alerts
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Push Notifications"
                secondary="Browser notifications for urgent alerts"
              />
              <Button
                variant={notificationSettings.push ? "contained" : "outlined"}
                size="small"
                onClick={requestNotificationPermission}
              >
                {notificationSettings.push ? "Enabled" : "Enable"}
              </Button>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={saveNotificationSettings} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Alerts; 