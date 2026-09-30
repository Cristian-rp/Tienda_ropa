let currentEntity = "prendas";
let listaPrendasPrecios = {}; // Guarda precios id_prenda -> precio

document.addEventListener("DOMContentLoaded", () => {
    inicializarFormulario();
    cargarDatos();

    document.getElementById("main-form").addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = document.getElementById("entity-id").value;
        const action = id ? "actualizar" : "guardar";

        fetch(`api.php?entity=${currentEntity}&action=${action}`, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                limpiarFormulario();
                cargarDatos();
            } else {
                alert("Ocurrió un error al guardar el registro.");
            }
        })
        .catch(err => console.error("Error al guardar:", err));
    });
});

function cambiarModulo(entity) {
    currentEntity = entity;

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.getAttribute("onclick").includes(`'${entity}'`)) {
            btn.classList.add("active");
        }
    });

    limpiarFormulario();
    inicializarFormulario();
    cargarDatos();
}

function inicializarFormulario() {
    const fields = document.getElementById("form-fields");
    document.getElementById("form-titulo").innerText = `Gestión de ${currentEntity.toUpperCase()}`;
    fields.innerHTML = "";

    if (currentEntity === "proveedores") {
        fields.innerHTML = `
            <div class="form-group"><label>Empresa:</label><input type="text" name="nombre_empresa" required></div>
            <div class="form-group"><label>Teléfono:</label><input type="text" name="telefono" required></div>
            <div class="form-group"><label>Email:</label><input type="email" name="email" required></div>
        `;
    } else if (currentEntity === "clientes") {
        fields.innerHTML = `
            <div class="form-group"><label>Nombre:</label><input type="text" name="nombre" required></div>
            <div class="form-group"><label>Email:</label><input type="email" name="email" required></div>
            <div class="form-group"><label>Tipo (ENUM):</label>
                <select name="tipo_cliente" required>
                    <option value="Regular">Regular</option>
                    <option value="VIP">VIP</option>
                    <option value="Mayorista">Mayorista</option>
                </select>
            </div>
            <div class="form-group"><label>Nacimiento (DATE):</label><input type="date" name="fecha_nacimiento" required></div>
        `;
    } else if (currentEntity === "prendas") {
        fields.innerHTML = `
            <div class="form-group"><label>Proveedor (FK):</label><select id="select-proveedores" name="id_proveedor" required></select></div>
            <div class="form-group"><label>Nombre:</label><input type="text" name="nombre" required></div>
            <div class="form-group"><label>Precio ($):</label><input type="number" step="0.01" name="precio" required></div>
            <div class="form-group"><label>Categoría (ENUM):</label>
                <select name="categoria" required>
                    <option value="Camisetas">Camisetas</option>
                    <option value="Pantalones">Pantalones</option>
                    <option value="Chaquetas">Chaquetas</option>
                    <option value="Accesorios">Accesorios</option>
                </select>
            </div>
            <div class="form-group"><label>Ingreso (DATE):</label><input type="date" name="fecha_ingreso" required></div>
            <div class="form-group"><label>Imagen (BLOB):</label><input type="file" name="imagen" accept="image/*"></div>
        `;
        cargarSelect("proveedores", "select-proveedores", "nombre_empresa");
    } else if (currentEntity === "ventas") {
        fields.innerHTML = `
            <div class="form-group"><label>Prenda (FK):</label><select id="select-prendas" name="id_prenda" onchange="calcularTotalVenta()" required></select></div>
            <div class="form-group"><label>Cliente (FK):</label><select id="select-clientes" name="id_cliente" required></select></div>
            <div class="form-group"><label>Cantidad:</label><input type="number" id="cantidad-venta" name="cantidad" min="1" value="1" oninput="calcularTotalVenta()" required></div>
            <div class="form-group"><label>Total ($):</label><input type="number" step="0.01" id="total-venta" name="total" readonly required></div>
            <div class="form-group"><label>Método Pago (ENUM):</label>
                <select name="metodo_pago" required>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                </select>
            </div>
        `;
        cargarSelectPrendasVenta();
        cargarSelect("clientes", "select-clientes", "nombre");
    }
}

// Carga las prendas guardando el precio por cada ID
function cargarSelectPrendasVenta() {
    fetch(`api.php?entity=prendas&action=listar`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("select-prendas");
            if (!select) return;
            select.innerHTML = `<option value="">Seleccione...</option>`;
            listaPrendasPrecios = {};
            if (Array.isArray(data)) {
                data.forEach(item => {
                    listaPrendasPrecios[item.id] = parseFloat(item.precio);
                    select.innerHTML += `<option value="${item.id}">${item.nombre} ($${item.precio})</option>`;
                });
            }
        });
}

function cargarSelect(entity, selectId, displayKey) {
    fetch(`api.php?entity=${entity}&action=listar`)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById(selectId);
            if (!select) return;
            select.innerHTML = `<option value="">Seleccione...</option>`;
            if (Array.isArray(data)) {
                data.forEach(item => {
                    select.innerHTML += `<option value="${item.id}">${item[displayKey]}</option>`;
                });
            }
        });
}

// Cálculo automático: Precio de la prenda x Cantidad
function calcularTotalVenta() {
    const idPrenda = document.getElementById("select-prendas").value;
    const cantidad = parseFloat(document.getElementById("cantidad-venta").value) || 0;
    const inputTotal = document.getElementById("total-venta");

    if (idPrenda && listaPrendasPrecios[idPrenda]) {
        const precioUnitario = listaPrendasPrecios[idPrenda];
        inputTotal.value = (precioUnitario * cantidad).toFixed(2);
    } else {
        inputTotal.value = "0.00";
    }
}

function cargarDatos() {
    const thead = document.getElementById("table-head");
    const tbody = document.getElementById("table-body");
    const entityRequested = currentEntity;

    tbody.innerHTML = "";

    if (entityRequested === "proveedores") {
        thead.innerHTML = `<tr><th>ID</th><th>Empresa</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr>`;
    } else if (entityRequested === "clientes") {
        thead.innerHTML = `<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Tipo (ENUM)</th><th>Nacimiento (DATE)</th><th>Acciones</th></tr>`;
    } else if (entityRequested === "prendas") {
        thead.innerHTML = `<tr><th>ID</th><th>Imagen (BLOB)</th><th>Prenda</th><th>Proveedor</th><th>Precio</th><th>Categoría (ENUM)</th><th>Ingreso (DATE)</th><th>Acciones</th></tr>`;
    } else if (entityRequested === "ventas") {
        thead.innerHTML = `<tr><th>ID</th><th>Prenda</th><th>Cliente</th><th>Cantidad</th><th>Total</th><th>Pago (ENUM)</th><th>Fecha (TIMESTAMP)</th><th>Acciones</th></tr>`;
    }

    fetch(`api.php?entity=${entityRequested}&action=listar`)
        .then(res => res.json())
        .then(data => {
            if (entityRequested !== currentEntity) return;

            tbody.innerHTML = "";

            if (!data || !Array.isArray(data) || data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No hay registros disponibles.</td></tr>`;
                return;
            }

            if (entityRequested === "proveedores") {
                data.forEach(i => {
                    tbody.innerHTML += `<tr><td>${i.id}</td><td>${i.nombre_empresa}</td><td>${i.telefono}</td><td>${i.email}</td>
                    <td><button class="btn btn-red" onclick="eliminarRegistro(${i.id})">Eliminar</button></td></tr>`;
                });
            } else if (entityRequested === "clientes") {
                data.forEach(i => {
                    tbody.innerHTML += `<tr><td>${i.id}</td><td>${i.nombre}</td><td>${i.email}</td><td>${i.tipo_cliente}</td><td>${i.fecha_nacimiento}</td>
                    <td><button class="btn btn-red" onclick="eliminarRegistro(${i.id})">Eliminar</button></td></tr>`;
                });
            } else if (entityRequested === "prendas") {
                data.forEach(i => {
                    const img = i.imagen_blob ? `<img class="thumb" src="${i.imagen_blob}">` : "Sin Foto";
                    tbody.innerHTML += `<tr><td>${i.id}</td><td>${img}</td><td>${i.nombre}</td><td>${i.proveedor}</td><td>$${i.precio}</td><td>${i.categoria}</td><td>${i.fecha_ingreso}</td>
                    <td><button class="btn btn-red" onclick="eliminarRegistro(${i.id})">Eliminar</button></td></tr>`;
                });
            } else if (entityRequested === "ventas") {
                data.forEach(i => {
                    const ventaJSON = JSON.stringify(i).replace(/'/g, "&apos;");
                    tbody.innerHTML += `<tr>
                        <td>${i.id}</td>
                        <td>${i.prenda}</td>
                        <td>${i.cliente}</td>
                        <td>${i.cantidad}</td>
                        <td>$${parseFloat(i.total).toFixed(2)}</td>
                        <td><strong>${i.metodo_pago}</strong></td>
                        <td><small>${i.fecha_venta}</small></td>
                        <td>
                            <button class="btn btn-blue" onclick='imprimirComprobante(${ventaJSON})'>Imprimir Recibo</button>
                            <button class="btn btn-red" onclick="eliminarRegistro(${i.id})">Eliminar</button>
                        </td>
                    </tr>`;
                });
            }
        });
}

// Genera e imprime el recibo/comprobante de la venta
function imprimirComprobante(venta) {
    const ventana = window.open("", "_blank", "width=600,height=600");
    ventana.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Comprobante de Venta #${venta.id}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                .ticket { border: 1px dashed #333; padding: 20px; max-width: 350px; margin: 0 auto; text-align: center; }
                h2 { margin-bottom: 5px; }
                .info { text-align: left; margin-top: 15px; font-size: 14px; line-height: 1.6; }
                .total { font-size: 18px; font-weight: bold; margin-top: 15px; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <h2>TIENDA DE ROPA</h2>
                <p><small>Comprobante de Pago #${venta.id}</small></p>
                <hr>
                <div class="info">
                    <p><strong>Fecha:</strong> ${venta.fecha_venta}</p>
                    <p><strong>Cliente:</strong> ${venta.cliente}</p>
                    <p><strong>Producto:</strong> ${venta.prenda}</p>
                    <p><strong>Cantidad:</strong> ${venta.cantidad}</p>
                    <p><strong>Método de Pago:</strong> ${venta.metodo_pago}</p>
                </div>
                <div class="total">
                    TOTAL PAGADO: $${parseFloat(venta.total).toFixed(2)}
                </div>
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); };
            </script>
        </body>
        </html>
    `);
    ventana.document.close();
}

function eliminarRegistro(id) {
    if (confirm("¿Desea eliminar el registro seleccionado?")) {
        fetch(`api.php?entity=${currentEntity}&action=eliminar&id=${id}`)
            .then(res => res.json())
            .then(() => cargarDatos());
    }
}

function limpiarFormulario() {
    document.getElementById("entity-id").value = "";
    document.getElementById("main-form").reset();
    document.getElementById("btn-cancelar").style.display = "none";
}