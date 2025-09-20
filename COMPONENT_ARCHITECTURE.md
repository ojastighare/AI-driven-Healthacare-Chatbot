# Healthcare Chatbot - Component Architecture

## 🎯 **Component Hierarchy & Relationships**

```
App.js (Root Component)
├── ThemeProvider (Material-UI)
├── CssBaseline (Global styles)
├── Router (React Router)
│
├── Header Section
│   ├── Logo & Title
│   ├── VoiceControls
│   ├── LanguageSelector
│   └── OfflineIndicator
│
├── Main Content (Routes)
│   ├── ChatInterface (/) - Primary route
│   │   ├── QuickActions
│   │   ├── MessagesContainer
│   │   │   ├── MessageBubble (User)
│   │   │   ├── MessageBubble (Bot)
│   │   │   └── LoadingIndicator
│   │   ├── InputArea
│   │   │   ├── TextField
│   │   │   ├── VoiceButton
│   │   │   └── SendButton
│   │   └── EmergencyButton
│   │
│   ├── Alerts (/alerts)
│   │   ├── AlertsHeader
│   │   ├── AlertsList
│   │   │   └── AlertCard[]
│   │   ├── EmergencyContacts
│   │   └── PreventiveMeasures
│   │
│   ├── VaccinationSchedule (/vaccination)
│   │   ├── ProgressCard
│   │   ├── AgeGroupFilter
│   │   ├── VaccineGrid
│   │   │   └── VaccineCard[]
│   │   ├── VaccineDetailsDialog
│   │   └── ReminderDialog
│   │
│   ├── PreventiveCare (/preventive-care)
│   │   ├── HealthScoreCard
│   │   ├── HealthChecklist
│   │   ├── CategoryGrid
│   │   │   └── CategoryCard[]
│   │   ├── QuickTips
│   │   └── CategoryDetailsDialog
│   │
│   └── Profile (/profile)
│       ├── ProfileHeader
│       ├── HealthStatistics
│       ├── PersonalInfoForm
│       ├── NotificationPreferences
│       ├── QuickActions
│       └── SettingsDialog
│
└── Navigation (Bottom Navigation)
    ├── ChatTab
    ├── AlertsTab
    ├── VaccinesTab
    ├── PreventionTab
    └── ProfileTab
```

## 📦 **Component Details**

### **1. Core Components**

#### **App.js - Root Component**
```javascript
State Management:
- userId: string
- currentLanguage: string
- isOnline: boolean
- userProfile: object

Key Functions:
- handleLanguageChange()
- handleProfileUpdate()
- Online/Offline monitoring
- Theme configuration
```

#### **ChatInterface.js - Main Chat Component**
```javascript
State Management:
- messages: array
- inputMessage: string
- isLoading: boolean
- isListening: boolean
- offlineQueue: array

Key Functions:
- sendMessage()
- sendMessageToServer()
- speakText()
- toggleListening()
- formatMessageContent()
- handleQuickAction()

Features:
- Voice-to-text input
- Text-to-speech output
- Offline message queuing
- Real-time chat interface
- Quick action buttons
- Emergency access
```

### **2. Navigation Components**

#### **Navigation.js - Bottom Navigation**
```javascript
Features:
- 5 main sections (Chat, Alerts, Vaccines, Prevention, Profile)
- Active route highlighting
- Mobile-optimized design
- Material-UI BottomNavigation
```

#### **LanguageSelector.js - Multi-language Support**
```javascript
Supported Languages:
- English (en)
- Hindi (hi)
- Bengali (bn)
- Telugu (te)
- Tamil (ta)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)
- Odia (or)
- Assamese (as)

Features:
- Dropdown menu with flags
- Real-time language switching
- Persistent language preference
```

### **3. Health Feature Components**

#### **Alerts.js - Health Alerts System**
```javascript
State Management:
- alerts: array
- loading: boolean
- error: string
- notificationSettings: object

Key Functions:
- fetchAlerts()
- getSeverityColor()
- getSeverityIcon()
- formatDate()
- requestNotificationPermission()

Features:
- Severity-based color coding
- Location-based filtering
- Emergency contact display
- Notification preferences
- Real-time alert updates
```

#### **VaccinationSchedule.js - Vaccine Tracker**
```javascript
State Management:
- vaccineData: object
- userVaccinations: object
- selectedVaccine: object
- ageGroup: string

Key Functions:
- getVaccinesByAge()
- getVaccinationStatus()
- markVaccineCompleted()
- getCompletionPercentage()
- openVaccineDetails()

Features:
- Age-appropriate filtering
- Progress tracking
- Completion status
- Detailed vaccine information
- Reminder system
```

#### **PreventiveCare.js - Health Tips & Guidance**
```javascript
State Management:
- selectedCategory: object
- healthScore: number
- dialogOpen: boolean

Features:
- Health score calculation
- Daily health checklist
- Categorized tips
- Interactive category cards
- Progress tracking
```

#### **Profile.js - User Management**
```javascript
State Management:
- isEditing: boolean
- formData: object
- healthStats: object
- settingsDialogOpen: boolean

Key Functions:
- handleInputChange()
- handleSwitchChange()
- handleSave()
- handleCancel()

Features:
- Personal information management
- Health statistics display
- Notification preferences
- Quick action buttons
- Settings management
```

### **4. Utility Components**

#### **VoiceControls.js - Accessibility Features**
```javascript
Features:
- Speech-to-text toggle
- Text-to-speech settings
- Auto-speak configuration
- Voice settings persistence
```

#### **OfflineIndicator.js - Connectivity Status**
```javascript
Features:
- Real-time connectivity monitoring
- Visual status indication
- Tooltip information
- Color-coded status
```

## 🔄 **Data Flow Between Components**

### **1. Parent-Child Communication**

```
App.js (State Container)
├── Passes down props:
│   ├── userId → All components
│   ├── currentLanguage → All components
│   ├── userProfile → Profile, Chat, Vaccination
│   ├── isOnline → ChatInterface, Alerts
│   └── onProfileUpdate → Profile
│
└── Receives callbacks:
    ├── onLanguageChange ← LanguageSelector
    └── onProfileUpdate ← Profile
```

### **2. API Communication Flow**

```
Component → API Call → Backend → Database → Response → Component Update

Examples:
ChatInterface → /api/chat → NLP Processing → Response Display
Alerts → /api/alerts → Database Query → Alerts List
Profile → /api/profile → User Data → Profile Update
```

### **3. State Management Pattern**

```javascript
// Local State (Component Level)
const [messages, setMessages] = useState([]);
const [loading, setLoading] = useState(false);

// Shared State (App Level)
const [userProfile, setUserProfile] = useState(null);
const [currentLanguage, setCurrentLanguage] = useState('en');

// Persistent State (localStorage)
localStorage.setItem('healthcare_bot_profile', JSON.stringify(profile));
localStorage.getItem('healthcare_bot_language');
```

## 🎨 **UI/UX Component Design**

### **1. Design System**

#### **Color Palette**
```javascript
Primary Colors:
- Primary Blue: #2196f3 (Trust, reliability)
- Secondary Green: #4caf50 (Health, growth)
- Error Red: #f44336 (Alerts, warnings)
- Warning Orange: #ff9800 (Cautions)

Background Colors:
- Default: #f5f5f5 (Light gray)
- Paper: #ffffff (White)
- Chat Background: #fafafa (Very light gray)
```

#### **Typography**
```javascript
Font Family: 'Roboto', 'Helvetica', 'Arial', sans-serif
Font Weights:
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

Responsive Typography:
- H1: 2.5rem → 1.8rem (mobile)
- H4: 2.125rem → 1.2rem (mobile)
- Body: 1rem (consistent)
```

#### **Spacing System**
```javascript
Spacing Scale (8px base):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px
```

### **2. Component Styling Patterns**

#### **Card Components**
```javascript
Common Card Style:
- Border radius: 16px
- Box shadow: 0 4px 12px rgba(0,0,0,0.1)
- Padding: 16-24px
- Hover effects: translateY(-2px)
```

#### **Button Components**
```javascript
Button Styles:
- Border radius: 20px
- Padding: 10px 20px
- No text transform
- Smooth transitions: 0.3s ease
```

#### **Input Components**
```javascript
Input Styles:
- Border radius: 25px (chat input)
- Border: 2px solid #e0e0e0
- Focus: Border color #2196f3
- Padding: 12px 16px
```

## 📱 **Responsive Design Architecture**

### **1. Breakpoint System**

```javascript
Breakpoints:
- xs: 0px (mobile)
- sm: 600px (tablet)
- md: 960px (desktop)
- lg: 1280px (large desktop)
- xl: 1920px (extra large)
```

### **2. Mobile-First Approach**

```javascript
Grid System:
- Mobile: 12 columns, full width
- Tablet: 6-8 columns, side margins
- Desktop: 4-6 columns, centered layout

Component Adaptations:
- Navigation: Bottom nav (mobile) → Side nav (desktop)
- Cards: Single column (mobile) → Grid (desktop)
- Dialogs: Full screen (mobile) → Modal (desktop)
```

### **3. Touch-Friendly Design**

```javascript
Touch Targets:
- Minimum size: 44px × 44px
- Spacing: 8px minimum between targets
- Gestures: Swipe, tap, long press support
```

## 🔧 **Performance Optimization**

### **1. Component Optimization**

```javascript
React Optimizations:
- React.memo() for pure components
- useMemo() for expensive calculations
- useCallback() for event handlers
- Lazy loading for route components

Example:
const ChatInterface = React.memo(({ userId, currentLanguage }) => {
  const memoizedMessages = useMemo(() => 
    formatMessages(messages), [messages]
  );
  
  const handleSend = useCallback((message) => {
    // Handle send logic
  }, [userId]);
});
```

### **2. Bundle Optimization**

```javascript
Code Splitting:
- Route-based splitting
- Component lazy loading
- Dynamic imports for heavy components

Bundle Analysis:
- webpack-bundle-analyzer
- Tree shaking for unused code
- Compression and minification
```

### **3. Caching Strategy**

```javascript
Frontend Caching:
- Service Worker caching
- localStorage for user data
- IndexedDB for offline messages
- Browser cache for static assets

API Caching:
- Response caching for static data
- ETags for conditional requests
- Cache-Control headers
```

## 🧪 **Testing Architecture**

### **1. Component Testing**

```javascript
Testing Stack:
- Jest: Test runner
- React Testing Library: Component testing
- MSW: API mocking
- Cypress: E2E testing

Test Structure:
components/
├── __tests__/
│   ├── ChatInterface.test.js
│   ├── Profile.test.js
│   └── Alerts.test.js
└── __mocks__/
    └── api.js
```

### **2. Test Categories**

```javascript
Unit Tests:
- Component rendering
- User interactions
- State management
- Utility functions

Integration Tests:
- API communication
- Component interactions
- Route navigation
- Form submissions

E2E Tests:
- User workflows
- Cross-browser compatibility
- Mobile responsiveness
- Accessibility compliance
```

## 🚀 **Deployment Component Architecture**

### **1. Build Process**

```javascript
Build Steps:
1. npm run build
2. Static file generation
3. Service worker generation
4. Asset optimization
5. Bundle analysis

Output Structure:
build/
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── index.html
├── manifest.json
└── service-worker.js
```

### **2. Environment Configuration**

```javascript
Environment Variables:
- REACT_APP_API_URL: Backend API URL
- REACT_APP_VERSION: App version
- REACT_APP_ENVIRONMENT: dev/staging/prod

Configuration Files:
- .env.development
- .env.production
- .env.local
```

This component architecture provides a comprehensive overview of how the healthcare chatbot frontend is structured, ensuring maintainability, scalability, and optimal user experience across different devices and network conditions. 