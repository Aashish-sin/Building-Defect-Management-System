from flask import Blueprint, request, jsonify, current_app, make_response
from models import User, RefreshToken
from extensions import db
import jwt
import datetime
import hashlib
import secrets

auth_bp = Blueprint('auth_bp', __name__)

ACCESS_TOKEN_MINUTES = 15
REFRESH_TOKEN_DAYS = 7
REFRESH_COOKIE_NAME = 'refresh_token'


def _encode_token(payload):
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token


def _create_access_token(user_id):
    return _encode_token({
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_MINUTES)
    })


def _hash_token(token):
    return hashlib.sha256(token.encode('utf-8')).hexdigest()


def _issue_refresh_token(user_id):
    raw_token = secrets.token_urlsafe(48)
    token_hash = _hash_token(raw_token)
    refresh = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_DAYS)
    )
    db.session.add(refresh)
    db.session.commit()
    return raw_token, refresh


def _set_refresh_cookie(response, token):
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        token,
        httponly=True,
        samesite='Lax',
        secure=False,
        max_age=REFRESH_TOKEN_DAYS * 24 * 60 * 60
    )


def _clear_refresh_cookie(response):
    response.set_cookie(REFRESH_COOKIE_NAME, '', expires=0)

@auth_bp.route('/signup', methods=['POST'])
def signup():
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

    access_token = _create_access_token(new_user.id)
    refresh_token, _ = _issue_refresh_token(new_user.id)

    response = make_response(jsonify({
        'token': access_token,
        'user': {
            'id': new_user.id,
            'name': new_user.name,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201)
    _set_refresh_cookie(response, refresh_token)
    return response

@auth_bp.route('/login', methods=['POST'])
def login():
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return jsonify({'message': 'Could not verify'}), 401, {'WWW-Authenticate': 'Basic realm="Login required!"'}

    user = User.query.filter_by(email=auth.username).first()

    if not user:
        return jsonify({'message': 'Could not verify'}), 401, {'WWW-Authenticate': 'Basic realm="Login required!"'}

    if user.check_password(auth.password):
        access_token = _create_access_token(user.id)
        refresh_token, _ = _issue_refresh_token(user.id)

        response = make_response(jsonify({
            'token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role
            }
        }))
        _set_refresh_cookie(response, refresh_token)
        return response

    return jsonify({'message': 'Could not verify'}), 401, {'WWW-Authenticate': 'Basic realm="Login required!"'}


@auth_bp.route('/logout', methods=['POST'])
def logout():
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if raw_token:
        token_hash = _hash_token(raw_token)
        refresh = RefreshToken.query.filter_by(token_hash=token_hash).first()
        if refresh and not refresh.revoked_at:
            refresh.revoked_at = datetime.datetime.utcnow()
            db.session.commit()

    response = make_response(jsonify({'message': 'Logged out successfully'}), 200)
    _clear_refresh_cookie(response)
    return response


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    raw_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not raw_token:
        response = make_response(jsonify({'message': 'Missing refresh token'}), 401)
        _clear_refresh_cookie(response)
        return response

    token_hash = _hash_token(raw_token)
    refresh_record = RefreshToken.query.filter_by(token_hash=token_hash).first()
    now = datetime.datetime.utcnow()

    if not refresh_record or refresh_record.revoked_at or refresh_record.expires_at <= now:
        if refresh_record and not refresh_record.revoked_at:
            refresh_record.revoked_at = now
            db.session.commit()
        response = make_response(jsonify({'message': 'Invalid refresh token'}), 401)
        _clear_refresh_cookie(response)
        return response

    new_raw_token = secrets.token_urlsafe(48)
    new_token_hash = _hash_token(new_raw_token)
    new_refresh = RefreshToken(
        user_id=refresh_record.user_id,
        token_hash=new_token_hash,
        expires_at=now + datetime.timedelta(days=REFRESH_TOKEN_DAYS)
    )
    db.session.add(new_refresh)
    refresh_record.revoked_at = now
    refresh_record.replaced_by_token = new_token_hash
    db.session.commit()

    access_token = _create_access_token(refresh_record.user_id)
    response = make_response(jsonify({'token': access_token}))
    _set_refresh_cookie(response, new_raw_token)
    return response
