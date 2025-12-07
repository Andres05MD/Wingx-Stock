// Elementos del DOM
const materialsList = document.getElementById('materials-list');
const garmentsContainer = document.getElementById('garments-container');

/**
 * Renderiza la lista de materiales en el formulario.
 * @param {Array} materials - Lista de materiales actuales.
 * @param {Function} removeCallback - Función a ejecutar al eliminar un material.
 */
export function renderMaterialsList(materials, removeCallback) {
    materialsList.innerHTML = '';
    materials.forEach(material => {
        const div = document.createElement('div');
        div.className = 'material-row';
        div.style.alignItems = 'center';
        div.style.justifyContent = 'space-between';
        div.style.background = '#fff';
        div.style.padding = '0.5rem';
        div.style.borderRadius = '4px';

        div.innerHTML = `
            <span>${material.name} - $${material.cost.toFixed(2)}</span>
        `;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-danger';
        btn.textContent = 'X';
        btn.onclick = () => removeCallback(material.id);

        div.appendChild(btn);
        materialsList.appendChild(div);
    });
}

/**
 * Renderiza la lista de prendas guardadas.
 * @param {Array} garments - Lista de prendas obtenidas de la base de datos.
 * @param {Function} deleteCallback - Función a ejecutar al eliminar una prenda.
 * @param {Function} editCallback - Función a ejecutar al editar una prenda.
 */
export function renderGarmentsList(garments, deleteCallback, editCallback) {
    garmentsContainer.innerHTML = '';

    if (garments.length === 0) {
        garmentsContainer.innerHTML = '<p style="text-align:center; color: #888;">No hay prendas registradas aún.</p>';
        return;
    }

    // Ordenar por fecha de creación (más reciente primero), si existe el campo createdAt
    // Nota: Como los IDs de Firestore son strings, no podemos restar (b.id - a.id) directamente.
    // Usamos createdAt si está disponible.
    garments.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });

    garments.forEach(garment => {
        const profitClass = garment.profit >= 0 ? 'profit-positive' : 'profit-negative';

        const card = document.createElement('div');
        card.className = 'garment-item';

        const materialsListHtml = garment.materials.map(m => `${m.name} ($${m.cost})`).join(', ');

        card.innerHTML = `
            <div class="garment-info">
                <h3>${garment.name} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(Talla: ${garment.size || 'N/A'})</span></h3>
                <div class="garment-details">
                    <p><strong>Precio Venta:</strong> $${garment.price.toFixed(2)}</p>
                    <p><strong>Costos:</strong> Mano de Obra ($${garment.laborCost.toFixed(2)}) + Pasaje ($${(garment.transportCost || 0).toFixed(2)})</p>
                    <p><strong>Materiales:</strong> ${materialsListHtml || 'Ninguno'}</p>
                    <p><strong>Costo Total:</strong> $${garment.totalCost.toFixed(2)}</p>
                </div>
                <span class="profit-badge ${profitClass}">
                    Ganancia: $${garment.profit.toFixed(2)}
                </span>
            </div>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-secondary';
        editBtn.textContent = 'Editar';
        editBtn.style.marginRight = '0.5rem';
        editBtn.onclick = () => editCallback(garment);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.onclick = () => deleteCallback(garment.id);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        card.appendChild(actionsDiv);

        garmentsContainer.appendChild(card);
    });
}

/**
 * Muestra una alerta general usando SweetAlert2.
 * @param {string} icon - Icono de la alerta ('success', 'error', 'warning', etc.).
 * @param {string} title - Título de la alerta.
 * @param {string} text - Texto descriptivo.
 */
export function showAlert(icon, title, text) {
    Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#2d3436'
    });
}

/**
 * Muestra una notificación tipo "Toast" de éxito.
 * @param {string} title - Mensaje a mostrar.
 */
export function showSuccessToast(title) {
    Swal.fire({
        icon: 'success',
        title: title,
        timer: 2000,
        showConfirmButton: false
    });
}

/**
 * Muestra un diálogo de confirmación.
 * @param {string} title - Título del diálogo.
 * @param {string} text - Texto descriptivo.
 * @param {string} confirmText - Texto del botón de confirmar.
 * @returns {Promise} Promesa de SweetAlert2.
 */
export function confirmAction(title, text, confirmText) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2d3436',
        cancelButtonColor: '#d63031',
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancelar'
    });
}
