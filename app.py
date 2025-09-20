from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json
import os
import re
from collections import Counter
import requests
import schedule
import time
from apscheduler.schedulers.background import BackgroundScheduler
from langdetect import detect

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'healthcare-bot-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///healthcare_bot.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)

# Initialize scheduler for alerts
scheduler = BackgroundScheduler()
scheduler.start()

# Load healthcare data
def load_healthcare_data():
    """Load healthcare knowledge base"""
    try:
        with open('data/diseases.json', 'r', encoding='utf-8') as f:
            diseases_data = json.load(f)
        with open('data/vaccines.json', 'r', encoding='utf-8') as f:
            vaccines_data = json.load(f)
        with open('data/preventive_care.json', 'r', encoding='utf-8') as f:
            preventive_data = json.load(f)
        return diseases_data, vaccines_data, preventive_data
    except FileNotFoundError:
        return {}, {}, {}

# Database Models
class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    language = db.Column(db.String(10), default='en')

class HealthAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    location = db.Column(db.String(100))
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class UserProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), unique=True, nullable=False)
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    location = db.Column(db.String(100))
    language_preference = db.Column(db.String(10), default='en')
    phone_number = db.Column(db.String(15))
    vaccination_reminders = db.Column(db.Boolean, default=True)

# Healthcare Chatbot Class
class HealthcareChatbot:
    def __init__(self):
        self.diseases_data, self.vaccines_data, self.preventive_data = load_healthcare_data()
        
    def preprocess_text(self, text):
        """Clean and preprocess user input"""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)
        return text
    
    def detect_language(self, text):
        """Detect the language of user input"""
        try:
            return detect(text)
        except:
            return 'en'
    
    def translate_text(self, text, target_lang='en'):
        """Translate text to target language (simplified version)"""
        # For now, return original text since translation service had compatibility issues
        # In production, you would integrate with Google Translate API, Azure Translator, or similar
        # This maintains functionality while avoiding dependency conflicts
        return text
    
    def symptom_analysis(self, symptoms_text):
        """Analyze symptoms and provide recommendations"""
        processed_text = self.preprocess_text(symptoms_text)
        words = processed_text.split()
        
        possible_conditions = []
        symptom_matches = {}
        
        # Check against disease database
        for disease, info in self.diseases_data.items():
            matches = 0
            matched_symptoms = []
            
            for symptom in info.get('symptoms', []):
                if any(word in symptom.lower() for word in words):
                    matches += 1
                    matched_symptoms.append(symptom)
            
            if matches > 0:
                confidence = min((matches / len(info.get('symptoms', [1]))) * 100, 95)
                possible_conditions.append({
                    'condition': disease,
                    'confidence': confidence,
                    'matched_symptoms': matched_symptoms,
                    'description': info.get('description', ''),
                    'recommendations': info.get('recommendations', []),
                    'severity': info.get('severity', 'medium')
                })
        
        # Sort by confidence
        possible_conditions.sort(key=lambda x: x['confidence'], reverse=True)
        
        return possible_conditions[:3]  # Return top 3 matches
    
    def get_vaccination_info(self, age=None, vaccine_name=None):
        """Get vaccination information based on age or vaccine name"""
        if vaccine_name:
            return self.vaccines_data.get(vaccine_name.lower(), {})
        
        if age:
            age_appropriate_vaccines = []
            for vaccine, info in self.vaccines_data.items():
                age_range = info.get('age_range', '')
                if self.is_age_appropriate(age, age_range):
                    age_appropriate_vaccines.append({
                        'vaccine': vaccine,
                        'info': info
                    })
            return age_appropriate_vaccines
        
        return list(self.vaccines_data.keys())
    
    def is_age_appropriate(self, age, age_range):
        """Check if age falls within vaccine age range"""
        try:
            if 'months' in age_range:
                # Handle month ranges
                return True  # Simplified for demo
            elif '-' in age_range:
                min_age, max_age = map(int, age_range.split('-'))
                return min_age <= age <= max_age
            elif 'above' in age_range or '>' in age_range:
                min_age = int(re.findall(r'\d+', age_range)[0])
                return age >= min_age
            return True
        except:
            return True
    
    def get_preventive_care_tips(self, category=None):
        """Get preventive healthcare tips"""
        if category:
            return self.preventive_data.get(category.lower(), {})
        return self.preventive_data
    
    def generate_response(self, user_input, user_profile=None):
        """Generate chatbot response based on user input"""
        processed_input = self.preprocess_text(user_input)
        
        # Detect intent
        if any(word in processed_input for word in ['symptom', 'pain', 'fever', 'cough', 'headache', 'sick', 'hurt']):
            # Symptom analysis
            analysis = self.symptom_analysis(user_input)
            if analysis:
                response = "Based on your symptoms, here are some possible conditions:\n\n"
                for condition in analysis:
                    response += f"• **{condition['condition']}** ({condition['confidence']:.0f}% match)\n"
                    response += f"  {condition['description']}\n"
                    if condition['recommendations']:
                        response += f"  Recommendations: {', '.join(condition['recommendations'])}\n"
                    response += "\n"
                
                response += "⚠️ **Important**: This is for educational purposes only. Please consult a healthcare professional for proper diagnosis and treatment."
                return response
            else:
                return "I couldn't identify specific conditions based on your symptoms. Please provide more details or consult a healthcare professional."
        
        elif any(word in processed_input for word in ['vaccine', 'vaccination', 'immunization']):
            # Vaccination information
            age = None
            if user_profile:
                age = user_profile.age
            
            vaccines = self.get_vaccination_info(age=age)
            if vaccines:
                response = "Here are the recommended vaccinations:\n\n"
                for vaccine in vaccines[:5]:  # Limit to 5
                    info = vaccine['info']
                    response += f"• **{vaccine['vaccine'].title()}**\n"
                    response += f"  Age: {info.get('age_range', 'As recommended')}\n"
                    response += f"  Purpose: {info.get('purpose', 'Disease prevention')}\n\n"
                return response
            else:
                return "I can provide vaccination information. Please specify your age or the vaccine you're interested in."
        
        elif any(word in processed_input for word in ['prevent', 'prevention', 'healthy', 'tips', 'care']):
            # Preventive care tips
            tips = self.get_preventive_care_tips()
            response = "Here are some important preventive healthcare tips:\n\n"
            
            for category, info in list(tips.items())[:3]:  # Limit to 3 categories
                response += f"**{category.title()}:**\n"
                for tip in info.get('tips', [])[:3]:  # Limit to 3 tips per category
                    response += f"• {tip}\n"
                response += "\n"
            
            return response
        
        elif any(word in processed_input for word in ['alert', 'outbreak', 'emergency', 'warning']):
            # Health alerts
            alerts = HealthAlert.query.filter_by(active=True).order_by(HealthAlert.created_at.desc()).limit(3).all()
            if alerts:
                response = "🚨 **Current Health Alerts:**\n\n"
                for alert in alerts:
                    response += f"• **{alert.title}** ({alert.severity.upper()})\n"
                    response += f"  {alert.description}\n"
                    if alert.location:
                        response += f"  Location: {alert.location}\n"
                    response += "\n"
                return response
            else:
                return "No active health alerts in your area. Stay safe and follow preventive measures!"
        
        else:
            # General health information
            return """Hello! I'm your healthcare assistant. I can help you with:

🔍 **Symptom Analysis** - Describe your symptoms for possible conditions
💉 **Vaccination Info** - Get vaccination schedules and information  
🛡️ **Preventive Care** - Learn about staying healthy
🚨 **Health Alerts** - Check for disease outbreaks in your area

What would you like to know about?"""

# Initialize chatbot
chatbot = HealthcareChatbot()

# API Routes
@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    data = request.get_json()
    user_message = data.get('message', '')
    user_id = data.get('user_id', 'anonymous')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Get user profile
    user_profile = UserProfile.query.filter_by(user_id=user_id).first()
    
    # Detect language
    detected_lang = chatbot.detect_language(user_message)
    
    # Generate response
    response = chatbot.generate_response(user_message, user_profile)
    
    # Translate response if needed (currently disabled due to dependency issues)
    # In production, integrate with a proper translation service
    # if user_profile and user_profile.language_preference != 'en':
    #     response = chatbot.translate_text(response, user_profile.language_preference)
    
    # Save chat history
    chat_record = ChatHistory(
        user_id=user_id,
        message=user_message,
        response=response,
        language=detected_lang
    )
    db.session.add(chat_record)
    db.session.commit()
    
    return jsonify({
        'response': response,
        'detected_language': detected_lang,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get active health alerts"""
    location = request.args.get('location')
    
    query = HealthAlert.query.filter_by(active=True)
    if location:
        query = query.filter(HealthAlert.location.ilike(f'%{location}%'))
    
    alerts = query.order_by(HealthAlert.created_at.desc()).all()
    
    return jsonify([{
        'id': alert.id,
        'title': alert.title,
        'description': alert.description,
        'severity': alert.severity,
        'location': alert.location,
        'created_at': alert.created_at.isoformat()
    } for alert in alerts])

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create new health alert (admin only)"""
    data = request.get_json()
    
    alert = HealthAlert(
        title=data['title'],
        description=data['description'],
        severity=data.get('severity', 'medium'),
        location=data.get('location')
    )
    
    db.session.add(alert)
    db.session.commit()
    
    # Send SMS alerts for critical alerts
    if alert.severity == 'critical':
        send_sms_alerts(alert)
    
    return jsonify({'message': 'Alert created successfully', 'id': alert.id})

@app.route('/api/profile', methods=['GET', 'POST'])
def user_profile():
    """Get or update user profile"""
    user_id = request.args.get('user_id') or request.json.get('user_id')
    
    if request.method == 'GET':
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if profile:
            return jsonify({
                'user_id': profile.user_id,
                'age': profile.age,
                'gender': profile.gender,
                'location': profile.location,
                'language_preference': profile.language_preference,
                'vaccination_reminders': profile.vaccination_reminders
            })
        return jsonify({'message': 'Profile not found'}), 404
    
    elif request.method == 'POST':
        data = request.get_json()
        
        profile = UserProfile.query.filter_by(user_id=user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id)
        
        profile.age = data.get('age', profile.age)
        profile.gender = data.get('gender', profile.gender)
        profile.location = data.get('location', profile.location)
        profile.language_preference = data.get('language_preference', profile.language_preference)
        profile.phone_number = data.get('phone_number', profile.phone_number)
        profile.vaccination_reminders = data.get('vaccination_reminders', profile.vaccination_reminders)
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify({'message': 'Profile updated successfully'})

@app.route('/api/translate', methods=['POST'])
def translate_text_api():
    """Translate text to specified language (currently returns original text)"""
    data = request.get_json()
    text = data.get('text', '')
    target_lang = data.get('target_lang', 'en')
    
    # Currently returns original text due to dependency issues
    # In production, integrate with proper translation service
    translated = text
    
    return jsonify({
        'original': text,
        'translated': translated,
        'target_language': target_lang,
        'note': 'Translation service temporarily disabled due to compatibility issues'
    })

def send_sms_alerts(alert):
    """Send SMS alerts for critical health alerts"""
    # This would integrate with Twilio or similar SMS service
    # For demo purposes, we'll just log the alert
    print(f"SMS Alert: {alert.title} - {alert.description}")
    # In production, uncomment and configure Twilio:
    # try:
    #     from twilio.rest import Client
    #     client = Client(account_sid, auth_token)
    #     message = client.messages.create(
    #         body=f"Health Alert: {alert.title} - {alert.description}",
    #         from_='+1234567890',  # Your Twilio number
    #         to='+1234567890'      # Recipient number
    #     )
    # except Exception as e:
    #     print(f"Failed to send SMS: {e}")

# Initialize database
def create_tables():
    with app.app_context():
        db.create_all()
        
        # Create sample data if tables are empty
        if HealthAlert.query.count() == 0:
            sample_alert = HealthAlert(
                title="Seasonal Flu Prevention",
                description="Get vaccinated against seasonal flu. Maintain hygiene and avoid crowded places.",
                severity="medium",
                location="General"
            )
            db.session.add(sample_alert)
            db.session.commit()

if __name__ == '__main__':
    # Initialize database tables
    create_tables()
    app.run(debug=True, host='0.0.0.0', port=8080) 