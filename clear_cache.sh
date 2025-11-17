#!/bin/bash
# Script to clear Python cache files

echo "Clearing Python cache files..."

# Remove __pycache__ directories
find backend -type d -name __pycache__ -exec rm -r {} + 2>/dev/null || true

# Remove .pyc files
find backend -name "*.pyc" -delete 2>/dev/null || true

# Remove .pyo files
find backend -name "*.pyo" -delete 2>/dev/null || true

echo "✅ Cache cleared! Please restart your server."

