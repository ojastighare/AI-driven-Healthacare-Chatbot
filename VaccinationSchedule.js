import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Vaccines as VaccineIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
  Warning as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Child as ChildIcon,
  Elderly as ElderlyIcon
} from '@mui/icons-material';

const VaccinationSchedule = ({ userId, userProfile, currentLanguage }) => {
  const [vaccineData, setVaccineData] = useState({});
  const [userVaccinations, setUserVaccinations] = useState({});
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ageGroup, setAgeGroup] = useState('all');
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  // Sample vaccination data (in real app, this would come from API)
  const vaccines = {
    "bcg": {
      "name": "BCG (Bacillus Calmette-Guérin)",
      "purpose": "Protection against tuberculosis",
      "age_range": "At birth",
      "doses": 1,
      "schedule": "Single dose at birth",
      "side_effects": ["Small scar at injection site", "Mild fever"],
      "importance": "Essential for TB prevention in high-risk areas",
      "category": "infant"
    },
    "hepatitis_b": {
      "name": "Hepatitis B Vaccine",
      "purpose": "Protection against Hepatitis B virus",
      "age_range": "Birth, 1-2 months, 6-18 months",
      "doses": 3,
      "schedule": "Birth, 1-2 months, 6-18 months",
      "side_effects": ["Pain at injection site", "Low-grade fever"],
      "importance": "Prevents liver infection and liver cancer",
      "category": "infant"
    },
    "dpt": {
      "name": "DPT (Diphtheria, Pertussis, Tetanus)",
      "purpose": "Protection against diphtheria, whooping cough, and tetanus",
      "age_range": "2, 4, 6, 15-18 months, 4-6 years",
      "doses": 5,
      "schedule": "2, 4, 6, 15-18 months, 4-6 years",
      "side_effects": ["Fever", "Fussiness", "Pain at injection site"],
      "importance": "Prevents serious bacterial infections",
      "category": "child"
    },
    "polio": {
      "name": "Polio Vaccine (IPV/OPV)",
      "purpose": "Protection against poliomyelitis",
      "age_range": "2, 4, 6-18 months, 4-6 years",
      "doses": 4,
      "schedule": "2, 4, 6-18 months, 4-6 years",
      "side_effects": ["Mild fever", "Soreness at injection site"],
      "importance": "Prevents paralytic poliomyelitis",
      "category": "child"
    },
    "measles": {
      "name": "Measles Vaccine (MMR)",
      "purpose": "Protection against measles, mumps, and rubella",
      "age_range": "12-15 months, 4-6 years",
      "doses": 2,
      "schedule": "12-15 months, 4-6 years",
      "side_effects": ["Fever", "Mild rash", "Swelling"],
      "importance": "Prevents serious viral infections",
      "category": "child"
    },
    "covid_19": {
      "name": "COVID-19 Vaccine",
      "purpose": "Protection against SARS-CoV-2 virus",
      "age_range": "12 years and above",
      "doses": "2-3 doses plus boosters",
      "schedule": "As per national guidelines",
      "side_effects": ["Pain at injection site", "Fever", "Fatigue"],
      "importance": "Prevents COVID-19 infection and severe disease",
      "category": "adult"
    },
    "influenza": {
      "name": "Seasonal Flu Vaccine",
      "purpose": "Protection against seasonal influenza",
      "age_range": "6 months and above",
      "doses": 1,
      "schedule": "Annual vaccination",
      "side_effects": ["Mild fever", "Muscle aches", "Soreness"],
      "importance": "Prevents seasonal flu complications",
      "category": "all"
    },
    "hpv": {
      "name": "HPV Vaccine",
      "purpose": "Protection against Human Papillomavirus",
      "age_range": "9-26 years (ideally 11-12 years)",
      "doses": "2-3 doses",
      "schedule": "0, 1-2, 6 months",
      "side_effects": ["Pain at injection site", "Fever", "Dizziness"],
      "importance": "Prevents cervical and other cancers",
      "category": "adolescent"
    }
  };

  useEffect(() => {
    setVaccineData(vaccines);
    // Load user vaccination records
    const savedVaccinations = localStorage.getItem(`vaccinations_${userId}`);
    if (savedVaccinations) {
      setUserVaccinations(JSON.parse(savedVaccinations));
    }
  }, [userId]);

  const getVaccinesByAge = () => {
    if (ageGroup === 'all') return Object.entries(vaccines);
    return Object.entries(vaccines).filter(([key, vaccine]) => 
      vaccine.category === ageGroup || vaccine.category === 'all'
    );
  };

  const getVaccinationStatus = (vaccineKey) => {
    return userVaccinations[vaccineKey] || { completed: false, doses_taken: 0 };
  };

  const markVaccineCompleted = (vaccineKey, dosesCompleted) => {
    const updatedVaccinations = {
      ...userVaccinations,
      [vaccineKey]: {
        completed: dosesCompleted >= vaccines[vaccineKey].doses,
        doses_taken: dosesCompleted,
        last_updated: new Date().toISOString()
      }
    };
    setUserVaccinations(updatedVaccinations);
    localStorage.setItem(`vaccinations_${userId}`, JSON.stringify(updatedVaccinations));
  };

  const getCompletionPercentage = () => {
    const totalVaccines = Object.keys(vaccines).length;
    const completedVaccines = Object.values(userVaccinations).filter(v => v.completed).length;
    return Math.round((completedVaccines / totalVaccines) * 100);
  };

  const getAgeGroupIcon = (category) => {
    switch (category) {
      case 'infant': return <ChildIcon />;
      case 'child': return <ChildIcon />;
      case 'adolescent': return <PersonIcon />;
      case 'adult': return <PersonIcon />;
      case 'elderly': return <ElderlyIcon />;
      default: return <VaccineIcon />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'infant': return 'primary';
      case 'child': return 'secondary';
      case 'adolescent': return 'warning';
      case 'adult': return 'info';
      case 'elderly': return 'success';
      default: return 'default';
    }
  };

  const openVaccineDetails = (vaccineKey, vaccine) => {
    setSelectedVaccine({ key: vaccineKey, ...vaccine });
    setDialogOpen(true);
  };

  const ageGroups = [
    { value: 'all', label: 'All Ages' },
    { value: 'infant', label: 'Infants (0-2 years)' },
    { value: 'child', label: 'Children (2-12 years)' },
    { value: 'adolescent', label: 'Adolescents (12-18 years)' },
    { value: 'adult', label: 'Adults (18-60 years)' },
    { value: 'elderly', label: 'Elderly (60+ years)' }
  ];

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h4" color="primary" gutterBottom>
        💉 Vaccination Schedule
      </Typography>

      {/* Vaccination Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Vaccination Progress</Typography>
            <Typography variant="h4" color="primary">
              {getCompletionPercentage()}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getCompletionPercentage()} 
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            {Object.values(userVaccinations).filter(v => v.completed).length} of {Object.keys(vaccines).length} vaccines completed
          </Typography>
        </CardContent>
      </Card>

      {/* Age Group Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            select
            label="Filter by Age Group"
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            fullWidth
            variant="outlined"
          >
            {ageGroups.map((group) => (
              <MenuItem key={group.value} value={group.value}>
                {group.label}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {/* Vaccination Cards */}
      <Grid container spacing={2}>
        {getVaccinesByAge().map(([vaccineKey, vaccine]) => {
          const status = getVaccinationStatus(vaccineKey);
          return (
            <Grid item xs={12} sm={6} key={vaccineKey}>
              <Card 
                elevation={2}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                  border: status.completed ? '2px solid #4caf50' : '1px solid #e0e0e0'
                }}
                onClick={() => openVaccineDetails(vaccineKey, vaccine)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getAgeGroupIcon(vaccine.category)}
                      <Typography variant="h6" component="h3" sx={{ fontSize: '1rem' }}>
                        {vaccine.name}
                      </Typography>
                    </Box>
                    {status.completed ? (
                      <CompletedIcon color="success" />
                    ) : (
                      <PendingIcon color="warning" />
                    )}
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {vaccine.purpose}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={vaccine.category.charAt(0).toUpperCase() + vaccine.category.slice(1)}
                      color={getCategoryColor(vaccine.category)}
                      size="small"
                    />
                    <Chip
                      label={`${vaccine.doses} dose${vaccine.doses > 1 ? 's' : ''}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Schedule:</strong> {vaccine.age_range}
                  </Typography>

                  {status.doses_taken > 0 && (
                    <Typography variant="body2" color="primary">
                      Progress: {status.doses_taken}/{vaccine.doses} doses
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Vaccination Reminders */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            📅 Upcoming Vaccinations
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Set reminders for upcoming vaccinations based on your age and vaccination history.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => setReminderDialogOpen(true)}
            startIcon={<ScheduleIcon />}
          >
            Set Vaccination Reminders
          </Button>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" color="primary">
            ℹ️ Important Vaccination Information
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemIcon>
                <CompletedIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Consult Healthcare Provider"
                secondary="Always consult with a healthcare professional before getting vaccinated"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CompletedIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Keep Records"
                secondary="Maintain a record of all vaccinations with dates and batch numbers"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CompletedIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Follow Schedule"
                secondary="Stick to the recommended vaccination schedule for maximum protection"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CompletedIcon color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Report Side Effects"
                secondary="Report any severe side effects to your healthcare provider immediately"
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Vaccine Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedVaccine && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VaccineIcon color="primary" />
                {selectedVaccine.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Purpose:</strong> {selectedVaccine.purpose}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Schedule:</strong> {selectedVaccine.schedule}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Total Doses:</strong> {selectedVaccine.doses}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Importance:</strong> {selectedVaccine.importance}
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Common Side Effects:
              </Typography>
              <List dense>
                {selectedVaccine.side_effects?.map((effect, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Typography variant="body2">•</Typography>
                    </ListItemIcon>
                    <ListItemText primary={effect} />
                  </ListItem>
                ))}
              </List>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Consult your healthcare provider for personalized vaccination advice.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained"
                onClick={() => {
                  const currentStatus = getVaccinationStatus(selectedVaccine.key);
                  const newDoses = Math.min(currentStatus.doses_taken + 1, selectedVaccine.doses);
                  markVaccineCompleted(selectedVaccine.key, newDoses);
                  setDialogOpen(false);
                }}
              >
                Mark Dose Completed
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reminder Dialog */}
      <Dialog 
        open={reminderDialogOpen} 
        onClose={() => setReminderDialogOpen(false)}
      >
        <DialogTitle>Set Vaccination Reminders</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We'll help you remember when it's time for your next vaccination.
          </Typography>
          <Alert severity="info">
            Reminder functionality would be implemented with push notifications and SMS in the full version.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setReminderDialogOpen(false)}>
            Set Reminders
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VaccinationSchedule; 