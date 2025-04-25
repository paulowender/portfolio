#!/bin/bash

# Script para implantar a aplicação com Docker
# Este script é para uso local, não para o Portainer

echo "Este script é para implantação local. Para o Portainer, use a interface web."
echo "Certifique-se de configurar as variáveis de ambiente no Portainer."

# Check if Docker is installed
if ! command -v docker &>/dev/null; then
  echo "Error: Docker is not installed!"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &>/dev/null; then
  echo "Error: Docker Compose is not installed!"
  exit 1
fi

# Build and start the containers
echo "Building and starting Docker containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check if the containers are running
echo "Checking if containers are running..."
sleep 10
if docker-compose ps | grep -q "Up"; then
  echo "Containers are running!"
  echo "Application is now available at: http://localhost:3000"
  echo "To check logs: docker-compose logs -f"
else
  echo "Error: Containers failed to start!"
  echo "Check logs with: docker-compose logs"
  exit 1
fi

# Optional: Set up SSL with Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " setup_ssl
if [ "$setup_ssl" = "y" ] || [ "$setup_ssl" = "Y" ]; then
  # Check if domain is set
  read -p "Enter your domain name (e.g., example.com): " domain_name
  if [ -z "$domain_name" ]; then
    echo "Error: Domain name is required for SSL setup!"
    exit 1
  fi

  # Update Nginx configuration
  echo "Updating Nginx configuration..."
  sed -i "s/localhost/$domain_name/g" nginx/conf/app.conf

  # Update Let's Encrypt script
  echo "Updating Let's Encrypt script..."
  sed -i "s/your-domain.com/$domain_name/g" init-letsencrypt.sh
  sed -i "s/www.your-domain.com/www.$domain_name/g" init-letsencrypt.sh

  # Run Let's Encrypt script
  echo "Running Let's Encrypt script..."
  chmod +x init-letsencrypt.sh
  sudo ./init-letsencrypt.sh

  echo "SSL setup complete!"
  echo "Application is now available at: https://$domain_name"
fi

echo "Deployment complete!"
