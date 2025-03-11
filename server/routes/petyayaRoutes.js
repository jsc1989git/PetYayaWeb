const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', petyayaController.index)
// Routes now protected (need to login to access)
router.get('/feed', ensureAuthenticated, petyayaController.posts);
router.post('/add-post', ensureAuthenticated, petyayaController.addPost);
router.put('/edit-post/:id', ensureAuthenticated, petyayaController.editPost);
router.delete('/delete-post/:id', ensureAuthenticated, petyayaController.deletePost);

module.exports = router;