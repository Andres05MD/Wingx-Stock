import { getGarments, deleteGarmentFromStorage, getOrders } from './storage.js';
import { renderGarmentsList, showAlert, showSuccessToast, confirmAction } from './ui.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshGarmentsList();
});

function handleEditRedirect(garment) {
    window.location.href = `form.html?id=${garment.id}`;
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
        renderGarmentsList(garments, handleDeleteGarment, handleEditRedirect);
        await updateStats(garments);
    } catch (error) {
        console.error("Error cargando prendas:", error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas.');
    }
}

async function updateStats(garments) {
    try {
        // Total de prendas
        document.getElementById('total-garments').textContent = garments.length;

        // Ganancia potencial total (suma de todas las ganancias de las prendas)
        const totalProfit = garments.reduce((sum, g) => sum + (g.profit || 0), 0);
        document.getElementById('total-profit').textContent = `$${totalProfit.toFixed(2)}`;

        // Obtener pedidos para calcular estadísticas
        const orders = await getOrders();

        // Pedidos activos (no finalizados)
        const activeOrders = orders.filter(o => o.status !== 'Finalizado');
        document.getElementById('active-orders').textContent = activeOrders.length;

        // Total por cobrar (suma de saldos pendientes)
        const pendingPayments = orders.reduce((sum, o) => {
            const balance = o.price - o.paidAmount;
            return sum + (balance > 0 ? balance : 0);
        }, 0);
        document.getElementById('pending-payments').textContent = `$${pendingPayments.toFixed(2)}`;

    } catch (error) {
        console.error("Error actualizando estadísticas:", error);
    }
}
