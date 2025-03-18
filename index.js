require('dotenv').config();
const express = require("express");
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const mongoose = require("mongoose");
const petyayaRoutes = require('./server/routes/petyayaroutes'); // Ensure the path is correct

const PORT = process.env.PORT || 3000;

const path = require('path');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Required for JSON requests
app.use(methodOverride('_method'));
app.use(express.static("public")); // Serve static files (CSS, JS, images)

// Correctly mount routes
app.use("/", petyayaRoutes); // Mount all routes under root

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
