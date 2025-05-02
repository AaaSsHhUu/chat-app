from flask import Blueprint, request, jsonify
from ..models.models import User, db


auth_bp = Blueprint('auth', __name__)

# Signup
@auth_bp.route('/register', methods=['POST'])
def create_user():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')  # In production, hash this password
    
    if not all([username, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409
    
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'id': new_user.id,
        'username': new_user.username,
        'email': new_user.email
    }), 201

# Login
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({'error': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # In a real app, you would generate a JWT token here
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email
    }), 200