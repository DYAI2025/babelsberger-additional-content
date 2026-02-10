#!/usr/bin/env python3
"""
Script to start a local server and open the Park Babelsberg website in a browser using Playwright
"""

import subprocess
import time
import sys
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

def start_server():
    """Start a local HTTP server in the background"""
    project_dir = Path("/home/dyai/Dokumente/DYAI_home/Web/Babelsberger.info/park-babelsberg_deploy_2025-10-24")
    os.chdir(project_dir)
    
    # Start the server on port 8000
    server_process = subprocess.Popen(
        [sys.executable, "-m", "http.server", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=project_dir
    )
    
    # Wait a moment for the server to start
    time.sleep(2)
    
    # Check if the server started successfully
    if server_process.poll() is None:  # Server is still running
        print("✓ Server started successfully on http://localhost:8000")
        return server_process
    else:
        # Server failed to start, get error output
        _, stderr = server_process.communicate()
        print(f"✗ Failed to start server: {stderr.decode()}")
        return None

def open_website():
    """Open the website using Playwright"""
    try:
        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=False)  # Set to False to see the browser
            page = browser.new_page()
            
            # Navigate to the website
            print("Opening website...")
            page.goto("http://localhost:8000/park-babelsberg/")
            
            # Wait for the page to load
            page.wait_for_load_state("networkidle")
            
            print("Website loaded successfully!")
            print("You can now interact with the website.")
            print("Keep this terminal running to maintain the server.")
            print("To close: Close the browser window and press Ctrl+C in this terminal.")
            
            # Keep the script running so the server stays up
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\nStopping browser and server...")
            
            browser.close()
    
    except Exception as e:
        print(f"Error opening website: {e}")
        # Wait for user input before exiting
        try:
            input("Press Enter to exit...")
        except:
            pass

def main():
    print("Starting Park Babelsberg website...")
    
    # Start the local server
    server_process = start_server()
    if server_process is None:
        print("Could not start the server. Exiting.")
        return
    
    try:
        # Open the website in Playwright
        open_website()
    except KeyboardInterrupt:
        print("\nReceived interrupt signal...")
    finally:
        # Always terminate the server
        print("Stopping server...")
        server_process.terminate()
        server_process.wait()
        print("Server stopped.")

if __name__ == "__main__":
    main()