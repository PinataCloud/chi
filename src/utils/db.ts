import { Database } from "sqlite3";
import { FilterOptions, RemoteQueue } from "../types";

const db = new Database("./queue.db");

const TABLE_NAME = "remote_pinning_service";

// Create a table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rules TEXT NOT NULL,
    cid TEXT NOT NULL, 
    pending BOOL NOT NULL DEFAULT TRUE,
    provider TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

export const insertFileIntoQueue = async (rules: string, cid: string) => {
  try {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO ${TABLE_NAME} (rules, cid) VALUES (?, ?)`,
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

export const getRemotePinningQueue = async (
  filterOptions?: FilterOptions
): Promise<RemoteQueue[]> => {
  return new Promise((resolve, reject) => {
    // Start with the base query
    let query = `SELECT * FROM ${TABLE_NAME}`;

    // An array to store the filter conditions
    const conditions: string[] = [];
    const params: (string | boolean)[] = [];

    // Add conditions if filter options are provided
    if (filterOptions?.pending !== undefined) {
      conditions.push("pending = ?");
      params.push(filterOptions.pending);
    }

    if (filterOptions?.provider) {
      conditions.push("provider = ?");
      params.push(filterOptions.provider);
    }

    // If any conditions are added, append them to the query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Append the ORDER BY clause
    query += " ORDER BY created_at";

    // Execute the query with the parameters
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("Queue retrieval error:", err);
        reject(err);
        return;
      }

      resolve(rows as RemoteQueue[]);
    });
  });
};

export const getPendingRemotePins = async (): Promise<RemoteQueue[]> => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM ${TABLE_NAME} WHERE pending = TRUE ORDER BY created_at`,
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

export const deleteFromPinningQueue = async (id: number) => {
  try {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM ${TABLE_NAME} WHERE id = ${id}`, function (err) {
        if (err) {
          console.error("Error deleting completed items:", err);
          reject(err);
        } else {
          console.log("Completed queue items removed.");
          resolve(this.changes);
        }
      });
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateRemotePinStatus = async (id: number, pending: boolean, provider: string) => {
    try {
        return new Promise((resolve, reject) => {
          const query = `
            UPDATE ${TABLE_NAME}
            SET pending = ?, provider = ?
            WHERE id = ?
          `;
    
          db.run(query, [pending, provider, id], function (err: any) {
            if (err) {
              console.error("DB error: ", err);
              reject(err);
              return;
            }
    
            // Check if any row was updated
            if (this.changes === 0) {
              console.log("No record found with the provided id.");
            }
    
            resolve(null);
          });
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
}
