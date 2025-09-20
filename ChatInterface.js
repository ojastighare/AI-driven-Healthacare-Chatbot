import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Fab,
  Tooltip,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Warning as WarningIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';

const ChatInterface = ({ userId, currentLanguage, userProfile, isOnline }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const [offlineQueue, setOfflineQueue] = useState([]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    // Load chat history from localStorage
    const savedMessages = localStorage.getItem(`chat_history_${userId}`);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hello! I'm your healthcare assistant. I can help you with:

🔍 **Symptom Analysis** - Describe your symptoms for possible conditions
💉 **Vaccination Info** - Get vaccination schedules and information  
🛡️ **Preventive Care** - Learn about staying healthy
🚨 **Health Alerts** - Check for disease outbreaks in your area

What would you like to know about?`,
        timestamp: new Date().toISOString(),
        language: currentLanguage
      };
      setMessages([welcomeMessage]);
    }
  }, [userId, currentLanguage]);

  useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Update input with speech recognition transcript
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    // Process offline queue when coming back online
    if (isOnline && offlineQueue.length > 0) {
      offlineQueue.forEach(message => {
        sendMessageToServer(message.content, message.id);
      });
      setOfflineQueue([]);
    }
  }, [isOnline, offlineQueue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      language: currentLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    resetTranscript();

    if (isOnline) {
      await sendMessageToServer(userMessage.content, userMessage.id);
    } else {
      // Add to offline queue
      setOfflineQueue(prev => [...prev, userMessage]);
      
      // Add offline response
      const offlineResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'I\'m currently offline. Your message will be processed when connection is restored. In the meantime, here are some general health tips: Stay hydrated, maintain good hygiene, and seek immediate medical attention for severe symptoms.',
        timestamp: new Date().toISOString(),
        language: currentLanguage,
        offline: true
      };
      setMessages(prev => [...prev, offlineResponse]);
    }
  };

  const sendMessageToServer = async (message, messageId) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message,
        user_id: userId,
        language: currentLanguage
      });

      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response.data.response,
        timestamp: response.data.timestamp,
        language: response.data.detected_language,
        confidence: response.data.confidence
      };

      setMessages(prev => [...prev, botMessage]);

      // Speak the response if text-to-speech is enabled
      if (userProfile?.textToSpeech && 'speechSynthesis' in window) {
        speakText(response.data.response);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your message. Please try again later or consult a healthcare professional if it\'s urgent.',
        timestamp: new Date().toISOString(),
        language: currentLanguage,
        error: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      SpeechRecognition.startListening({ continuous: true, language: currentLanguage === 'hi' ? 'hi-IN' : 'en-US' });
      setIsListening(true);
    }
  };

  const formatMessageContent = (content) => {
    // Convert markdown-like formatting to JSX
    return content.split('\n').map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <Typography key={index} variant="subtitle2" sx={{ fontWeight: 'bold', mt: 1 }}>
            {line.slice(2, -2)}
          </Typography>
        );
      } else if (line.startsWith('• ')) {
        return (
          <Typography key={index} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
            {line}
          </Typography>
        );
      } else if (line.includes('⚠️') || line.includes('🚨')) {
        return (
          <Alert key={index} severity="warning" sx={{ mt: 1, mb: 1 }}>
            {line.replace(/⚠️|🚨/g, '')}
          </Alert>
        );
      } else if (line.trim()) {
        return (
          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
            {line}
          </Typography>
        );
      }
      return <br key={index} />;
    });
  };

  const quickActions = [
    { label: 'Check Symptoms', icon: '🔍', message: 'I have some symptoms I\'d like to discuss' },
    { label: 'Vaccination Info', icon: '💉', message: 'Tell me about vaccination schedules' },
    { label: 'Preventive Care', icon: '🛡️', message: 'Give me preventive healthcare tips' },
    { label: 'Health Alerts', icon: '🚨', message: 'Are there any health alerts in my area?' }
  ];

  const handleQuickAction = (message) => {
    setInputMessage(message);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      {/* Quick Actions */}
      {messages.length <= 1 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickActions.map((action, index) => (
                <Chip
                  key={index}
                  label={`${action.icon} ${action.label}`}
                  onClick={() => handleQuickAction(action.message)}
                  clickable
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Messages Container */}
      <Paper 
        elevation={3} 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          mb: 2, 
          backgroundColor: '#fafafa',
          borderRadius: 3
        }}
      >
        <List sx={{ p: 2 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                mb: 2,
                px: 0
              }}
            >
              <Avatar
                sx={{
                  bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                  mx: 1,
                  width: 32,
                  height: 32
                }}
              >
                {message.type === 'user' ? <PersonIcon fontSize="small" /> : <BotIcon fontSize="small" />}
              </Avatar>
              
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.type === 'user' ? 'primary.light' : 'white',
                  color: message.type === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                {message.error && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <WarningIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="error">Error</Typography>
                  </Box>
                )}
                
                {message.offline && (
                  <Chip 
                    label="Offline" 
                    size="small" 
                    color="warning" 
                    sx={{ mb: 1 }} 
                  />
                )}

                <Box>
                  {typeof message.content === 'string' ? 
                    formatMessageContent(message.content) : 
                    message.content
                  }
                </Box>

                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block', 
                    mt: 1, 
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>

                {message.type === 'bot' && (
                  <Tooltip title="Listen to response">
                    <IconButton
                      size="small"
                      onClick={() => speakText(message.content)}
                      sx={{ 
                        position: 'absolute', 
                        top: 4, 
                        right: 4,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <VolumeUpIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Paper>
            </ListItem>
          ))}
          
          {isLoading && (
            <ListItem sx={{ justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </ListItem>
          )}
          
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      {/* Input Area */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
        {!isOnline && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You're offline. Messages will be processed when connection is restored.
          </Alert>
        )}
        
        {isListening && (
          <Alert severity="info" sx={{ mb: 2 }}>
            🎤 Listening... Speak now or click the mic to stop.
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Describe your symptoms or ask a health question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3
              }
            }}
          />
          
          {browserSupportsSpeechRecognition && (
            <Tooltip title={listening ? "Stop listening" : "Start voice input"}>
              <IconButton
                color={listening ? "secondary" : "default"}
                onClick={toggleListening}
                sx={{ 
                  bgcolor: listening ? 'secondary.light' : 'grey.100',
                  '&:hover': {
                    bgcolor: listening ? 'secondary.main' : 'grey.200'
                  }
                }}
              >
                {listening ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>
          )}
          
          <Tooltip title="Send message">
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark'
                },
                '&:disabled': {
                  bgcolor: 'grey.300'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
          💡 This is for educational purposes only. Consult healthcare professionals for medical advice.
        </Typography>
      </Paper>

      {/* Emergency Button */}
      <Fab
        color="error"
        size="medium"
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          zIndex: 1000
        }}
        onClick={() => handleQuickAction('This is a medical emergency, what should I do?')}
      >
        <HospitalIcon />
      </Fab>
    </Box>
  );
};

export default ChatInterface; 