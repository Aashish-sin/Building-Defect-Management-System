import datetime
from flask import Blueprint, request, jsonify
from extensions import db
from models import Defect, DefectComment, Building, BuildingUser, User
from routes.utils import require_auth, require_roles, user_has_building_access


defects_bp = Blueprint('defects_bp', __name__)


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
        'created_at': defect.created_at.isoformat() if defect.created_at else None,
        'updated_at': defect.updated_at.isoformat() if defect.updated_at else None,
    }


def _serialize_comment(comment):
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


def _normalize_role(role):
    normalized = (role or '').strip().lower()
    normalized = normalized.replace('-', '_').replace(' ', '_')
    while '__' in normalized:
        normalized = normalized.replace('__', '_')
    return normalized


def _can_access_defect(user, defect):
    role = _normalize_role(user.role)
    if role == 'admin':
        return True

    if defect.reporter_id == user.id:
        return True

    if role in ['csr', 'building_executive']:
        return True

    if role == 'technician':
        return defect.assigned_technician_id == user.id

    return False


def _get_or_create_comments(defect_id):
    comments = (
        DefectComment.query.filter_by(defect_id=defect_id)
        .order_by(DefectComment.updated_at.desc(), DefectComment.created_at.desc())
        .first()
    )
    if not comments:
        comments = DefectComment(defect_id=defect_id)
        db.session.add(comments)
    return comments


@defects_bp.route('', methods=['POST'])
@require_auth
def create_defect(user):
    data = request.get_json() or {}
    required_fields = ['title', 'description', 'priority', 'building_id']
    if any(field not in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    if user.role not in ['csr', 'building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    building = Building.query.get(data['building_id'])
    if not building:
        return jsonify({'message': 'Building not found'}), 404

    defect = Defect(
        title=data['title'],
        description=data['description'],
        priority=data['priority'],
        image_url=data.get('image_url'),
        initial_report_image=data.get('initial_report_image'),
        building_id=data['building_id'],
        reporter_id=user.id,
        external_contractor=data.get('external_contractor', False),
        contractor_name=data.get('contractor_name')
    )
    db.session.add(defect)

    db.session.flush()
    comments = _get_or_create_comments(defect.id)
    initial_report = data.get('initial_report') or data.get('csr_prognosis')
    if initial_report:
        comments.initial_report = initial_report
    db.session.commit()

    return jsonify(_serialize_defect(defect)), 201


@defects_bp.route('', methods=['GET'])
@require_auth
def list_defects(user):
    role = _normalize_role(user.role)
    if role in ['admin', 'csr', 'building_executive']:
        defects = Defect.query.all()
    elif role == 'technician':
        defects = Defect.query.filter_by(assigned_technician_id=user.id).all()
    else:
        defects = []

    return jsonify([_serialize_defect(d) for d in defects])


@defects_bp.route('/<int:defect_id>', methods=['GET'])
@require_auth
def get_defect(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404
    if not _can_access_defect(user, defect):
        return jsonify({'message': 'Forbidden'}), 403
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>', methods=['PUT'])
@require_auth
def update_defect(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['csr', 'building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}

    if role == 'csr':
        if 'priority' in data:
            defect.priority = data['priority']
    elif role == 'building_executive':
        if 'status' in data and data['status'] in ['Open', 'Reviewed', 'Ongoing', 'Done', 'Completed']:
            defect.status = data['status']
        for field in ['external_contractor', 'contractor_name', 'technician_report_image']:
            if field in data:
                setattr(defect, field, data[field])
    elif role == 'technician':
        if defect.assigned_technician_id != user.id:
            return jsonify({'message': 'Forbidden'}), 403
        if 'technician_report_image' in data:
            defect.technician_report_image = data['technician_report_image']
    else:
        # Admin
        if 'status' in data and data['status'] in ['Open', 'Reviewed', 'Ongoing', 'Done', 'Completed']:
            defect.status = data['status']

        for field in ['title', 'description', 'priority', 'image_url', 'initial_report_image', 'technician_report_image', 'external_contractor', 'contractor_name']:
            if field in data:
                setattr(defect, field, data[field])

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/review', methods=['PATCH'])
@require_auth
def review_defect(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    defect.status = 'Reviewed'
    defect.reviewed_by_id = user.id
    if 'external_contractor' in data:
        defect.external_contractor = data['external_contractor']
    if 'contractor_name' in data:
        defect.contractor_name = data['contractor_name']

    comments = _get_or_create_comments(defect.id)
    if data.get('executive_decision'):
        comments.executive_decision = data.get('executive_decision')

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/assign', methods=['PATCH'])
@require_auth
def assign_technician(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    tech_id = data.get('assigned_technician_id')
    if not tech_id:
        return jsonify({'message': 'assigned_technician_id is required'}), 400

    technician = User.query.get(tech_id)
    if not technician or technician.role != 'technician':
        return jsonify({'message': 'Invalid technician'}), 400

    defect.assigned_technician_id = tech_id
    defect.status = 'Ongoing'
    if data.get('external_contractor') is not None:
        defect.external_contractor = data.get('external_contractor')
    if data.get('contractor_name') is not None:
        defect.contractor_name = data.get('contractor_name')

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/ongoing', methods=['PATCH'])
@require_auth
def mark_ongoing(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['technician', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403
    if role == 'technician' and defect.assigned_technician_id != user.id:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    defect.status = 'Ongoing'

    comments = _get_or_create_comments(defect.id)
    if data.get('technician_report'):
        comments.technician_report = data.get('technician_report')

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/done', methods=['PATCH'])
@require_auth
def mark_done(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['technician', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403
    if role == 'technician' and defect.assigned_technician_id != user.id:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    defect.status = 'Done'
    defect.done_at = datetime.datetime.utcnow()

    comments = _get_or_create_comments(defect.id)
    if data.get('technician_report'):
        comments.technician_report = data.get('technician_report')
    if data.get('verification_report'):
        comments.verification_report = data.get('verification_report')
    if data.get('technician_report_image'):
        defect.technician_report_image = data.get('technician_report_image')

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/complete', methods=['PATCH'])
@require_auth
def mark_complete(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    defect.status = 'Completed'
    defect.completed_at = datetime.datetime.utcnow()

    comments = _get_or_create_comments(defect.id)
    if data.get('verification_report'):
        comments.verification_report = data.get('verification_report')
    if data.get('final_completion'):
        comments.final_completion = data.get('final_completion')

    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>/reopen', methods=['PATCH'])
@require_auth
def reopen_defect(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404

    role = _normalize_role(user.role)
    if role not in ['building_executive', 'admin']:
        return jsonify({'message': 'Forbidden'}), 403

    defect.status = 'Open'
    defect.done_at = None
    defect.completed_at = None
    db.session.commit()
    return jsonify(_serialize_defect(defect))


@defects_bp.route('/<int:defect_id>', methods=['DELETE'])
@require_auth
@require_roles('admin')
def delete_defect(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404
    db.session.delete(defect)
    db.session.commit()
    return jsonify({'message': 'Defect deleted'})


@defects_bp.route('/<int:defect_id>/comments', methods=['POST'])
@require_auth
def upsert_comments(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404
    if not _can_access_defect(user, defect):
        return jsonify({'message': 'Forbidden'}), 403

    data = request.get_json() or {}
    comments = _get_or_create_comments(defect.id)

    if 'csr_prognosis' in data and 'initial_report' not in data:
        data['initial_report'] = data['csr_prognosis']

    role = _normalize_role(user.role)
    allowed_fields = []
    if role == 'csr':
        allowed_fields = ['initial_report']
    elif role == 'building_executive':
        allowed_fields = ['executive_decision', 'verification_report', 'final_completion']
    elif role == 'technician':
        allowed_fields = ['technician_report', 'verification_report']
    elif role == 'admin':
        allowed_fields = ['initial_report', 'executive_decision', 'technician_report', 'verification_report', 'final_completion']

    for field in allowed_fields:
        if field in data:
            setattr(comments, field, data[field])

    db.session.commit()
    return jsonify(_serialize_comment(comments))


@defects_bp.route('/<int:defect_id>/comments', methods=['GET'])
@require_auth
def get_comments(user, defect_id):
    defect = Defect.query.get(defect_id)
    if not defect:
        return jsonify({'message': 'Defect not found'}), 404
    if not _can_access_defect(user, defect):
        return jsonify({'message': 'Forbidden'}), 403

    comments = (
        DefectComment.query.filter_by(defect_id=defect_id)
        .order_by(DefectComment.created_at.asc(), DefectComment.updated_at.asc())
        .all()
    )
    return jsonify([_serialize_comment(comment) for comment in comments])
