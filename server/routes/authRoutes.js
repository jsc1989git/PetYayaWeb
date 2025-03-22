const express = require('express');
const passport = require('../config/passport');
const router = express.Router();

// Initiate Google OAuth login
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/',  // Redirect to home on failure
    successRedirect: '/feed' // Redirect to feed on success
  })
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { 
      console.error("Logout error:", err);
      return res.redirect('/'); 
    }
    res.redirect('/');
  });
});

module.exports = router;