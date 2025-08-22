#!/usr/bin/env python3
"""
Backend Dependencies Installation Script

This script installs all backend dependencies in the correct order to avoid conflicts.
Run this script from the backend directory with your virtual environment activated.

Usage:
    python install_dependencies.py
"""

import subprocess
import sys


def run_pip_install(packages: list[str], description: str) -> bool:
    """
    Install a list of packages using pip.

    Args:
        packages: List of package specifications
        description: Description of what's being installed

    Returns:
        True if successful, False otherwise
    """
    print(f"\n{'='*60}")
    print(f"Installing {description}...")
    print(f"{'='*60}")

    for package in packages:
        print(f"Installing {package}...")
        try:
            subprocess.run(
                [sys.executable, "-m", "pip", "install", package],
                check=True,
                capture_output=True,
                text=True
            )
            print(f"✅ Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install {package}")
            print(f"Error: {e.stderr}")
            return False

    return True


def verify_installation(packages: list[str]) -> bool:
    """
    Verify that packages can be imported.

    Args:
        packages: List of package names to verify

    Returns:
        True if all packages can be imported, False otherwise
    """
    print(f"\n{'='*60}")
    print("Verifying installation...")
    print(f"{'='*60}")

    for package in packages:
        try:
            __import__(package)
            print(f"✅ {package} imported successfully")
        except ImportError:
            print(f"❌ Failed to import {package}")
            return False

    return True


def main():
    """
    Main installation function.
    """
    print("FBR Invoicing App - Backend Dependencies Installation")
    print("=====================================================")

    # Define installation groups in order
    installation_groups = [
        (
            "Core Framework Dependencies",
            [
                "fastapi>=0.104.0",
                "uvicorn[standard]>=0.24.0",
                "pydantic>=2.4.0",
                "pydantic-settings>=2.0.0"
            ]
        ),
        (
            "Database Dependencies",
            [
                "sqlmodel>=0.0.8",
                "psycopg[binary]>=3.1.7",
                "alembic>=1.12.0"
            ]
        ),
        (
            "Authentication & Security",
            [
                "PyJWT>=2.8.0",
                "passlib[bcrypt]>=1.7.4",
                "bcrypt>=4.0.1"
            ]
        ),
        (
            "HTTP & Communication",
            [
                "httpx>=0.25.0",
                "requests>=2.31.0",
                "emails>=0.6.0"
            ]
        ),
        (
            "File Processing Dependencies",
            [
                "openpyxl>=3.1.2",
                "pandas>=2.0.0",
                "reportlab>=4.0.0"
            ]
        ),
        (
            "Additional Utilities",
            [
                "python-multipart>=0.0.5",
                "email-validator>=2.0.0",
                "tenacity>=8.2.0",
                "jinja2>=3.1.2",
                "sentry-sdk[fastapi]>=1.32.0",
                "python-dateutil>=2.8.0",
                "xmltodict>=0.13.0",
                "lxml>=4.9.0"
            ]
        )
    ]

    # Install each group
    for description, packages in installation_groups:
        if not run_pip_install(packages, description):
            print(f"\n❌ Installation failed at: {description}")
            sys.exit(1)

    # Verify critical imports
    critical_packages = [
        "fastapi",
        "sqlmodel",
        "jwt",
        "passlib",
        "emails",
        "openpyxl",
        "pandas",
        "reportlab"
    ]

    if verify_installation(critical_packages):
        print(f"\n{'='*60}")
        print("🎉 All dependencies installed successfully!")
        print("You can now start the backend server with:")
        print("python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        print(f"{'='*60}")
    else:
        print("\n❌ Some packages failed verification")
        sys.exit(1)


if __name__ == "__main__":
    main()
