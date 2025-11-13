var db;

async function initDatabase() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    });
    db = new SQL.Database();

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS tickets (
            id TEXT PRIMARY KEY,
            summary TEXT,
            description TEXT,
            caller TEXT,
            assigned_group TEXT,
            assignee TEXT,
            status TEXT,
            priority TEXT,
            impact TEXT,
            urgency TEXT,
            category TEXT,
            asset TEXT,
            work_log TEXT,
            resolution TEXT
        );
    `;
    db.run(createTableQuery);
}

// The database is initialized in chatbot.js
