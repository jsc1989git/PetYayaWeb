const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs"); // Set EJS as the template engine
app.use(express.static("public")); // Serve static files (CSS, JS, images)

app.get("/", (req, res) => {
    res.render("index", { title: "My EJS Page", username: "John Doe" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
