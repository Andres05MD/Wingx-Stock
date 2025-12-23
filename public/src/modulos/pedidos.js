import { getOrders, saveOrder, updateOrder, deleteOrder, getGarments, saveMaterial, getMaterials } from '../servicios/almacenamiento.js';
import { showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Elementos Principales
const orderForm = document.getElementById('order-form');
const ordersContainer = document.getElementById('orders-container');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const formContainer = document.getElementById('form-container');
const cancelOrderBtn = document.getElementById('cancel-order-btn');

// Elementos del Formulario
const garmentSelect = document.getElementById('garment-select');
const garmentNameInput = document.getElementById('garment-name');
const orderPriceInput = document.getElementById('order-price');

// Elementos de Materiales Custom
const catalogMaterialsDisplay = document.getElementById('catalog-materials-display');
const customMaterialsContainer = document.getElementById('custom-materials-container');
const customMaterialsList = document.getElementById('custom-materials-list');
const newMatNameInput = document.getElementById('new-mat-name');
const newMatCostInput = document.getElementById('new-mat-cost');
const addMaterialBtn = document.getElementById('add-material-btn');
const oldMaterialsInfo = document.getElementById('materials-info'); // Referencia al viejo si existiera para ocultarlo

let garmentsData = [];
let selectedGarment = null;
let customMaterials = []; // Lista temporal para materiales de pedido custom

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshOrdersList();
    loadGarments();
    setupFormToggle();
    if (oldMaterialsInfo) oldMaterialsInfo.style.display = 'none'; // Asegurar que el viejo no estorbe
});

// Listeners
orderForm.addEventListener('submit', handleOrderSubmit);
garmentSelect.addEventListener('change', handleGarmentSelection);

if (cancelOrderBtn) cancelOrderBtn.addEventListener('click', hideForm);

if (addMaterialBtn) {
    addMaterialBtn.addEventListener('click', handleAddCustomMaterial);
}

// Configurar toggle del form
function setupFormToggle() {
    if (!toggleFormBtn) return;
    toggleFormBtn.addEventListener('click', () => {
        const isVisible = formContainer.style.display !== 'none';
        if (isVisible) hideForm();
        else showForm();
    });
}

function showForm() {
    formContainer.style.display = 'block';

    // Resetear animación y scroll
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        formContainer.style.transition = 'all 0.3s ease';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
    }, 10);

    toggleFormBtn.textContent = '✕ Cancelar';
    toggleFormBtn.classList.add('btn-secondary');
}

function hideForm() {
    formContainer.style.display = 'none';
    orderForm.reset();
    selectedGarment = null;
    customMaterials = [];
    updateMaterialsUI();

    toggleFormBtn.textContent = '+ Agregar Pedido';
    toggleFormBtn.classList.remove('btn-secondary');
}

// Cargar catálogo
async function loadGarments() {
    try {
        garmentsData = await getGarments();
        garmentSelect.innerHTML = '<option value="">-- Seleccionar para autocompletar --</option>';
        garmentsData.forEach(garment => {
            const option = document.createElement('option');
            option.value = garment.id;
            option.textContent = `${garment.name} (${garment.size || 'N/A'}) - $${garment.price.toFixed(2)}`;
            garmentSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error cargando prendas:', error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas del catálogo.');
    }
}

// Selección de Prenda
function handleGarmentSelection() {
    const garmentId = garmentSelect.value;

    if (!garmentId) {
        selectedGarment = null;
    } else {
        selectedGarment = garmentsData.find(g => g.id === garmentId);
        if (selectedGarment) {
            orderPriceInput.value = selectedGarment.price.toFixed(2);
            garmentNameInput.value = selectedGarment.name;
        }
    }
    updateMaterialsUI();
}

// Manejar Materiales Custom
function handleAddCustomMaterial() {
    const name = newMatNameInput.value.trim();
    const cost = parseFloat(newMatCostInput.value) || 0;

    if (!name) {
        showSuccessToast('Ingresa un nombre para el material'); // Reusando toast para feedback rápido
        return;
    }

    customMaterials.push({ name, cost });
    newMatNameInput.value = '';
    newMatCostInput.value = '';
    newMatNameInput.focus();
    renderCustomMaterials();
}

function removeCustomMaterial(index) {
    customMaterials.splice(index, 1);
    renderCustomMaterials();
}

// Exponer removeCustomMaterial globalmente para el onclick
window.removeCustomMaterial = removeCustomMaterial;

function renderCustomMaterials() {
    customMaterialsList.innerHTML = '';
    customMaterials.forEach((mat, index) => {
        const chip = document.createElement('div');
        chip.style.cssText = 'background: #e2e8f0; padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;';
        chip.innerHTML = `
            <span>${mat.name} ($${mat.cost})</span>
            <button type="button" onclick="removeCustomMaterial(${index})" style="border: none; background: none; color: #64748b; cursor: pointer; font-weight: bold; padding: 0;">✕</button>
        `;
        customMaterialsList.appendChild(chip);
    });
}

function updateMaterialsUI() {
    if (selectedGarment) {
        // Modo Catálogo
        customMaterialsContainer.style.display = 'none';
        catalogMaterialsDisplay.style.display = 'block';

        if (selectedGarment.materials && selectedGarment.materials.length > 0) {
            catalogMaterialsDisplay.innerHTML = '<strong>Incluye:</strong> ' + selectedGarment.materials
                .map(m => `${m.name} ($${m.cost})`).join(', ');
        } else {
            catalogMaterialsDisplay.innerHTML = '<em>Esta prenda no tiene materiales registrados en el catálogo.</em>';
        }
    } else {
        // Modo Custom
        customMaterialsContainer.style.display = 'block';
        catalogMaterialsDisplay.style.display = 'none';
        renderCustomMaterials();
    }
}

// Guardar Pedido
async function handleOrderSubmit(e) {
    e.preventDefault();

    const clientName = document.getElementById('client-name').value.trim();
    const garmentName = garmentNameInput.value.trim();
    const size = document.getElementById('garment-size').value;
    const price = parseFloat(orderPriceInput.value);
    const paidAmount = parseFloat(document.getElementById('paid-amount').value);
    const status = document.getElementById('order-status').value;

    if (!clientName || !garmentName || isNaN(price) || isNaN(paidAmount)) {
        showAlert('warning', 'Campos incompletos', 'Completa los campos obligatorios (*).');
        return;
    }

    const order = {
        clientName,
        garmentName,
        garmentId: selectedGarment ? selectedGarment.id : null,
        size,
        price,
        paidAmount,
        status,
        createdAt: new Date().toISOString()
    };

    try {
        await saveOrder(order);

        // Procesar Materiales
        let materialsToSave = [];
        if (selectedGarment && selectedGarment.materials) {
            materialsToSave = selectedGarment.materials;
        } else if (!selectedGarment && customMaterials.length > 0) {
            materialsToSave = customMaterials;
        }

        if (materialsToSave.length > 0) {
            // Incluir el nombre del cliente en la nota para mejor agrupación
            await addMaterialsToShoppingList(materialsToSave, `${garmentName} - ${clientName}`);
        }

        showSuccessToast('¡Pedido Guardado!');
        hideForm();
        await refreshOrdersList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo guardar el pedido.');
        console.error(error);
    }
}

/**
 * Agrega materiales a la lista de compras global
 * @param {Array} materials Lista de materiales {name, cost}
 * @param {string} sourceName Nombre de la prenda o pedido origen
 */
async function addMaterialsToShoppingList(materials, sourceName) {
    try {
        const existingMaterials = await getMaterials();

        for (const mat of materials) {
            // Verificar duplicados no comprados
            const exists = existingMaterials.some(
                m => m.name.toLowerCase() === mat.name.toLowerCase() && !m.purchased
            );

            if (!exists) {
                await saveMaterial({
                    name: mat.name,
                    quantity: '1 unidad', // Valor por defecto
                    price: parseFloat(mat.cost) || 0,
                    notes: `Pedido: ${sourceName}`,
                    purchased: false,
                    createdAt: new Date().toISOString()
                });
            }
        }
    } catch (error) {
        console.error('Error guardando materiales:', error);
    }
}

// Funciones de Lista de Pedidos
async function refreshOrdersList() {
    try {
        const orders = await getOrders();
        renderOrdersList(orders);
    } catch (error) {
        console.error("Error cargando pedidos:", error);
    }
}

function renderOrdersList(orders) {
    ordersContainer.innerHTML = '';
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align:center; color: #888;">No hay pedidos registrados.</p>';
        return;
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    orders.forEach(order => {
        const balance = order.price - order.paidAmount;
        const statusColors = {
            'Sin Comenzar': '#d63031',
            'En Proceso': '#fdcb6e',
            'Finalizado': '#00b894'
        };
        const statusColor = statusColors[order.status] || '#636e72';

        const card = document.createElement('div');
        card.className = 'garment-item';
        card.innerHTML = `
            <div class="garment-info" style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${order.clientName}</h3>
                    <span style="background:${statusColor}; color:white; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.8rem;">${order.status}</span>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">Prenda: <strong>${order.garmentName}</strong> <span style="font-size: 0.8em; color: #666;">(Talla: ${order.size || 'N/A'})</span></p>
                
                <div class="garment-details">
                    <p><strong>Precio Total:</strong> $${order.price.toFixed(2)}</p>
                    <p><strong>Abonado:</strong> $${order.paidAmount.toFixed(2)}</p>
                    <p style="color: ${balance > 0 ? '#d63031' : '#00b894'}; font-weight:bold;">
                        ${balance > 0 ? `Resta: $${balance.toFixed(2)}` : '¡Pagado Completo!'}
                    </p>
                </div>

                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; color: var(--text-color);">Estado del Pedido</label>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="width: 100%; padding: 0.625rem 0.875rem; border-radius: var(--radius); border: 1px solid var(--border-color); font-size: 0.95rem; margin-bottom: 0.75rem;">
                        <option value="Sin Comenzar" ${order.status === 'Sin Comenzar' ? 'selected' : ''}>Sin Comenzar</option>
                        <option value="En Proceso" ${order.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="Finalizado" ${order.status === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
                    </select>
                    
                    <div style="display: flex; gap: 0.75rem;">
                        ${balance > 0 ? `<button class="btn btn-secondary" style="flex: 1;" onclick="addPayment('${order.id}', ${balance}, ${order.paidAmount})">Registrar Pago</button>` : ''}
                        <button class="btn btn-danger" style="flex: 1;" onclick="deleteOrderHandler('${order.id}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
        ordersContainer.appendChild(card);
    });
}

// Globales
window.updateOrderStatus = async (id, newStatus) => {
    try {
        await updateOrder(id, { status: newStatus });
        showSuccessToast('Estado actualizado');
        refreshOrdersList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo actualizar.');
    }
};

window.deleteOrderHandler = (id) => {
    confirmAction('¿Eliminar Pedido?', 'Esta acción no se puede deshacer', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteOrder(id);
                    showSuccessToast('Pedido eliminado');
                    refreshOrdersList();
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar.');
                }
            }
        });
};

window.addPayment = async (id, currentBalance, currentPaidAmount) => {
    const { value: amount } = await Swal.fire({
        title: 'Registrar Pago',
        input: 'number',
        inputLabel: `Restante: $${currentBalance.toFixed(2)}`,
        inputPlaceholder: 'Monto a abonar',
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value <= 0) return 'Monto inválido';
            if (parseFloat(value) > currentBalance) return 'El monto excede la deuda';
        }
    });

    if (amount) {
        try {
            await updateOrder(id, { paidAmount: currentPaidAmount + parseFloat(amount) });
            showSuccessToast('Pago registrado');
            refreshOrdersList();
        } catch (error) {
            showAlert('error', 'Error', 'Falló el registro del pago.');
        }
    }
};
