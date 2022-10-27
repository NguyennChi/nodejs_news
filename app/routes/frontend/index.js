var express = require('express');
var router = express.Router();
const middleGetMenu  = require(__path_middleware + 'get-menu');
// router.use('/', require('./home'));
// router.use('/auth', require('./auth'));

router.use('/',middleGetMenu,require('./home'));
// router.use('/',require('./home'));

router.use('/rss', require('./rss'));
router.use('/c', require('./category'));
router.use('/p', require('./article'));
module.exports = router;
