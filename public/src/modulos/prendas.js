import { getGarments, deleteGarmentFromStorage } from '../servicios/almacenamiento.js';
import { renderGarmentsList, showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    refreshGarmentsList();
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

async function refreshGarmentsList() {
    try {
        const garments = await getGarments();
        renderGarmentsList(garments, handleDeleteGarment, handleEditRedirect);
    } catch (error) {
        console.error("Error cargando prendas:", error);
        showAlert('error', 'Error', 'No se pudieron cargar las prendas.');
    }
}
