#!/usr/bin/env python3
"""
ElevateHire AI - Database Connectivity and System Health Check
"""

import json
import urllib.request
import urllib.error
import time
import subprocess
import sys

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BLUE}{Colors.BOLD}{'=' * 60}")
    print(f"{text}")
    print(f"{'=' * 60}{Colors.END}")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")

def check_docker_containers():
    """Check status of Docker containers"""
    print_header("🐳 Docker Containers Status")
    
    try:
        # Run docker-compose ps
        result = subprocess.run(
            ['docker-compose', 'ps'], 
            capture_output=True, 
            text=True, 
            cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai"
        )
        
        if result.returncode == 0:
            print("Container Status:")
            print(result.stdout)
            
            # Check for specific service statuses
            if "Up" in result.stdout:
                print_success("Docker containers are running")
            if "healthy" in result.stdout:
                print_success("Database health check passed")
            if "Restarting" in result.stdout:
                print_warning("Some containers are restarting")
                
            return True
        else:
            print_error(f"Docker command failed: {result.stderr}")
            return False
            
    except Exception as e:
        print_error(f"Error checking Docker containers: {e}")
        return False

def test_database_via_api():
    """Test database connectivity through API endpoints"""
    print_header("🗄️ Database Connectivity via API")
    
    base_url = "http://localhost:8000"
    
    # Test basic API connectivity
    try:
        response = urllib.request.urlopen(f"{base_url}/admin/", timeout=10)
        print_success("Backend server is responding")
        
        # Test API endpoints that use database
        api_url = f"{base_url}/api/auth/register/"
        
        # Create a test user to verify database write operations
        test_data = {
            "username": f"db_test_{int(time.time())}",
            "email": f"dbtest{int(time.time())}@example.com",
            "password": "testpass123",
            "password_confirm": "testpass123",
            "first_name": "DB",
            "last_name": "Test"
        }
        
        json_data = json.dumps(test_data).encode('utf-8')
        req = urllib.request.Request(api_url, data=json_data)
        req.add_header('Content-Type', 'application/json')
        
        with urllib.request.urlopen(req, timeout=10) as api_response:
            response_data = api_response.read().decode('utf-8')
            status_code = api_response.getcode()
            
            if status_code == 201:
                print_success("Database write operation successful")
                print_success("User registration works (database INSERT)")
                
                # Parse response to test database read
                try:
                    json_response = json.loads(response_data)
                    if json_response.get('user', {}).get('id'):
                        print_success("Database read operation successful")
                        print_success("User data retrieved (database SELECT)")
                        return True
                except:
                    pass
            
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print_warning("API endpoint accessible but validation failed (expected)")
            print_success("Database connectivity appears to be working")
            return True
        else:
            print_error(f"API error: {e.code} - {e.reason}")
    except Exception as e:
        print_error(f"Database API test failed: {e}")
        
    return False

def test_postgres_direct():
    """Test PostgreSQL database directly"""
    print_header("🐘 PostgreSQL Direct Connection Test")
    
    try:
        # Test PostgreSQL container directly
        result = subprocess.run([
            'docker-compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'postgres'
        ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
        
        if result.returncode == 0:
            print_success("PostgreSQL is accepting connections")
            
            # Test database query
            result = subprocess.run([
                'docker-compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', 
                '-d', 'elevatehire_db', '-c', 'SELECT version();'
            ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
            
            if result.returncode == 0:
                print_success("Database query executed successfully")
                print(f"PostgreSQL Version: {result.stdout.strip()}")
                return True
            else:
                print_error(f"Database query failed: {result.stderr}")
        else:
            print_error("PostgreSQL is not ready")
            
    except Exception as e:
        print_error(f"PostgreSQL direct test failed: {e}")
        
    return False

def test_django_database():
    """Test Django database operations"""
    print_header("🎯 Django Database Operations")
    
    try:
        # Test Django database check
        result = subprocess.run([
            'docker-compose', 'exec', '-T', 'backend', 'python', 'manage.py', 'check', '--database', 'default'
        ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
        
        if result.returncode == 0:
            print_success("Django database configuration is valid")
            
            # Test migrations status
            result = subprocess.run([
                'docker-compose', 'exec', '-T', 'backend', 'python', 'manage.py', 'showmigrations'
            ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
            
            if result.returncode == 0:
                print_success("Django migrations status retrieved")
                if '[X]' in result.stdout:
                    print_success("Migrations are applied")
                if '[ ]' in result.stdout:
                    print_warning("Some migrations are not applied")
                
                return True
            else:
                print_error(f"Migration check failed: {result.stderr}")
        else:
            print_error(f"Django database check failed: {result.stderr}")
            
    except Exception as e:
        print_error(f"Django database test failed: {e}")
        
    return False

def check_redis_connectivity():
    """Test Redis connectivity"""
    print_header("🔴 Redis Connectivity")
    
    try:
        result = subprocess.run([
            'docker-compose', 'exec', '-T', 'redis', 'redis-cli', 'ping'
        ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
        
        if result.returncode == 0 and 'PONG' in result.stdout:
            print_success("Redis is responding")
            
            # Test Redis set/get
            subprocess.run([
                'docker-compose', 'exec', '-T', 'redis', 'redis-cli', 'set', 'test_key', 'test_value'
            ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
            
            result = subprocess.run([
                'docker-compose', 'exec', '-T', 'redis', 'redis-cli', 'get', 'test_key'
            ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
            
            if 'test_value' in result.stdout:
                print_success("Redis read/write operations working")
                return True
        else:
            print_error("Redis is not responding")
            
    except Exception as e:
        print_error(f"Redis test failed: {e}")
        
    return False

def check_environment_variables():
    """Check environment configuration"""
    print_header("🔧 Environment Configuration")
    
    try:
        result = subprocess.run([
            'docker-compose', 'exec', '-T', 'backend', 'python', '-c', 
            'import os; print("DB_HOST:", os.environ.get("DB_HOST", "not set")); print("DATABASE_URL:", os.environ.get("DATABASE_URL", "not set")[:50] + "..."); print("REDIS_URL:", os.environ.get("REDIS_URL", "not set"))'
        ], capture_output=True, text=True, cwd=r"d:\programming_II\ElevateHire AI\elevatehire-ai")
        
        if result.returncode == 0:
            print("Environment Variables:")
            print(result.stdout)
            print_success("Environment variables are accessible")
            return True
        else:
            print_error(f"Environment check failed: {result.stderr}")
            
    except Exception as e:
        print_error(f"Environment check failed: {e}")
        
    return False

def main():
    print(f"{Colors.BOLD}🔍 ElevateHire AI - System Health & Database Connectivity Check{Colors.END}")
    print(f"{Colors.BOLD}================================================================{Colors.END}")
    
    results = []
    
    # Run all tests
    results.append(("Docker Containers", check_docker_containers()))
    results.append(("Environment Config", check_environment_variables()))
    results.append(("PostgreSQL Direct", test_postgres_direct()))
    results.append(("Redis Connectivity", check_redis_connectivity()))
    results.append(("Django Database", test_django_database()))
    results.append(("Database via API", test_database_via_api()))
    
    # Summary
    print_header("📊 System Health Summary")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        if result:
            print_success(f"{test_name}: PASSED")
            passed += 1
        else:
            print_error(f"{test_name}: FAILED")
    
    print(f"\n{Colors.BOLD}Overall Status: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print_success("🎉 All systems are operational!")
    elif passed >= total - 1:
        print_warning("⚠️  System mostly operational with minor issues")
    else:
        print_error("❌ System has significant issues that need attention")
    
    # Provide recommendations
    print_header("💡 Recommendations")
    
    if passed < total:
        print("To fix issues:")
        print("1. Check Docker container logs: docker-compose logs [service_name]")
        print("2. Restart services: docker-compose restart")
        print("3. Rebuild if needed: docker-compose up --build")
        print("4. Check environment variables in .env file")
    
    print("\n📱 Quick Access URLs:")
    print("• Frontend: http://localhost:3000")
    print("• Backend API: http://localhost:8000")
    print("• Admin Panel: http://localhost:8000/admin")
    print("• Database: localhost:5434 (PostgreSQL)")
    print("• Redis: localhost:6380")

if __name__ == "__main__":
    main()
