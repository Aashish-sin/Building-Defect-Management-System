from flask import Blueprint, jsonify, request
from extensions import db
from models import User
from routes.utils import require_auth, require_roles


users_bp = Blueprint('users_bp', __name__)


def _serialize_user(user):
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None,
    }


@users_bp.route('', methods=['GET'])
@require_auth
@require_roles('admin')
def list_users(user):
    users = User.query.all()
    return jsonify([_serialize_user(u) for u in users])


@users_bp.route('/<int:user_id>', methods=['GET'])
@require_auth
@require_roles('admin')
def get_user(user, user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(_serialize_user(target_user))


@users_bp.route('', methods=['POST'])
@require_auth
@require_roles('admin')
def create_user(user):
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409

    role = data.get('role', 'csr')
    if role not in ['admin', 'csr', 'building_executive', 'technician']:
        return jsonify({'message': 'Invalid role'}), 400

    new_user = User(
        email=data['email'],
        name=data.get('name', ''),
        role=role
    )
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify(_serialize_user(new_user)), 201


@users_bp.route('/<int:user_id>', methods=['PUT'])
@require_auth
@require_roles('admin')
def update_user(user, user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    if 'name' in data:
        target_user.name = data['name']
    if 'email' in data:
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user_id:
            return jsonify({'message': 'Email already exists'}), 409
        target_user.email = data['email']
    if 'role' in data:
        if data['role'] not in ['admin', 'csr', 'building_executive', 'technician']:
            return jsonify({'message': 'Invalid role'}), 400
        target_user.role = data['role']
    if 'password' in data:
        target_user.set_password(data['password'])

    db.session.commit()
    return jsonify(_serialize_user(target_user))


@users_bp.route('/<int:user_id>', methods=['DELETE'])
@require_auth
@require_roles('admin')
def delete_user(user, user_id):
    target_user = User.query.get(user_id)
    if not target_user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(target_user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})


@users_bp.route('/technicians', methods=['GET'])
@require_auth
def list_technicians(user):
    if user.role not in ['admin', 'building_executive']:
        return jsonify({'message': 'Forbidden'}), 403
    
    technicians = User.query.filter_by(role='technician').all()
    return jsonify([_serialize_user(t) for t in technicians])
