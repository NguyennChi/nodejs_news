const Collection = 'articles';
const Model = require(__path_schemas + Collection);
const FileHelpers = require(__path_helpers + 'file');
const CategoriesModel = require(__path_schemas + 'categories');
module.exports = {
	getList(objWhere, pagination, {sortField, sortType}) {
		let sort = sortField && sortType ? {[sortField]: sortType} : {_id: 'desc'};
		return Model
			.find(objWhere)
			.sort(sort)
			.skip((pagination.currentPage-1) * pagination.totalItemsPerPage)
			.limit(pagination.totalItemsPerPage)
	},	
	countRow(objWhere) {
		return Model.count(objWhere).then(data => data);
	},
	updateOne({id,field,value,...restParams} = {}){
		if(!field) return Model.updateOne({_id: id}, restParams);
		return Model.updateOne({_id: id}, {[field]: value,...restParams});
	},
	updateMany({cid,...restParams},field,value,operator = '$in') {
		return Model.updateMany({_id: {[operator]: cid }}, {[field]: value,...restParams});
	},
	async addOne(obj){
		let article = await Model(obj).save();
		let Category = await CategoriesModel.findById(obj.categoriesId);
		Category.articles.push(article._id);
		return Category.save();
	},
	deleteOne(id,field = null){
		if(field) {
			return Model.findById(id).select(field).then(data => {
				FileHelpers.remove(`public/uploads/${Collection}/`, data[field]);
			}).then(() => Model.deleteOne({_id: id}));
		} else {
			return Model.deleteOne({_id: id});
		}
		
	},
	deleteMulti(arrayId){
		return Model.remove({_id: arrayId});
	},
	findById(id) {
		return Model.findById(id);
	}
}