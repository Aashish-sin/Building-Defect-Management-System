import datetime
import bcrypt
from extensions import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.Enum('admin', 'csr', 'building_executive', 'technician', name='user_roles'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class Building(db.Model):
    __tablename__ = 'buildings'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class BuildingUser(db.Model):
    __tablename__ = 'building_users'
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.Enum('manager', 'engineer', name='building_user_roles'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    __table_args__ = (db.UniqueConstraint('building_id', 'user_id'),)

class Defect(db.Model):
    __tablename__ = 'defects'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('Open', 'Reviewed', 'Ongoing', 'Done', 'Completed', name='defect_statuses'), default='Open', nullable=False)
    priority = db.Column(db.Enum('low', 'medium', 'high', name='defect_priorities'), nullable=False)
    image_url = db.Column(db.String, nullable=True)
    initial_report_image = db.Column(db.Text, nullable=True)
    technician_report_image = db.Column(db.Text, nullable=True)
    building_id = db.Column(db.Integer, db.ForeignKey('buildings.id'), nullable=False)
    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    assigned_technician_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    external_contractor = db.Column(db.Boolean, default=False)
    contractor_name = db.Column(db.String, nullable=True)
    done_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    reporter = db.relationship('User', foreign_keys=[reporter_id])
    reviewer = db.relationship('User', foreign_keys=[reviewed_by_id])
    technician = db.relationship('User', foreign_keys=[assigned_technician_id])
    building = db.relationship('Building', backref=db.backref('defects', lazy=True))


class DefectComment(db.Model):
    __tablename__ = 'defect_comments'
    id = db.Column(db.Integer, primary_key=True)
    defect_id = db.Column(db.Integer, db.ForeignKey('defects.id'), nullable=False)
    # Keep `csr_prognosis` as a synonym for legacy clients, while
    # storing data in the renamed `initial_report` column.
    initial_report = db.Column(db.Text, nullable=True)
    csr_prognosis = db.synonym('initial_report')
    executive_decision = db.Column(db.Text, nullable=True)
    technician_report = db.Column(db.Text, nullable=True)
    verification_report = db.Column(db.Text, nullable=True)
    final_completion = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    defect = db.relationship(
        'Defect',
        backref=db.backref('comments', lazy=True, cascade='all, delete-orphan')
    )
