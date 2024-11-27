// Mi administrador_aside.js:
function loadSection(section) {
    const mainContent = document.getElementById("main-content");

    if (section === "admin_profile") {
        mainContent.innerHTML = `
        <div class="container mt-1">
            <h2 style="font-weight: bold">Perfil del Administrador</h2>
            </br>
            <form>
                <div class="form-group">
                    <label for="nombre">Nombre Completo:</label>
                    <input type="text" id="nombre" class="form-control" value="${usuario.first_name}" readonly>
                </div>
                <div class="form-group">
                    <label for="email">Correo Electrónico:</label>
                    <input type="email" id="email" class="form-control" value="${usuario.email}" readonly>
                </div>
                <div class="form-group">
                    <label for="rut">RUT:</label>
                    <input type="text" id="rut" class="form-control" value="${usuario.username}" readonly>
                </div>
            </form>
        </div>`;
    } else if (section === "admin_cases") {
    // Mostrar todos los casos
    mainContent.innerHTML = `
    <div class="container mt-1">
        <h2 style="font-weight: bold">Mis casos</h2>
        </br>
        <div class="search-container">
            <input type="text" id="searchInput" class="form-control" placeholder="Buscar casos..." onkeyup="searchCases()">
        </div>
        </br>
        <div class="table-responsive">
            <table class="table text-center">
                <thead>
                    <tr>
                        <th>Fecha de Registro</th>
                        <th>Tipo de Conflicto</th>
                        <th>Tienda</th>
                        <th>Método</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="casos-tbody">
                    <tr>
                        <td colspan="5" class="text-center">Cargando casos...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`;

    // Hacer la solicitud para obtener todos los casos
    fetch('/api/casos/')
        .then(response => response.json())
        .then(casos => {
            const tbody = document.getElementById('casos-tbody');
            if (casos.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">No hay casos registrados</td>
                    </tr>`;
                return;
            }

            tbody.innerHTML = casos.map(caso => `
                <tr>
                    <td>${formatDate(caso.created_at)}</td>
                    <td>${caso.conflict_type}</td>
                    <td>${caso.store_name}</td>
                    <td>${formatAcquisitionMethod(caso.acquisition_method)}</td>
                    <td>
                        <div>
                            <button onclick="verCaso(${caso.id})" class="btn btn-primary btn-sm" aria-label="Ver caso">
                                <i class="fa fa-eye fa-lg" aria-hidden="true"></i>
                            </button>
                            <button onclick="eliminarCaso(${caso.id})" class="btn btn-danger btn-sm" aria-label="Eliminar caso">
                                <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar los casos:', error);
            document.getElementById('casos-tbody').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error al cargar los casos. Por favor, intente nuevamente.
                    </td>
                </tr>`;
        });
} else if (section === "admin_all-cases") {
            mainContent.innerHTML = `
            <div class="container mt-1">
                <h2 style="font-weight: bold">Todos los Casos</h2>
                </br>
                <div class="search-container">
                    <input type="text" id="searchInput" class="form-control" placeholder="Buscar casos..." onkeyup="searchCases()">
                </div>
                </br>
                <div class="table-responsive">
                    <table class="table text-center">
                        <thead>
                            <tr>
                                <th>Fecha de Registro</th>
                                <th>Rut</th>
                                <th>Tipo de Conflicto</th>
                                <th>Tienda</th>
                                <th>Método</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="casos-tbody">
                            <tr>
                                <td colspan="5" class="text-center">Cargando casos...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`;

            // Hacer la solicitud para obtener todos los casos
            fetch('/api/todos_los_casos/')
                .then(response => response.json())
                .then(casos => {
                    const tbody = document.getElementById('casos-tbody');
                    if (casos.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="5" class="text-center">No hay casos registrados</td>
                            </tr>`;
                        return;
                    }

                    tbody.innerHTML = casos.map(caso => `
                        <tr>
                            <td>${formatDate(caso.created_at)}</td>
                            <td>${caso.rut_usuario}</td>
                            <td>${caso.conflict_type}</td>
                            <td>${caso.store_name}</td>
                            <td>${formatAcquisitionMethod(caso.acquisition_method)}</td>
                            <td>
                                <div>
                                    <button onclick="verCaso(${caso.id})" class="btn btn-primary btn-sm" aria-label="Ver caso">
                                        <i class="fa fa-eye fa-lg" aria-hidden="true"></i>
                                    </button>
                                    <button onclick="eliminarCaso(${caso.id})" class="btn btn-danger btn-sm" aria-label="Eliminar caso">
                                        <i class="fa fa-trash fa-lg" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                })
                .catch(error => {
                    console.error('Error al cargar los casos:', error);
                    document.getElementById('casos-tbody').innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-danger">
                                Error al cargar los casos. Por favor, intente nuevamente.
                            </td>
                        </tr>`;
                });
    } else if (section === "admin_new-case") {
        fetch('/consumidor/?section=new-case')
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
            })
            .catch(error => console.error('Error al cargar la sección de nuevo caso:', error));
    } else if (section === "admin_new-admin") {
        // Cargar formulario para crear un nuevo administrador
        mainContent.innerHTML = 
        `<div class="container mt-1">
            <h2 style="font-weight: bold">Crear Nuevo Administrador</h2>
            </br>
            <form method="post" id="new-admin-form">
                <div class="form-group">
                    <label for="nombre">Nombre Completo:</label>
                    <input type="text" id="nombre" class="form-control" name="first_name" required>
                </div>
                <div class="form-group">
                    <label for="email">Correo Electrónico:</label>
                    <input type="email" id="email" class="form-control" name="email" required>
                </div>
                <div class="form-group">
                    <label for="rut">RUT:</label>
                    <input type="text" id="rut" class="form-control" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" class="form-control" name="password" required>
                </div>
                <div class="form-group">
                    <label for="password_confirm">Confirmar Contraseña:</label>
                    <input type="password" id="password_confirm" class="form-control" name="password_confirm" required>
                </div>
                <button type="submit" class="btn btn-primary">Crear Administrador</button>
            </form>
        </div>`;
    
        // Manejador de evento para el formulario de crear administrador
        document.getElementById("new-admin-form").addEventListener("submit", function(event) {
            event.preventDefault();
            const formData = new FormData(this);
            
            const password = formData.get('password');
            const passwordConfirm = formData.get('password_confirm');
            if (password !== passwordConfirm) {
                alert("Las contraseñas no coinciden.");
                return;
            }
    
            // Enviar los datos del formulario al backend para crear el nuevo administrador
            fetch('/api/crear_admin/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Administrador creado con éxito');
                    loadSection('admin_profile');
                } else {
                    alert('Error al crear el administrador: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ocurrió un error al crear el administrador');
            });
        });
    } else if (section === "admin_dashboard") {
        mainContent.innerHTML = `
            <div class="container mt-1">
                <h2 style="font-weight: bold">Panel de Control</h2>
                </br>
                <div class="row">
                    <div class="col-md-6">
                        <h3>Resumen General</h3>
                        <div id="resumen-general-container">
                            <p class="text-center">Cargando datos...</p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h3>Resumen Último Mes</h3>
                        <div id="resumen-ultimo-mes-container">
                            <p class="text-center">Cargando datos...</p>
                        </div>
                    </div>
                </div>
            </div>`;
    
        // Cargar datos del dashboard
        fetch('/api/dashboard/')
            .then(response => response.json())
            .then(data => {
                console.log(data); 
                const generalContainer = document.getElementById('resumen-general-container');
                const ultimoMesContainer = document.getElementById('resumen-ultimo-mes-container');
    
                // Función para crear HTML de resumen
                const crearResumenHTML = (resumen) => {
                    return `
                        <table class="table">
                            <tr><td>Total de Casos:</td><td>${resumen.total_casos}</td></tr>
                            <tr>
                                <td>Tipos de Conflicto:</td>
                                <td>${resumen.tipos_conflicto.map(t => `${t.conflict_type}: ${t.count}`).join('<br>')}</td>
                            </tr>
                            <tr>
                                <td>Detalles de Conflicto:</td>
                                <td>${resumen.detalles_conflicto.map(d => `${d.conflict_details}: ${d.count}`).join('<br>')}</td>
                            </tr>
                            <!-- Repite para otros campos -->
                            <tr>
                                <td>Tamaños de Producto:</td>
                                <td>${resumen.tamanos_producto.map(p => `${p.product_size}: ${p.count}`).join('<br>')}</td>
                            </tr>
                            <!-- Continúa con los otros campos -->
                        </table>
                    `;
                };
    
                generalContainer.innerHTML = crearResumenHTML(data.resumen_general);
                ultimoMesContainer.innerHTML = crearResumenHTML(data.resumen_ultimo_mes);
            })
            .catch(error => {
                console.error('Error al cargar datos del dashboard:', error);
                const generalContainer = document.getElementById('resumen-general-container');
                const ultimoMesContainer = document.getElementById('resumen-ultimo-mes-container');
                generalContainer.innerHTML = '<p class="text-danger">Error al cargar datos</p>';
                ultimoMesContainer.innerHTML = '<p class="text-danger">Error al cargar datos</p>';
            });
    }
    else if (section === "admin_updates") {
        mainContent.innerHTML = `
            <div class="container mt-1">
            <h2 style="font-weight: bold">Actualizaciones</h2>
            </br>
            <ul class="list-group">
                <li class="list-group-item">No hay actualizaciones disponibles</li>
            </ul>
            </div>`;
    }
}

// Función auxiliar para formatear fechas
function formatDate(dateString, locale = 'es-ES') {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(locale, options);
}

// Función auxiliar para formatear el método de adquisición
function formatAcquisitionMethod(method) {
    const methods = {
        'online': 'En línea',
        'presencial': 'Presencial'
    };
    return methods[method] || method;
}

// Función para ver el detalle de un caso
function verCaso(casoId) {
    window.location.href = `/consumidor/caso/${casoId}/`;
}

// Función para eliminar un caso
function eliminarCaso(casoId) {
    if (confirm('¿Está seguro que desea eliminar este caso? Esta acción no se puede deshacer.')) {
        // Mostrar indicador de carga
        const casosTbody = document.getElementById('casos-tbody');
        casosTbody.innerHTML = `<tr><td colspan="5" class="text-center">Eliminando...</td></tr>`;
        
        fetch(`/api/casos/${casoId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                loadSection('consumidor_cases');  // Recargar la lista de casos
            } else {
                throw new Error('Error al eliminar el caso');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No se pudo eliminar el caso. Por favor, intente nuevamente.');
            casosTbody.innerHTML = `<tr><td colspan="5" class="text-center">Error al eliminar el caso.</td></tr>`;
        });
    }
}

// Función auxiliar para obtener el token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Función para buscar casos
let debounceTimeout;
function searchCases() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#casos-tbody tr');

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
        rows.forEach(row => {
            const cells = row.getElementsByTagName('td');
            let match = false;
            for (let i = 0; i < cells.length - 1; i++) {
                const cell = cells[i];
                if (cell.textContent.toLowerCase().includes(filter)) {
                    match = true;
                    break;
                }
            }
            row.style.display = match ? '' : 'none';
        });
    }, 300);
}

// Función auxiliar para obtener el token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}