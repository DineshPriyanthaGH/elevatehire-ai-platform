#!/usr/bin/env python
"""
ElevateHire AI Backend Setup Script
This script automates the Django backend setup process
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"\n{'='*60}")
    print(f"RUNNING: {description}")
    print(f"Command: {command}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"SUCCESS: {description}")
        if result.stdout:
            print("Output:", result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERROR: {description}")
        print(f"Return code: {e.returncode}")
        if e.stdout:
            print("Stdout:", e.stdout)
        if e.stderr:
            print("Stderr:", e.stderr)
        return False

def main():
    """Main setup function"""
    print("ElevateHire AI Backend Setup")
    print("=" * 40)
    
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print(f"Working directory: {os.getcwd()}")
    
    # Setup steps
    steps = [
        ("python manage.py makemigrations", "Creating initial migrations"),
        ("python manage.py makemigrations authentication", "Creating authentication migrations"),
        ("python manage.py migrate", "Applying database migrations"),
    ]
    
    # Execute each step
    for command, description in steps:
        success = run_command(command, description)
        if not success:
            print(f"\nSetup failed at step: {description}")
            print("Please check the error messages above and resolve any issues.")
            return False
    
    print("\n" + "="*60)
    print("SETUP COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\nNext steps:")
    print("1. Create a superuser: python manage.py createsuperuser")
    print("2. Start the development server: python manage.py runserver")
    print("3. Test the API endpoints with Postman")
    print("\nAPI Base URL: http://127.0.0.1:8000")
    
    return True

if __name__ == "__main__":
    main()
