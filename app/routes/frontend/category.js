var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "category"
const folderView				= __path_views_frontend + `/pages/${routerName}/`;
const systemConfig 				= require(__path_configs + 'system');

const linkIndex 				= '/' + systemConfig.prefixAdmin + '/' + routerName;

// list Items
router.get('/', async (req, res, next) => {
    res.render(`${folderView}category`)
	

});
module.exports = router;