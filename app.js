document.addEventListener('DOMContentLoaded', () => {
    // Inicializar listeners de pestañas
    initTabs();

    // Cargar datos
    cargarDashboard();
    cargarProveedores();
    cargarClientes();
    cargarPrendas();
    cargarVentas();

    // Eventos Formularios
    document.getElementById('form-proveedor').addEventListener('submit', guardarProveedor);
    document.getElementById('form-cliente').addEventListener('submit', guardarCliente);
    document.getElementById('form-prenda').addEventListener('submit', guardarPrenda);
    document.getElementById('form-venta').addEventListener('submit', guardarVenta);
});

// ==========================================
// CONTROL DE PESTAÑAS (TABS)
// ==========================================
function initTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
}

// ==========================================
// DASHBOARD
// ==========================================
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

// ==========================================
// PROVEEDORES
// ==========================================
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

// ==========================================
// CLIENTES
// ==========================================
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

// ==========================================
// PRENDAS
// ==========================================
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
                ? `<img src="${p.imagen_blob}" width="50" height="50" style="object-fit:cover; border-radius:4px;">` 
                : 'Sin Imagen';

            tbody.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${imgHtml}</td>
                    <td>${p.nombre}</td>
                    <td>$${parseFloat(p.precio).toFixed(2)}</td>
                    <td>${p.categoria}</td>
                    <td>${p.proveedor}</td>
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

// ==========================================
// VENTAS
// ==========================================
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
    
    const selectPrenda = document.getElementById('select-prenda-venta');
    const optionSelected = selectPrenda.options[selectPrenda.selectedIndex];
    const precioUnitario = optionSelected ? parseFloat(optionSelected.dataset.precio || 0) : 0;
    const cantidad = parseInt(formData.get('cantidad') || 1);
    
    if (!formData.get('total') || parseFloat(formData.get('total')) === 0) {
        formData.set('total', (precioUnitario * cantidad).toFixed(2));
    }

    const res = await fetch('api.php?entity=ventas&action=guardar', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
        e.target.reset();
        cargarVentas();
        cargarDashboard();
    } else {
        alert("Error al registrar venta: " + (data.error || "Verifique los datos cargados."));
    }
}

// ==========================================
// ELIMINAR
// ==========================================
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