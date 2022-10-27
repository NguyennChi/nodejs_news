var express = require('express');
var router = express.Router();
const UtilsHelpers 	= require(__path_helpers + 'utils');
const articlesModel 		= require(__path_schemas + 'articles');
const categoryModel 		= require(__path_schemas + 'categories');
const folderView	 = __path_view_blog + 'pages/articles/';
const layout	     = __path_view_blog + 'frontend';
/* GET home page. */
router.get('/(:slug)?',async (req, res, next) => {
  let slug = req.params.slug || null;
  let article = await articlesModel.findOne({slug});
  if(!article) {
    res.redirect('/');
    return;
  }
  let category = await categoryModel.findById(article.categoriesId);
  let relative = await  articlesModel.find({
    categoriesId: article.categoriesId,
    _id: {$ne: article.id}
  })
  let breadcrumb = [
    {name: category.name, link: 'c/' + category.slug},
    {name: article.title}
  ];
  res.render(`${folderView}index`, { 
    layout,
    article,
    relative,
    category,
    breadcrumb
  })
});

module.exports = router;
