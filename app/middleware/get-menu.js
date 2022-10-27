const {col_categories,col_menu} = require(__path_configs + 'database');
const menuModel 		= require(__path_schemas + col_menu);
const categoryModel 		= require(__path_schemas + col_categories);

module.exports = async(req, res, next) => {
  const listCategory = await  categoryModel.find({status:'active'}).sort({ordering: 'asc'}).then(data => {
    return data.map(item => {
      item.link = 'c/' + item.slug;
      return item;
    })
  });
  const listMenu = await menuModel.find({status:'active'}).sort({ordering: 'asc'}).then(data => {
    return data.map(item => {
      item.link = (item.name == 'Home') ? '/' : item.slug;
      return item;
    })
  });
  res.locals.listCategory = listCategory;
  res.locals.listMenu = listMenu;
  next();
}