# Dependency Installation Guide

This document provides the correct sequence for installing all dependencies for the FBR Invoicing Application to avoid conflicts.

## Prerequisites

- Python 3.11+ installed
- Node.js 18+ installed
- PostgreSQL database running
- Virtual environment activated

## Backend Dependencies Installation Sequence

### Step 1: Core Framework Dependencies
Install these first as they form the foundation:

```bash
cd backend
python -m pip install fastapi>=0.104.0
python -m pip install uvicorn[standard]>=0.24.0
python -m pip install pydantic>=2.4.0
python -m pip install pydantic-settings>=2.0.0
```

### Step 2: Database Dependencies
Install database-related packages:

```bash
python -m pip install sqlmodel>=0.0.8
python -m pip install psycopg[binary]>=3.1.7
python -m pip install alembic>=1.12.0
```

### Step 3: Authentication & Security
Install security-related packages:

```bash
python -m pip install PyJWT>=2.8.0
python -m pip install passlib[bcrypt]>=1.7.4
python -m pip install bcrypt>=4.0.1
```

### Step 4: HTTP & Communication
Install HTTP and communication packages:

```bash
python -m pip install httpx>=0.25.0
python -m pip install requests>=2.31.0
python -m pip install emails>=0.6.0
```

### Step 5: File Processing Dependencies
Install file processing packages:

```bash
python -m pip install openpyxl>=3.1.2
python -m pip install pandas>=2.0.0
python -m pip install reportlab>=4.0.0
```

### Step 6: Additional Utilities
Install remaining utility packages:

```bash
python -m pip install python-multipart>=0.0.5
python -m pip install email-validator>=2.0.0
python -m pip install tenacity>=8.2.0
python -m pip install jinja2>=3.1.2
python -m pip install sentry-sdk[fastapi]>=1.32.0
python -m pip install python-dateutil>=2.8.0
python -m pip install xmltodict>=0.13.0
python -m pip install lxml>=4.9.0
```

### Alternative: Install All at Once
After updating `pyproject.toml`, you can install all dependencies:

```bash
python -m pip install -e .
```

## Frontend Dependencies Installation Sequence

### Step 1: Install Core Dependencies
Navigate to frontend directory and install base packages:

```bash
cd frontend
npm install
```

### Step 2: Install Additional FBR-Specific Dependencies
Install packages for enhanced functionality:

```bash
npm install @tanstack/react-table@^8.20.5
npm install react-datepicker@^7.5.0
npm install react-dropzone@^14.3.5
npm install @hookform/resolvers@^3.10.0
npm install zod@^3.24.1
npm install date-fns@^4.1.0
npm install react-select@^5.8.3
npm install react-number-format@^5.4.2
npm install file-saver@^2.0.5
npm install xlsx@^0.18.5
npm install jspdf@^2.5.2
npm install html2canvas@^1.4.1
```

### Step 3: Install Type Definitions
Install TypeScript type definitions:

```bash
npm install --save-dev @types/file-saver@^2.0.7
```

## Troubleshooting Common Issues

### Backend Issues

1. **ModuleNotFoundError for 'jwt'**
   - Solution: Install PyJWT explicitly: `pip install PyJWT>=2.8.0`

2. **ModuleNotFoundError for 'passlib'**
   - Solution: Install with bcrypt support: `pip install passlib[bcrypt]>=1.7.4`

3. **ModuleNotFoundError for 'emails'**
   - Solution: Install emails package: `pip install emails>=0.6.0`

4. **Dependency resolution conflicts**
   - Solution: Install packages individually in the specified order
   - Use version constraints as specified in pyproject.toml

### Frontend Issues

1. **npm vulnerabilities**
   - Run `npm audit fix` to resolve non-breaking vulnerabilities
   - For critical issues, run `npm audit fix --force` (use with caution)

2. **Type definition conflicts**
   - Some packages now include their own types
   - Remove conflicting @types packages if they exist

## Verification Steps

### Backend Verification
```bash
cd backend
python -c "import fastapi, sqlmodel, jwt, passlib, emails; print('All imports successful')"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Verification
```bash
cd frontend
npm run dev
```

## Environment Configuration

Ensure your `.env` file contains:

```env
# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changethis

# Security
SECRET_KEY=changethis
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changethis

# Backend URL
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

## Success Indicators

- Backend server starts without import errors
- Frontend development server starts successfully
- No dependency conflicts reported
- Both servers accessible at their respective URLs:
  - Backend: http://localhost:8000
  - Frontend: http://localhost:5173

## Notes

- Always activate your virtual environment before installing backend dependencies
- Use the exact version constraints specified to avoid conflicts
- Install dependencies in the specified order to prevent resolution issues
- Keep this document updated when adding new dependencies