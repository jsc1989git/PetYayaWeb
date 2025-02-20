const express = require('express');
const router = express.Router();
const petyayaController = require('../controllers/petyayaController')

router.get('/', petyayaController.index)
router.get('/dashboard', petyayaController.posts)
router.post('/add-post', petyayaController.addPost)

module.exports = router;