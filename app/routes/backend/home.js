var express = require('express');
var router = express.Router();

const folderView	 = __path_views + 'pages/dashboard/';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('test');
});

module.exports = router;
