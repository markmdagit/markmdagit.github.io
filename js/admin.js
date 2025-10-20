document.addEventListener('DOMContentLoaded', async () => {
    const SQL_CONFIG = {
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    };
    const calendarForm = document.getElementById('calendar-form');
    const calendarBody = document.getElementById('calendar-body');

    if (!calendarForm) {
        return;
    }

    let db;

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
                    day TEXT,
                    start_time TEXT,
                    end_time TEXT
                )
            `);

            loadData();
        } catch (err) {
            console.error('Database initialization failed:', err);
        }
    }

    function loadData() {
        loadCalendarData();
    }

    function loadCalendarData() {
        const stmt = db.prepare('SELECT * FROM calendar_events');
        const events = [];
        while (stmt.step()) {
            events.push(stmt.getAsObject());
        }
        stmt.free();
        renderCalendar(events);
    }

    function renderCalendar(events) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        days.forEach(day => {
            const cell = document.getElementById(`cal-day-${day}`);
            if (cell) {
                cell.innerHTML = '';
            }
        });

        events.forEach(event => {
            const cell = document.getElementById(`cal-day-${event.day}`);
            if (cell) {
                const eventDiv = document.createElement('div');
                eventDiv.className = 'calendar-event';
                eventDiv.innerHTML = `
                    <strong>${event.first_name} ${event.last_name}</strong><br>
                    ${event.start_time} - ${event.end_time}
                `;
                cell.appendChild(eventDiv);
            }
        });
    }

    calendarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('cal-first-name').value;
        const lastName = document.getElementById('cal-last-name').value;
        const day = document.getElementById('cal-day').value;
        const startTime = document.getElementById('cal-start-time').value;
        const endTime = document.getElementById('cal-end-time').value;

        db.run('INSERT INTO calendar_events (first_name, last_name, day, start_time, end_time) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, day, startTime, endTime]);
        calendarForm.reset();
        loadCalendarData();
    });

    await initDb();
});