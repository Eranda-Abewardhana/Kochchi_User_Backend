#!/bin/sh
echo "Waiting for SSL certificate..."
while [ ! -f /etc/letsencrypt/live/kochchibazaar.lk/fullchain.pem ]; do
  sleep 5
done
echo "Certificate found, starting nginx..."
nginx -g "daemon off;"
