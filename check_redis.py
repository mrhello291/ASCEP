#!/usr/bin/env python3
"""
Redis Health Check Script
Check Redis connection and configuration
"""

import os
import sys
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_redis():
    print("🔍 Checking Redis connection...")
    
    # Check environment variables (support both naming conventions)
    redis_url = os.getenv('REDIS_URL')
    redis_host = os.getenv('REDIS_HOST') or os.getenv('REDISHOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT') or os.getenv('REDISPORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD') or os.getenv('REDISPASSWORD')
    
    print(f"📊 Environment variables:")
    print(f"   REDIS_URL: {'Set' if redis_url else 'Not set'}")
    print(f"   REDIS_HOST: {redis_host}")
    print(f"   REDIS_PORT: {redis_port}")
    print(f"   REDIS_PASSWORD: {'Set' if redis_password else 'Not set'}")
    print(f"   REDISHOST: {'Set' if os.getenv('REDISHOST') else 'Not set'}")
    print(f"   REDISPORT: {'Set' if os.getenv('REDISPORT') else 'Not set'}")
    print(f"   REDISPASSWORD: {'Set' if os.getenv('REDISPASSWORD') else 'Not set'}")
    
    try:
        if redis_url:
            print(f"🔗 Connecting via REDIS_URL: {redis_url[:20]}...")
            client = redis.from_url(redis_url, decode_responses=True)
        else:
            print(f"🔗 Connecting to {redis_host}:{redis_port}")
            client = redis.Redis(
                host=redis_host,
                port=redis_port,
                password=redis_password,
                decode_responses=True,
                socket_connect_timeout=5
            )
        
        # Test connection
        response = client.ping()
        print(f"✅ Redis connection successful: {response}")
        
        # Test basic operations
        client.set('test_key', 'test_value')
        value = client.get('test_key')
        print(f"✅ Redis read/write test: {value}")
        client.delete('test_key')
        
        print("🎉 Redis is working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        print("\n💡 Troubleshooting tips:")
        print("   1. Check if Redis service is running")
        print("   2. Verify environment variables")
        print("   3. Check network connectivity")
        print("   4. For Railway: Add Redis service in dashboard")
        return False

if __name__ == "__main__":
    success = check_redis()
    sys.exit(0 if success else 1) 