#! /bin/sh
npm run build
cd client/dist
sudo cp -r * /usr/share/nginx/html/
sudo systemctl restart pet-care-tracker
