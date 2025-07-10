#!/usr/bin/env python3
"""
Python Version Compatibility Checker for ASCEP
"""

import sys
import subprocess
import platform

def check_python_version():
    """Check Python version and provide recommendations"""
    version = sys.version_info
    print(f"🐍 Python Version: {version.major}.{version.minor}.{version.micro}")
    print(f"   Platform: {platform.platform()}")
    
    if version.major == 3 and version.minor >= 12:
        print("✅ Python version is compatible with ASCEP")
        return True
    elif version.major == 3 and version.minor == 13:
        print("⚠️  Python 3.13 detected - experimental support")
        print("   Some packages may have compatibility issues")
        print("   Consider using Python 3.12 for better stability")
        return True
    else:
        print("❌ Python version is not compatible")
        print("   ASCEP requires Python 3.12+")
        print("   Please upgrade your Python version")
        return False

def check_pip():
    """Check if pip is available"""
    try:
        subprocess.run([sys.executable, "-m", "pip", "--version"], 
                      check=True, capture_output=True)
        print("✅ pip is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ pip is not available")
        return False

def check_pnpm():
    """Check if pnpm is available"""
    try:
        subprocess.run(["pnpm", "--version"], 
                      check=True, capture_output=True)
        print("✅ pnpm is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ pnpm is not available")
        print("   Install with: npm install -g pnpm")
        return False

def check_redis():
    """Check if Redis is available"""
    try:
        subprocess.run(["redis-cli", "ping"], 
                      check=True, capture_output=True)
        print("✅ Redis is available")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Redis is not available")
        print("   Install with: sudo apt-get install redis-server")
        return False

def main():
    print("🔍 ASCEP Environment Check")
    print("=" * 40)
    
    checks = [
        check_python_version(),
        check_pip(),
        check_pnpm(),
        check_redis()
    ]
    
    print("\n" + "=" * 40)
    if all(checks):
        print("🎉 All checks passed! You're ready to install ASCEP.")
        print("\nNext steps:")
        print("1. Run: ./setup.sh")
        print("2. Or manually:")
        print("   cd backend && pip install -r requirements.txt")
        print("   cd frontend && pnpm install")
    else:
        print("⚠️  Some checks failed. Please resolve the issues above.")
        print("\nRecommendations:")
        print("- Use Python 3.12 for best compatibility")
        print("- Install missing dependencies")
        print("- Consider using conda/mamba for Python environment management")

if __name__ == "__main__":
    main() 