# Contributing to FBR Invoicing Application

Thank you for your interest in contributing to the FBR Invoicing Application! We welcome contributions from the community and are pleased to have you join us.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Submitting Changes](#submitting-changes)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/FBR-invoicing-app.git
   cd FBR-invoicing-app
   ```
3. Set up the development environment following our [Setup Guide](SETUP_GUIDE.md)
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

Please refer to our [Complete Setup Guide](SETUP_GUIDE.md) for detailed instructions on setting up the development environment.

### Quick Setup

```bash
# Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
npm run generate-client
```

## 🔄 Making Changes

### Branch Naming Convention

- `feature/description` - for new features
- `bugfix/description` - for bug fixes
- `hotfix/description` - for urgent fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(invoices): add PDF export functionality`
- `fix(auth): resolve token expiration issue`
- `docs(readme): update installation instructions`
- `refactor(api): improve error handling`

## 📤 Submitting Changes

1. **Test your changes**: Ensure all tests pass and add new tests if needed
2. **Update documentation**: Update relevant documentation for your changes
3. **Commit your changes**: Use clear, descriptive commit messages
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**: Submit a PR with a clear title and description

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly mark any breaking changes

## 🎨 Code Style Guidelines

### Backend (Python)

- Follow [PEP 8](https://pep8.org/) style guide
- Use [Black](https://black.readthedocs.io/) for code formatting
- Use [isort](https://pycqa.github.io/isort/) for import sorting
- Use type hints where appropriate
- Maximum line length: 88 characters

```bash
# Format code
black .
isort .

# Lint code
flake8 .
mypy .
```

### Frontend (TypeScript/React)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use [Prettier](https://prettier.io/) for code formatting
- Use [ESLint](https://eslint.org/) for linting
- Use TypeScript strict mode
- Prefer functional components with hooks

```bash
# Format and lint
npm run lint
npm run format
```

### General Guidelines

- Write self-documenting code with clear variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow the existing code patterns in the project

## 🧪 Testing

### Backend Testing

```bash
cd backend
pytest

# With coverage
pytest --cov=app
```

### Frontend Testing

```bash
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### Test Guidelines

- Write tests for new features and bug fixes
- Maintain or improve test coverage
- Use descriptive test names
- Test both happy path and edge cases

## 📚 Documentation

- Update relevant documentation for your changes
- Use clear, concise language
- Include code examples where helpful
- Update API documentation for backend changes

## 🐛 Reporting Issues

When reporting issues, please include:

- **Environment**: OS, Python version, Node.js version
- **Steps to reproduce**: Clear steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable
- **Error messages**: Full error messages and stack traces

## 💡 Feature Requests

When requesting features:

- **Use case**: Explain why this feature would be useful
- **Description**: Detailed description of the proposed feature
- **Alternatives**: Any alternative solutions you've considered
- **Implementation**: If you have ideas about implementation

## 🏷️ Labels

We use the following labels to categorize issues and PRs:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 🤝 Getting Help

If you need help:

1. Check the [Setup Guide](SETUP_GUIDE.md)
2. Search existing issues
3. Create a new issue with the `help wanted` label
4. Join our community discussions

## 🙏 Recognition

Contributors will be recognized in:

- The project's README
- Release notes for significant contributions
- Our contributors page

Thank you for contributing to the FBR Invoicing Application! 🎉