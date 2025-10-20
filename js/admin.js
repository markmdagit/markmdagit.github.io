document.addEventListener('DOMContentLoaded', async () => {
    const SQL_CONFIG = {
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    };
    const calendarForm = document.getElementById('calendar-form');
    const calendarBody = document.getElementById('calendar-body');
    const monthTabs = document.querySelectorAll('.month-tab');

    if (!calendarForm || !calendarBody || !monthTabs.length) {
        console.error("Calendar elements not found!");
        return;
    }

    let db;
    const today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    async function initDb() {
        try {
            const sqlPromise = initSqlJs(SQL_CONFIG);
            const [SQL] = await Promise.all([sqlPromise]);
            db = new SQL.Database();

            db.run(`
                CREATE TABLE IF NOT EXISTS calendar_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT,
                    last_name TEXT,
                    date TEXT,
                    start_time TEXT,
                    end_time TEXT
                )
            `);

            renderCalendar(currentYear, currentMonth);
        } catch (err) {
            console.error('Database initialization failed:', err);
        }
    }

    async function renderCalendar(year, month) {
        calendarBody.innerHTML = '';
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const events = await fetchEventsForMonth(year, month);

        // Create blank cells for days before the first of the month
        for (let i = 0; i < firstDay; i++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day', 'empty');
            calendarBody.appendChild(cell);
        }

        // Create cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day');
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            cell.dataset.date = dateStr;

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;
            cell.appendChild(dayNumber);

            // Add events to this day
            const dayEvents = events.filter(e => e.date === dateStr);
            dayEvents.forEach(event => {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'calendar-event';
                eventDiv.innerHTML = `
                    <strong>${event.first_name} ${event.last_name}</strong><br>
                    ${event.start_time} - ${event.end_time}
                `;
                cell.appendChild(eventDiv);
            });

            calendarBody.appendChild(cell);
        }
    }

    async function fetchEventsForMonth(year, month) {
        const monthStr = String(month + 1).padStart(2, '0');
        const stmt = db.prepare(`
            SELECT * FROM calendar_events
            WHERE strftime('%Y-%m', date) = :year_month
        `);
        stmt.bind({ ':year_month': `${year}-${monthStr}` });

        const events = [];
        while (stmt.step()) {
            events.push(stmt.getAsObject());
        }
        stmt.free();
        return events;
    }

    calendarForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('cal-first-name').value;
        const lastName = document.getElementById('cal-last-name').value;
        const date = document.getElementById('cal-date').value;
        const startTime = document.getElementById('cal-start-time').value;
        const endTime = document.getElementById('cal-end-time').value;

        if (!date) {
            alert('Please select a date.');
            return;
        }

        db.run('INSERT INTO calendar_events (first_name, last_name, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, date, startTime, endTime]);
        calendarForm.reset();

        // Refresh the calendar for the month of the new event
        const newEventDate = new Date(date);
        currentYear = newEventDate.getFullYear();
        currentMonth = newEventDate.getMonth();

        monthTabs.forEach(tab => {
            tab.classList.toggle('active', parseInt(tab.dataset.month) === currentMonth);
        });

        await renderCalendar(currentYear, currentMonth);
    });

    monthTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentMonth = parseInt(tab.dataset.month);
            monthTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderCalendar(currentYear, currentMonth);
        });
    });

    await initDb();
});