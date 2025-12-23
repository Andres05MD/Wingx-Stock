import {
    getMaterials,
    saveMaterial,
    updateMaterial,
    deleteMaterial
} from '../servicios/almacenamiento.js';
import { showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Elementos del DOM
const materialForm = document.getElementById('material-form');
const materialNameInput = document.getElementById('material-name');
const materialQuantityInput = document.getElementById('material-quantity');
const materialPriceInput = document.getElementById('material-price');
const materialNotesInput = document.getElementById('material-notes');
const materialsContainer = document.getElementById('materials-container');
const formContainer = document.getElementById('form-container');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const cancelFormBtn = document.getElementById('cancel-form-btn');

// Elementos de Estadísticas
const totalCostEl = document.getElementById('total-cost');
const pendingItemsEl = document.getElementById('pending-items');
const purchasedItemsEl = document.getElementById('purchased-items');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshMaterialsList();
    setupFormHandler();
    setupFormToggle();
});

function setupFormToggle() {
    toggleFormBtn.addEventListener('click', () => {
        const isVisible = formContainer.style.display !== 'none';
        if (isVisible) {
            hideForm();
        } else {
            showForm();
        }
    });

    cancelFormBtn.addEventListener('click', () => {
        hideForm();
    });
}

function showForm() {
    formContainer.style.display = 'block';
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        formContainer.style.transition = 'all 0.3s ease';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
    }, 10);
    toggleFormBtn.textContent = '✕ Cerrar Formulario';
    toggleFormBtn.classList.add('btn-secondary');
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    materialNameInput.focus();
}

function hideForm() {
    formContainer.style.transition = 'all 0.3s ease';
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        formContainer.style.display = 'none';
        materialForm.reset();
    }, 300);
    toggleFormBtn.textContent = '+ Agregar Material';
    toggleFormBtn.classList.remove('btn-secondary');
}

function setupFormHandler() {
    materialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddMaterial();
    });
}

async function handleAddMaterial() {
    const name = materialNameInput.value.trim();
    const quantity = materialQuantityInput.value.trim();
    const price = parseFloat(materialPriceInput.value) || 0;
    const notes = materialNotesInput.value.trim();

    if (!name) {
        showAlert('error', 'Error', 'El nombre del material es obligatorio.');
        return;
    }

    const material = {
        name,
        quantity,
        price,
        notes,
        purchased: false,
        createdAt: new Date().toISOString()
    };

    try {
        await saveMaterial(material);
        showSuccessToast('¡Material agregado!');
        materialForm.reset();
        await refreshMaterialsList();
        hideForm();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo agregar el material.');
        console.error(error);
    }
}

async function handleTogglePurchased(id, currentStatus) {
    try {
        await updateMaterial(id, { purchased: !currentStatus });
        await refreshMaterialsList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo actualizar el estado.');
        console.error(error);
    }
}

function handleDeleteMaterial(id) {
    confirmAction('¿Estás seguro?', 'No podrás revertir esta acción', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteMaterial(id);
                    await refreshMaterialsList();
                    showSuccessToast('¡Eliminado!');
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar el material.');
                    console.error(error);
                }
            }
        });
}

async function refreshMaterialsList() {
    try {
        const materials = await getMaterials();
        updateStats(materials);
        renderMaterialsList(materials);
    } catch (error) {
        console.error("Error cargando materiales:", error);
        showAlert('error', 'Error', 'No se pudieron cargar los materiales.');
    }
}

function updateStats(materials) {
    if (!totalCostEl) return;

    const pending = materials.filter(m => !m.purchased);
    const purchased = materials.filter(m => m.purchased);

    const totalCost = pending.reduce((sum, m) => sum + (m.price || 0), 0);

    totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
    pendingItemsEl.textContent = pending.length;
    purchasedItemsEl.textContent = purchased.length;
}

function renderMaterialsList(materials) {
    materialsContainer.innerHTML = '';

    if (materials.length === 0) {
        materialsContainer.innerHTML = '<p style="text-align:center; color: #888;">No hay materiales en la lista aún.</p>';
        return;
    }

    const pending = materials.filter(m => !m.purchased);
    const purchased = materials.filter(m => m.purchased);

    // Agrupar Pendientes
    if (pending.length > 0) {
        const grouped = {};

        pending.forEach(m => {
            let groupName = 'Otros Materiales';
            if (m.notes) {
                if (m.notes.includes('Pedido:')) {
                    groupName = m.notes; // Usar el texto completo como identificador
                } else if (m.notes.includes('Material para')) {
                    // Limpiar un poco el texto
                    groupName = m.notes;
                }
            }
            if (!grouped[groupName]) grouped[groupName] = [];
            grouped[groupName].push(m);
        });

        // Ordenar: Poner 'Otros Materiales' al final
        const sortedKeys = Object.keys(grouped).sort((a, b) => {
            if (a === 'Otros Materiales') return 1;
            if (b === 'Otros Materiales') return -1;
            return a.localeCompare(b);
        });

        sortedKeys.forEach(group => {
            // Header del grupo
            const groupHeader = document.createElement('div');
            groupHeader.style.cssText = 'background: #f1f5f9; padding: 0.5rem 1rem; border-radius: 0.5rem; margin: 1.5rem 0 0.5rem; color: var(--primary-color); font-weight: 600; font-size: 0.95rem; border-left: 4px solid var(--primary-color);';
            groupHeader.textContent = group;
            materialsContainer.appendChild(groupHeader);

            // Items del grupo
            grouped[group].forEach(material => {
                materialsContainer.appendChild(createMaterialCard(material));
            });
        });
    }

    // Comprados (Sin agrupar, al final)
    if (purchased.length > 0) {
        const purchasedTitle = document.createElement('h3');
        purchasedTitle.textContent = 'Historial de Compras';
        purchasedTitle.style.cssText = 'margin: 2rem 0 0.5rem; color: var(--success-color); font-size: 1.1rem; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;';
        materialsContainer.appendChild(purchasedTitle);

        purchased.forEach(material => {
            materialsContainer.appendChild(createMaterialCard(material));
        });
    }
}

function createMaterialCard(material) {
    const card = document.createElement('div');
    card.className = 'material-item';
    if (material.purchased) {
        card.classList.add('purchased');
    }

    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'material-checkbox';
    checkbox.checked = material.purchased;
    checkbox.onchange = () => handleTogglePurchased(material.id, material.purchased);
    checkboxWrapper.appendChild(checkbox);

    const infoContainer = document.createElement('div');
    infoContainer.className = 'material-info';

    const nameElement = document.createElement('h4');
    nameElement.textContent = material.name;

    const detailsElement = document.createElement('div');
    detailsElement.className = 'material-details';

    let detailsHTML = '';
    if (material.quantity) {
        detailsHTML += `<span class="detail-item">📏 ${material.quantity}</span>`;
    }
    if (material.price > 0) {
        detailsHTML += `<span class="detail-item">💵 $${material.price.toFixed(2)}</span>`;
    }
    detailsElement.innerHTML = detailsHTML;

    infoContainer.appendChild(nameElement);
    infoContainer.appendChild(detailsElement);

    // Solo mostrar nota si NO es una nota de agrupación automática
    // (es decir, si no empieza por "Pedido:" ni "Material para")
    if (material.notes) {
        const isAutoNote = material.notes.startsWith('Pedido:') || material.notes.startsWith('Material para');

        if (!isAutoNote) {
            const notesElement = document.createElement('p');
            notesElement.className = 'material-notes';
            notesElement.textContent = `📝 ${material.notes}`;
            infoContainer.appendChild(notesElement);
        }
    }

    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'material-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.setAttribute('aria-label', 'Eliminar');
    deleteBtn.onclick = () => handleDeleteMaterial(material.id);

    actionsContainer.appendChild(deleteBtn);

    card.appendChild(checkboxWrapper);
    card.appendChild(infoContainer);
    card.appendChild(actionsContainer);

    return card;
}
