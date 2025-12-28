/* public/js/parents/inactive-parents.js */

const { status, limit } = window.PARENT_CONFIG;

let currentPage = 1;
let currentSortBy = 'id';
let currentSortDir = 'DESC';

/* ================= FETCH ================= */
async function fetchParents(page = 1) {
    const search = document.getElementById('searchInput').value || '';

    const res = await fetch(
        `/parents/ajax/list` +
        `?page=${page}` +
        `&limit=${limit}` +
        `&status=${status}` +              // ✅ REQUIRED
        `&search=${encodeURIComponent(search)}` +
        `&sortBy=${currentSortBy}` +
        `&sortDir=${currentSortDir}`
    );

    const json = await res.json();
    if (!json.success) return;

    currentPage = json.pagination.page;
    renderTable(json.data);
}

/* ================= SORT ================= */
function sortTable(column) {
    if (currentSortBy === column) {
        currentSortDir = currentSortDir === 'ASC' ? 'DESC' : 'ASC';
    } else {
        currentSortBy = column;
        currentSortDir = 'ASC';
    }
    fetchParents(1);
}

/* ================= RENDER ================= */
function renderTable(parents) {
    const tbody = document.getElementById('parentsTableBody');
    tbody.innerHTML = '';

    if (!parents.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No parents found</td>
            </tr>`;
        return;
    }

    parents.forEach(p => {
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${p.name}</td>
                <td>${p.occupation}</td>
                <td>${p.mobile_no}</td>
                <td>${p.email}</td>
                <td>
                    <a href="/parents/profile/${p.id}">Profile</a>
                </td>
            </tr>
        `);
    });
}

/* ================= SEARCH ================= */
document.getElementById('searchInput')
    .addEventListener('keyup', () => fetchParents(1));

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
    fetchParents(1);
});
