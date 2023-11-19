const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();

const db = require("./db/connect");
db();

// import routes

const authModel = require("./models/authModel");
const user = require("./routes/userRoutes");
const notes = require("./routes/notesRoutes");

app.use("/notes/user", user);
app.use("/", authModel.authenticateUser);
app.use("/notes", notes);

app.get("/", (req,res) => {
    res.send("Save Your Notes Here!!!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on the port ${PORT}`);
});