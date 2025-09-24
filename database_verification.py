#!/usr/bin/env python3
"""
Database Verification and Access Guide for ElevateHire AI
"""

import psycopg2
from datetime import datetime

def verify_database():
    """Verify PostgreSQL database setup"""
    
    db_config = {
        'host': 'localhost',
        'port': '5434',
        'database': 'elevatehire_db',
        'user': 'postgres',
        'password': 'priyantha2002'
    }
    
    print("🔍 ElevateHire AI Database Verification")
    print("="*60)
    print(f"Timestamp: {datetime.now()}")
    print()
    
    try:
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        print("✅ PostgreSQL Connection: SUCCESS")
        
        # Get database info
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"   Database Version: {version.split(',')[0]}")
        
        cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()));")
        db_size = cursor.fetchone()[0]
        print(f"   Database Size: {db_size}")
        
        # Get all tables
        cursor.execute("""
            SELECT table_name, 
                   pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📊 Database Tables ({len(tables)} total):")
        print("-" * 60)
        
        for table_name, size in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"   📋 {table_name:<35} {count:>6} records  ({size})")
            except Exception as e:
                print(f"   ❌ {table_name:<35} Error: {str(e)}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("🎉 DATABASE SETUP COMPLETE!")
        print("="*60)
        
        print("\n🌐 ACCESS METHODS:")
        print("-" * 30)
        
        print("\n1. 🖥️  pgAdmin (Web Database GUI):")
        print("   URL: http://localhost:5050")
        print("   Email: admin@elevatehire.com")
        print("   Password: admin123")
        print("   Then add server with:")
        print("   - Name: ElevateHire Local")
        print("   - Host: host.docker.internal (or db if from container)")
        print("   - Port: 5432")
        print("   - Database: elevatehire_db")
        print("   - Username: postgres")
        print("   - Password: priyantha2002")
        
        print("\n2. 🔧 Django Admin Interface:")
        print("   URL: http://localhost:8000/admin/")
        print("   Username: admin@elevatehire.com")
        print("   Password: admin123")
        
        print("\n3. 🗄️  Direct Database Connection:")
        print("   Host: localhost")
        print("   Port: 5434")
        print("   Database: elevatehire_db")
        print("   Username: postgres")
        print("   Password: priyantha2002")
        
        print("\n4. 🚀 API Endpoints:")
        print("   Base URL: http://localhost:8000/api/")
        print("   - Authentication: /api/auth/")
        print("   - Candidates: /api/candidates/")
        print("   - Interviews: /api/interviews/")
        print("   - Analytics: /api/analytics/")
        
        print("\n5. 🐳 Docker Commands:")
        print("   View logs: docker logs elevatehire-ai-backend-1")
        print("   Access DB: docker exec -it elevatehire-ai-db-1 psql -U postgres -d elevatehire_db")
        print("   Django shell: docker exec -it elevatehire-ai-backend-1 python manage.py shell")
        
        print("\n📝 NEXT STEPS:")
        print("-" * 15)
        print("   1. Open pgAdmin to explore database structure")
        print("   2. Use Django Admin to manage data")
        print("   3. Test API endpoints")
        print("   4. Start developing your features!")
        
        return True
        
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")
        return False

if __name__ == "__main__":
    verify_database()
