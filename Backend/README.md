# Building Defect Management System - Backend

A Flask-based REST API for managing building defects with role-based access control.

## Technologies Used

- Python 3.x
- Flask
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Flask-CORS
- Flask-Migrate

## Features

- JWT token-based authentication
- Role-based authorization (Admin, CSR, Building Executive, Technician)
- Full CRUD operations for defects, buildings, and users
- Structured comment system for defect lifecycle tracking
- Analytics endpoints for reporting

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL database
- pip

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Backend
```

2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database

```bash
flask db upgrade
```

6. Run the application

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Defects

- `GET /api/defects` - List all defects (role-based filtering)
- `POST /api/defects` - Create new defect
- `GET /api/defects/:id` - Get defect details
- `PUT /api/defects/:id` - Update defect
- `DELETE /api/defects/:id` - Delete defect (admin only)
- `PATCH /api/defects/:id/review` - Review defect
- `PATCH /api/defects/:id/assign` - Assign technician
- `PATCH /api/defects/:id/ongoing` - Mark as ongoing
- `PATCH /api/defects/:id/done` - Mark as done
- `PATCH /api/defects/:id/complete` - Mark as completed
- `PATCH /api/defects/:id/reopen` - Reopen defect

### Comments

- `GET /api/defects/:id/comments` - Get defect comments
- `POST /api/defects/:id/comments` - Update defect comments

### Buildings

- `GET /api/buildings` - List all buildings
- `POST /api/buildings` - Create building (admin only)
- `GET /api/buildings/:id` - Get building details
- `PUT /api/buildings/:id` - Update building (admin only)
- `DELETE /api/buildings/:id` - Delete building (admin only)
- `GET /api/buildings/:id/users` - List building users
- `POST /api/buildings/:id/users` - Assign user to building
- `DELETE /api/buildings/:id/users/:userId` - Remove user from building

### Users

- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get user details (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/users/technicians` - List technicians

### Analytics

- `GET /api/analytics/defects-per-building` - Defects count per building (admin only)
- `GET /api/analytics/defects-status` - Defects count by status (admin only)

## User Roles

### Admin

- Full access to all features
- Can create, read, update, and delete all data
- Only role that can delete defects
- Access to analytics dashboard

### CSR (Customer Service Representative)

- Create and read defects for all buildings
- Add initial prognosis
- Cannot assign, update, or delete defects

### Building Executive

- Create, read, and update defects for all buildings
- Review and assign defects
- Mark defects as completed
- Cannot delete defects

### Technician

- Read and update assigned defects only
- Mark defects as ongoing/done
- Add technical reports
- Limited to assigned buildings

## Database Schema

### Users

- id, name, email, password (hashed), role, created_at, updated_at

### Buildings

- id, name, address, created_at, updated_at

### Building Users

- id, building_id, user_id, role (manager/engineer), created_at

### Defects

- id, title, description, status, priority, image_url, building_id, reporter_id, reviewed_by_id, assigned_technician_id, external_contractor, contractor_name, done_at, completed_at, created_at, updated_at

### Defect Comments

- id, defect_id, csr_prognosis, executive_decision, technician_report, verification_report, final_completion, created_at, updated_at

## Frontend Repository

[Link to Frontend Repository](https://github.com/yourusername/building-defect-frontend)

## License

MIT
