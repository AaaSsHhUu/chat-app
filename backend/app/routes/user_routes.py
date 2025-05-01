from flask import Blueprint, request, jsonify
from ..models.models import User, db

user_bp = Blueprint("users", __name__)


@user_bp.route('/search', methods=['GET'])
def search_users():
    query = request.args.get('q', '')
    current_user_id = request.args.get('user_id')
    
    if not current_user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Search for users by username or email
    users = User.query.filter(
        (User.username.ilike(f'%{query}%') | User.email.ilike(f'%{query}%')) &
        (User.id != int(current_user_id))
    ).limit(10).all()
    
    # Get blocked users
    current_user = User.query.get(current_user_id)
    blocked_ids = [block.blocked_id for block in current_user.blocked_users.all()]
    blocked_by_ids = [block.user_id for block in current_user.blocked_by.all()]
    
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_blocked': user.id in blocked_ids,
            'is_blocking_you': user.id in blocked_by_ids
        })
    
    return jsonify(result), 200

@user_bp.route('/<int:user_id>/block', methods=['POST'])
def block_user(user_id):
    data = request.json
    blocker_id = data.get('blocker_id')
    
    if not blocker_id:
        return jsonify({'error': 'Blocker ID is required'}), 400
    
    # Check if users exist
    blocker = User.query.get_or_404(blocker_id)
    blocked = User.query.get_or_404(user_id)
    
    # Check if already blocked
    if blocker.is_blocking(blocked):
        return jsonify({'message': 'User already blocked'}), 200
    
    # Block the user
    blocker.block_user(blocked)
    db.session.commit()
    
    return jsonify({'success': True}), 200

@user_bp.route('/<int:user_id>/unblock', methods=['POST'])
def unblock_user(user_id):
    data = request.json
    blocker_id = data.get('blocker_id')
    
    if not blocker_id:
        return jsonify({'error': 'Blocker ID is required'}), 400
    
    # Check if users exist
    blocker = User.query.get_or_404(blocker_id)
    blocked = User.query.get_or_404(user_id)
    
    # Check if blocked
    if not blocker.is_blocking(blocked):
        return jsonify({'message': 'User is not blocked'}), 200
    
    # Unblock the user
    blocker.unblock_user(blocked)
    db.session.commit()
    
    return jsonify({'success': True}), 200
