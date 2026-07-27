// public/js/dashboard.js
// Handles AJAX-driven admin panel features: Manage Users and Manage Requests
// (Loaded only on admin/users.ejs and admin/requests.ejs)

// ===================================================================
// MANAGE USERS PAGE
// ===================================================================
function initUsersPage() {
  let currentPage = 1;
  let searchTimeout = null;

  const tableBody = document.getElementById('usersTableBody');
  const paginationEl = document.getElementById('usersPagination');
  const searchInput = document.getElementById('userSearchInput');
  const totalCountEl = document.getElementById('userTotalCount');

  function loadUsers(page = 1) {
    const search = searchInput.value.trim();
    fetch(`/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        currentPage = data.currentPage;
        totalCountEl.textContent = `${data.totalRecords} user(s) found`;

        if (data.users.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No users found.</td></tr>`;
        } else {
          tableBody.innerHTML = data.users
            .map(
              (u) => `
              <tr>
                <td>
                  <img src="${u.profileImage}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-right:8px;">
                  ${u.name}
                </td>
                <td>${u.email}</td>
                <td>${u.mobile}</td>
                <td>${u.vehicleType} - ${u.vehicleNumber || '-'}</td>
                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger delete-user-btn" data-id="${u._id}" data-name="${u.name}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>`
            )
            .join('');
        }

        renderPagination(paginationEl, data.currentPage, data.totalPages, loadUsers);
        attachDeleteHandlers();
      })
      .catch(() => {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">Failed to load users.</td></tr>`;
      });
  }

  function attachDeleteHandlers() {
    document.querySelectorAll('.delete-user-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const userId = this.getAttribute('data-id');
        const userName = this.getAttribute('data-name');

        Swal.fire({
          title: `Delete ${userName}?`,
          text: 'This will permanently delete the user and all their service requests.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete',
          confirmButtonColor: '#dc3545',
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  Swal.fire('Deleted!', data.message, 'success');
                  loadUsers(currentPage);
                } else {
                  Swal.fire('Error', data.message || 'Could not delete user', 'error');
                }
              })
              .catch(() => Swal.fire('Error', 'Server error. Please try again.', 'error'));
          }
        });
      });
    });
  }

  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadUsers(1), 400);
  });

  loadUsers(1);
}

// ===================================================================
// MANAGE REQUESTS PAGE
// ===================================================================
function initRequestsPage() {
  let currentPage = 1;
  let searchTimeout = null;

  const tableBody = document.getElementById('requestsTableBody');
  const paginationEl = document.getElementById('requestsPagination');
  const searchInput = document.getElementById('requestSearchInput');
  const statusFilter = document.getElementById('statusFilter');

  const modalEl = document.getElementById('manageRequestModal');
  const modal = new bootstrap.Modal(modalEl);

  function loadRequests(page = 1) {
    const search = searchInput.value.trim();
    const status = statusFilter.value;

    fetch(`/api/services/all?page=${page}&limit=10&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;
        currentPage = data.currentPage;

        if (data.requests.length === 0) {
          tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No requests found.</td></tr>`;
        } else {
          tableBody.innerHTML = data.requests
            .map((r) => {
              const statusClass = r.status.replace(/\s+/g, '-').toLowerCase();
              const userName = r.userId ? r.userId.name : 'Deleted User';
              const userEmail = r.userId ? r.userId.email : '-';
              return `
              <tr>
                <td>${userName}<br><small class="text-muted">${userEmail}</small></td>
                <td>${r.serviceType}</td>
                <td>${r.vehicleType} - ${r.vehicleNumber}</td>
                <td>${r.location}</td>
                <td><span class="status-badge status-${statusClass}">${r.status}</span></td>
                <td>${r.assignedMechanic || '-'}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary manage-request-btn"
                    data-id="${r._id}"
                    data-status="${r.status}"
                    data-mechanic="${r.assignedMechanic || ''}"
                    data-eta="${r.estimatedTime || ''}">
                    <i class="fa-solid fa-pen"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger delete-request-btn" data-id="${r._id}">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>`;
            })
            .join('');
        }

        renderPagination(paginationEl, data.currentPage, data.totalPages, loadRequests);
        attachRequestHandlers();
      })
      .catch(() => {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load requests.</td></tr>`;
      });
  }

  function attachRequestHandlers() {
    document.querySelectorAll('.manage-request-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        document.getElementById('modalRequestId').value = this.getAttribute('data-id');
        document.getElementById('modalStatus').value = this.getAttribute('data-status');
        document.getElementById('modalMechanic').value = this.getAttribute('data-mechanic');
        document.getElementById('modalEta').value = this.getAttribute('data-eta');
        modal.show();
      });
    });

    document.querySelectorAll('.delete-request-btn').forEach((btn) => {
      btn.addEventListener('click', function () {
        const requestId = this.getAttribute('data-id');

        Swal.fire({
          title: 'Delete this request?',
          text: 'This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete',
          confirmButtonColor: '#dc3545',
        }).then((result) => {
          if (result.isConfirmed) {
            fetch(`/api/services/${requestId}`, { method: 'DELETE' })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  Swal.fire('Deleted!', data.message, 'success');
                  loadRequests(currentPage);
                } else {
                  Swal.fire('Error', data.message || 'Could not delete request', 'error');
                }
              })
              .catch(() => Swal.fire('Error', 'Server error. Please try again.', 'error'));
          }
        });
      });
    });
  }

  document.getElementById('saveRequestUpdateBtn').addEventListener('click', function () {
    const requestId = document.getElementById('modalRequestId').value;
    const status = document.getElementById('modalStatus').value;
    const assignedMechanic = document.getElementById('modalMechanic').value;
    const estimatedTime = document.getElementById('modalEta').value;

    fetch(`/api/services/${requestId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignedMechanic, estimatedTime }),
    })
      .then((res) => res.json())
      .then((data) => {
        modal.hide();
        if (data.success) {
          Swal.fire('Updated!', 'Request has been updated successfully.', 'success');
          loadRequests(currentPage);
        } else {
          Swal.fire('Error', data.message || 'Could not update request', 'error');
        }
      })
      .catch(() => {
        modal.hide();
        Swal.fire('Error', 'Server error. Please try again.', 'error');
      });
  });

  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadRequests(1), 400);
  });

  statusFilter.addEventListener('change', function () {
    loadRequests(1);
  });

  loadRequests(1);
}

// ===================================================================
// SHARED PAGINATION RENDERER
// ===================================================================
function renderPagination(container, currentPage, totalPages, callback) {
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';

  html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
  </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" href="#" data-page="${i}">${i}</a>
    </li>`;
  }

  html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
  </li>`;

  container.innerHTML = html;

  container.querySelectorAll('.page-link').forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const page = parseInt(this.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages) {
        callback(page);
      }
    });
  });
}
