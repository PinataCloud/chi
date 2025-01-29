import { Database } from 'sqlite3';

const db = new Database('./queue.db');

// Create a table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS remote_pinning_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rules TEXT NOT NULL,
    cid TEXT NOT NULL
  );
`);

export const insertFileIntoQueue = async (
  rules: string,
  cid: string
) => {
  try {
    db.run(
      `INSERT INTO remote_pinning_queue (rules, cid) VALUES (?, ?)`,
      [rules, cid],
      (err: any) => {
        if (err) {
          console.error("DB error: ", err);
          throw err;
        }
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};
