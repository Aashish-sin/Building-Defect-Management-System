from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from sqlalchemy import text

load_dotenv()

from extensions import db, migrate

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    CORS(app, origins=["http://localhost:5173", "http://localhost:3000"], supports_credentials=True)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    postgres_default = "postgresql://postgres:postgres@localhost:5432/building_defect_db"

    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', postgres_default),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )

    db.init_app(app)
    migrate.init_app(app, db)

    from models import User, RefreshToken, Building, Defect, DefectComment
    from routes.auth import auth_bp
    from routes.defects import defects_bp
    from routes.buildings import buildings_bp
    from routes.analytics import analytics_bp
    from routes.users import users_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(defects_bp, url_prefix='/api/defects')
    app.register_blueprint(buildings_bp, url_prefix='/api/buildings')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(users_bp, url_prefix='/api/users')

    @app.route('/')
    def index():
        return "<h1>Defect Management API</h1>"

    @app.cli.command("sync-sequences")
    def sync_sequences():
        """Fixes the PostgreSQL sequences to match the max ID in tables."""
        tables = ['users', 'refresh_tokens', 'buildings', 'defects', 'defect_comments']
        for table in tables:
            try:
                sql = text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), coalesce(max(id)+1, 1), false) FROM {table};")
                db.session.execute(sql)
                db.session.commit()
                print(f"Synced sequence for {table}")
            except Exception as e:
                print(f"Error syncing {table}: {e}")

    return app

if __name__ == '__main__':
    app = create_app()
    app.run()
