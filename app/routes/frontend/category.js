var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "category"
const folderView				= __path_views_frontend + `/pages/${routerName}/`;
const systemConfig 				= require(__path_configs + 'system');
const schemaMenu                = require(__path_schemas + 'menu');
const schemaCategory            = require(__path_schemas + 'category');
const schemaRSS                 = require(__path_schemas + 'rss');
const schemaArticle             = require(__path_schemas + 'article');

const linkIndex 				= '/index'


const WeatherHelpers           = require(__path_helpers + 'weather');
const upWeather                = 'public/weatherfile/'
const schemaWeather            = require(__path_schemas  + 'weather');





// list Items
router.get('/', async (req, res, next) => {
    try {
        if (req.params.category != undefined) {
            const category = await schemaCategory.find({status: 'active'}).sort({ordering: "asc"})
            const objCategory = category.find(item => item.slug === req.params.category);
            if (objCategory != undefined) { // document exists });
                let delay = 600000;
                const weather     = await schemaWeather.find({status:'active'}).sort({ordering:"asc"});
                const category = await schemaCategory.find({status: 'active'}).sort({ordering: "asc"})
               const menuNav      = await schemaMenu.find({status:'active'}).sort({ordering:"asc"})
                
                const rss = await schemaRSS.find({status: 'active'}).sort({ordering: "asc"})
                const article = await schemaArticle.find({status: 'active', categoryId: `${objCategory.id}`}).sort({updatedAt: 'desc'}).select('-editordata')
                let dataWeather = await WeatherHelpers.getDataWeather(upWeather, weather, delay)
                
                res.render(`${folderView}category`, {
                            layout,
                            menuNav,
                            category,
                            rss,
                            article,
                            objCategory,
                            dataWeather
                        });
            } else {
                res.redirect(linkIndex);
            }
        } else {
            res.redirect(linkIndex);
        }
    } catch (error) {
        console.log(error)
    }
	

});
module.exports = router;