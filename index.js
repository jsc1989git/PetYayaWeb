require ('dotenv').config();
const express = require("express");
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('./auth');
const MongoStore = require('connect-mongo');

const PORT = process.env.PORT || 3000;

const petyayaRoute = require('./server/routes/petyayaRoutes')
const authRoutes = require('./server/routes/authRoutes');

const path = require('path')

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.set('views', path.join(__dirname, 'views'));

// After requiring mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // = 14 days
  }),
  cookie: { 
      secure: false,  // Set to true if using https
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

  // Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use(express.static("public")); // Serve static files (CSS, JS, images)

// Add a middleware to pass user to all views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
  });
  
  app.use('/', petyayaRoute)
  app.use('/auth', authRoutes)
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
