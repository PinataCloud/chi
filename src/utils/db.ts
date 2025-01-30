import { Database } from "sqlite3";
import { RemoteQueue } from "../types";

const db = new Database("./queue.db");

// Create a table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS remote_pinning_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rules TEXT NOT NULL,
    cid TEXT NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

export const insertFileIntoQueue = async (rules: string, cid: string) => {
  try {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO remote_pinning_queue (rules, cid) VALUES (?, ?)`,
        [rules, cid],
        (err: any) => {
          if (err) {
            console.error("DB error: ", err);
            reject(err);
          }
          resolve(null);
        }
      );
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRemotePinningQueue = async (): Promise<RemoteQueue[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM remote_pinning_queue ORDER BY created_at`,
      (err, rows) => {
        if (err) {
          console.error("Queue retrieval error:", err);
          reject(err);
          return;
        }

        resolve(rows as RemoteQueue[]);
      }
    );
  });
};

export const deleteFromPinningQueue = async(id: number) => {
    try {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM remote_pinning_queue WHERE id = ${id}`, function (err) {
                if (err) {
                    console.error('Error deleting completed items:', err);
                    reject(err);
                } else {
                    console.log('Completed queue items removed.');
                    resolve(this.changes);
                }
            });
        });
    } catch (error) {
        console.log(error);
        throw error;
    }
}
