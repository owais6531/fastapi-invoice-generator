# Complete Setup Guide for FBR Invoicing Application

This guide will help you set up the FBR Invoicing Application on any machine from scratch.

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Python 3.11+** - [Download from python.org](https://www.python.org/downloads/)
- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** - [Download from postgresql.org](https://www.postgresql.org/download/)
- **Git** - [Download from git-scm.com](https://git-scm.com/downloads)

### Optional but Recommended
- **Docker Desktop** - For containerized development
- **VS Code** - Recommended IDE with extensions for Python and TypeScript

## Quick Setup (Automated)

For Windows users, you can use the automated setup:

```bash
# Clone the repository
git clone <your-repository-url>
cd FBR-invoicing-app

# Run automated installation
install_all_dependencies.bat
```

## Manual Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd FBR-invoicing-app
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE fbr_invoicing;
CREATE USER fbr_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fbr_invoicing TO fbr_user;
```

#### Option B: Docker PostgreSQL
```bash
docker run --name fbr-postgres -e POSTGRES_DB=fbr_invoicing -e POSTGRES_USER=fbr_user -e POSTGRES_PASSWORD=your_password -p 5432:5432 -d postgres:14
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# OR using uv (faster):
pip install uv
uv pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your database credentials

# Run database migrations
alembic upgrade head

# Create initial data (optional)
python app/initial_data.py
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your API URL

# Generate API client
npm run generate-client
```

### 5. Environment Configuration

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://fbr_user:your_password@localhost:5432/fbr_invoicing

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (optional)
SMTP_TLS=True
SMTP_SSL=False
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# FBR API Configuration
FBR_API_URL=https://api.fbr.gov.pk
FBR_API_KEY=your-fbr-api-key

# Environment
ENVIRONMENT=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
# Activate virtual environment first
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Server
```bash
cd frontend
npm run dev
```

#### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Mode

#### Using Docker Compose
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Development Workflow

### Code Quality Tools

#### Backend
```bash
cd backend

# Linting
ruff check .
ruff format .

# Type checking
mypy .

# Testing
pytest

# Coverage
coverage run -m pytest
coverage report
```

#### Frontend
```bash
cd frontend

# Linting and formatting
npm run lint

# Type checking
npm run build

# Testing
npm run test
```

### Database Migrations

```bash
cd backend

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in .env file
   - Ensure database exists

2. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version: `node --version`
   - Regenerate API client: `npm run generate-client`

3. **Backend Import Errors**
   - Verify virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`
   - Check Python version: `python --version`

4. **Port Already in Use**
   - Backend: Change port in uvicorn command
   - Frontend: Set PORT environment variable

### Getting Help

- Check the [Development Guide](development.md) for detailed development instructions
- Review [Dependency Installation Guide](DEPENDENCY_INSTALLATION.md) for dependency issues
- Check GitHub Issues for known problems

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Chakra UI Documentation](https://chakra-ui.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.