import db from "../database/dbConnection.js";

const getAllManga = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM mangalist`;

    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return reject(err);
      }

      connection.query(sql, (error, result) => {
        connection.release();

        if (error) {
          console.error("Error executing the query:", error);
          return reject(error);
        }

        resolve(result);
      });
    });
  });
};

export default getAllManga;
