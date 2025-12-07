import { getOrders, saveOrder, updateOrder, deleteOrder } from './storage.js';
import { showAlert, showSuccessToast, confirmAction } from './ui.js';

// Elementos
const orderForm = document.getElementById('order-form');
const ordersContainer = document.getElementById('orders-container');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshOrdersList();
});

// Listeners
orderForm.addEventListener('submit', handleOrderSubmit);

async function handleOrderSubmit(e) {
    e.preventDefault();

    const clientName = document.getElementById('client-name').value.trim();
    const garmentName = document.getElementById('garment-name').value.trim();
    const size = document.getElementById('garment-size').value;
    const price = parseFloat(document.getElementById('order-price').value);
    const paidAmount = parseFloat(document.getElementById('paid-amount').value);
    const status = document.getElementById('order-status').value;

    if (!clientName || !garmentName || isNaN(price) || isNaN(paidAmount)) {
        showAlert('warning', 'Campos incompletos', 'Por favor completa todos los campos.');
        return;
    }

    const order = {
        clientName,
        garmentName,
        size,
        price,
        paidAmount,
        status,
        createdAt: new Date().toISOString()
    };

    try {
        await saveOrder(order);
        showSuccessToast('¡Pedido Guardado!');
        orderForm.reset();
        await refreshOrdersList();
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo guardar el pedido.');
        console.error(error);
    }
}

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

    // Ordenar por fecha (más reciente primero)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    orders.forEach(order => {
        const balance = order.price - order.paidAmount;
        const statusColors = {
            'Sin Comenzar': '#d63031', // Rojo
            'En Proceso': '#fdcb6e',   // Amarillo/Naranja
            'Finalizado': '#00b894'    // Verde
        };
        const statusColor = statusColors[order.status] || '#636e72';

        const card = document.createElement('div');
        card.className = 'garment-item'; // Reutilizamos estilos de tarjeta

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

// Hacer funciones globales para los eventos onclick en el HTML generado
window.updateOrderStatus = async (id, newStatus) => {
    try {
        await updateOrder(id, { status: newStatus });
        showSuccessToast('Estado actualizado');
        refreshOrdersList(); // Recargar para actualizar colores si es necesario
    } catch (error) {
        showAlert('error', 'Error', 'No se pudo actualizar el estado.');
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
        inputLabel: `Monto restante: $${currentBalance.toFixed(2)}`,
        inputPlaceholder: 'Ingresa el monto a abonar',
        showCancelButton: true,
        confirmButtonText: 'Registrar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value || value <= 0) {
                return 'Por favor ingresa un monto válido';
            }
            if (parseFloat(value) > currentBalance) {
                return 'El monto no puede ser mayor a la deuda restante';
            }
        }
    });

    if (amount) {
        try {
            const newPaidAmount = currentPaidAmount + parseFloat(amount);
            await updateOrder(id, { paidAmount: newPaidAmount });
            showSuccessToast('Pago registrado');
            refreshOrdersList();
        } catch (error) {
            showAlert('error', 'Error', 'No se pudo registrar el pago.');
            console.error(error);
        }
    }
};
