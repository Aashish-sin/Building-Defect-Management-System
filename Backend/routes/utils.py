import functools
from flask import request, jsonify, current_app
import jwt
from models import User


def _get_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()
    return None


def get_current_user():
    token = _get_token()
    if not token:
        return None
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user = User.query.get(payload.get('user_id'))
        return user
    except Exception:
        return None


def require_auth(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 401
        return fn(user, *args, **kwargs)
    return wrapper


def require_roles(*roles):
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(user, *args, **kwargs):
            if user.role not in roles:
                return jsonify({'message': 'Forbidden'}), 403
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


def user_has_building_access(user, building_id):
    if user.role == 'admin':
        return True
    if user.role == 'technician':
        return True
    return False
