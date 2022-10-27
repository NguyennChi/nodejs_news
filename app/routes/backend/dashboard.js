var express = require('express');
var router = express.Router();
const {countCollection} 	= require(__path_helpers + 'utils');
const folderView	 = __path_view_admin + 'pages/dashboard/';
const SlidersModel 	= require(__path_schemas + 'sliders');
const CategoriesModel 	= require(__path_schemas + 'categories');
const ArticlesModel 	= require(__path_schemas + 'articles');
const MenuModel 	= require(__path_schemas + 'menu');
const RssModel 	= require(__path_schemas + 'rss');
/* GET dashboard page. */
router.get('/', async(req, res, next) => {
	let collectionModel = {
		'Sliders': SlidersModel,
		'Categories': CategoriesModel,
		'Articles': ArticlesModel,
		'Menu': MenuModel,
		'Rss' : RssModel
	};
	collectionModel = await countCollection(Object.keys(collectionModel),collectionModel);
	res.render(`${folderView}index`, { 
		pageTitle: 'Dashboard Page', 
		count: collectionModel
	});
});

module.exports = router;
