var express = require('express');
var mongoose = require('mongoose');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "home"
const folderView				= __path_views_frontend + `/pages/${routerName}/`;
const layout	                = __path_views_frontend + 'frontend';
const systemConfig 				= require(__path_configs + 'system');
const schemaMenu                = require(__path_schemas + 'menu');
const schemaCategory            = require(__path_schemas + 'category');
const schemaArticle             = require(__path_schemas + 'article');
const linkIndex 				= '/' + systemConfig.prefixAdmin + '/' + routerName;

// list Items
router.get('/', async (req, res, next) => {
    try {
        let limitArticleHome = 20
        let limitArticle     = 18
        let delay = 600000;
        const menuNav      = await schemaMenu.find({status:'active'}).sort({ordering:"asc"})
        const category     = await schemaCategory.find({status:'active'}).sort({ordering:"asc"})
        

    let objWhereArticle = {status: "active",
                           slider: false, 
                           toppost: false, 
                           breakingnews:false, 
                           fearture: false}

    let objWhereHome = [{status: "active", slider: true}, 
                        {status: "active", toppost: true}, 
                        {status: "active", breakingnews:true}, 
                        {status: "active", fearture: true}]    

    let articleHome = await schemaArticle.find({$or: objWhereHome})
                                        .limit(limitArticleHome)
                                        .sort({updatedAt: 'desc'})

    let article = await schemaArticle.find(objWhereArticle)
                                     .limit(limitArticle)
                                    .sort( {updatedAt: 'desc'})
    res.render(`${folderView}home`, {
        layout,
        menuNav,
        article,
        articleHome,
        category,  
     });        
    } catch (error) {
        console.log(error)
        res.redirect("/error")
    }
	

});
module.exports = router;