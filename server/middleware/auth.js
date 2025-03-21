module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');
    },

    checkRole: (role) => {
      return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
          return next();
        }
        res.status(403).send('Access Denied');
      }
    }
  };