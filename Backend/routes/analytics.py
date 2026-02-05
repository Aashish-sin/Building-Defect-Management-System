from flask import Blueprint, jsonify
from sqlalchemy import func
from extensions import db
from models import Defect, Building
from routes.utils import require_auth, require_roles


analytics_bp = Blueprint('analytics_bp', __name__)


@analytics_bp.route('/defects-per-building', methods=['GET'])
@require_auth
@require_roles('admin', 'csr', 'building_executive')
def defects_per_building(user):
    results = (
        db.session.query(Building.id, Building.name, func.count(Defect.id))
        .outerjoin(Defect, Defect.building_id == Building.id)
        .group_by(Building.id, Building.name)
        .all()
    )

    return jsonify([
        {'building_id': b_id, 'building_name': b_name, 'defect_count': count}
        for b_id, b_name, count in results
    ])


@analytics_bp.route('/defects-status', methods=['GET'])
@require_auth
@require_roles('admin', 'csr', 'building_executive')
def defects_status(user):
    results = (
        db.session.query(Defect.status, func.count(Defect.id))
        .group_by(Defect.status)
        .all()
    )

    return jsonify([
        {'status': status, 'count': count}
        for status, count in results
    ])
