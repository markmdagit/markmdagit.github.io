document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('laptop-search');
  const resultsContainer = document.getElementById('search-results');

  if (!searchInput) {
    return;
  }

  searchInput.disabled = true;

  let db;

  async function initDb() {
    try {
      const sqlPromise = initSqlJs(SQL_CONFIG);
      const dataPromise = fetch('../data/laptops.json').then(res => res.json());
      const [SQL, data] = await Promise.all([sqlPromise, dataPromise]);
      db = new SQL.Database();

      const createTableQuery = `
        CREATE TABLE laptops (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          brand TEXT,
          model TEXT,
          screen_size REAL,
          resolution TEXT,
          processor TEXT,
          ram INTEGER,
          storage TEXT,
          os TEXT,
          part_number TEXT UNIQUE
        )
      `;
      db.run(createTableQuery);

      const insertStmt = db.prepare(`
        INSERT INTO laptops (brand, model, screen_size, resolution, processor, ram, storage, os, part_number)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertedPartNumbers = new Set();
      data.forEach(laptop => {
        const screenPartNumbers = laptop["Screen Replacement Part # (Common)"].split(',').map(p => p.trim());
        const batteryPartNumber = laptop["Battery Replacement Part # (Common)"].trim();
        const allPartNumbers = [...screenPartNumbers, batteryPartNumber];

        allPartNumbers.forEach(partNumber => {
          if (partNumber && !insertedPartNumbers.has(partNumber)) {
            insertStmt.run([
              "HP", // brand
              laptop.Model,
              laptop.Display,
              laptop.Display,
              laptop.Processor,
              laptop.Memory, // ram
              laptop["Internal Drive"],
              "Windows", // os
              partNumber
            ]);
            insertedPartNumbers.add(partNumber);
          }
        });
      });

      insertStmt.free();
      searchInput.disabled = false;
      searchInput.placeholder = "Search for laptops...";
    } catch (err) {
      console.error('Database initialization failed:', err);
      searchInput.placeholder = "Search unavailable";
    }
  }

  const originalContent = document.getElementById('root');

  function searchLaptops(searchTerm) {
    if (!db) return;

    resultsContainer.innerHTML = '';

    if (!searchTerm) {
      originalContent.style.display = 'block';
      resultsContainer.style.display = 'none';
      return;
    }
    originalContent.style.display = 'none';
    resultsContainer.style.display = 'block';

    try {
      console.log(`Searching for: "${searchTerm}"`);
      const stmt = db.prepare(`
        SELECT * FROM laptops
        WHERE brand LIKE ? OR model LIKE ? OR processor LIKE ? OR part_number LIKE ? OR storage LIKE ? OR ram LIKE ?
      `);
      stmt.bind([`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);

      let resultCount = 0;
      let hasResults = false;
      while (stmt.step()) {
        hasResults = true;
        resultCount++;
        const row = stmt.getAsObject();
        const resultEl = document.createElement('div');
        resultEl.className = 'search-result';
        resultEl.innerHTML = `
          <h3>${row.brand} ${row.model}</h3>
          <p><strong>Part Number:</strong> ${row.part_number}</p>
          <p><strong>CPU:</strong> ${row.processor}</p>
          <p><strong>RAM:</strong> ${row.ram}</p>
          <p><strong>Storage:</strong> ${row.storage}</p>
        `;
        resultsContainer.appendChild(resultEl);
      }
      stmt.free();
      console.log(`Found ${resultCount} results.`);

      if (!hasResults) {
        const noResultsEl = document.createElement('div');
        noResultsEl.className = 'no-results';
        noResultsEl.textContent = 'No results found.';
        resultsContainer.appendChild(noResultsEl);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  }

  searchInput.addEventListener('input', (e) => {
    searchLaptops(e.target.value);
  });

  await initDb();
});