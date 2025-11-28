//public/main.js
document.querySelectorAll('.sidebar-section li').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-section li').forEach(li => li.classList.remove('active'));
        item.classList.add('active');
    });
});



document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar'); 

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function () {
            sidebar.classList.toggle('hidden');

            const icon = this.querySelector('i');
            if (icon) {
                if (sidebar.classList.contains('hidden')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
});


