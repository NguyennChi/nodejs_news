var express = require('express');
var router = express.Router();
const middleAuthentication = require(__path_middleware + 'auth');

// router.use('/',middleAuthentication ,require('./dashboard'));
router.use('/dashboard', require('./dashboard'));
router.use('/items', require('./items'));
router.use('/sliders', require('./sliders'));
router.use('/users', require('./users'));
router.use('/categories', require('./categories'));
router.use('/articles', require('./articles'));
router.use('/menu', require('./menu'));
router.use('/rss', require('./rss'));
router.use('/settings', require('./settings'));
module.exports = router;
