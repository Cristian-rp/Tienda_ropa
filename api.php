<?php
error_reporting(0);
ini_set('display_errors', 0);
header("Content-Type: application/json; charset=utf-8");

include("db.php");

$entity = $_GET['entity'] ?? 'prendas';
$action = $_GET['action'] ?? 'listar';

// 1. MÓDULO PROVEEDORES

if ($entity === 'proveedores') {
    if ($action === 'listar') {
        $res = $conexion->query("SELECT * FROM proveedores ORDER BY id DESC");
        echo json_encode($res ? $res->fetch_all(MYSQLI_ASSOC) : []);
        exit();
    }
    if ($action === 'guardar') {
        $stmt = $conexion->prepare("INSERT INTO proveedores (nombre_empresa, telefono, email) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $_POST['nombre_empresa'], $_POST['telefono'], $_POST['email']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'actualizar') {
        $stmt = $conexion->prepare("UPDATE proveedores SET nombre_empresa=?, telefono=?, email=? WHERE id=?");
        $stmt->bind_param("sssi", $_POST['nombre_empresa'], $_POST['telefono'], $_POST['email'], $_POST['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'eliminar') {
        $stmt = $conexion->prepare("DELETE FROM proveedores WHERE id=?");
        $stmt->bind_param("i", $_GET['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
}

// 2. MÓDULO CLIENTES

if ($entity === 'clientes') {
    if ($action === 'listar') {
        $res = $conexion->query("SELECT * FROM clientes ORDER BY id DESC");
        echo json_encode($res ? $res->fetch_all(MYSQLI_ASSOC) : []);
        exit();
    }
    if ($action === 'guardar') {
        $stmt = $conexion->prepare("INSERT INTO clientes (nombre, email, tipo_cliente, fecha_nacimiento) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $_POST['nombre'], $_POST['email'], $_POST['tipo_cliente'], $_POST['fecha_nacimiento']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'actualizar') {
        $stmt = $conexion->prepare("UPDATE clientes SET nombre=?, email=?, tipo_cliente=?, fecha_nacimiento=? WHERE id=?");
        $stmt->bind_param("ssssi", $_POST['nombre'], $_POST['email'], $_POST['tipo_cliente'], $_POST['fecha_nacimiento'], $_POST['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'eliminar') {
        $stmt = $conexion->prepare("DELETE FROM clientes WHERE id=?");
        $stmt->bind_param("i", $_GET['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
}

// 3. MÓDULO PRENDAS

if ($entity === 'prendas') {
    if ($action === 'listar') {
        // Usamos LEFT JOIN para que traiga la prenda incluso si id_proveedor es NULL
        $sql = "SELECT p.*, COALESCE(pr.nombre_empresa, 'Sin Proveedor') AS proveedor 
                FROM prendas p 
                LEFT JOIN proveedores pr ON p.id_proveedor = pr.id 
                ORDER BY p.id DESC";
        $res = $conexion->query($sql);
        $prendas = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                if (!empty($row['imagen_blob'])) {
                    $row['imagen_blob'] = 'data:image/jpeg;base64,' . base64_encode($row['imagen_blob']);
                }
                $prendas[] = $row;
            }
        }
        echo json_encode($prendas);
        exit();
    }
    if ($action === 'guardar') {
        $img = isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK ? file_get_contents($_FILES['imagen']['tmp_name']) : null;
        $stmt = $conexion->prepare("INSERT INTO prendas (id_proveedor, nombre, precio, categoria, fecha_ingreso, imagen_blob) VALUES (?, ?, ?, ?, ?, ?)");
        $null = NULL;
        $stmt->bind_param("isdssb", $_POST['id_proveedor'], $_POST['nombre'], $_POST['precio'], $_POST['categoria'], $_POST['fecha_ingreso'], $null);
        if ($img !== null) $stmt->send_long_data(5, $img);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'actualizar') {
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            $img = file_get_contents($_FILES['imagen']['tmp_name']);
            $stmt = $conexion->prepare("UPDATE prendas SET id_proveedor=?, nombre=?, precio=?, categoria=?, fecha_ingreso=?, imagen_blob=? WHERE id=?");
            $null = NULL;
            $stmt->bind_param("isdssbi", $_POST['id_proveedor'], $_POST['nombre'], $_POST['precio'], $_POST['categoria'], $_POST['fecha_ingreso'], $null, $_POST['id']);
            $stmt->send_long_data(5, $img);
        } else {
            $stmt = $conexion->prepare("UPDATE prendas SET id_proveedor=?, nombre=?, precio=?, categoria=?, fecha_ingreso=? WHERE id=?");
            $stmt->bind_param("isdssi", $_POST['id_proveedor'], $_POST['nombre'], $_POST['precio'], $_POST['categoria'], $_POST['fecha_ingreso'], $_POST['id']);
        }
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'eliminar') {
        $stmt = $conexion->prepare("DELETE FROM prendas WHERE id=?");
        $stmt->bind_param("i", $_GET['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
}

// 4. MÓDULO VENTAS (CONECTA PRENDAS Y CLIENTES)

if ($entity === 'ventas') {
    if ($action === 'listar') {
        $sql = "SELECT v.*, p.nombre AS prenda, c.nombre AS cliente 
                FROM ventas v 
                JOIN prendas p ON v.id_prenda = p.id 
                JOIN clientes c ON v.id_cliente = c.id 
                ORDER BY v.id DESC";
        $res = $conexion->query($sql);
        $ventas = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                if (!empty($row['comprobante_blob'])) {
                    $row['comprobante_blob'] = 'data:image/jpeg;base64,' . base64_encode($row['comprobante_blob']);
                }
                $ventas[] = $row;
            }
        }
        echo json_encode($ventas);
        exit();
    }
    if ($action === 'guardar') {
        $comp = isset($_FILES['comprobante']) && $_FILES['comprobante']['error'] === UPLOAD_ERR_OK ? file_get_contents($_FILES['comprobante']['tmp_name']) : null;
        $stmt = $conexion->prepare("INSERT INTO ventas (id_prenda, id_cliente, cantidad, total, metodo_pago, comprobante_blob) VALUES (?, ?, ?, ?, ?, ?)");
        $null = NULL;
        $stmt->bind_param("iiidsb", $_POST['id_prenda'], $_POST['id_cliente'], $_POST['cantidad'], $_POST['total'], $_POST['metodo_pago'], $null);
        if ($comp !== null) $stmt->send_long_data(5, $comp);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
    if ($action === 'eliminar') {
        $stmt = $conexion->prepare("DELETE FROM ventas WHERE id=?");
        $stmt->bind_param("i", $_GET['id']);
        echo json_encode(["success" => $stmt->execute()]);
        exit();
    }
}
?>