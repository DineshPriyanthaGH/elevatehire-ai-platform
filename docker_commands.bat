@echo off
REM Docker Commands Helper for ElevateHire AI
REM Use this file to manage Docker containers easily

echo ========================================
echo ElevateHire AI Docker Commands Helper
echo ========================================
echo.

if "%1"=="build" (
    echo Building Docker containers...
    docker-compose build
) else if "%1"=="up" (
    echo Starting all services...
    docker-compose up -d
) else if "%1"=="down" (
    echo Stopping all services...
    docker-compose down
) else if "%1"=="logs" (
    echo Showing logs for %2...
    if "%2"=="" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %2
    )
) else if "%1"=="shell" (
    echo Opening shell in %2 container...
    if "%2"=="backend" (
        docker-compose exec backend python manage.py shell
    ) else if "%2"=="db" (
        docker-compose exec db psql -U postgres elevatehire_db
    ) else (
        docker-compose exec %2 sh
    )
) else if "%1"=="migrate" (
    echo Running Django migrations...
    docker-compose exec backend python manage.py migrate
) else if "%1"=="makemigrations" (
    echo Creating Django migrations...
    docker-compose exec backend python manage.py makemigrations
) else if "%1"=="createsuperuser" (
    echo Creating Django superuser...
    docker-compose exec backend python manage.py createsuperuser
) else if "%1"=="restart" (
    echo Restarting %2 service...
    docker-compose restart %2
) else if "%1"=="status" (
    echo Showing container status...
    docker-compose ps
) else (
    echo Usage: docker_commands.bat [command] [service]
    echo.
    echo Available commands:
    echo   build              - Build all containers
    echo   up                - Start all services
    echo   down              - Stop all services
    echo   logs [service]    - Show logs
    echo   shell [service]   - Open shell in container
    echo   migrate           - Run Django migrations
    echo   makemigrations    - Create Django migrations
    echo   createsuperuser   - Create Django superuser
    echo   restart [service] - Restart specific service
    echo   status            - Show container status
    echo.
    echo Examples:
    echo   docker_commands.bat build
    echo   docker_commands.bat up
    echo   docker_commands.bat logs backend
    echo   docker_commands.bat shell backend
)
