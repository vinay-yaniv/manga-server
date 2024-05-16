import db from "../database/dbConnection.js";

const updateTotalChapter = async (values) => {
  const id = values.id;
  const newTotalChapter = values.newTotalChapter;
  const totalChapter = values.totalChapter;
  let sql;
console.log(id)
  if (newTotalChapter.length <= 0) return;
  if (newTotalChapter[0] > totalChapter) {
    sql = `UPDATE mangalist
    SET lastChapter = ?,
    totalChapter = ?,
    dateUpdate = CURRENT_TIMESTAMP
    WHERE id = ?;`;
  } else {
    return;
  }

  try {
    db.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return reject(err);
      }
      connection.query(
        sql,
        [newTotalChapter[1], newTotalChapter[0], id],
        (error, result) => {
          connection.release();

          if (error) {
            console.error("Error executing the query:", error);
            return reject(error);
          }

          const message = `${id}:${newTotalChapter}`;

          if (result) {
            return message;
          }
        }
      );
    });
  } catch (error) {
    console.log("error in updateTotalChapter", error);
  }
};

export default updateTotalChapter;
