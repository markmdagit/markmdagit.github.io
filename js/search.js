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
          screen_size TEXT,
          resolution TEXT,
          processor TEXT,
          ram TEXT,
          storage TEXT,
          os TEXT,
          part_numbers TEXT
        )
      `;
      db.run(createTableQuery);

      const insertStmt = db.prepare(`
        INSERT INTO laptops (brand, model, screen_size, resolution, processor, ram, storage, os, part_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      data.forEach(laptop => {
        const screenPartNumbers = laptop["Screen Replacement Part # (Common)"].split(',').map(p => p.trim());
        const batteryPartNumber = laptop["Battery Replacement Part # (Common)"].trim();
        const allPartNumbers = [...screenPartNumbers, batteryPartNumber].filter(p => p);

        insertStmt.run([
          "HP", // brand
          laptop.Model,
          laptop.Display,
          laptop.Display,
          laptop.Processor,
          laptop.Memory,
          laptop["Internal Drive"],
          "Windows", // os
          allPartNumbers.join(',')
        ]);
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
      const query = `
        SELECT * FROM laptops
        WHERE model LIKE ? OR processor LIKE ? OR storage LIKE ? OR part_numbers LIKE ? OR ram LIKE ? OR screen_size LIKE ?
      `;
      const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
      const stmt = db.prepare(query);
      stmt.bind(params);

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
          <p><strong>Part Numbers:</strong> ${row.part_numbers}</p>
          <p><strong>CPU:</strong> ${row.processor}</p>
          <p><strong>RAM:</strong> ${row.ram} GB</p>
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