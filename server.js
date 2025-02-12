
const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const morgan = require("morgan");

//Controllers
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profile = require("./controllers/profile");
const image = require("./controllers/image");

//Middleware
const { requireAuth } = require("./middleware/auth");

require("dotenv").config();
const db = knex({
  // connect to your own database here:
  client: "pg",
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json()); // latest version of exressJS now comes with Body-Parser!

app.get("/", (req, res) => {
  console.log(process.env.POSTGRES_USER);
  console.log(db.user);
  res.send(db.user);
});

app.post("/signin", signin.signinAuthentication(db, bcrypt));
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.get("/profile/:id", requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});
app.put("/profile/:id", requireAuth, (req, res) => {
  profile.handleProfilePut(req, res, db);
});

app.put("/image", requireAuth, (req, res) => {
  image.handleImage(req, res, db);
});
app.post("/imageurl", requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.listen(8080, () => {
  console.log("app is running on port 8080");
});
