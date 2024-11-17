function loadSection(section) {
    const mainContent = document.getElementById("main-content");

    if (section === "consumidor_profile") {
        mainContent.innerHTML = `
        <div class="container mt-1">
            <h2>Perfil del Consumidor</h2>
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
    } else if (section === "consumidor_cases") {
        // Estructura de la tabla
        mainContent.innerHTML = `
        <div class="container mt-1">
            <h2>Mis Casos</h2>
            <div class="search-container">
                <input type="text" id="searchInput" class="form-control" placeholder="Buscar casos..." onkeyup="searchCases()">
            </div>
            <div class="table-responsive">
                <table class="table text-center">
                    <thead>
                        <tr>
                            <th>Fecha de Registro</th>
                            <th>Fecha de Compra</th>
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

        // Luego hacemos la petición para obtener los casos
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
                        <td>${formatDate(caso.purchase_date)}</td>
                        <td>${caso.store_name}</td>
                        <td>${formatAcquisitionMethod(caso.acquisition_method)}</td>
                        <td>
                            <div class="btn-group">
                                <button onclick="verCaso(${caso.id})" class="btn btn-link btn-sm">
                                    <i class="fa fa-eye fa-lg" aria-hidden="true"></i>
                                </button>
                                <button onclick="eliminarCaso(${caso.id})" class="btn btn-link btn-sm">
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
    } else if (section === "consumidor_new-case") {
        fetch('/consumidor/?section=new-case')
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
            })
            .catch(error => console.error('Error al cargar la sección de nuevo caso:', error));
    } else if (section === "consumidor_updates") {
        mainContent.innerHTML = `
            <h2>Actualizaciones</h2>
            <ul class="list-group">
                <li class="list-group-item">No hay actualizaciones disponibles</li>
            </ul>`;
    }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
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
        fetch(`/api/casos/${casoId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => {
            if (response.ok) {
                // Recargar la sección de casos
                loadSection('consumidor_cases');
            } else {
                throw new Error('Error al eliminar el caso');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('No se pudo eliminar el caso. Por favor, intente nuevamente.');
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
function searchCases() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#casos-tbody tr');

    rows.forEach(row => {
        const cells = row.getElementsByTagName('td');
        let match = false;

        // Verificar si algún valor de la fila coincide con la búsqueda
        for (let i = 0; i < cells.length - 1; i++) { // Excluimos la columna de acciones
            const cell = cells[i];
            if (cell.textContent.toLowerCase().includes(filter)) {
                match = true;
                break;
            }
        }

        // Mostrar u ocultar la fila dependiendo del resultado de la búsqueda
        if (match) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
