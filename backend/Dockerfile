FROM php:8.2-apache

# Install system dependencies and PostgreSQL PHP extensions
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Copy all files from the backend directory into Apache web root
COPY . /var/www/html/

WORKDIR /var/www/html

# Enable Apache rewrite module for clean API routing
RUN a2enmod rewrite

EXPOSE 80