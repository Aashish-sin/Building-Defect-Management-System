# Project 4 Building Defect Management System

A Flask-based REST API for managing building defects with role-based access control.

## Screenshot of App

![alt text](image.png)

## Technologies Used

- Python 3.x
- Flask
- PostgreSQL
- SQLAlchemy as ORM
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

## .env Keys

### Backend (.env)

- `DATABASE_URL`: PostgreSQL connection string. Example: `postgresql://user:password@localhost:5432/building_defect_db`
- `SECRET_KEY`: Flask secret used for JWT signing and session security

### Frontend (Frontend/.env)

- `VITE_API_URL`: API base URL used by the frontend. Defaults to `http://localhost:5000/api` if not set.

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
- `PATCH /api/defects/:id/comments` - Update defect comments

### Buildings

- `GET /api/buildings` - List all buildings
- `POST /api/buildings` - Create building (admin only)
- `GET /api/buildings/:id` - Get building details
- `PUT /api/buildings/:id` - Update building (admin only)
- `DELETE /api/buildings/:id` - Delete building (admin only)

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
- Can view all buildings

## Database Schema

### Users

- id, name, email, password (hashed), role, created_at, updated_at

### Buildings

- id, name, address, created_at, updated_at

### Defects

- id, title, description, status, priority, image_url, building_id, reporter_id, reviewed_by_id, assigned_technician_id, external_contractor, contractor_name, done_at, completed_at, created_at, updated_at

### Defect Comments

- id, defect_id, csr_prognosis, executive_decision, technician_report, verification_report, final_completion, created_at, updated_at

## Entire Data Model

![alt text](image-1.png)

## Frontend Repository

https://github.com/Aashish-sin/Building-Defect-Management-System/tree/main/Frontend

## Component Tree

```text
App
├── Auth
└── Layout
    ├── TopNav
    ├── Sidebar
    ├── MobileNav
    └── [Routes]
        ├── Dashboard
        │   └── Analytics
        ├── DefectList
        │   ├── SearchInput
        │   └── Pagination
        ├── DefectDetail
        ├── DefectForm
        ├── Buildings
        └── Users

Shared UI Components:
├── Alert, Badge, Button, Input
├── LoadingSkeleton, LoadingSpinner
├── Modal, Pagination, PasswordInput
├── SearchInput, Select, Textarea, Toast
```

## Future Updates

- Work to allow system to be more robust : Add more user types and allow for restriction technicaian to be based on building if needed
- Work on a simple mobile version for more seamless defect logging

## License

MIT
