# Dependencies Management Guide

This guide provides comprehensive information about managing dependencies for the FBR Invoicing Application.

## Overview

The FBR Invoicing Application consists of two main components:
- **Backend**: FastAPI-based REST API (Python)
- **Frontend**: React-based web application (TypeScript/JavaScript)

Each component has its own set of dependencies that must be installed in a specific order to avoid conflicts.

## Quick Start

### Automated Installation

#### Backend Dependencies
```bash
cd backend
python install_dependencies.py
```

#### Frontend Dependencies
```bash
cd frontend
npm run install-deps
# or
node install_dependencies.js
```

### Manual Installation
Refer to `DEPENDENCY_INSTALLATION.md` for detailed manual installation steps.

## Backend Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|----------|
| fastapi | >=0.104.0 | Web framework |
| uvicorn | >=0.24.0 | ASGI server |
| pydantic | >=2.4.0 | Data validation |
| sqlmodel | >=0.0.8 | Database ORM |
| psycopg | >=3.1.7 | PostgreSQL adapter |
| alembic | >=1.12.0 | Database migrations |

### Authentication & Security

| Package | Version | Purpose |
|---------|---------|----------|
| PyJWT | >=2.8.0 | JWT token handling |
| passlib | >=1.7.4 | Password hashing |
| bcrypt | >=4.0.1 | Encryption |

### File Processing

| Package | Version | Purpose |
|---------|---------|----------|
| openpyxl | >=3.1.2 | Excel file processing |
| pandas | >=2.0.0 | Data manipulation |
| reportlab | >=4.0.0 | PDF generation |
| lxml | >=4.9.0 | XML processing |
| xmltodict | >=0.13.0 | XML to dict conversion |

### Communication

| Package | Version | Purpose |
|---------|---------|----------|
| httpx | >=0.25.0 | HTTP client |
| requests | >=2.31.0 | HTTP requests |
| emails | >=0.6.0 | Email functionality |

## Frontend Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|----------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| @tanstack/react-router | 1.19.1 | Routing |
| @tanstack/react-query | ^5.28.14 | Data fetching |
| @chakra-ui/react | ^3.8.0 | UI components |

### Form Handling

| Package | Version | Purpose |
|---------|---------|----------|
| react-hook-form | ^7.54.2 | Form management |
| @hookform/resolvers | ^3.10.0 | Form validation |
| zod | ^3.24.1 | Schema validation |

### Data Display

| Package | Version | Purpose |
|---------|---------|----------|
| @tanstack/react-table | ^8.20.5 | Data tables |
| react-datepicker | ^7.5.0 | Date selection |
| react-select | ^5.8.3 | Select components |
| react-number-format | ^5.4.2 | Number formatting |

### File Operations

| Package | Version | Purpose |
|---------|---------|----------|
| react-dropzone | ^14.3.5 | File upload |
| file-saver | ^2.0.5 | File download |
| xlsx | ^0.18.5 | Excel processing |
| jspdf | ^2.5.2 | PDF generation |
| html2canvas | ^1.4.1 | HTML to canvas |

### Utilities

| Package | Version | Purpose |
|---------|---------|----------|
| date-fns | ^4.1.0 | Date utilities |
| axios | 1.9.0 | HTTP client |
| react-icons | ^5.4.0 | Icon library |

## Installation Scripts

### Backend Installation Script

**File**: `backend/install_dependencies.py`

**Features**:
- Installs dependencies in correct order
- Handles conflicts automatically
- Verifies installation success
- Provides detailed error messages

**Usage**:
```bash
cd backend
python install_dependencies.py
```

### Frontend Installation Script

**File**: `frontend/install_dependencies.js`

**Features**:
- Installs all required packages
- Checks for vulnerabilities
- Provides installation progress
- Handles errors gracefully

**Usage**:
```bash
cd frontend
npm run install-deps
```

## Troubleshooting

### Common Backend Issues

1. **Import Errors**
   - Ensure virtual environment is activated
   - Run the installation script again
   - Check Python version (3.11+ required)

2. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

3. **Dependency Conflicts**
   - Use the provided installation script
   - Install packages in the specified order
   - Consider using a fresh virtual environment

### Common Frontend Issues

1. **Build Errors**
   - Clear node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall: `npm install`
   - Check Node.js version (18+ required)

2. **Type Errors**
   - Ensure all @types packages are installed
   - Run `npm run generate-client` to update API types

3. **Vulnerabilities**
   - Run `npm audit fix` for automatic fixes
   - Use `npm audit fix --force` for breaking changes (caution)

## Development Workflow

### Initial Setup
1. Clone the repository
2. Set up virtual environment (backend)
3. Install backend dependencies
4. Install frontend dependencies
5. Configure environment variables
6. Run database migrations
7. Start both servers

### Adding New Dependencies

#### Backend
1. Add to `pyproject.toml`
2. Update installation script if needed
3. Test installation order
4. Update documentation

#### Frontend
1. Install with npm: `npm install package-name`
2. Update installation script if needed
3. Add to documentation
4. Test build process

## Environment Variables

Ensure your `.env` file contains all required variables:

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

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

## Version Management

### Backend
- Use `pyproject.toml` for dependency specification
- Pin major versions, allow minor updates
- Test compatibility before updating

### Frontend
- Use `package.json` for dependency specification
- Use `package-lock.json` for exact versions
- Regular security updates with `npm audit`

## Support

For issues related to dependencies:
1. Check this documentation
2. Review error messages carefully
3. Use the provided installation scripts
4. Ensure environment requirements are met
5. Consider creating a fresh environment

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Run security audits
- Test installation scripts
- Update documentation
- Monitor for deprecation warnings

### Before Production
- Freeze all dependency versions
- Run full test suite
- Perform security audit
- Document any custom configurations
- Test deployment process