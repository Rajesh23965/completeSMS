//public/js/topbar.js

document.addEventListener("DOMContentLoaded", () => {

    const itemsContainer = document.getElementById('itemsContainer');
    const addItemBtn = document.getElementById('addItemBtn');
    const topbarForm = document.getElementById("topbarForm");

    if (!itemsContainer || !addItemBtn) {
        console.error("Topbar elements not found in DOM.");
        return;
    }

    // ADD NEW TOPBAR ITEM
    addItemBtn.addEventListener('click', () => {
        const newRow = document.createElement("div");
        newRow.classList.add("item-row", "row", "p-3", "mb-3", "border", "rounded");
        newRow.style.background = "#fafafa";

        newRow.innerHTML = `
            <input type="hidden" name="id[]" value="">
            <div class="col-md-2">
                <label>Type</label>
                <select name="type[]" class="form-select">
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="address">Address</option>
                    <option value="social">Social</option>
                    <option value="button">Button</option>
                    <option value="toggle">Toggle</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            <div class="col-md-1"><label>Section</label>
                <input type="number" name="section[]" class="form-control" value="12" min="1" max="12">
            </div>
            <div class="col-md-2">
                <label>Position</label>
                <select name="position[]" class="form-select">
                    <option value="start">Start</option>
                    <option value="center">Center</option>
                    <option value="end">End</option>
                    <option value="between">Between</option>
                    <option value="around">Around</option>
                </select>
            </div>
            <div class="col-md-1"><label>Order</label>
                <input type="number" name="order_no[]" class="form-control" value="0">
            </div>
            <div class="col-md-2"><label>Text</label>
                <input type="text" name="text[]" class="form-control" required>
            </div>
            <div class="col-md-1"><label>Icon</label>
                <input type="text" name="icon[]" class="form-control">
            </div>
            <div class="col-md-2"><label>URL</label>
                <input type="text" name="url[]" class="form-control">
            </div>
            <div class="col-md-1"><label>Border</label>
                <input type="text" name="border[]" class="form-control">
            </div>
            <div class="col-md-1"><label>Radius</label>
                <input type="text" name="radius[]" class="form-control">
            </div>
            <div class="col-md-2">
                <label>Device</label>
                <select name="device[]" class="form-select">
                    <option value="both">Both</option>
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                </select>
            </div>
            <div class="col-md-2 mt-3">
                <label class="fw-bold d-block">Visible</label>
                <label class="switch">
                    <input type="checkbox" name="visibility[]" value="1" checked>
                    <span class="slider"></span>
                </label>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger removeItemBtn">×</button>
            </div>
        `;

        itemsContainer.appendChild(newRow);
    });

    // DELETE ITEM
    itemsContainer.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("removeItemBtn")) return;

        const row = e.target.closest(".item-row");
        const id = e.target.dataset.id;

        if (!confirm("Are you sure you want to delete this item?")) return;

        if (id) {
            await fetch(`/frontend/topbar/delete/${id}`, { method: "DELETE" });
        }

        row.remove();
    });

    // VISIBILITY UPDATE
    itemsContainer.addEventListener("change", async (e) => {
        if (e.target.name !== "visibility[]") return;

        const checkbox = e.target;
        const row = checkbox.closest(".item-row");
        const id = row.dataset.id;

        if (!id) return;

        const visibility = checkbox.checked ? 1 : 0;

        try {
            const response = await fetch("/frontend/topbar/visibility/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, visibility })
            });

            const result = await response.json();

            if (!result.success) {
                alert("Failed to update visibility");
                checkbox.checked = !checkbox.checked;
            }
        } catch (error) {
            alert("Error updating visibility");
            checkbox.checked = !checkbox.checked;
        }
    });

});
