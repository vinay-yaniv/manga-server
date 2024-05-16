import express from "express";
import cors from "cors";
import { scraper, updateChapter, scrapeLinks } from "./scrapper.js";
import mangaWeb from "./controlers/mangaWeb.js";
import getAllManga from "./controlers/getAllManga.js";
import incrementViews from "./controlers/incrementViews.js";
import updateTotalChapter from "./controlers/updateTotalChapter.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cron from "node-cron";
dotenv.config();

import db from "./database/dbConnection.js";

const port = process.env.PORT || process.env.DB_PORT;

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONT_WEBSITE_URL);
  next();
});

app.use(
  cors({
    origin: [process.env.FRONT_WEBSITE_URL],
    methods: ["POST", "GET", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

const verifyUser = (req, res, next) => {
  const token = req.body.token;
  if (!token) {
    return res.json({ Error: "User not authorized" });
  } else {
    jwt.verify(token, process.env.KEY_BRANCE_JT, (err, decoded) => {
      if (err) {
        return res.json({ Error: "Token is not verified", cookie: token });
      } else {
        req.name = decoded.name;
        next();
      }
    });
  }
};

app.post("/uploadManga", verifyUser, (req, res) => {
  return res.json({ Status: "success", name: req.name });
});

app.post("/chapter", async (req, res) => {
  const url = `${req.body.url}`;
  const chapClass = `${req.body.chapClass}`;

  const chapter = await scraper(url, chapClass);
  res.json(chapter);
});

app.post("/createManga", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    const result = await mangaWeb(data);
    return res.status(200).json({ message: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});

app.get("/allManga", async (req, res) => {
  try {
    const data = await getAllManga();

    if (!data || data.length === 0) {
      console.log("no data in database");
      return res.status(400).json({ error: "empty database" });
    }

    res.status(200).json({ result: data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});
// allChapters

app.post("/allChapters", async (req, res) => {
  const url = req.body.link;
  try {
    const data = await scrapeLinks(url);
    if (!data || data.length <= 0) {
      console.log(`no chapter for this ${link}`);
      return res.status(400).json({ error: link });
    }

    res.status(200).json({ result: data });
  } catch (error) {
    console.log(url);
    console.error("Error");
    res.status(500).json({ error: "An error occurred." });
  }
});

app.post("/incrementViews", async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Invalid request data." });
    }

    await incrementViews(data);

    return res.status(200).json({ message: "Manga view incremented." });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ error: "An error occurred while creating the manga." });
  }
});

app.post("/login", (req, res) => {
  console.log(req.body.email.toString());
  const sql = `SELECT * FROM admins WHERE email = ?`;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return reject(err);
    }
    connection.query(sql, req.body.email.toString(), (error, data) => {
      connection.release();

      if (error) return res.json({ Error: "Login error in server" });
      if (data.length > 0) {
        bcrypt.compare(
          req.body.password.toString(),
          data[0].password,
          (err, response) => {
            if (err) return res.json({ Error: "password compare error" });
            if (response) {
              const name = data[0].name;
              const token = jwt.sign({ name }, process.env.KEY_BRANCE_JT, {
                expiresIn: "1d",
              });
              // res.cookie("token", "cokie is here", {
              //   httpOnly: true,
              //   maxAge: 3600000 * 5,
              //   secure: true,
              //   sameSite: "none",
              // });
              return res.json({ Status: "success", cookie: token });
            } else {
              return res.json({ Error: "email or password incorrect" });
            }
          }
        );
      } else {
        return res.json({ Error: "password or email incorrect" });
      }
    });
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ Status: "success" });
});

app.post("/updateManga", (req, res) => {
  const data = req.body;
  if (!data) {
    res.json({ Error: "no data was sent" });
    return;
  }
  const { id, updateNum, updateChap } = data;

  const sql = `UPDATE mangalist
  SET lastChapter = ?,
  totalChapter = ?,
  dateUpdate = CURRENT_TIMESTAMP
  WHERE id = ?;`;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return reject(err);
    }
    connection.query(sql, [updateChap, updateNum, id], (error, result) => {
      connection.release();

      if (error) {
        console.error("Error executing the query:", error);
        return error;
      }
      const message = "updated latest and total ";
      return message;
    });
  });
});

app.delete("/deleteManga/:id", (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "no valid id found" });
  }

  const sql = `DELETE FROM mangalist WHERE id = ?`;

  db.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      reject(err);
      return res.status(400).json({ error: "Invalid request data." });
    }
    connection.query(sql, [id], (error, result) => {
      connection.release();

      if (error) {
        console.error("Error executing the query:", error);
        return res.status(400).json({ error: "Error executing the query." });
      }
      const message = "deleted successfully";
      return res.status(200).json({ message: message });
    });
  });
});

// app.delete("/deleteManga/:id", (req, res) => {
//   const id = req.params.id;
//   if (!id) {
//     return res.status(400).json({ error: "no valid id found" });
//   }

//   const sql = `DELETE FROM mangalist WHERE id = ?`;

//   db.getConnection((err, connection) => {
//     if (err) {
//       console.error("Error getting database connection:", err);
//       reject(err);
//       return res.status(400).json({ error: "Invalid request data." });
//     }
//     connection.query(sql, [id], (error, result) => {
//       connection.release();

//       if (error) {
//         console.error("Error executing the query:", error);
//         return res.status(400).json({ error: "Error executing the query." });
//       }
//       const message = "deleted successfully";
//       return res.status(200).json({ message: message });
//     });
//   });
// });

const chapterUpdate = async () => {
  try {
    const data = await getAllManga();

    if (!data || data.length <= 0) {
      console.log("no data found in database");
      return res.status(400).json({ error: "Invalid request data." });
    }
    data.forEach(async (element) => {
      const { id, websiteName, totalChapter } = element;
      let newTotalChapter = await updateChapter(websiteName);

      await updateTotalChapter({
        id,
        newTotalChapter,
        totalChapter,
      });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred." });
  }
};

cron.schedule("0 2 * * 0", (err) => {
  console.log("Running API request...");
  chapterUpdate();
});

app.listen(9000, () => {
  console.log(`listening on port ${port}`);
});
