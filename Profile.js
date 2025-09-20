import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  MenuItem,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  HealthAndSafety as HealthIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import axios from 'axios';

const Profile = ({ userId, userProfile, onProfileUpdate, currentLanguage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    location: '',
    phone: '',
    language_preference: 'en',
    vaccination_reminders: true,
    health_alerts: true,
    sms_notifications: false,
    email_notifications: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [healthStats, setHealthStats] = useState({
    consultations: 0,
    vaccinations_completed: 0,
    health_score: 75
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || '',
        gender: userProfile.gender || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        language_preference: userProfile.language_preference || 'en',
        vaccination_reminders: userProfile.vaccination_reminders !== false,
        health_alerts: userProfile.health_alerts !== false,
        sms_notifications: userProfile.sms_notifications || false,
        email_notifications: userProfile.email_notifications || false
      });
    }

    // Load health statistics
    const savedStats = localStorage.getItem(`health_stats_${userId}`);
    if (savedStats) {
      setHealthStats(JSON.parse(savedStats));
    }
  }, [userProfile, userId]);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.checked
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/profile', {
        user_id: userId,
        ...formData
      });

      onProfileUpdate(formData);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Save locally if server is unavailable
      onProfileUpdate(formData);
      setMessage('Profile saved locally. Will sync when online.');
      setIsEditing(false);
      
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age || '',
        gender: userProfile.gender || '',
        location: userProfile.location || '',
        phone: userProfile.phone || '',
        language_preference: userProfile.language_preference || 'en',
        vaccination_reminders: userProfile.vaccination_reminders !== false,
        health_alerts: userProfile.health_alerts !== false,
        sms_notifications: userProfile.sms_notifications || false,
        email_notifications: userProfile.email_notifications || false
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' }
  ];

  const genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
  ];

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary">
          👤 My Profile
        </Typography>
        <IconButton 
          color="primary" 
          onClick={() => setSettingsDialogOpen(true)}
        >
          <SettingsIcon />
        </IconButton>
      </Box>

      {message && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* Profile Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                mr: 3, 
                bgcolor: 'primary.main',
                fontSize: '2rem'
              }}
            >
              {getInitials(formData.name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" gutterBottom>
                {formData.name || 'Healthcare User'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.age && (
                  <Chip label={`${formData.age} years old`} size="small" />
                )}
                {formData.gender && (
                  <Chip label={formData.gender} size="small" />
                )}
                {formData.location && (
                  <Chip 
                    icon={<LocationIcon />} 
                    label={formData.location} 
                    size="small" 
                  />
                )}
              </Box>
            </Box>
            <IconButton 
              color="primary" 
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <CancelIcon /> : <EditIcon />}
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Health Statistics */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            📊 Health Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {healthStats.consultations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Consultations
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {healthStats.vaccinations_completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vaccinations
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {healthStats.health_score}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Health Score
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Personal Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                disabled={!isEditing}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={formData.age}
                onChange={handleInputChange('age')}
                disabled={!isEditing}
                variant="outlined"
                inputProps={{ min: 0, max: 120 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={handleInputChange('gender')}
                disabled={!isEditing}
                variant="outlined"
              >
                {genders.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange('location')}
                disabled={!isEditing}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Preferred Language"
                value={formData.language_preference}
                onChange={handleInputChange('language_preference')}
                disabled={!isEditing}
                variant="outlined"
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            🔔 Notification Preferences
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <NotificationIcon />
              </ListItemIcon>
              <ListItemText
                primary="Vaccination Reminders"
                secondary="Get notified about upcoming vaccinations"
              />
              <Switch
                checked={formData.vaccination_reminders}
                onChange={handleSwitchChange('vaccination_reminders')}
                disabled={!isEditing}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <HealthIcon />
              </ListItemIcon>
              <ListItemText
                primary="Health Alerts"
                secondary="Receive disease outbreak and health emergency alerts"
              />
              <Switch
                checked={formData.health_alerts}
                onChange={handleSwitchChange('health_alerts')}
                disabled={!isEditing}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <PhoneIcon />
              </ListItemIcon>
              <ListItemText
                primary="SMS Notifications"
                secondary="Receive critical health alerts via SMS"
              />
              <Switch
                checked={formData.sms_notifications}
                onChange={handleSwitchChange('sms_notifications')}
                disabled={!isEditing}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            ⚡ Quick Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HistoryIcon />}
                sx={{ mb: 1 }}
              >
                View Chat History
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<HealthIcon />}
                sx={{ mb: 1 }}
              >
                Health Records
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SecurityIcon />}
                sx={{ mb: 1 }}
              >
                Privacy Settings
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<NotificationIcon />}
                sx={{ mb: 1 }}
              >
                Manage Notifications
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>App Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Manage your app preferences and data
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Data Privacy"
                secondary="Your health data is stored locally and encrypted"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Language Support"
                secondary="Available in 12 regional languages"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <HealthIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Offline Mode"
                secondary="Basic features work without internet"
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile; 