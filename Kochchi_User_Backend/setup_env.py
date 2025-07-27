#!/usr/bin/env python3
"""
Environment Setup Script
Helps users create their .env file from the example configuration
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Create .env file from config.env.example if it doesn't exist"""
    
    example_file = "config.env.example"
    env_file = ".env"
    
    if os.path.exists(env_file):
        print(f"✅ {env_file} already exists!")
        print("If you want to recreate it, delete the existing file and run this script again.")
        return
    
    if not os.path.exists(example_file):
        print(f"❌ {example_file} not found!")
        print("Please make sure the example configuration file exists.")
        return
    
    try:
        # Copy the example file to .env
        shutil.copy2(example_file, env_file)
        print(f"✅ Created {env_file} from {example_file}")
        print("📝 Please edit the .env file with your actual configuration values.")
        print("🔑 Don't forget to set your actual API keys and credentials!")
        
    except Exception as e:
        print(f"❌ Error creating {env_file}: {e}")

if __name__ == "__main__":
    print("🚀 Setting up environment configuration...")
    setup_environment()
    print("✅ Setup complete!") 