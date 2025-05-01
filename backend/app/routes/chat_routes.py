from flask import Blueprint, request, jsonify
from ..models.models import Chat, ArchivedChat, GroupMember, Message, User, db
from extensions import socketio
from datetime import datetime

chat_bp = Blueprint("chats", __name__)

# region GET CHATS
@chat_bp.route('/api/chats', methods=['GET'])
def get_chats():
    user_id = request.args.get('user_id')
    include_archived = request.args.get('include_archived', 'false').lower() == 'true'
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Get all direct chats for the user
    direct_chats = Chat.query.filter(
        (Chat.user1_id == user_id) | (Chat.user2_id == user_id),
        Chat.is_group == False
    ).all()
    
    # Get all group chats for the user
    group_memberships = GroupMember.query.filter_by(user_id=user_id).all()
    group_chat_ids = [membership.chat_id for membership in group_memberships]
    group_chats = Chat.query.filter(Chat.id.in_(group_chat_ids)).all()
    
    # Combine all chats
    all_chats = direct_chats + group_chats
    
    # Get archived chats for the user
    archived_chat_ids = [
        archive.chat_id for archive in 
        ArchivedChat.query.filter_by(user_id=user_id).all()
    ]
    
    result = []
    for chat in all_chats:
        # Skip archived chats if not requested
        if chat.id in archived_chat_ids and not include_archived:
            continue
            
        if chat.is_group:
            # Group chat
            chat_name = chat.name
            members_count = GroupMember.query.filter_by(chat_id=chat.id).count()
            
            # Get the last message
            last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()
            
            # Count unread messages
            unread_count = Message.query.filter_by(
                chat_id=chat.id, 
                is_read=False
            ).filter(Message.sender_id != int(user_id)).count()
            
            result.append({
                'id': chat.id,
                'name': chat_name,
                'is_group': True,
                'members_count': members_count,
                'lastMessage': last_message.content if last_message else '',
                'lastSender': User.query.get(last_message.sender_id).username if last_message else '',
                'timestamp': last_message.timestamp.strftime('%I:%M %p') if last_message else '',
                'unread': unread_count,
                'is_archived': chat.id in archived_chat_ids
            })
        else:
            # Direct chat
            # Get the other user in the chat
            other_user_id = chat.user2_id if chat.user1_id == int(user_id) else chat.user1_id
            other_user = User.query.get(other_user_id)
            
            # Get the last message
            last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()
            
            # Count unread messages
            unread_count = Message.query.filter_by(
                chat_id=chat.id, 
                is_read=False,
                sender_id=other_user_id
            ).count()
            
            # Check if user is blocked
            current_user = User.query.get(user_id)
            is_blocked = current_user.is_blocking(other_user)
            is_blocked_by = current_user.is_blocked_by(other_user)
            
            result.append({
                'id': chat.id,
                'name': other_user.username,
                'is_group': False,
                'lastMessage': last_message.content if last_message else '',
                'timestamp': last_message.timestamp.strftime('%I:%M %p') if last_message else '',
                'unread': unread_count,
                'is_archived': chat.id in archived_chat_ids,
                'is_blocked': is_blocked,
                'is_blocked_by': is_blocked_by
            })
    
    return jsonify(result), 200

# endregion

# region Create Chat
@chat_bp.route('/api/chats', methods=['POST'])
def create_chat():
    data = request.json
    user1_id = data.get('user1_id')
    user2_id = data.get('user2_id')
    is_group = data.get('is_group', False)
    group_name = data.get('group_name')
    members = data.get('members', [])
    
    if is_group:
        if not all([user1_id, group_name, members]):
            return jsonify({'error': 'Creator ID, group name, and members are required'}), 400
            
        # Create a new group chat
        new_chat = Chat(
            is_group=True,
            name=group_name,
            user1_id=user1_id  # Creator
        )
        db.session.add(new_chat)
        db.session.flush()  # Get the chat ID
        
        # Add members including the creator
        all_members = list(set([int(user1_id)] + members))
        for member_id in all_members:
            is_admin = member_id == int(user1_id)
            member = GroupMember(
                chat_id=new_chat.id,
                user_id=member_id,
                is_admin=is_admin
            )
            db.session.add(member)
        
        db.session.commit()
        
        return jsonify({
            'id': new_chat.id,
            'name': new_chat.name,
            'is_group': True,
            'members_count': len(all_members)
        }), 201
    else:
        if not all([user1_id, user2_id]):
            return jsonify({'error': 'Both user IDs are required'}), 400
        
        # Check if users have blocked each other
        user1 = User.query.get(user1_id)
        user2 = User.query.get(user2_id)
        
        if user1.is_blocking(user2) or user1.is_blocked_by(user2):
            return jsonify({'error': 'Cannot create chat with blocked user'}), 403
        
        # Check if chat already exists
        existing_chat = Chat.query.filter(
            ((Chat.user1_id == user1_id) & (Chat.user2_id == user2_id)) |
            ((Chat.user1_id == user2_id) & (Chat.user2_id == user1_id)),
            Chat.is_group == False
        ).first()
        
        if existing_chat:
            return jsonify({'id': existing_chat.id}), 200
        
        new_chat = Chat(user1_id=user1_id, user2_id=user2_id, is_group=False)
        db.session.add(new_chat)
        db.session.commit()
        
        return jsonify({'id': new_chat.id}), 201
# endregion

# region GET MESSAGES
@chat_bp.route('/api/chats/<int:chat_id>/messages', methods=['GET'])
def get_messages(chat_id):
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Check if user is part of the chat
    chat = Chat.query.get_or_404(chat_id)
    
    if chat.is_group:
        # Check if user is a member of the group
        membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
        if not membership:
            return jsonify({'error': 'User is not a member of this group'}), 403
    else:
        # Check if user is part of the direct chat
        if chat.user1_id != int(user_id) and chat.user2_id != int(user_id):
            return jsonify({'error': 'User is not part of this chat'}), 403
    
    # Optional pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    result = []
    for message in messages.items:
        sender = User.query.get(message.sender_id)
        result.append({
            'id': message.id,
            'content': message.content,
            'sender': sender.username,
            'sender_id': sender.id,
            'timestamp': message.timestamp.strftime('%I:%M %p'),
            'is_read': message.is_read,
            'isMe': int(user_id) == message.sender_id
        })
    
    return jsonify({
        'messages': result,
        'total': messages.total,
        'pages': messages.pages,
        'current_page': page
    }), 200
# endregion

# region SEND MESSAGES
@chat_bp.route('/api/chats/<int:chat_id>/messages', methods=['POST'])
def send_message(chat_id):
    data = request.json
    sender_id = data.get('sender_id')
    content = data.get('content')
    
    if not all([sender_id, content]):
        return jsonify({'error': 'Sender ID and content are required'}), 400
    
    # Check if chat exists
    chat = Chat.query.get_or_404(chat_id)
    
    # Check if user can send messages to this chat
    if chat.is_group:
        # Check if user is a member of the group
        membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=sender_id).first()
        if not membership:
            return jsonify({'error': 'User is not a member of this group'}), 403
    else:
        # Check if user is part of the direct chat
        if chat.user1_id != int(sender_id) and chat.user2_id != int(sender_id):
            return jsonify({'error': 'User is not part of this chat'}), 403
            
        # Check if users have blocked each other
        other_user_id = chat.user2_id if chat.user1_id == int(sender_id) else chat.user1_id
        sender = User.query.get(sender_id)
        other_user = User.query.get(other_user_id)
        
        if sender.is_blocking(other_user) or sender.is_blocked_by(other_user):
            return jsonify({'error': 'Cannot send message to blocked user'}), 403
    
    new_message = Message(
        chat_id=chat_id,
        sender_id=sender_id,
        content=content,
        timestamp=datetime.now(),
        is_read=False
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    sender = User.query.get(sender_id)
    
    # Emit the message to the chat room
    socketio.emit('message', {
        'id': new_message.id,
        'content': new_message.content,
        'sender': sender.username,
        'sender_id': sender.id,
        'timestamp': new_message.timestamp.strftime('%I:%M %p'),
        'is_read': new_message.is_read
    }, room=str(chat_id))
    
    return jsonify({
        'id': new_message.id,
        'content': new_message.content,
        'sender': sender.username,
        'timestamp': new_message.timestamp.strftime('%I:%M %p')
    }), 201
# endregion

# region MARK MESSAGES AS READ
@chat_bp.route('/api/chats/<int:chat_id>/messages/read', methods=['POST'])
def mark_messages_as_read(chat_id):
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Mark all messages from other users as read
    messages = Message.query.filter_by(
        chat_id=chat_id, 
        is_read=False
    ).filter(Message.sender_id != user_id).all()
    
    for message in messages:
        message.is_read = True
    
    db.session.commit()
    
    return jsonify({'success': True, 'count': len(messages)}), 200
# endregion

# region ARCHIEVE CHAT
@chat_bp.route('/api/chats/<int:chat_id>/archive', methods=['POST'])
def archive_chat(chat_id):
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Check if chat exists
    chat = Chat.query.get_or_404(chat_id)
    
    # Check if user is part of the chat
    if chat.is_group:
        membership = GroupMember.query.filter_by(chat_id=chat_id, user_id=user_id).first()
        if not membership:
            return jsonify({'error': 'User is not a member of this group'}), 403
    else:
        if chat.user1_id != int(user_id) and chat.user2_id != int(user_id):
            return jsonify({'error': 'User is not part of this chat'}), 403
    
    # Check if already archived
    existing_archive = ArchivedChat.query.filter_by(user_id=user_id, chat_id=chat_id).first()
    
    if existing_archive:
        return jsonify({'message': 'Chat already archived'}), 200
    
    # Archive the chat
    archive = ArchivedChat(user_id=user_id, chat_id=chat_id)
    db.session.add(archive)
    db.session.commit()
    
    return jsonify({'success': True}), 200
# endregion

# region UNARCHIEVE CHAT
@chat_bp.route('/api/chats/<int:chat_id>/unarchive', methods=['POST'])
def unarchive_chat(chat_id):
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Find the archive entry
    archive = ArchivedChat.query.filter_by(user_id=user_id, chat_id=chat_id).first()
    
    if not archive:
        return jsonify({'message': 'Chat is not archived'}), 200
    
    # Unarchive the chat
    db.session.delete(archive)
    db.session.commit()
    
    return jsonify({'success': True}), 200
# endregion