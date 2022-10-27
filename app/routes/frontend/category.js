var express = require('express');
var router = express.Router();
const UtilsHelpers 	= require(__path_helpers + 'utils');
const articlesModel 		= require(__path_schemas + 'articles');
const categoryModel 		= require(__path_schemas + 'categories');
const folderView	 = __path_view_blog + 'pages/categories/';
const layout	     = __path_view_blog + 'frontend';
/* GET home page. */
router.get('/(:category)?(/:page)?',async (req, res, next) => {
  let categoryslug = req.params.category || null;
  let page = req.params.page || 1;
  let category = await categoryModel.findOne({slug: categoryslug}).select('id name');
  let paginationObj = {
    totalItems		 : await articlesModel.count({categoriesId: category.id}),
    totalItemsPerPage: 3,
    currentPage		 : parseInt(page),
    pageRanges		 : 3
  }
  articlesModel
    .find({categoriesId: category.id})
    .skip((paginationObj.currentPage-1) * paginationObj.totalItemsPerPage)
    .limit(paginationObj.totalItemsPerPage)
    .then(articlesList => {
    if(articlesList.length == 0) {
      res.redirect('/');
    } else {
      let breadcrumb = [{name: category.name}];
      res.render(`${folderView}index`, { 
        articlesList,
        paginationObj,
        layout,
        categoryName:category.name,
        categorySlug:categoryslug,
        breadcrumb
      })
    }
  })
});

module.exports = router;
