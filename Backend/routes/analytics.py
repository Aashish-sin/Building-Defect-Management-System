from flask import Blueprint, jsonify
from sqlalchemy import func
from extensions import db
from models import Defect, Building, DefectComment, User
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


def _serialize_user(user):
    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None,
    }


def _serialize_building(building):
    return {
        'id': building.id,
        'name': building.name,
        'address': building.address,
        'created_at': building.created_at.isoformat() if building.created_at else None,
        'updated_at': building.updated_at.isoformat() if building.updated_at else None,
    }


def _serialize_defect(defect):
    return {
        'id': defect.id,
        'title': defect.title,
        'description': defect.description,
        'status': defect.status,
        'priority': defect.priority,
        'image_url': defect.image_url,
        'initial_report_image': defect.initial_report_image,
        'technician_report_image': defect.technician_report_image,
        'building_id': defect.building_id,
        'reporter_id': defect.reporter_id,
        'reviewed_by': defect.reviewed_by_id,
        'assigned_technician_id': defect.assigned_technician_id,
        'external_contractor': defect.external_contractor,
        'contractor_name': defect.contractor_name,
        'done_at': defect.done_at.isoformat() if defect.done_at else None,
        'completed_at': defect.completed_at.isoformat() if defect.completed_at else None,
        'deleted_at': defect.deleted_at.isoformat() if defect.deleted_at else None,
        'deleted_by_id': defect.deleted_by_id,
        'created_at': defect.created_at.isoformat() if defect.created_at else None,
        'updated_at': defect.updated_at.isoformat() if defect.updated_at else None,
    }


def _serialize_defect_comment(comment):
    return {
        'id': comment.id,
        'defect_id': comment.defect_id,
        'initial_report': comment.initial_report,
        'executive_decision': comment.executive_decision,
        'technician_report': comment.technician_report,
        'verification_report': comment.verification_report,
        'final_completion': comment.final_completion,
        'created_at': comment.created_at.isoformat() if comment.created_at else None,
        'updated_at': comment.updated_at.isoformat() if comment.updated_at else None,
    }


@analytics_bp.route('/export', methods=['GET'])
@require_auth
@require_roles('admin')
def export_database(user):
    users = User.query.all()
    buildings = Building.query.all()
    defects = Defect.query.all()
    comments = DefectComment.query.all()

    return jsonify({
        'users': [_serialize_user(u) for u in users],
        'buildings': [_serialize_building(b) for b in buildings],
        'defects': [_serialize_defect(d) for d in defects],
        'defect_comments': [_serialize_defect_comment(c) for c in comments],
    })
