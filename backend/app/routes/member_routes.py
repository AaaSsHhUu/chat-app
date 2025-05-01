from flask import Blueprint, request, jsonify
from ..models.models import GroupMember, Chat, User, db
from extensions import socketio

member_bp = Blueprint("members", __name__)

@member_bp.route('/<int:chat_id>/group/members', methods=['GET'])
def get_group_members(chat_id):
    # Check if chat exists and is a group
    chat = Chat.query.get_or_404(chat_id)
    
    if not chat.is_group:
        return jsonify({'error': 'Chat is not a group'}), 400
    
    # Get all members
    members = GroupMember.query.filter_by(chat_id=chat_id).all()
    
    result = []
    for member in members:
        user = User.query.get(member.user_id)
        result.append({
            'id': user.id,
            'username': user.username,
            'is_admin': member.is_admin,
            'joined_at': member.joined_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify(result), 200

@member_bp.route('/<int:chat_id>/group/members', methods=['POST'])
def add_group_member(chat_id):
    data = request.json
    user_id = data.get('user_id')
    admin_id = data.get('admin_id')
    
    if not all([user_id, admin_id]):
        return jsonify({'error': 'User ID and admin ID are required'}), 400
    
    # Check if chat exists and is a group
    chat = Chat.query.get_or_404(chat_id)
    
    if not chat.is_group:
        return jsonify({'error': 'Chat is not a group'}), 400
    
    # Check if admin is actually an admin
    admin_membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=admin_id, is_admin=True).first()
    
    if not admin_membership:
        return jsonify({'error': 'User is not an admin of this group'}), 403
    
    # Check if user is already a member
    existing_membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    
    if existing_membership:
        return jsonify({'message': 'User is already a member of this group'}), 200
    
    # Add user to the group
    new_member = GroupMember(chat_id=chat_id, user_id=user_id, is_admin=False)
    db.session.add(new_member)
    db.session.commit()
    
    # Get user details
    user = User.query.get(user_id)
    
    # Notify group members about new user
    socketio.emit('group_update', {
        'type': 'new_member',
        'chat_id': chat_id,
        'user': {
            'id': user.id,
            'username': user.username
        }
    }, room=str(chat_id))
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'is_admin': False,
        'joined_at': new_member.joined_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 201

@member_bp.route('/<int:chat_id>/group/members/<int:user_id>', methods=['DELETE'])
def remove_group_member(chat_id, user_id):
    data = request.json
    admin_id = data.get('admin_id')
    
    if not admin_id:
        return jsonify({'error': 'Admin ID is required'}), 400
    
    # Check if chat exists and is a group
    chat = Chat.query.get_or_404(chat_id)
    
    if not chat.is_group:
        return jsonify({'error': 'Chat is not a group'}), 400
    
    # Check if admin is actually an admin
    admin_membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=admin_id, is_admin=True).first()
    
    if not admin_membership:
        return jsonify({'error': 'User is not an admin of this group'}), 403
    
    # Check if user is a member
    membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    
    if not membership:
        return jsonify({'error': 'User is not a member of this group'}), 404
    
    # Cannot remove an admin (unless it's self-removal)
    if membership.is_admin and int(user_id) != int(admin_id):
        return jsonify({'error': 'Cannot remove an admin'}), 403
    
    # Remove user from the group
    db.session.delete(membership)
    db.session.commit()
    
    # Notify group members about removed user
    socketio.emit('group_update', {
        'type': 'member_removed',
        'chat_id': chat_id,
        'user_id': user_id
    }, room=str(chat_id))
    
    return jsonify({'success': True}), 200

@member_bp.route('/<int:chat_id>/group/admin', methods=['POST'])
def make_group_admin(chat_id):
    data = request.json
    user_id = data.get('user_id')
    admin_id = data.get('admin_id')
    
    if not all([user_id, admin_id]):
        return jsonify({'error': 'User ID and admin ID are required'}), 400
    
    # Check if chat exists and is a group
    chat = Chat.query.get_or_404(chat_id)
    
    if not chat.is_group:
        return jsonify({'error': 'Chat is not a group'}), 400
    
    # Check if admin is actually an admin
    admin_membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=admin_id, is_admin=True).first()
    
    if not admin_membership:
        return jsonify({'error': 'User is not an admin of this group'}), 403
    
    # Check if user is a member
    membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
    
    if not membership:
        return jsonify({'error': 'User is not a member of this group'}), 404
    
    # Make user an admin
    membership.is_admin = True
    db.session.commit()
    
    # Notify group members about new admin
    socketio.emit('group_update', {
        'type': 'new_admin',
        'chat_id': chat_id,
        'user_id': user_id
    }, room=str(chat_id))
    
    return jsonify({'success': True}), 200
