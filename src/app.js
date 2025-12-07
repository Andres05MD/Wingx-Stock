import { getGarments, saveGarment, deleteGarmentFromStorage, updateGarment } from './storage.js';
import { renderMaterialsList, renderGarmentsList, showAlert, showSuccessToast, confirmAction } from './ui.js';

// Estado local
let currentMaterials = [];
let editingId = null; // ID de la prenda que se está editando (null si es nueva)

// Elementos del DOM
const garmentForm = document.getElementById('garment-form');
const materialNameInput = document.getElementById('material-name');
const materialCostInput = document.getElementById('material-cost');
const addMaterialBtn = document.getElementById('add-material-btn');
const submitBtn = garmentForm.querySelector('button[type="submit"]');

// Botón de cancelar edición (creado dinámicamente o agregado al HTML)
let cancelEditBtn = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshGarmentsList();
});

// Listeners
addMaterialBtn.addEventListener('click', addMaterial);
garmentForm.addEventListener('submit', handleFormSubmit);

/**
 * Agrega un material a la lista temporal.
 */
function addMaterial() {
    const name = materialNameInput.value.trim();
    const cost = parseFloat(materialCostInput.value);

    if (name && !isNaN(cost)) {
        const material = { id: Date.now(), name, cost };
        currentMaterials.push(material);
        renderMaterialsList(currentMaterials, removeMaterial);

        materialNameInput.value = '';
        materialCostInput.value = '';
        materialNameInput.focus();
    } else {
        showAlert('error', 'Datos inválidos', 'Por favor ingresa un nombre y costo válido para el material.');
    }
}

/**
 * Elimina un material de la lista temporal.
 */
function removeMaterial(id) {
    currentMaterials = currentMaterials.filter(m => m.id !== id);
    renderMaterialsList(currentMaterials, removeMaterial);
}

/**
 * Prepara el formulario para editar una prenda existente.
 * @param {Object} garment - Objeto de la prenda a editar.
 */
function handleEditGarment(garment) {
    editingId = garment.id;

    // Rellenar campos
    document.getElementById('garment-name').value = garment.name;
    document.getElementById('garment-size').value = garment.size || 'M';
    document.getElementById('garment-price').value = garment.price;
    document.getElementById('labor-cost').value = garment.laborCost;
    document.getElementById('transport-cost').value = garment.transportCost || 0;

    // Cargar materiales
    currentMaterials = garment.materials || [];
    renderMaterialsList(currentMaterials, removeMaterial);

    // Cambiar texto del botón y mostrar cancelar
    submitBtn.textContent = 'Actualizar Prenda';
    showCancelButton();

    // Scroll hacia el formulario
    garmentForm.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Muestra el botón de cancelar edición si no existe.
 */
function showCancelButton() {
    if (!cancelEditBtn) {
        cancelEditBtn = document.createElement('button');
        cancelEditBtn.type = 'button';
        cancelEditBtn.className = 'btn btn-secondary';
        cancelEditBtn.textContent = 'Cancelar';
        cancelEditBtn.style.marginRight = '10px';
        cancelEditBtn.onclick = resetFormState;

        // Insertar antes del botón de submit
        submitBtn.parentNode.insertBefore(cancelEditBtn, submitBtn);
    }
    cancelEditBtn.style.display = 'inline-block';
}

/**
 * Resetea el formulario a su estado inicial (crear nueva prenda).
 */
function resetFormState() {
    editingId = null;
    garmentForm.reset();
    currentMaterials = [];
    renderMaterialsList(currentMaterials, removeMaterial);
    submitBtn.textContent = 'Guardar Prenda';

    if (cancelEditBtn) {
        cancelEditBtn.style.display = 'none';
    }
}

/**
 * Maneja el envío del formulario (Crear o Actualizar).
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('garment-name').value.trim();
    const size = document.getElementById('garment-size').value;
    const price = parseFloat(document.getElementById('garment-price').value);
    const laborCost = parseFloat(document.getElementById('labor-cost').value);
    const transportCost = parseFloat(document.getElementById('transport-cost').value);

    if (!name || isNaN(price) || isNaN(laborCost) || isNaN(transportCost)) {
        showAlert('warning', 'Campos incompletos', 'Por favor completa todos los campos principales.');
        return;
    }

    const materialsCost = currentMaterials.reduce((sum, m) => sum + m.cost, 0);
    const totalCost = laborCost + materialsCost + transportCost;
    const profit = price - totalCost;

    const garmentData = {
        name,
        size,
        price,
        laborCost,
        transportCost,
        materials: currentMaterials,
        totalCost,
        profit,
        updatedAt: new Date().toISOString()
    };

    if (!editingId) {
        garmentData.createdAt = new Date().toISOString();
    }

    try {
        if (editingId) {
            await updateGarment(editingId, garmentData);
            showSuccessToast('¡Actualizado!');
        } else {
            await saveGarment(garmentData);
            showSuccessToast('¡Guardado!');
        }

        resetFormState();
        await refreshGarmentsList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo guardar la prenda.');
        console.error(error);
    }
}

/**
 * Maneja la eliminación de una prenda.
 */
function handleDeleteGarment(id) {
    confirmAction('¿Estás seguro?', 'No podrás revertir esta acción', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteGarmentFromStorage(id);
                    // Si estamos editando la prenda que acabamos de borrar, resetear form
                    if (editingId === id) {
                        resetFormState();
                    }
                    await refreshGarmentsList();
                    showSuccessToast('¡Eliminado!');
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar la prenda.');
                    console.error(error);
                }
            }
        });
}

/**
 * Recarga la lista de prendas.
 */
async function refreshGarmentsList() {
    try {
        const garments = await getGarments();
        renderGarmentsList(garments, handleDeleteGarment, handleEditGarment);
    } catch (error) {
        console.error("Error cargando prendas:", error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas.');
    }
}
