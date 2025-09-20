import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HealthAndSafety as HealthIcon,
  Restaurant as NutritionIcon,
  CleanHands as HygieneIcon,
  FitnessCenter as ExerciseIcon,
  Psychology as MentalHealthIcon,
  Water as WaterIcon,
  PregnantWoman as MaternalIcon,
  Shield as PreventionIcon,
  WbSunny as SeasonalIcon,
  Elderly as ElderlyIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const PreventiveCare = ({ currentLanguage }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [healthScore, setHealthScore] = useState(75); // Sample score

  const preventiveCareData = {
    nutrition: {
      category: "Nutrition and Diet",
      icon: <NutritionIcon />,
      color: "primary",
      tips: [
        "Eat a balanced diet with fruits, vegetables, whole grains, and lean proteins",
        "Drink at least 8-10 glasses of clean water daily",
        "Limit processed foods, sugar, and excessive salt intake",
        "Include locally available seasonal fruits and vegetables",
        "Consume iron-rich foods like green leafy vegetables and legumes",
        "Ensure adequate protein intake from dal, eggs, fish, or meat",
        "Avoid eating stale or contaminated food",
        "Practice portion control to maintain healthy weight"
      ],
      importance: "Good nutrition strengthens immunity and prevents malnutrition-related diseases",
      keyPoints: [
        "Include all food groups in daily meals",
        "Focus on local, seasonal produce",
        "Maintain proper meal timing",
        "Stay adequately hydrated"
      ]
    },
    hygiene: {
      category: "Personal Hygiene",
      icon: <HygieneIcon />,
      color: "secondary",
      tips: [
        "Wash hands with soap and water for at least 20 seconds frequently",
        "Brush teeth twice daily and maintain oral hygiene",
        "Take regular baths and keep body clean",
        "Keep nails short and clean",
        "Wash hands before eating and after using toilet",
        "Use clean clothes and change them regularly",
        "Keep living spaces clean and well-ventilated",
        "Properly dispose of waste and garbage"
      ],
      importance: "Good hygiene prevents infectious diseases and promotes overall health",
      keyPoints: [
        "Hand hygiene is the most important preventive measure",
        "Regular bathing prevents skin infections",
        "Clean environment reduces disease transmission",
        "Proper waste disposal prevents vector breeding"
      ]
    },
    exercise: {
      category: "Physical Activity",
      icon: <ExerciseIcon />,
      color: "success",
      tips: [
        "Engage in at least 30 minutes of physical activity daily",
        "Include walking, running, cycling, or swimming in routine",
        "Practice yoga or stretching exercises for flexibility",
        "Do household chores and farming activities as exercise",
        "Avoid prolonged sitting and take regular breaks",
        "Encourage children to play outdoor games",
        "Start slowly and gradually increase activity level",
        "Choose activities you enjoy to maintain consistency"
      ],
      importance: "Regular exercise prevents chronic diseases and improves mental health",
      keyPoints: [
        "Any movement is better than no movement",
        "Consistency is more important than intensity",
        "Include both aerobic and strength activities",
        "Exercise should be enjoyable, not punishment"
      ]
    },
    mental_health: {
      category: "Mental Health and Well-being",
      icon: <MentalHealthIcon />,
      color: "info",
      tips: [
        "Practice stress management techniques like deep breathing",
        "Maintain social connections with family and friends",
        "Get adequate sleep (7-8 hours for adults)",
        "Practice meditation or mindfulness",
        "Engage in hobbies and recreational activities",
        "Seek help when feeling overwhelmed or depressed",
        "Limit alcohol consumption and avoid tobacco",
        "Practice gratitude and positive thinking"
      ],
      importance: "Mental health is as important as physical health for overall well-being",
      keyPoints: [
        "Mental health affects physical health",
        "Social support is crucial for mental wellness",
        "Regular sleep schedule improves mood",
        "Professional help is available when needed"
      ]
    },
    water_sanitation: {
      category: "Water and Sanitation",
      icon: <WaterIcon />,
      color: "primary",
      tips: [
        "Drink only boiled, filtered, or treated water",
        "Store water in clean, covered containers",
        "Use separate utensils for drinking water",
        "Ensure proper sewage disposal and drainage",
        "Keep water sources clean and protected",
        "Use soap and clean water for washing",
        "Practice safe food handling and storage",
        "Maintain clean toilets and washing facilities"
      ],
      importance: "Clean water and sanitation prevent waterborne diseases and infections",
      keyPoints: [
        "Water quality is critical for health",
        "Proper sanitation prevents disease outbreaks",
        "Safe food handling prevents foodborne illness",
        "Community hygiene benefits everyone"
      ]
    },
    maternal_health: {
      category: "Maternal and Child Health",
      icon: <MaternalIcon />,
      color: "secondary",
      tips: [
        "Attend regular antenatal checkups during pregnancy",
        "Take iron and folic acid supplements as prescribed",
        "Ensure institutional delivery with skilled birth attendant",
        "Practice exclusive breastfeeding for first 6 months",
        "Follow immunization schedule for children",
        "Monitor child growth and development regularly",
        "Maintain proper nutrition during pregnancy and breastfeeding",
        "Seek immediate medical care for pregnancy complications"
      ],
      importance: "Proper maternal and child care prevents complications and ensures healthy development",
      keyPoints: [
        "Regular checkups prevent complications",
        "Nutrition is crucial during pregnancy",
        "Breastfeeding provides best nutrition for infants",
        "Timely vaccinations protect children"
      ]
    }
  };

  const healthChecklist = [
    { item: "Daily physical activity", completed: true },
    { item: "Balanced nutrition", completed: true },
    { item: "Adequate sleep", completed: false },
    { item: "Regular health checkups", completed: true },
    { item: "Stress management", completed: false },
    { item: "Social connections", completed: true },
    { item: "Avoiding harmful substances", completed: true },
    { item: "Mental health care", completed: false }
  ];

  const openCategoryDetails = (categoryKey, categoryData) => {
    setSelectedCategory({ key: categoryKey, ...categoryData });
    setDialogOpen(true);
  };

  const getCompletedItemsCount = () => {
    return healthChecklist.filter(item => item.completed).length;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ p: 2, pb: 10, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Typography variant="h4" color="primary" gutterBottom>
        🛡️ Preventive Healthcare
      </Typography>

      {/* Health Score Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Your Health Score</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {healthScore}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={healthScore} 
            sx={{ 
              height: 8, 
              borderRadius: 4, 
              mb: 1,
              backgroundColor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white'
              }
            }}
          />
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Based on your health habits and preventive care practices
          </Typography>
        </CardContent>
      </Card>

      {/* Health Checklist */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            📋 Daily Health Checklist
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {getCompletedItemsCount()}/{healthChecklist.length} completed today
          </Typography>
          <List dense>
            {healthChecklist.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  <CheckIcon color={item.completed ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText 
                  primary={item.item}
                  sx={{ 
                    textDecoration: item.completed ? 'line-through' : 'none',
                    opacity: item.completed ? 0.7 : 1
                  }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Preventive Care Categories */}
      <Typography variant="h5" color="primary" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Preventive Care Categories
      </Typography>
      
      <Grid container spacing={2}>
        {Object.entries(preventiveCareData).map(([categoryKey, categoryData]) => (
          <Grid item xs={12} sm={6} md={4} key={categoryKey}>
            <Card 
              elevation={2}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                },
                height: '100%'
              }}
              onClick={() => openCategoryDetails(categoryKey, categoryData)}
            >
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ color: `${categoryData.color}.main`, mb: 2 }}>
                  {React.cloneElement(categoryData.icon, { sx: { fontSize: 48 } })}
                </Box>
                <Typography variant="h6" component="h3" sx={{ mb: 2, flex: 1 }}>
                  {categoryData.category}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {categoryData.tips.length} health tips
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  color={categoryData.color}
                  fullWidth
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Tips */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            💡 Quick Health Tips
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Alert severity="success" sx={{ mb: 1 }}>
                <strong>Morning:</strong> Start your day with water and light exercise
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="info" sx={{ mb: 1 }}>
                <strong>Afternoon:</strong> Take breaks from work and stay hydrated
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="warning" sx={{ mb: 1 }}>
                <strong>Evening:</strong> Practice relaxation and prepare for sleep
              </Alert>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Alert severity="error" sx={{ mb: 1 }}>
                <strong>Always:</strong> Seek medical help for persistent symptoms
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Category Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCategory && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedCategory.icon}
                {selectedCategory.category}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                {selectedCategory.importance}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Key Points:
              </Typography>
              <List dense sx={{ mb: 3 }}>
                {selectedCategory.keyPoints?.map((point, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={point} />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom>
                Detailed Tips:
              </Typography>
              <List dense>
                {selectedCategory.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Typography variant="body2" color="primary">
                        {index + 1}.
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<ScheduleIcon />}>
                Set Reminders
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PreventiveCare; 