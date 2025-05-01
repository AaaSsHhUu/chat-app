# filepath: /home/ashu/Desktop/Major-project/backend/sockets.py
from flask_socketio import emit, join_room, leave_room
from datetime import datetime
from app.models.models import Message, db

def register_socketio_events(socketio, app):
    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('join')
    def on_join(data):
        username = data['username']
        room = data['room']
        join_room(room)
        emit('status', {'msg': f'{username} has entered the room.'}, room=room)

    @socketio.on('leave')
    def on_leave(data):
        username = data['username']
        room = data['room']
        leave_room(room)
        emit('status', {'msg': f'{username} has left the room.'}, room=room)

    @socketio.on('message')
    def handle_message(data):
        room = data['room']
        emit('message', data, room=room, include_self=False)

        # Save message to database
        with app.app_context():
            new_message = Message(
                chat_id=data['room'],
                sender_id=data['sender_id'],
                content=data['message'],
                timestamp=datetime.now()
            )
            db.session.add(new_message)
            db.session.commit()