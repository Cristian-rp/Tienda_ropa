FROM php:8.2-apache

# Instalar extensiones de MySQL necesarias para PHP
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copiar todos los archivos del proyecto al servidor Apache
COPY . /var/www/html/

# Exponer el puerto 80
EXPOSE 80