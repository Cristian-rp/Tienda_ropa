<?php
// Lee las variables de entorno de Render o usa las locales por defecto (XAMPP)
$host = getenv('DB_HOST') ?: "localhost";
$usuario = getenv('DB_USER') ?: "root";
$password = getenv('DB_PASS') ?: "";
$base_datos = getenv('DB_NAME') ?: "tienda_ropa_db";
$puerto = getenv('DB_PORT') ?: "3306";

$conexion = new mysqli($host, $usuario, $password, $base_datos, $puerto);

if ($conexion->connect_error) {
    die(json_encode(["success" => false, "message" => "Error de conexión: " . $conexion->connect_error]));
}

$conexion->set_charset("utf8mb4");
?>