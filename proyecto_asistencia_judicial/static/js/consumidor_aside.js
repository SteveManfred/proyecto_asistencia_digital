// Mi consumidor_aside.js:
function loadSection(section) {
    const mainContent = document.getElementById("main-content");

    if (section === "consumidor_profile") {
        mainContent.innerHTML = `
        <div class="container mt-1">
            <h2 style="font-weight: bold">Perfil del Consumidor</h2>
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
    } else if (section === "consumidor_cases") {
        mainContent.innerHTML = `
        <div class="container mt-1">
            <h2 style="font-weight: bold">Mis Casos</h2>
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
                <div id="pagination-container"></div>
            </div>
        </div>`;

        let currentPage = 1;
        const itemsPerPage = 6;
    
        function renderCases(page) {
            fetch('/api/casos/')
                .then(response => response.json())
                .then(casos => {
                    const tbody = document.getElementById('casos-tbody');
                    const paginationContainer = document.getElementById('pagination-container');
                    
                    // Calcular los casos para la página actual
                    const startIndex = (page - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedCases = casos.slice(startIndex, endIndex);
    
                    if (casos.length === 0) {
                        tbody.innerHTML = `
                            <tr>
                                <td colspan="5" class="text-center">No hay casos registrados</td>
                            </tr>`;
                        return;
                    }
    
                    tbody.innerHTML = paginatedCases.map(caso => `
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
    
                    // Limpiar contenedor de paginación
                    paginationContainer.innerHTML = '';
                    
                    // Crear y agregar paginación
                    const pagination = createPagination(
                        casos.length, 
                        itemsPerPage, 
                        page, 
                        (newPage) => {
                            currentPage = newPage;
                            renderCases(currentPage);
                        }
                    );
                    paginationContainer.appendChild(pagination);
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
        }
    
        // Renderizar la primera página
        renderCases(currentPage);
    } else if (section === "consumidor_new-case") {
        fetch('/consumidor/?section=new-case')
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
            })
            .catch(error => console.error('Error al cargar la sección de nuevo caso:', error));
    } else if (section === "consumidor_updates") {
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

let debounceTimeout;
function searchCases() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const rows = document.querySelectorAll('#casos-tbody tr');

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
        let visibleRowsCount = 0;
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
            
            if (match) {
                row.style.display = '';
                visibleRowsCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Mostrar mensaje si no hay resultados
        const noResultsRow = document.querySelector('#casos-tbody .no-results');
        if (visibleRowsCount === 0) {
            if (!noResultsRow) {
                const tr = document.createElement('tr');
                tr.className = 'no-results';
                tr.innerHTML = `<td colspan="5" class="text-center">No se encontraron resultados</td>`;
                document.getElementById('casos-tbody').appendChild(tr);
            }
        } else if (noResultsRow) {
            noResultsRow.remove();
        }
    }, 300);
}

    // Función para crear paginación
    function createPagination(totalItems, itemsPerPage, currentPage, onPageChange) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination justify-content-center mt-3';
        
        // Botón de página anterior
        const prevButton = document.createElement('button');
        prevButton.className = 'btn btn-secondary mr-2';
        prevButton.textContent = 'Anterior';
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => onPageChange(currentPage - 1);
        
        // Botón de página siguiente
        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-secondary ml-2';
        nextButton.textContent = 'Siguiente';
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => onPageChange(currentPage + 1);
        
        // Número de página actual
        const pageInfo = document.createElement('span');
        pageInfo.className = 'btn btn-light mx-2';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);
        
        return paginationContainer;
    }