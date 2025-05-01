# from flask_sqlalchemy import SQLAlchemy
from extensions import db 
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    sent_messages = db.relationship('Message', backref='sender', lazy=True, foreign_keys='Message.sender_id')
    blocked_users = db.relationship('BlockedUser', 
                                   foreign_keys='BlockedUser.user_id',
                                   backref='user',
                                   lazy='dynamic')
    blocked_by = db.relationship('BlockedUser',
                                foreign_keys='BlockedUser.blocked_id',
                                backref='blocked_user',
                                lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def block_user(self, user):
        if not self.is_blocking(user):
            block = BlockedUser(user_id=self.id, blocked_id=user.id)
            db.session.add(block)
            
    def unblock_user(self, user):
        block = self.blocked_users.filter_by(blocked_id=user.id).first()
        if block:
            db.session.delete(block)
            
    def is_blocking(self, user):
        return self.blocked_users.filter_by(blocked_id=user.id).first() is not None
    
    def is_blocked_by(self, user):
        return self.blocked_by.filter_by(user_id=user.id).first() is not None
    
    def __repr__(self):
        return f'<User {self.username}>'


class Chat(db.Model):
    __tablename__ = 'chats'
    
    id = db.Column(db.Integer, primary_key=True)
    user1_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    user2_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_group = db.Column(db.Boolean, default=False)
    name = db.Column(db.String(100), nullable=True)  # For group chats
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_archived = db.Column(db.Boolean, default=False)
    
    # Relationships
    user1 = db.relationship('User', foreign_keys=[user1_id])
    user2 = db.relationship('User', foreign_keys=[user2_id])
    messages = db.relationship('Message', backref='chat', lazy=True)
    members = db.relationship('GroupMember', backref='chat', lazy=True)
    
    def __repr__(self):
        return f'<Chat {self.id}>'


class GroupMember(db.Model):
    __tablename__ = 'group_members'
    
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate memberships
    __table_args__ = (db.UniqueConstraint('chat_id', 'user_id', name='unique_group_membership'),)
    
    # Relationship
    user = db.relationship('User')
    
    def __repr__(self):
        return f'<GroupMember {self.user_id} in {self.chat_id}>'


class Message(db.Model):
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Message {self.id}>'


class BlockedUser(db.Model):
    __tablename__ = 'blocked_users'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blocked_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    blocked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate blocks
    __table_args__ = (db.UniqueConstraint('user_id', 'blocked_id', name='unique_block'),)
    
    def __repr__(self):
        return f'<BlockedUser {self.user_id} blocked {self.blocked_id}>'


class ArchivedChat(db.Model):
    __tablename__ = 'archived_chats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    chat_id = db.Column(db.Integer, db.ForeignKey('chats.id'), nullable=False)
    archived_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint to prevent duplicate archives
    __table_args__ = (db.UniqueConstraint('user_id', 'chat_id', name='unique_archive'),)
    
    # Relationships
    user = db.relationship('User')
    chat = db.relationship('Chat')
    
    def __repr__(self):
        return f'<ArchivedChat {self.user_id} archived {self.chat_id}>'
