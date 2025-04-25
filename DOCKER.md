# Docker Deployment Guide for Wender Tech Portfolio

This guide explains how to deploy the Wender Tech Portfolio application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your server
- A domain name pointing to your server (for production deployment)
- SSL certificate (Let's Encrypt will be used in this guide)

## Deployment Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio
```

### 2. Configure Environment Variables

Create a `.env.production` file based on the provided template:

```bash
cp .env.production.template .env.production
```

Edit the `.env.production` file and fill in your actual values:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Database Connection (for Prisma)
DATABASE_URL=postgresql://postgres.your-project:your-password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME="Wender Tech"
NEXT_PUBLIC_APP_DESCRIPTION="Portfolio e Gerenciamento de Projetos"

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Environment
NODE_ENV=production
NEXT_PUBLIC_PRODUCTION=true
```

### 3. Use the Deployment Script (Recommended)

We've provided a deployment script that automates the process:

```bash
./deploy.sh
```

The script will:

1. Check for the required files and dependencies
2. Build and start the Docker containers
3. Verify that the containers are running
4. Optionally set up SSL with Let's Encrypt if you provide a domain name

### 4. Manual Deployment (Alternative)

If you prefer to deploy manually, follow these steps:

#### Configure Nginx for Your Domain

Edit the `nginx/conf/app.conf` file and replace `localhost` with your actual domain name.

#### Set Up SSL Certificates

Edit the `init-letsencrypt.sh` script and replace:

- `your-domain.com` with your actual domain
- `www.your-domain.com` with your www subdomain if needed
- Verify the email address is correct

Run the script to set up SSL certificates:

```bash
sudo ./init-letsencrypt.sh
```

#### Build and Start the Docker Containers

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

This will:

- Build the Next.js application with your environment variables
- Start the application container
- Start Nginx as a reverse proxy with SSL
- Set up automatic SSL certificate renewal

### 5. Verify the Deployment

Visit your domain in a browser to verify the application is running correctly.

You can also check the health of the application by visiting:

```
https://your-domain.com/api/check-env
```

## Maintenance

### Viewing Logs

```bash
# View all logs
docker-compose logs

# View only app logs
docker-compose logs app

# Follow logs in real-time
docker-compose logs -f
```

### Updating the Application

To update the application with new code:

```bash
# Pull the latest code
git pull

# Rebuild and restart the containers
docker-compose up -d --build
```

### Stopping the Application

```bash
docker-compose down
```

## Troubleshooting

### Container Not Starting

Check the logs for errors:

```bash
docker-compose logs app
```

### SSL Certificate Issues

If you encounter SSL certificate issues, you can force renewal:

```bash
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot --force-renewal -d your-domain.com -d www.your-domain.com
docker-compose exec nginx nginx -s reload
```

### Database Connection Issues

Verify your DATABASE_URL is correct and that your IP is allowed in the Supabase dashboard.

## Security Considerations

- The `.env.production` file contains sensitive information. Make sure it's not committed to version control.
- Regularly update your Docker images to get security patches.
- Consider setting up a firewall to restrict access to your server.
