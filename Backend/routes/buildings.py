from flask import Blueprint, jsonify, request
from extensions import db
from models import Building, BuildingUser, User
from routes.utils import require_auth, require_roles, user_has_building_access


buildings_bp = Blueprint('buildings_bp', __name__)


def _serialize_building(building):
    return {
        'id': building.id,
        'name': building.name,
        'address': building.address,
        'created_at': building.created_at.isoformat() if building.created_at else None,
        'updated_at': building.updated_at.isoformat() if building.updated_at else None,
    }


@buildings_bp.route('', methods=['GET'])
@require_auth
def list_buildings(user):
    if user.role in ['admin', 'csr', 'building_executive']:
        buildings = Building.query.all()
    elif user.role == 'technician':
        buildings = Building.query.join(BuildingUser).filter(BuildingUser.user_id == user.id).all()
    else:
        buildings = []

    return jsonify([_serialize_building(b) for b in buildings])


@buildings_bp.route('/<int:building_id>', methods=['GET'])
@require_auth
def get_building(user, building_id):
    building = Building.query.get(building_id)
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    if user.role in ['admin', 'csr', 'building_executive']:
        return jsonify(_serialize_building(building))

    if not user_has_building_access(user, building_id):
        return jsonify({'message': 'Forbidden'}), 403

    return jsonify(_serialize_building(building))


@buildings_bp.route('', methods=['POST'])
@require_auth
@require_roles('admin')
def create_building(user):
    data = request.get_json()
    if not data or 'name' not in data or 'address' not in data:
        return jsonify({'message': 'Missing required fields'}), 400

    building = Building(name=data['name'], address=data['address'])
    db.session.add(building)
    db.session.commit()
    return jsonify(_serialize_building(building)), 201


@buildings_bp.route('/<int:building_id>', methods=['PUT'])
@require_auth
@require_roles('admin')
def update_building(user, building_id):
    building = Building.query.get(building_id)
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    data = request.get_json()
    if 'name' in data:
        building.name = data['name']
    if 'address' in data:
        building.address = data['address']

    db.session.commit()
    return jsonify(_serialize_building(building))


@buildings_bp.route('/<int:building_id>', methods=['DELETE'])
@require_auth
@require_roles('admin')
def delete_building(user, building_id):
    building = Building.query.get(building_id)
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    db.session.delete(building)
    db.session.commit()
    return jsonify({'message': 'Building deleted'})


@buildings_bp.route('/<int:building_id>/users', methods=['GET'])
@require_auth
@require_roles('admin')
def list_building_users(user, building_id):
    building = Building.query.get(building_id)
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    building_users = BuildingUser.query.filter_by(building_id=building_id).all()
    result = []
    for bu in building_users:
        user_obj = User.query.get(bu.user_id)
        if user_obj:
            result.append({
                'id': bu.id,
                'building_id': bu.building_id,
                'user_id': bu.user_id,
                'user_name': user_obj.name,
                'user_email': user_obj.email,
                'user_role': user_obj.role,
                'building_role': bu.role,
                'created_at': bu.created_at.isoformat() if bu.created_at else None,
            })
    return jsonify(result)


@buildings_bp.route('/<int:building_id>/users', methods=['POST'])
@require_auth
@require_roles('admin')
def assign_user_to_building(user, building_id):
    building = Building.query.get(building_id)
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    data = request.get_json()
    if not data or 'user_id' not in data:
        return jsonify({'message': 'user_id is required'}), 400

    target_user = User.query.get(data['user_id'])
    if not target_user:
        return jsonify({'message': 'User not found'}), 404

    building_role = data.get('role', 'engineer')
    if building_role not in ['manager', 'engineer']:
        return jsonify({'message': 'Invalid building role'}), 400

    existing = BuildingUser.query.filter_by(building_id=building_id, user_id=data['user_id']).first()
    if existing:
        return jsonify({'message': 'User already assigned to this building'}), 409

    building_user = BuildingUser(
        building_id=building_id,
        user_id=data['user_id'],
        role=building_role
    )
    db.session.add(building_user)
    db.session.commit()

    return jsonify({
        'id': building_user.id,
        'building_id': building_user.building_id,
        'user_id': building_user.user_id,
        'role': building_user.role,
        'created_at': building_user.created_at.isoformat() if building_user.created_at else None,
    }), 201


@buildings_bp.route('/<int:building_id>/users/<int:building_user_id>', methods=['DELETE'])
@require_auth
@require_roles('admin')
def remove_user_from_building(user, building_id, building_user_id):
    building_user = BuildingUser.query.filter_by(id=building_user_id, building_id=building_id).first()
    if not building_user:
        return jsonify({'message': 'Building user assignment not found'}), 404

    db.session.delete(building_user)
    db.session.commit()
    return jsonify({'message': 'User removed from building'})

