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

    // EVENTOS PARA CÁLCULO AUTOMÁTICO DEL TOTAL
    const selectPrenda = document.getElementById('select-prenda-venta');
    const inputCantidad = document.getElementById('venta-cantidad');

    if (selectPrenda) selectPrenda.addEventListener('change', calcularTotalVenta);
    if (inputCantidad) inputCantidad.addEventListener('input', calcularTotalVenta);
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

            // Inicializar mapa al hacer clic en Ventas
            if (target === 'tab-ventas') {
                setTimeout(initMap, 300);
            }
        });
    });
}

// CÁLCULO AUTOMÁTICO DEL TOTAL
function calcularTotalVenta() {
    const select = document.getElementById('select-prenda-venta');
    const inputTotal = document.getElementById('venta-total');
    const inputCantidad = document.getElementById('venta-cantidad');

    if (!select || !inputTotal) return;

    const selectedOption = select.options[select.selectedIndex];
    const precio = selectedOption ? parseFloat(selectedOption.getAttribute('data-precio') || 0) : 0;
    const cantidad = parseInt(inputCantidad ? inputCantidad.value : 1) || 1;

    const totalCalculado = precio * cantidad;
    inputTotal.value = totalCalculado.toFixed(2);
}

// INICIALIZAR MAPA
function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    if (!mapInstance) {
        mapInstance = L.map('map').setView([4.5802, -74.2206], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(mapInstance);
        L.marker([4.5802, -74.2206], { draggable: true }).addTo(mapInstance);
    } else {
        mapInstance.invalidateSize();
    }
}

// PRENDAS (Guarda el atributo data-precio correctamente)
async function cargarPrendas() {
    try {
        const res = await fetch('api.php?entity=prendas&action=listar');
        const datos = await res.json();
        
        const tbody = document.getElementById('tabla-prendas');
        const selectVenta = document.getElementById('select-prenda-venta');
        
        if (tbody) tbody.innerHTML = '';
        if (selectVenta) selectVenta.innerHTML = '<option value="">Seleccione Prenda</option>';

        datos.forEach(p => {
            const imgHtml = p.imagen_blob 
                ? `<img src="${p.imagen_blob}" width="45" height="45" style="object-fit:cover; border-radius:4px;">` 
                : 'Sin Imagen';

            if (tbody) {
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
            }

            if (selectVenta) {
                selectVenta.innerHTML += `<option value="${p.id}" data-precio="${p.precio}">${p.nombre} - $${parseFloat(p.precio).toFixed(2)}</option>`;
            }
        });
    } catch (error) {
        console.error("Error prendas:", error);
    }
}

// PROVEEDORES
async function cargarProveedores() {
    try {
        const res = await fetch('api.php?entity=proveedores&action=listar');
        const datos = await res.json();
        const tbody = document.getElementById('tabla-proveedores');
        const selectPrenda = document.getElementById('select-proveedor-prenda');
        
        if (tbody) tbody.innerHTML = '';
        if (selectPrenda) selectPrenda.innerHTML = '<option value="">Sin Proveedor</option>';

        datos.forEach(p => {
            if (tbody) {
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
            }
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
        
        if (tbody) tbody.innerHTML = '';
        if (selectVenta) selectVenta.innerHTML = '<option value="">Seleccione Cliente</option>';

        datos.forEach(c => {
            if (tbody) {
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
            }
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
        if (tbody) tbody.innerHTML = '';

        datos.forEach(v => {
            if (tbody) {
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
            }
        });
    } catch (error) {
        console.error("Error ventas:", error);
    }
}

async function guardarVenta(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const btn = document.getElementById('btn-procesar-venta');

    if (btn) {
        btn.textContent = "Procesando Pasarela...";
        btn.disabled = true;
    }

    try {
        const resPasarela = await fetch('api.php?entity=ventas&action=procesar_pasarela', {
            method: 'POST',
            body: formData
        });
        const dataPasarela = await resPasarela.json();

        if (dataPasarela.success) {
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
        if (btn) {
            btn.textContent = "Procesar Venta";
            btn.disabled = false;
        }
    }
}

// DASHBOARD
async function cargarDashboard() {
    try {
        const res = await fetch('api.php?entity=dashboard&action=resumen');
        const resultado = await res.json();

        if (resultado.success) {
            const data = resultado.data;
            const eIngresos = document.getElementById('metric-ingresos');
            const eVentas = document.getElementById('metric-ventas');
            const eClientes = document.getElementById('metric-clientes');
            const eTop = document.getElementById('metric-top');

            if (eIngresos) eIngresos.textContent = `$${parseFloat(data.ingresos_totales).toFixed(2)}`;
            if (eVentas) eVentas.textContent = data.total_ventas;
            if (eClientes) eClientes.textContent = data.total_clientes;
            if (eTop) eTop.textContent = data.producto_estrella;
        }
    } catch (error) {
        console.error("Error al cargar dashboard:", error);
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