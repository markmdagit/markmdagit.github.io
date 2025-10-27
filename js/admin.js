document.addEventListener('DOMContentLoaded', async () => {
    const SQL_CONFIG = {
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    };

    // Calendar elements
    const calendarForm = document.getElementById('calendar-form');
    const calendarBody = document.getElementById('calendar-body');
    const monthTabs = document.querySelectorAll('.month-tab');

    // Income Manager elements
    const userForm = document.getElementById('user-form');
    const userTableBody = document.getElementById('user-table-body');

    if (!calendarForm || !userForm) {
        console.error("Required forms not found!");
        return;
    }

    let db;
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();
    let startDate = null;
    let endDate = null;

    async function initDb() {
        try {
            const sqlPromise = initSqlJs(SQL_CONFIG);
            const [SQL] = await Promise.all([sqlPromise]);
            db = new SQL.Database();
            db.exec("PRAGMA foreign_keys = ON;");

            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL
                );
            `);
            db.run(`
                CREATE TABLE IF NOT EXISTS income (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL UNIQUE,
                    wage REAL NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);
            db.run(`
                CREATE TABLE IF NOT EXISTS calendar_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    date TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);

            await loadAdminData();
        } catch (err) {
            console.error('Database initialization failed:', err);
        }
    }

    async function loadAdminData() {
        await renderCalendar(currentYear, currentMonth);
        await populateUserDropdown();
        await displayUsers();
        await calculateAndDisplayPayroll(currentYear, currentMonth);
    }

    // --- User Management ---
    async function displayUsers() {
        userTableBody.innerHTML = '';
        const users = db.exec("SELECT u.id, u.first_name, u.last_name, i.wage FROM users u LEFT JOIN income i ON u.id = i.user_id;");
        if (!users.length) return;

        users[0].values.forEach(row => {
            const [id, firstName, lastName, wage] = row;
            const tr = document.createElement('tr');
            tr.dataset.userId = id;
            tr.innerHTML = `
                <td>${firstName}</td>
                <td>${lastName}</td>
                <td>${wage !== null ? `$${wage.toFixed(2)}` : 'N/A'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${id}">Delete</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }

    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('user-first-name').value;
        const lastName = document.getElementById('user-last-name').value;
        const wage = parseFloat(document.getElementById('user-wage').value);

        db.run('INSERT INTO users (first_name, last_name) VALUES (?, ?)', [firstName, lastName]);
        const userId = db.exec("SELECT last_insert_rowid();")[0].values[0][0];
        db.run('INSERT INTO income (user_id, wage) VALUES (?, ?)', [userId, wage]);

        userForm.reset();
        await loadAdminData();
    });

    userTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const userId = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this user? This will also remove all their calendar events.')) {
                db.run('DELETE FROM users WHERE id = ?', [userId]);
                await loadAdminData();
            }
        } else if (target.classList.contains('edit-btn')) {
            const row = target.closest('tr');
            const cells = row.querySelectorAll('td');

            const wageCell = cells[2];
            const currentWage = parseFloat(wageCell.textContent.replace('$', ''));
            wageCell.innerHTML = `<input type="number" class="wage-input" value="${currentWage.toFixed(2)}" step="0.01">`;

            target.textContent = 'Save';
            target.classList.remove('edit-btn');
            target.classList.add('save-btn');
        } else if (target.classList.contains('save-btn')) {
            const row = target.closest('tr');
            const newWage = parseFloat(row.querySelector('.wage-input').value);

            db.run('UPDATE income SET wage = ? WHERE user_id = ?', [newWage, userId]);
            await displayUsers(); // Just refresh the user table
        }
    });

    // --- Calendar Management ---
    async function populateUserDropdown() {
        const userSelect = document.getElementById('cal-user-select');
        if (!userSelect) return; // The element might not exist if the form changes

        userSelect.innerHTML = '<option value="">Select User</option>';
        const users = db.exec("SELECT id, first_name, last_name FROM users;");
        if (users.length) {
            users[0].values.forEach(([id, firstName, lastName]) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = `${firstName} ${lastName}`;
                userSelect.appendChild(option);
            });
        }
    }

    async function renderCalendar(year, month) {
        calendarBody.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const events = await fetchEventsForMonth(year, month);

        for (let i = 0; i < firstDay; i++) calendarBody.appendChild(Object.assign(document.createElement('div'), { className: 'calendar-day empty' }));

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cell.dataset.date = dateStr;
            cell.innerHTML = `<div class="day-number">${day}</div>`;

            const dayEvents = events.filter(e => e.date === dateStr);
            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'calendar-event';
                eventDiv.innerHTML = `<strong>${event.first_name} ${event.last_name}</strong><br>${event.start_time} - ${event.end_time}`;
                cell.appendChild(eventDiv);
            });
            calendarBody.appendChild(cell);
        }
    }

    async function fetchEventsForMonth(year, month) {
        const monthStr = String(month + 1).padStart(2, '0');
        const stmt = db.prepare(`
            SELECT ce.id, ce.user_id, ce.date, ce.start_time, ce.end_time, u.first_name, u.last_name
            FROM calendar_events ce JOIN users u ON ce.user_id = u.id
            WHERE strftime('%Y-%m', ce.date) = :year_month
        `);
        stmt.bind({ ':year_month': `${year}-${monthStr}` });
        const events = [];
        while (stmt.step()) events.push(stmt.getAsObject());
        stmt.free();
        return events;
    }

    calendarBody.addEventListener('click', (e) => {
        const target = e.target.closest('.calendar-day');
        if (target && !target.classList.contains('empty')) {
            const selectedDate = new Date(target.dataset.date);
            selectedDate.setHours(0, 0, 0, 0);

            if (!startDate || (startDate && endDate)) {
                startDate = selectedDate;
                endDate = null;
                const allDays = calendarBody.querySelectorAll('.calendar-day');
                allDays.forEach(day => day.classList.remove('selected', 'in-range'));
                target.classList.add('selected');
                document.getElementById('cal-date').value = '';
                document.getElementById('total-days').textContent = '';
            } else {
                endDate = selectedDate;
                if (endDate < startDate) {
                    [startDate, endDate] = [endDate, startDate];
                }
                highlightDateRange();
            }
        }
    });

    function highlightDateRange() {
        if (!startDate || !endDate) return;

        const allDays = calendarBody.querySelectorAll('.calendar-day:not(.empty)');
        let daysInRange = 0;

        allDays.forEach(day => {
            const dayDate = new Date(day.dataset.date);
            dayDate.setHours(0, 0, 0, 0);

            if (dayDate >= startDate && dayDate <= endDate) {
                day.classList.add('in-range');
                daysInRange++;
            } else {
                day.classList.remove('in-range');
            }
        });

        const startDay = calendarBody.querySelector(`.calendar-day[data-date='${startDate.toISOString().split('T')[0]}']`);
        const endDay = calendarBody.querySelector(`.calendar-day[data-date='${endDate.toISOString().split('T')[0]}']`);

        if (startDay) startDay.classList.add('selected');
        if (endDay) endDay.classList.add('selected');

        const totalDaysElement = document.getElementById('total-days');
        if (daysInRange > 0) {
            totalDaysElement.textContent = `Total Days Selected: ${daysInRange}`;
        } else {
            totalDaysElement.textContent = '';
        }
    }

    calendarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('cal-user-select').value;
        const startTime = document.getElementById('cal-start-time').value;
        const endTime = document.getElementById('cal-end-time').value;

        if (!startDate || !endDate || !userId) {
            alert('Please select a user and a date range.');
            return;
        }

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const isoDate = currentDate.toISOString().split('T')[0];
            db.run('INSERT INTO calendar_events (user_id, date, start_time, end_time) VALUES (?, ?, ?, ?)', [userId, isoDate, startTime, endTime]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const eventEndDate = new Date(endDate);

        calendarForm.reset();
        startDate = null;
        endDate = null;
        document.getElementById('total-days').textContent = '';

        currentYear = eventEndDate.getFullYear();
        currentMonth = eventEndDate.getMonth();

        monthTabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.month) === currentMonth);
        });

        await renderCalendar(currentYear, currentMonth);
        await calculateAndDisplayPayroll(currentYear, currentMonth);
    });

    monthTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            currentMonth = parseInt(tab.dataset.month);
            monthTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            await renderCalendar(currentYear, currentMonth);
            await calculateAndDisplayPayroll(currentYear, currentMonth);
        });
    });

    // --- Payroll Calculation ---
    async function calculateAndDisplayPayroll(year, month) {
        const payrollTableBody = document.getElementById('payroll-table-body');
        payrollTableBody.innerHTML = '';

        const events = await fetchEventsForMonth(year, month);
        if (!events.length) return;

        const payrollData = {};

        const wages = db.exec("SELECT user_id, wage FROM income")[0].values.reduce((acc, [id, wage]) => {
            acc[id] = wage;
            return acc;
        }, {});

        events.forEach(event => {
            const userId = event.user_id;
            if (!payrollData[userId]) {
                payrollData[userId] = {
                    name: `${event.first_name} ${event.last_name}`,
                    scheduledHours: 0,
                    paidHours: 0,
                    totalIncome: 0
                };
            }
            const startTime = new Date(`1970-01-01T${event.start_time}`);
            const endTime = new Date(`1970-01-01T${event.end_time}`);
            const scheduledHours = (endTime - startTime) / (1000 * 60 * 60);
            const paidHours = scheduledHours > 0 ? Math.max(0, scheduledHours - 0.5) : 0;

            payrollData[userId].scheduledHours += scheduledHours;
            payrollData[userId].paidHours += paidHours;
            payrollData[userId].totalIncome += paidHours * (wages[userId] || 0);
        });

        for (const userId in payrollData) {
            const data = payrollData[userId];
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${data.name}</td>
                <td>${data.scheduledHours.toFixed(2)}</td>
                <td>${data.paidHours.toFixed(2)}</td>
                <td>$${data.totalIncome.toFixed(2)}</td>
            `;
            payrollTableBody.appendChild(tr);
        }
    }

    await initDb();
});