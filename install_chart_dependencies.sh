#!/bin/bash

echo "Installing chart dependencies for pet weight visualization..."

# Navigate to client directory and install chart.js dependencies
cd client
npm install chart.js@^4.4.0 react-chartjs-2@^5.2.0

echo "Chart dependencies installed successfully!"
echo "You can now run 'npm run dev' to start the development server and test the weight chart functionality."