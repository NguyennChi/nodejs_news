var express = require('express');
var router = express.Router();

const routerName = "dashboard"


const folderView            = __path_views_backend + `/pages/${routerName}/`;
const {countCollection} 	  = require(__path_helpers + 'utils');
const SlidersModel 	        = require(__path_schemas + 'sliders');
const CategoriesModel 	    = require(__path_schemas + 'category');
const ArticlesModel 	      = require(__path_schemas + 'article');
const MenuModel 	          = require(__path_schemas + 'users');
const UsersModel	          = require(__path_schemas + 'menu');
// const UsersModel 	          = require(__path_schemas + 'menu');
const GroupModel 	          = require(__path_schemas + 'group');

router.get('/', async (req, res, next)=>{
  let collectionModel = {
		'Sliders': SlidersModel,
		'Category': CategoriesModel,
		'Article': ArticlesModel,
		'Menu': MenuModel,
    'Users': UsersModel,
    'Group': GroupModel,
	};
	collectionModel = await countCollection(Object.keys(collectionModel),collectionModel);
	res.render(`${folderView}index`, { 
		pageTitle: 'Dashboard Page', 
		count: collectionModel
	});
});

module.exports = router;
