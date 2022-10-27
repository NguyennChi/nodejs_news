var express = require('express');
var router = express.Router();
const UtilsHelpers 	= require(__path_helpers + 'utils');
const {col_rss} = require(__path_configs + 'database');
const folderView	 = __path_view_blog + 'pages/rss/';
const layout	     = __path_view_blog + 'frontend';
const rssModel 		= require(__path_schemas + col_rss);


/* GET home page. */
router.get('/(:page)?',async (req, res, next) => {
  const rssList = await rssModel.find({status:'active'}).select('name link');
  let page = req.params.page || 1;
  UtilsHelpers.getRss(rssList,req).then(data => {
    let totalItemsPerPage = 10;
    data = UtilsHelpers.mapRssPagination(data,totalItemsPerPage);
    let paginationObj = {
      totalItems		 : data.length * 10,
      totalItemsPerPage,
      currentPage		 : parseInt(page),
      pageRanges		 : 3
    }
    if(!data[page - 1]) {
      res.redirect('/')
      return;
    }
    let breadcrumb = [{name: 'rss'}];
    res.render(`${folderView}index`, { 
      layout,
      rss: data[page - 1],
      paginationObj,
      breadcrumb
    });
  });
});

module.exports = router;
