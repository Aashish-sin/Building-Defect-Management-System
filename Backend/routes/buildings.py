from flask import Blueprint, jsonify, request
from extensions import db
from models import Building
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
    if user.role in ['admin', 'csr', 'building_executive', 'technician']:
        buildings = Building.query.all()
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



