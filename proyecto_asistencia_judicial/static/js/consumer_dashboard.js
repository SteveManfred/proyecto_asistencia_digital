function loadSection(section) {
    const mainContent = document.getElementById("main-content");
    
    if (section === "profile") {
        mainContent.innerHTML = `
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
        `;
    }  else if (section === "cases") {
        mainContent.innerHTML = `
            <h2>Mis Casos</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Fecha de Registro</th>
                        <th>Fecha de Compra</th>
                        <th>Nombre de la Tienda</th>
                        <th>Método</th>
                        <th>Resumen</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Aquí se cargarían los casos del usuario -->
                </tbody>
            </table>
        `;
    } else if (section === "new-case") {
        // Aquí cargamos el formulario de nuevo caso
        fetch('/consumidor/?section=new-case')
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
            })
            .catch(error => console.error('Error al cargar la sección de nuevo caso:', error))
        ;
    } else if (section === "updates") {
        mainContent.innerHTML = `
            <h2>Actualizaciones</h2>
            <ul>
                <!-- Aquí se listarían las actualizaciones -->
            </ul>
        `;
    }
}
