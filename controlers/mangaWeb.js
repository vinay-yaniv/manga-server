import db from "../database/dbConnection.js";
import { scrapeTotal } from "../scrapper.js";

const mangaWeb = async (values) => {
  const valuesArray = [
    values.websiteName,
    values.mangaName,
    values.mangaCover,
    values.mangaClass,
    values.mangaType,
  ];
  let totalChapterD = 0;
  await scrapeTotal(values.websiteName).then((d) => {
    valuesArray.push(d.totalChapters);
    valuesArray.push(d.firstChapter);
    valuesArray.push(d.lastChapter);
    totalChapterD = d.totalChapters;
  });

  if (!totalChapterD || totalChapterD <= 0) {
    let message = "could not scrape total chapter";
    console.log(message);
    return message;
  }

  const sql = `INSERT INTO mangalist (\`websiteName\`, \`mangaName\`, \`mangaCover\`, \`mangaClass\`, \`mangaType\` ,\`totalChapter\`,\`firstChapter\`,\`lastChapter\`) VALUES (?, ?, ?, ?, ?, ?, ? ,?)`;

  try {
    const result = await new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) {
          console.error("Error getting database connection:", err);
          return reject(err);
        }
        connection.query(sql, valuesArray, (error, result) => {
          connection.release();

          if (error) {
            console.error("Error executing the query:", error);
            return reject(error);
          }

          resolve(result);
        });
      });
    });

    if (result) {
      const message = `successfully added to dataBase`;

      return message;
    } else {
      return "check the database";
    }
  } catch (error) {
    console.log(error);
    const message = `error while inserting to database`;
    return message;
  }

  return;
};

export default mangaWeb;
