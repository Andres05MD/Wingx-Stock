import { getClients, saveClient, updateClient, deleteClient } from '../servicios/almacenamiento.js';
import { showAlert, showSuccessToast, confirmAction } from '../utilidades/interfaz.js';

// Elementos DOM
const clientsContainer = document.getElementById('clients-container');
const clientForm = document.getElementById('client-form');
const formContainer = document.getElementById('form-container');
const toggleFormBtn = document.getElementById('toggle-form-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const formTitle = document.getElementById('form-title');

let allClients = [];
let isEditing = false;

document.addEventListener('DOMContentLoaded', () => {
    loadClients();
    setupEventListeners();
});

function setupEventListeners() {
    clientForm.addEventListener('submit', handleFormSubmit);

    toggleFormBtn.addEventListener('click', () => {
        if (formContainer.style.display === 'none') {
            showForm();
        } else {
            hideForm();
        }
    });

    cancelBtn.addEventListener('click', hideForm);

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allClients.filter(c =>
            c.name.toLowerCase().includes(term) ||
            (c.phone && c.phone.includes(term))
        );
        renderClients(filtered);
    });
}

function showForm(clientToEdit = null) {
    formContainer.style.display = 'block';
    // Animación simple
    formContainer.style.opacity = '0';
    formContainer.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        formContainer.style.transition = 'all 0.3s ease';
        formContainer.style.opacity = '1';
        formContainer.style.transform = 'translateY(0)';
    }, 10);

    toggleFormBtn.textContent = '✕ Cancelar';
    toggleFormBtn.classList.add('btn-secondary');

    if (clientToEdit) {
        isEditing = true;
        formTitle.textContent = 'Editar Cliente';
        document.getElementById('client-id').value = clientToEdit.id;
        document.getElementById('client-name').value = clientToEdit.name;
        document.getElementById('client-phone').value = clientToEdit.phone || '';
        document.getElementById('client-notes').value = clientToEdit.notes || '';
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        isEditing = false;
        formTitle.textContent = 'Registrar Cliente';
        clientForm.reset();
        document.getElementById('client-id').value = '';
    }
}

function hideForm() {
    formContainer.style.display = 'none';
    clientForm.reset();
    isEditing = false;
    toggleFormBtn.textContent = '+ Nuevo Cliente';
    toggleFormBtn.classList.remove('btn-secondary');
}

async function loadClients() {
    try {
        // Mostrar skeleton o loading
        clientsContainer.innerHTML = '<p style="text-align:center; color: #888;">Cargando clientes...</p>';

        allClients = await getClients();

        // Ordenar alfabéticamente
        allClients.sort((a, b) => a.name.localeCompare(b.name));

        renderClients(allClients);
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showAlert('error', 'Error', 'No se pudieron cargar los clientes.');
    }
}

function renderClients(clients) {
    clientsContainer.innerHTML = '';

    if (clients.length === 0) {
        clientsContainer.innerHTML = '<p style="text-align:center; color: #888;">No se encontraron clientes.</p>';
        return;
    }

    clients.forEach(client => {
        const card = document.createElement('div');
        card.className = 'garment-item'; // Reutilizamos estilo de tarjeta
        card.style.position = 'relative';

        const phoneLink = client.phone
            ? `<a href="https://wa.me/${client.phone.replace(/[^0-9]/g, '')}" target="_blank" style="color: var(--success-color); text-decoration: none; display: flex; align-items: center; gap: 0.25rem;">📱 ${client.phone}</a>`
            : '<span style="color: #999;">Sin teléfono</span>';

        card.innerHTML = `
            <div class="garment-info" style="width: 100%;">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3 style="margin-bottom: 0.25rem;">${client.name}</h3>
                    <div style="display: flex; gap: 0.5rem;">
                         <button class="btn btn-sm btn-secondary" onclick="editClient('${client.id}')">✏️</button>
                         <button class="btn btn-sm btn-danger" onclick="deleteClientHandler('${client.id}')">🗑️</button>
                    </div>
                </div>
                
                <div style="margin-top: 0.5rem; font-size: 0.95rem; display: grid; gap: 0.5rem;">
                    <div>${phoneLink}</div>
                </div>

                ${client.notes ? `
                    <div style="margin-top: 1rem; padding-top: 0.5rem; border-top: 1px dashed var(--border-color); font-size: 0.85rem; color: var(--text-muted); font-style: italic;">
                        "${client.notes}"
                    </div>
                ` : ''}
            </div>
        `;
        clientsContainer.appendChild(card);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('client-id').value;
    const clientData = {
        name: document.getElementById('client-name').value.trim(),
        phone: document.getElementById('client-phone').value.trim(),
        notes: document.getElementById('client-notes').value.trim(),
        updatedAt: new Date().toISOString()
    };

    if (!clientData.name) {
        showAlert('warning', 'Faltan datos', 'El nombre es obligatorio.');
        return;
    }

    // Formatear teléfono: Convertir 04XX... a +584XX...
    if (clientData.phone) {
        // Eliminar espacios y guiones
        let cleanPhone = clientData.phone.replace(/[\s-]/g, '');

        // Verificar si comienza con 0
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '+58' + cleanPhone.substring(1);
        }
        // Si no tiene + y no empieza por 0, asumimos que le falta el prefijo completo si son 10 dígitos, o dejamos igual
        else if (!cleanPhone.startsWith('+') && cleanPhone.length === 10) {
            cleanPhone = '+58' + cleanPhone;
        }

        clientData.phone = cleanPhone;
    }

    try {
        if (isEditing && id) {
            await updateClient(id, clientData);
            showSuccessToast('Cliente actualizado');
        } else {
            clientData.createdAt = new Date().toISOString();
            await saveClient(clientData);
            showSuccessToast('Cliente registrado');
        }

        hideForm();
        loadClients();
    } catch (error) {
        console.error('Error guardando cliente:', error);
        showAlert('error', 'Error', 'No se pudo guardar el cliente.');
    }
}

// Exponer funciones globales para los botones onlick
window.editClient = (id) => {
    const client = allClients.find(c => c.id === id);
    if (client) {
        showForm(client);
    }
};

window.deleteClientHandler = (id) => {
    confirmAction('¿Eliminar Cliente?', 'Se perderán sus datos de contacto.', 'Sí, eliminar')
        .then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteClient(id);
                    showSuccessToast('Cliente eliminado');
                    // Actualizar lista local para evitar recarga de red innecesaria si se quisiera, 
                    // pero loadClients es más seguro
                    loadClients();
                } catch (error) {
                    showAlert('error', 'Error', 'No se pudo eliminar.');
                }
            }
        });
};
