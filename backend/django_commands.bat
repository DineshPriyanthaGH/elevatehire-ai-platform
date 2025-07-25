@echo off
REM Django Commands Helper for ElevateHire AI
REM Use this file to run Django commands easily

set PYTHON_PATH="D:/programming_II/ElevateHire AI/elevatehire-ai/.venv/Scripts/python.exe"

echo ========================================
echo ElevateHire AI Django Commands Helper
echo ========================================
echo.
echo Available commands:
echo 1. runserver    - Start development server
echo 2. migrate      - Run database migrations  
echo 3. makemigrations - Create new migrations
echo 4. createsuperuser - Create admin user
echo 5. shell        - Open Django shell
echo 6. check        - Check for issues
echo.

if "%1"=="runserver" (
    echo Starting Django development server...
    %PYTHON_PATH% manage.py runserver
) else if "%1"=="migrate" (
    echo Running migrations...
    %PYTHON_PATH% manage.py migrate
) else if "%1"=="makemigrations" (
    echo Creating migrations...
    %PYTHON_PATH% manage.py makemigrations
) else if "%1"=="createsuperuser" (
    echo Creating superuser...
    %PYTHON_PATH% manage.py createsuperuser
) else if "%1"=="shell" (
    echo Opening Django shell...
    %PYTHON_PATH% manage.py shell
) else if "%1"=="check" (
    echo Checking Django configuration...
    %PYTHON_PATH% manage.py check
) else (
    echo Usage: django_commands.bat [command]
    echo Example: django_commands.bat runserver
)
