#!/usr/bin/env python3
"""
Simple Database Connection Test for ElevateHire AI
"""

import psycopg2
import json
from datetime import datetime

def test_database_connection():
    """Test PostgreSQL database connection"""
    
    # Database configuration
    db_config = {
        'host': 'localhost',
        'port': '5434',
        'database': 'elevatehire_db',
        'user': 'postgres',
        'password': 'priyantha2002'
    }
    
    print(f"🔍 Database Connection Test Started at {datetime.now()}")
    print("="*60)
    
    try:
        # Test connection
        conn = psycopg2.connect(**db_config)
        cursor = conn.cursor()
        
        print(f"✅ PostgreSQL Connection: SUCCESS")
        
        # Get PostgreSQL version
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"   PostgreSQL Version: {version[0]}")
        
        # Get database size
        cursor.execute("SELECT pg_size_pretty(pg_database_size(current_database()));")
        db_size = cursor.fetchone()
        print(f"   Database Size: {db_size[0]}")
        
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"\n📊 Database Tables ({len(tables)} total):")
        print("-" * 40)
        
        # Count records in each table
        for table in tables:
            table_name = table[0]
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"   {table_name:<30} {count:>8} records")
            except Exception as e:
                print(f"   {table_name:<30} Error: {str(e)}")
        
        # Get active connections
        cursor.execute("""
            SELECT count(*) FROM pg_stat_activity 
            WHERE state = 'active';
        """)
        active_connections = cursor.fetchone()[0]
        print(f"\n🔗 Active Connections: {active_connections}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        print(f"\n✅ Database Test Completed Successfully at {datetime.now()}")
        
    except Exception as e:
        print(f"❌ Database Connection Failed: {str(e)}")
        print("   Please check if PostgreSQL is running and credentials are correct")

if __name__ == "__main__":
    test_database_connection()
