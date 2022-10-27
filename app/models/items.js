const ItemsModel = require(__path_schemas + 'items');
module.exports = {
    saveItems(item) {
       return ItemsModel.create(item);
    },
    getListItems(objWhere, pagination) {
       return ItemsModel.find({...objWhere, age: {$gt: 5}})
		.sort({age: 'desc'})
		.slice(0,2)
    }
}