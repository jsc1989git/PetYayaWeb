require ('dotenv').config();
const express = require("express");
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('./server/config/passport');
const { ensureAuthenticated, checkRole } = require('./server/middleware/auth');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;

const petyayaRoute = require('./server/routes/petyayaRoutes')
const authRoutes = require('./server/routes/authRoutes');

const path = require('path')

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'", 
          "https://cdn.jsdelivr.net", 
          "https://cdnjs.cloudflare.com",
          "https://maps.googleapis.com", 
          "https://unpkg.com",
          "'unsafe-inline'" // For inline event handlers
        ],
        styleSrc: [
          "'self'", 
          "https://cdn.jsdelivr.net", 
          "https://fonts.googleapis.com",
          "https://unpkg.com",
          "https://www.googleapis.com",
          "'unsafe-inline'" 
        ],
        imgSrc: [
          "'self'", 
          "data:", 
          "https://api.thecatapi.com",
          "https://avataaars.io",
          "https://*.googleapis.com",
          'https://res.cloudinary.com'
        ],
        connectSrc: [
          "'self'",
          "https://api.thecatapi.com",
          "https://api.cloudinary.com"
        ],
        fontSrc: [
          "'self'", 
          "https://fonts.googleapis.com", 
          "https://fonts.gstatic.com", 
          "https://cdn.jsdelivr.net"
        ],
        frameSrc: ["'self'"]
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin"}
    }
  })
);

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
