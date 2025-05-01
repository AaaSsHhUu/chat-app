from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
from sockets import register_socketio_events
from extensions import socketio, db


# from app.routes import auth_bp, chat_bp, user_bp, member_bp
from app.routes.member_routes import member_bp
from app.routes.auth_routes import auth_bp
from app.routes.chat_routes import chat_bp
from app.routes.user_routes import user_bp

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
CORS(app, resources={r"/*": {"origins": os.environ.get('FRONTEND_URL', 'http://localhost:3000')}})
db.init_app(app)
socketio.init_app(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(chat_bp, url_prefix="/api/chats")
app.register_blueprint(user_bp, url_prefix="/api/users")
app.register_blueprint(member_bp, url_prefix="/api/members")

# Create tables
with app.app_context():
    db.create_all()

register_socketio_events(socketio, app)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
