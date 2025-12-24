import { getGarments, deleteGarmentFromStorage, saveGarment, updateGarment } from '../servicios/almacenamiento.js';
import { renderGarmentsList, showAlert, showSuccessToast, confirmAction, renderMaterialsList } from '../utilidades/interfaz.js';

// Estado local
let currentMaterials = [];
let editingId = null;

// Elementos del DOM
const toggleFormBtn = document.getElementById('toggle-form-btn');
const formContainer = document.getElementById('form-container');
const garmentForm = document.getElementById('garment-form');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const materialNameInput = document.getElementById('material-name');
const materialCostInput = document.getElementById('material-cost');
const addMaterialBtn = document.getElementById('add-material-btn');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshGarmentsList();
});

// Listeners
toggleFormBtn.addEventListener('click', () => {
    resetForm();
    showForm(true);
});

cancelBtn.addEventListener('click', () => {
    showForm(false);
    resetForm();
});

addMaterialBtn.addEventListener('click', addMaterial);
garmentForm.addEventListener('submit', handleFormSubmit);

// Funciones de UI
function showForm(show) {
    formContainer.style.display = show ? 'block' : 'none';
    toggleFormBtn.style.display = show ? 'none' : 'block';
    if (show) {
        document.getElementById('garment-name').focus();
    }
}

function resetForm() {
    editingId = null;
    currentMaterials = [];
    garmentForm.reset();
    document.getElementById('garment-id').value = '';
    formTitle.textContent = 'Nueva Prenda';
    renderMaterialsList(currentMaterials, removeMaterial);
}

// Funciones de Materiales
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

function removeMaterial(id) {
    currentMaterials = currentMaterials.filter(m => m.id !== id);
    renderMaterialsList(currentMaterials, removeMaterial);
}

// Funciones del Formulario
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

        showForm(false);
        resetForm();
        refreshGarmentsList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo guardar la prenda.');
        console.error(error);
    }
}

// Funciones de Gestión
function handleEditGarment(garment) {
    editingId = garment.id;
    document.getElementById('garment-id').value = garment.id;
    document.getElementById('garment-name').value = garment.name;
    document.getElementById('garment-size').value = garment.size || 'M';
    document.getElementById('garment-price').value = garment.price;
    document.getElementById('labor-cost').value = garment.laborCost;
    document.getElementById('transport-cost').value = garment.transportCost || 0;

    currentMaterials = garment.materials || [];
    renderMaterialsList(currentMaterials, removeMaterial);

    formTitle.textContent = 'Editar Prenda';
    showForm(true);
}

function handleDeleteGarment(id) {
    confirmAction('¿Estás seguro?', 'No podrás revertir esta acción', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteGarmentFromStorage(id);
                    await refreshGarmentsList();
                    showSuccessToast('¡Eliminado!');
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar la prenda.');
                    console.error(error);
                }
            }
        });
}

async function refreshGarmentsList() {
    try {
        const garments = await getGarments();
        renderGarmentsList(garments, handleDeleteGarment, handleEditGarment);
    } catch (error) {
        console.error("Error cargando prendas:", error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas.');
    }
}
