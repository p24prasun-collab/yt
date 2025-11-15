#!/bin/bash

# Activate virtual environment and run the server
cd "$(dirname "$0")"
source venv/bin/activate
cd backend
python main.py

