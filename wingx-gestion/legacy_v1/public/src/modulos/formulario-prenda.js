import { saveGarment, updateGarment, getGarmentById } from '../servicios/almacenamiento.js';
import { renderMaterialsList, showAlert, showSuccessToast } from '../utilidades/interfaz.js';

// Estado local
let currentMaterials = [];
let editingId = null;

// Elementos del DOM
const garmentForm = document.getElementById('garment-form');
const materialNameInput = document.getElementById('material-name');
const materialCostInput = document.getElementById('material-cost');
const addMaterialBtn = document.getElementById('add-material-btn');
const submitBtn = garmentForm.querySelector('button[type="submit"]');

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        editingId = id;
        submitBtn.textContent = 'Actualizar Prenda';
        document.getElementById('form-title').textContent = 'Editar Prenda';
        await loadGarmentData(id);
    }
});

// Listeners
addMaterialBtn.addEventListener('click', addMaterial);
garmentForm.addEventListener('submit', handleFormSubmit);

async function loadGarmentData(id) {
    const garment = await getGarmentById(id);
    if (!garment) {
        showAlert('error', 'Error', 'No se encontró la prenda.');
        setTimeout(() => window.location.href = 'prendas.html', 2000);
        return;
    }

    document.getElementById('garment-name').value = garment.name;
    document.getElementById('garment-size').value = garment.size || 'M';
    document.getElementById('garment-price').value = garment.price;
    document.getElementById('labor-cost').value = garment.laborCost;
    document.getElementById('transport-cost').value = garment.transportCost || 0;

    currentMaterials = garment.materials || [];
    renderMaterialsList(currentMaterials, removeMaterial);
}

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

        setTimeout(() => window.location.href = 'prendas.html', 1500);
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo guardar la prenda.');
        console.error(error);
    }
}
