import { getGarments, getStockItems, saveStockItem, updateStockItem, deleteStockItem } from '../servicios/almacenamiento.js';
import { showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Referencias del DOM
const modal = document.getElementById('stock-modal');
const addStockBtn = document.getElementById('add-stock-btn');
const closeModalBtn = document.getElementById('close-modal');
const stockForm = document.getElementById('stock-form');
const garmentSelect = document.getElementById('garment-select');
const stockContainer = document.getElementById('stock-container');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    loadGarmentsForSelect();
    refreshStockList();

    // Event listeners
    addStockBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        stockForm.reset();
    });

    // Cerrar modal al hacer click fuera de él
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            stockForm.reset();
        }
    });

    stockForm.addEventListener('submit', handleStockFormSubmit);

    // Listener para mostrar información de la prenda seleccionada
    garmentSelect.addEventListener('change', handleGarmentSelectionForDisplay);
});

/**
 * Muestra información de la prenda seleccionada
 */
function handleGarmentSelectionForDisplay() {
    const selectedOption = garmentSelect.options[garmentSelect.selectedIndex];
    const infoDisplay = document.getElementById('garment-info-display');
    const detailsDiv = document.getElementById('garment-details');

    if (!selectedOption.value) {
        infoDisplay.style.display = 'none';
        return;
    }

    const garmentData = JSON.parse(selectedOption.dataset.garmentData);

    let detailsHTML = `
        <p style="margin-bottom: 0.25rem;"><strong>Precio:</strong> $${garmentData.price.toFixed(2)}</p>
        <p style="margin-bottom: 0.25rem;"><strong>Costo Total:</strong> $${garmentData.totalCost.toFixed(2)}</p>
        <p style="margin-bottom: 0.25rem;"><strong>Ganancia:</strong> $${garmentData.profit.toFixed(2)}</p>
    `;

    if (garmentData.materials && garmentData.materials.length > 0) {
        detailsHTML += `<p style="margin-top: 0.5rem; margin-bottom: 0.25rem;"><strong>Materiales:</strong></p>`;
        garmentData.materials.forEach(m => {
            detailsHTML += `<p style="margin-left: 1rem; margin-bottom: 0.1rem; font-size: 0.8rem;">• ${m.name} - $${m.cost.toFixed(2)}</p>`;
        });
    }

    detailsDiv.innerHTML = detailsHTML;
    infoDisplay.style.display = 'block';
}

/**
 * Carga las prendas en el select del modal
 */
async function loadGarmentsForSelect() {
    try {
        const garments = await getGarments();
        garmentSelect.innerHTML = '<option value="">-- Seleccione una prenda --</option>';

        garments.forEach(garment => {
            const option = document.createElement('option');
            option.value = garment.id;
            option.textContent = `${garment.name} - $${garment.price.toFixed(2)}`;
            option.dataset.garmentData = JSON.stringify(garment);
            garmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error cargando prendas:", error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas.');
    }
}

/**
 * Maneja el envío del formulario de stock
 */
async function handleStockFormSubmit(e) {
    e.preventDefault();

    const selectedOption = garmentSelect.options[garmentSelect.selectedIndex];
    if (!selectedOption.value) {
        showAlert('warning', 'Atención', 'Debe seleccionar una prenda.');
        return;
    }

    const garmentData = JSON.parse(selectedOption.dataset.garmentData);
    const size = document.getElementById('stock-size').value;
    const quantity = parseInt(document.getElementById('stock-quantity').value);
    const color = document.getElementById('stock-color').value || 'Sin especificar';

    const stockItem = {
        garmentId: garmentData.id,
        garmentName: garmentData.name,
        size: size,
        quantity: quantity,
        color: color,
        price: garmentData.price,
        totalCost: garmentData.totalCost,
        profit: garmentData.profit,
        materials: garmentData.materials,
        laborCost: garmentData.laborCost,
        transportCost: garmentData.transportCost,
        createdAt: new Date().toISOString()
    };

    try {
        await saveStockItem(stockItem);
        showSuccessToast('¡Item agregado al stock!');
        modal.style.display = 'none';
        stockForm.reset();
        await refreshStockList();
    } catch (error) {
        console.error("Error guardando item en stock:", error);
        showAlert('error', 'Error', 'No se pudo agregar el item al stock.');
    }
}

/**
 * Recarga la lista de stock
 */
async function refreshStockList() {
    try {
        const stockItems = await getStockItems();
        renderStockList(stockItems);
    } catch (error) {
        console.error("Error cargando stock:", error);
        showAlert('error', 'Error', 'No se pudo cargar el inventario.');
    }
}

/**
 * Renderiza la lista de items en stock
 */
function renderStockList(stockItems) {
    if (!stockContainer) return;

    stockContainer.innerHTML = '';

    if (stockItems.length === 0) {
        stockContainer.innerHTML = '<p style="text-align:center; color: #888;">No hay items en stock.</p>';
        return;
    }

    // Ordenar por fecha de creación (más reciente primero)
    stockItems.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });

    stockItems.forEach(item => {
        const profitClass = item.profit >= 0 ? 'profit-positive' : 'profit-negative';

        const card = document.createElement('div');
        card.className = 'garment-item';

        const materialsListHtml = item.materials?.map(m => `${m.name} ($${m.cost})`).join(', ') || 'Ninguno';

        card.innerHTML = `
            <div class="garment-info">
                <h3>${item.garmentName} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(Talla: ${item.size} - Color: ${item.color})</span></h3>
                <div class="garment-details">
                    <p><strong>Cantidad en Stock:</strong> <span style="color: #00b894; font-size: 1.2em; font-weight: 600;">${item.quantity}</span></p>
                    <p><strong>Precio Venta:</strong> $${item.price.toFixed(2)}</p>
                    <p><strong>Costos:</strong> Mano de Obra ($${item.laborCost.toFixed(2)}) + Pasaje ($${(item.transportCost || 0).toFixed(2)})</p>
                    <p><strong>Materiales:</strong> ${materialsListHtml}</p>
                    <p><strong>Costo Total:</strong> $${item.totalCost.toFixed(2)}</p>
                </div>
                <span class="profit-badge ${profitClass}">
                    Ganancia: $${item.profit.toFixed(2)}
                </span>
            </div>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const updateBtn = document.createElement('button');
        updateBtn.className = 'btn btn-secondary';
        updateBtn.textContent = 'Actualizar Cantidad';
        updateBtn.style.marginRight = '0.5rem';
        updateBtn.onclick = () => handleUpdateQuantity(item);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.onclick = () => handleDeleteStock(item.id);

        actionsDiv.appendChild(updateBtn);
        actionsDiv.appendChild(deleteBtn);
        card.appendChild(actionsDiv);

        stockContainer.appendChild(card);
    });
}

/**
 * Maneja la actualización de cantidad de un item
 */
async function handleUpdateQuantity(item) {
    const { value: newQuantity } = await Swal.fire({
        title: 'Actualizar Cantidad',
        input: 'number',
        inputLabel: `Cantidad actual: ${item.quantity}`,
        inputPlaceholder: 'Nueva cantidad',
        inputAttributes: {
            min: 0,
            step: 1
        },
        showCancelButton: true,
        confirmButtonColor: '#2d3436',
        cancelButtonColor: '#d63031',
        confirmButtonText: 'Actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (newQuantity !== undefined && newQuantity !== null) {
        try {
            const quantity = parseInt(newQuantity);
            if (quantity === 0) {
                // Si la cantidad es 0, preguntar si desea eliminar
                const result = await confirmAction(
                    '¿Eliminar item?',
                    'La cantidad es 0. ¿Desea eliminar este item del stock?',
                    'Sí, eliminar'
                );

                if (result.isConfirmed) {
                    await deleteStockItem(item.id);
                    showSuccessToast('¡Item eliminado!');
                    await refreshStockList();
                }
            } else {
                await updateStockItem(item.id, { quantity: quantity });
                showSuccessToast('¡Cantidad actualizada!');
                await refreshStockList();
            }
        } catch (error) {
            console.error("Error actualizando cantidad:", error);
            showAlert('error', 'Error', 'No se pudo actualizar la cantidad.');
        }
    }
}

/**
 * Maneja la eliminación de un item del stock
 */
function handleDeleteStock(id) {
    confirmAction('¿Estás seguro?', 'No podrás revertir esta acción', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteStockItem(id);
                    await refreshStockList();
                    showSuccessToast('¡Eliminado!');
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar el item.');
                    console.error(error);
                }
            }
        });
}
