document.addEventListener('DOMContentLoaded', async () => {
    const SQL_CONFIG = {
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    };
    const startTimeForm = document.getElementById('start-time-form');
    const endTimeForm = document.getElementById('end-time-form');
    const startTimeTableBody = document.getElementById('start-time-table-body');
    const endTimeTableBody = document.getElementById('end-time-table-body');

    if (!startTimeForm || !endTimeForm) {
        return;
    }

    let db;

    async function initDb() {
        try {
            const sqlPromise = initSqlJs(SQL_CONFIG);
            const [SQL] = await Promise.all([sqlPromise]);
            db = new SQL.Database();

            db.run(`
                CREATE TABLE IF NOT EXISTS start_times (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT,
                    last_name TEXT,
                    start_time TEXT
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS end_times (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT,
                    last_name TEXT,
                    end_time TEXT
                )
            `);

            loadData();
        } catch (err) {
            console.error('Database initialization failed:', err);
        }
    }

    function loadData() {
        loadTableData('start_times', startTimeTableBody, ['first_name', 'last_name', 'start_time']);
        loadTableData('end_times', endTimeTableBody, ['first_name', 'last_name', 'end_time']);
    }

    function loadTableData(tableName, tableBody, columns) {
        const stmt = db.prepare(`SELECT * FROM ${tableName}`);
        tableBody.innerHTML = '';
        while (stmt.step()) {
            const row = stmt.getAsObject();
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col];
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        }
        stmt.free();
    }

    startTimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('start-first-name').value;
        const lastName = document.getElementById('start-last-name').value;
        const startTime = document.getElementById('start-time').value;

        db.run('INSERT INTO start_times (first_name, last_name, start_time) VALUES (?, ?, ?)', [firstName, lastName, startTime]);
        startTimeForm.reset();
        loadTableData('start_times', startTimeTableBody, ['first_name', 'last_name', 'start_time']);
    });

    endTimeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = document.getElementById('end-first-name').value;
        const lastName = document.getElementById('end-last-name').value;
        const endTime = document.getElementById('end-time').value;

        db.run('INSERT INTO end_times (first_name, last_name, end_time) VALUES (?, ?, ?)', [firstName, lastName, endTime]);
        endTimeForm.reset();
        loadTableData('end_times', endTimeTableBody, ['first_name', 'last_name', 'end_time']);
    });

    await initDb();
});