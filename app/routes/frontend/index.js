var express = require('express');
var router = express.Router();

router.use('/', require('./home'));
router.use('/category', require('./category'));
router.use('/blog', require('./blog'));
router.use('/contact', require('./contact'));
router.use('/error', require('./error'));
module.exports = router;
