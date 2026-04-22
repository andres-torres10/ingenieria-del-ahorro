/**
 * SQLite wrapper using sql.js (pure WebAssembly — no compilation needed).
 * Exposes the same synchronous API as better-sqlite3.
 * Call initDatabase() once at startup before using db.
 */
const path = require('path');
const fs = require('fs');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DB_DIR, 'ingenieria_del_ahorro.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

fs.mkdirSync(DB_DIR, { recursive: true });

let _db = null;

function save() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function bindParams(args) {
  if (args.length === 1 && Array.isArray(args[0])) return args[0];
  return args;
}

function createWrapper() {
  return {
    prepare(sql) {
      return {
        run(...args) {
          const params = bindParams(args);
          _db.run(sql, params);
          save();
          const lastId = _db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] ?? 0;
          const changes = _db.exec('SELECT changes()')[0]?.values[0]?.[0] ?? 0;
          return { lastInsertRowid: lastId, changes };
        },
        get(...args) {
          const params = bindParams(args);
          const stmt = _db.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return undefined;
        },
        all(...args) {
          const params = bindParams(args);
          const results = [];
          const stmt = _db.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        },
      };
    },
    exec(sql) {
      _db.run(sql);
      save();
    },
    pragma(str) {
      try { _db.run(`PRAGMA ${str}`); } catch {}
    },
  };
}

let _wrapper = null;

async function initDatabase() {
  if (_wrapper) return _wrapper;

  const wasmPath = path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
  const wasmBinary = fs.readFileSync(wasmPath);
  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs({ wasmBinary });

  if (fs.existsSync(DB_PATH)) {
    _db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    _db = new SQL.Database();
  }

  _db.run('PRAGMA foreign_keys = ON');
  _db.run('PRAGMA journal_mode = WAL');

  // Run migrations
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const stmts = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of stmts) {
      try { _db.run(stmt); } catch {}
    }
  }

  save();
  _wrapper = createWrapper();
  return _wrapper;
}

// Proxy: throws if used before initDatabase() resolves
const db = new Proxy({}, {
  get(_, prop) {
    if (!_wrapper) throw new Error('Database not initialized. Await initDatabase() in server.js first.');
    return _wrapper[prop];
  }
});

module.exports = { db, initDatabase };
