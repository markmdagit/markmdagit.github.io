document.addEventListener('DOMContentLoaded', function() {
    const adminBtn = document.getElementById('admin-btn');
    const adminOptions = document.getElementById('admin-options');

    // Admin Sub-buttons
    const calendarBtn = document.getElementById('calendar-btn');
    const incomeManagerBtn = document.getElementById('income-manager-btn');
    const payrollBtn = document.getElementById('payroll-btn');

    const travelBtn = document.getElementById('travel-btn');
    const travelOptions = document.getElementById('travel-options');
    const oneHourDriveBtn = document.getElementById('one-hour-drive-btn');

    const adminSection = document.getElementById('admin-dashboard');
    const oneHourDriveSection = document.getElementById('one-hour-drive');

    const allSections = [adminSection, oneHourDriveSection].filter(s => s !== null);
    const allButtons = [calendarBtn, incomeManagerBtn, payrollBtn, oneHourDriveBtn].filter(b => b !== null);

    function setupDropdown(btn, options, ...otherOptions) {
        if (!btn || !options) return;
        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            const isDisplayed = options.style.display !== 'none';
            otherOptions.forEach(opt => {
                if (opt) opt.style.display = 'none';
            });
            options.style.display = isDisplayed ? 'none' : 'block';
        });
    }

    function activateSection(sectionId) {
        allSections.forEach(section => {
            section.style.display = 'none';
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        }
    }

    function setupButton(btn, sectionId) {
        if (!btn) return;
        btn.addEventListener('click', () => {
            activateSection(sectionId);

            // Manage active class on dropdown buttons
            allButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Close dropdowns
            if (adminOptions) adminOptions.style.display = 'none';
            if (travelOptions) travelOptions.style.display = 'none';
        });
    }

    setupDropdown(adminBtn, adminOptions, travelOptions);
    setupDropdown(travelBtn, travelOptions, adminOptions);

    // Admin Logic
    setupButton(calendarBtn, 'admin-dashboard');
    setupButton(incomeManagerBtn, 'admin-dashboard');
    setupButton(payrollBtn, 'admin-dashboard');

    // Travel Logic
    setupButton(oneHourDriveBtn, 'one-hour-drive');

    window.addEventListener('click', function(event) {
        if (adminBtn && !adminBtn.contains(event.target) && adminOptions) {
            adminOptions.style.display = 'none';
        }
        if (travelBtn && !travelBtn.contains(event.target) && travelOptions) {
            travelOptions.style.display = 'none';
        }
    });
});
