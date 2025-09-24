#!/usr/bin/env python3
"""
Database Monitoring and Health Check Script for ElevateHire AI
This script provides comprehensive database monitoring and connectivity checks.
"""

import os
import sys
import django
import psycopg2
from datetime import datetime
import json
from django.db import connection, connections
from django.core.management.base import BaseCommand
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from candidates.models import Candidate
from interviews.models import Interview
from analytics.models import *
from ai_analysis.models import *
from scoring.models import *
from reports.models import *

User = get_user_model()

class DatabaseMonitor:
    def __init__(self):
        self.db_config = settings.DATABASES['default']
        
    def print_header(self, title):
        print(f"\n{'='*60}")
        print(f" {title}")
        print(f"{'='*60}")
        
    def check_database_connectivity(self):
        """Test basic database connectivity"""
        self.print_header("DATABASE CONNECTIVITY CHECK")
        
        try:
            # Test Django ORM connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
                print(f"✅ Django ORM Connection: SUCCESS")
                print(f"   PostgreSQL Version: {version[0]}")
                
            # Test direct psycopg2 connection
            conn = psycopg2.connect(
                host=self.db_config['HOST'],
                port=self.db_config['PORT'],
                database=self.db_config['NAME'],
                user=self.db_config['USER'],
                password=self.db_config['PASSWORD']
            )
            print(f"✅ Direct psycopg2 Connection: SUCCESS")
            conn.close()
            
            # Test connection pool
            connections_info = connections.all()
            print(f"✅ Connection Pool Status: {len(connections_info)} connections available")
            
        except Exception as e:
            print(f"❌ Database Connection Failed: {str(e)}")
            return False
            
        return True
    
    def show_database_info(self):
        """Display database configuration and stats"""
        self.print_header("DATABASE CONFIGURATION")
        
        print(f"Database Engine: {self.db_config['ENGINE']}")
        print(f"Database Name: {self.db_config['NAME']}")
        print(f"Host: {self.db_config['HOST']}")
        print(f"Port: {self.db_config['PORT']}")
        print(f"User: {self.db_config['USER']}")
        
    def check_tables_and_data(self):
        """Check all tables and their record counts"""
        self.print_header("DATABASE TABLES AND DATA")
        
        try:
            # Get all tables
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name;
                """)
                tables = cursor.fetchall()
                
                print(f"Total Tables: {len(tables)}\n")
                
                # Count records in each table
                for table in tables:
                    table_name = table[0]
                    try:
                        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                        count = cursor.fetchone()[0]
                        print(f"📊 {table_name:<30} {count:>10} records")
                    except Exception as e:
                        print(f"❌ {table_name:<30} Error: {str(e)}")
                        
        except Exception as e:
            print(f"❌ Error checking tables: {str(e)}")
    
    def show_model_data(self):
        """Show data from Django models"""
        self.print_header("DJANGO MODELS DATA")
        
        models_to_check = [
            (User, "Users"),
            (Candidate, "Candidates"),
            (Interview, "Interviews"),
        ]
        
        for model, name in models_to_check:
            try:
                count = model.objects.count()
                print(f"📊 {name:<20} {count:>10} records")
                
                # Show latest records
                if count > 0:
                    latest = model.objects.order_by('-id')[:3]
                    print(f"   Latest entries:")
                    for item in latest:
                        if hasattr(item, 'created_at'):
                            print(f"   - ID: {item.id}, Created: {item.created_at}")
                        elif hasattr(item, 'date_joined'):
                            print(f"   - ID: {item.id}, Joined: {item.date_joined}")
                        else:
                            print(f"   - ID: {item.id}")
                            
            except Exception as e:
                print(f"❌ Error checking {name}: {str(e)}")
    
    def show_database_performance(self):
        """Show database performance metrics"""
        self.print_header("DATABASE PERFORMANCE METRICS")
        
        try:
            with connection.cursor() as cursor:
                # Database size
                cursor.execute("""
                    SELECT pg_size_pretty(pg_database_size(current_database())) as db_size;
                """)
                db_size = cursor.fetchone()[0]
                print(f"Database Size: {db_size}")
                
                # Active connections
                cursor.execute("""
                    SELECT count(*) FROM pg_stat_activity 
                    WHERE state = 'active';
                """)
                active_connections = cursor.fetchone()[0]
                print(f"Active Connections: {active_connections}")
                
                # Largest tables
                cursor.execute("""
                    SELECT 
                        schemaname,
                        tablename,
                        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
                    LIMIT 5;
                """)
                large_tables = cursor.fetchall()
                print(f"\nLargest Tables:")
                for table in large_tables:
                    print(f"  {table[1]:<30} {table[2]}")
                    
        except Exception as e:
            print(f"❌ Error checking performance: {str(e)}")
    
    def run_full_health_check(self):
        """Run complete database health check"""
        print(f"🔍 Database Health Check Started at {datetime.now()}")
        
        if not self.check_database_connectivity():
            print("❌ Database connectivity failed. Exiting...")
            return False
            
        self.show_database_info()
        self.check_tables_and_data()
        self.show_model_data()
        self.show_database_performance()
        
        print(f"\n✅ Database Health Check Completed at {datetime.now()}")
        return True

def main():
    monitor = DatabaseMonitor()
    monitor.run_full_health_check()

if __name__ == "__main__":
    main()
