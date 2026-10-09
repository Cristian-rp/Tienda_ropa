let mapInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    initTabs();

    cargarDashboard();
    cargarProveedores();
    cargarClientes();
    cargarPrendas();
    cargarVentas();

    document.getElementById('form-proveedor').addEventListener('submit', guardarProveedor);
    document.getElementById('form-cliente').addEventListener('submit', guardarCliente);
    document.getElementById('form-prenda').addEventListener('submit', guardarPrenda);
    document.getElementById('form-venta').addEventListener('submit', guardarVenta);

    document.getElementById('select-prenda-venta').addEventListener('change', calcularTotalVenta);
    document.getElementById('venta-cantidad').addEventListener('input', calcularTotalVenta);
});

function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetElement = document.getElementById(target);
            if (targetElement) {
                targetElement.classList.add('active');
            }

            if (target === 'tab-ventas') {
                setTimeout(initMap, 200);
            }
        });
    });
}

// INICIALIZACIÓN DE SERVICIO DE MAPA
function initMap() {
    if (mapInstance || !document.getElementById('map')) return;
    mapInstance = L.map('map').setView([4.5802, -74.2206], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(mapInstance);
    L.marker([4.5802, -74.2206], { draggable: true }).addTo(mapInstance);
}

function calcularTotalVenta() {
    const select = document.getElementById('select-prenda-venta');
    const option = select.options[select.selectedIndex];
    const precio = option ? parseFloat(option.dataset.precio || 0) : 0;
    const cantidad = parseInt(document.getElementById('venta-cantidad').value || 1);
    document.getElementById('venta-total').value = (precio * cantidad).toFixed(2);
}

// DASHBOARD
async function cargarDashboard() {
    try {
        const res = await fetch('api.php?entity=dashboard&action=resumen');
        const resultado = await res.json();

        if (resultado.success) {
            const data = resultado.data;
            document.getElementById('metric-ingresos').textContent = `$${parseFloat(data.ingresos_totales).toFixed(2)}`;
            document.getElementById('metric-ventas').textContent = data.total_ventas;
            document.getElementById('metric-clientes').textContent = data.total_clientes;
            document.getElementById('metric-top').textContent = data.producto_estrella;
        }
    } catch (error) {
        console.error("Error al cargar dashboard:", error);
    }
}

// PROVEEDORES
async function cargarProveedores() {
    try {
        const res = await fetch('api.php?entity=proveedores&action=listar');
        const datos = await res.json();
        
        const tbody = document.getElementById('tabla-proveedores');
        const selectPrenda = document.getElementById('select-proveedor-prenda');
        
        tbody.innerHTML = '';
        if (selectPrenda) selectPrenda.innerHTML = '<option value="">Sin Proveedor</option>';

        datos.forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.nombre_empresa}</td>
                    <td>${p.telefono}</td>
                    <td>${p.email}</td>
                    <td>
                        <button onclick="eliminarEntidad('proveedores', ${p.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            if (selectPrenda) {
                selectPrenda.innerHTML += `<option value="${p.id}">${p.nombre_empresa}</option>`;
            }
        });
    } catch (error) {
        console.error("Error proveedores:", error);
    }
}

async function guardarProveedor(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('api.php?entity=proveedores&action=guardar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        e.target.reset();
        cargarProveedores();
    }
}

// CLIENTES
async function cargarClientes() {
    try {
        const res = await fetch('api.php?entity=clientes&action=listar');
        const datos = await res.json();
        
        const tbody = document.getElementById('tabla-clientes');
        const selectVenta = document.getElementById('select-cliente-venta');
        
        tbody.innerHTML = '';
        if (selectVenta) selectVenta.innerHTML = '<option value="">Seleccione Cliente</option>';

        datos.forEach(c => {
            tbody.innerHTML += `
                <tr>
                    <td>${c.id}</td>
                    <td>${c.nombre}</td>
                    <td>${c.email}</td>
                    <td>${c.tipo_cliente}</td>
                    <td>${c.fecha_nacimiento}</td>
                    <td>
                        <button onclick="eliminarEntidad('clientes', ${c.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            if (selectVenta) {
                selectVenta.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
            }
        });
    } catch (error) {
        console.error("Error clientes:", error);
    }
}

async function guardarCliente(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('api.php?entity=clientes&action=guardar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        e.target.reset();
        cargarClientes();
        cargarDashboard();
    }
}

// PRENDAS
async function cargarPrendas() {
    try {
        const res = await fetch('api.php?entity=prendas&action=listar');
        const datos = await res.json();
        
        const tbody = document.getElementById('tabla-prendas');
        const selectVenta = document.getElementById('select-prenda-venta');
        
        tbody.innerHTML = '';
        if (selectVenta) selectVenta.innerHTML = '<option value="">Seleccione Prenda</option>';

        datos.forEach(p => {
            const imgHtml = p.imagen_blob 
                ? `<img src="${p.imagen_blob}" width="45" height="45" style="object-fit:cover; border-radius:4px;">` 
                : 'Sin Imagen';

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${imgHtml}</td>
                    <td>${p.nombre}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>${p.categoria}</td>
                    <td>${p.fecha_ingreso}</td>
                    <td>
                        <button onclick="eliminarEntidad('prendas', ${p.id})">Eliminar</button>
                    </td>
                </tr>
            `;
            if (selectVenta) {
                selectVenta.innerHTML += `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} - $${p.precio}</option>`;
            }
        });
    } catch (error) {
        console.error("Error prendas:", error);
    }
}

async function guardarPrenda(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch('api.php?entity=prendas&action=guardar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        e.target.reset();
        cargarPrendas();
        cargarDashboard();
    }
}

// VENTAS
async function cargarVentas() {
    try {
        const res = await fetch('api.php?entity=ventas&action=listar');
        const datos = await res.json();
        const tbody = document.getElementById('tabla-ventas');
        tbody.innerHTML = '';

        datos.forEach(v => {
            tbody.innerHTML += `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.cliente}</td>
                    <td>${v.prenda}</td>
                    <td>${v.cantidad}</td>
                    <td>$${parseFloat(v.total).toFixed(2)}</td>
                    <td>${v.metodo_pago}</td>
                    <td>${v.fecha_venta}</td>
                    <td>
                        <button onclick="eliminarEntidad('ventas', ${v.id})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error ventas:", error);
    }
}

async function guardarVenta(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = document.getElementById('btn-procesar-venta');

    btn.textContent = "Procesando Pasarela...";
    btn.disabled = true;

    try {
        // 1. Simulación de aprobación de Pasarela vía API
        const resPasarela = await fetch('api.php?entity=ventas&action=procesar_pasarela', {
            method: 'POST',
            body: formData
        });
        const dataPasarela = await resPasarela.json();

        if (dataPasarela.success) {
            // 2. Inserción a la base de datos MySQL
            const resVenta = await fetch('api.php?entity=ventas&action=guardar', {
                method: 'POST',
                body: formData
            });
            const dataVenta = await resVenta.json();

            if (dataVenta.success) {
                alert(`¡Pago Aprobado!\nID Transacción: ${dataPasarela.transaction_id}\nVenta guardada en MySQL exitosamente.`);
                e.target.reset();
                cargarVentas();
                cargarDashboard();
            } else {
                alert("Error al guardar en BD: " + dataVenta.error);
            }
        }
    } catch (error) {
        alert("Error procesando pasarela.");
    } finally {
        btn.textContent = "Procesar Pago y Venta";
        btn.disabled = false;
    }
}

// ELIMINAR
async function eliminarEntidad(entity, id) {
    if (!confirm("¿Está seguro de eliminar este registro?")) return;
    const res = await fetch(`api.php?entity=${entity}&action=eliminar&id=${id}`);
    const data = await res.json();
    if (data.success) {
        if (entity === 'proveedores') cargarProveedores();
        if (entity === 'clientes') cargarClientes();
        if (entity === 'prendas') cargarPrendas();
        if (entity === 'ventas') cargarVentas();
        cargarDashboard();
    }
}