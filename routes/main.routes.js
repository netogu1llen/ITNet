const express = require('express');
const router = express.Router();


const mainController = require('../controllers/main.controller');




router.get('/', (req, res) => {
    res.render('login')
});




module.exports = router;