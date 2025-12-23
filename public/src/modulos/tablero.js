import { getGarments, deleteGarmentFromStorage, getOrders } from '../servicios/almacenamiento.js';
import { renderGarmentsList, showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshOrdersList();
});

function handleEditRedirect(garment) {
    window.location.href = `formulario-prenda.html?id=${garment.id}`;
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

async function refreshOrdersList() {
    try {
        const orders = await getOrders();
        const garments = await getGarments();
        renderOrdersList(orders);
        await updateStats(garments, orders);
    } catch (error) {
        console.error("Error cargando datos:", error);
        showAlert('error', 'Error', 'No se pudieron cargar los datos.');
    }
}

function renderOrdersList(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;

    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: #888;">No hay pedidos registrados aún.</p>';
        return;
    }

    // Ordenar pedidos por fecha (más recientes primero)
    orders.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });

    orders.forEach(order => {
        const balance = order.price - order.paidAmount;
        const balanceClass = balance > 0 ? 'profit-negative' : 'profit-positive';
        const statusClass = order.status === 'Finalizado' ? 'status-completed' :
            order.status === 'En Proceso' ? 'status-inprogress' : 'status-pending';

        const card = document.createElement('div');
        card.className = 'garment-item';

        card.innerHTML = `
            <div class="garment-info">
                <h3>${order.clientName} <span style="font-size: 0.8em; color: #666; font-weight: normal;">(${order.garmentName} - Talla: ${order.size})</span></h3>
                <div class="garment-details">
                    <p><strong>Precio Total:</strong> $${order.price.toFixed(2)}</p>
                    <p><strong>Abonado:</strong> $${order.paidAmount.toFixed(2)}</p>
                    <p><strong>Saldo:</strong> <span style="color: ${balance > 0 ? '#d63031' : '#00b894'};">$${balance.toFixed(2)}</span></p>
                    <p><strong>Estado:</strong> <span class="${statusClass}">${order.status}</span></p>
                </div>
                <span class="profit-badge ${balanceClass}">
                    ${balance > 0 ? 'Pendiente: $' + balance.toFixed(2) : 'Pagado Completo'}
                </span>
            </div>
        `;

        container.appendChild(card);
    });
}

async function updateStats(garments, orders) {
    try {
        // Total de prendas
        const totalGarmentsEl = document.getElementById('total-garments');
        if (totalGarmentsEl) totalGarmentsEl.textContent = garments.length;

        // Ingresos Reales (Suma de lo abonado)
        const realIncome = orders.reduce((sum, o) => sum + (o.paidAmount || 0), 0);
        const realIncomeEl = document.getElementById('real-income');
        if (realIncomeEl) realIncomeEl.textContent = `$${realIncome.toFixed(2)}`;

        // Pedidos activos (no finalizados)
        const activeOrders = orders.filter(o => o.status !== 'Finalizado');
        const activeOrdersEl = document.getElementById('active-orders');
        if (activeOrdersEl) activeOrdersEl.textContent = activeOrders.length;

        // Total por cobrar (suma de saldos pendientes)
        const pendingPayments = orders.reduce((sum, o) => {
            const balance = o.price - o.paidAmount;
            return sum + (balance > 0 ? balance : 0);
        }, 0);
        const pendingPaymentsEl = document.getElementById('pending-payments');
        if (pendingPaymentsEl) pendingPaymentsEl.textContent = `$${pendingPayments.toFixed(2)}`;

    } catch (error) {
        console.error("Error actualizando estadísticas:", error);
    }
}
