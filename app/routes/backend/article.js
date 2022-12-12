var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "article"
const pageTitle 				= ` Article Management`
const folderView				= __path_views_backend + `/pages/${routerName}/`;
const layout 					= __path_views_backend + 'backend';

const schemaArticle				= require(__path_schemas + routerName);
const systemConfig 				= require(__path_configs + 'system');
const notify 					= require(__path_configs + 'notify');
const UtilsHelpers 				= require(__path_helpers + 'utils');
const ParamsHelpers 			= require(__path_helpers + 'params');
const schemaCategory 			= require(__path_schemas + 'category');
const {param} 					= require('express-validator');
const FileHelpers				= require(__path_helpers + 'file');
const uploadThumb	 			= FileHelpers.upload('thumb', `${routerName}`);

const linkIndex 				= '/' + systemConfig.prefixAdmin + '/' + routerName;

// list Items
router.get('(/status/:status)?', async (req, res, next) => {
	try {
		let inform = req.flash()
		let objWhere = {};
		let currentStatus = ParamsHelpers.getParam(req.params, 'status', 'all');
		let statusFilter = await UtilsHelpers.createFilterStatus(currentStatus, routerName);
		let keyword = ParamsHelpers.getParam(req.query, 'keyword', '');
		let sortField = ParamsHelpers.getParam(req.session, 'sortField', 'ordering');
		let sortType = ParamsHelpers.getParam(req.session, 'sortType', 'desc');
		let categoryId = ParamsHelpers.getParam(req.session, 'categoryId', '');
		let sort	=  {};
		let category = await schemaCategory.find({status: 'active'})
		// let groupsItems = await schemaCategory.find({},{_id:1, name:1})
		// groupsItems.unshift({_id: 'allvalue', name: 'All Group'})
		sort[sortField] = sortType;
		let pagination = {
			totalItems: 1,
			totalItemsPerPage: 10,
			currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
			pageRanges: 3
		};
		if (categoryId !== '') objWhere = {'categoryId': categoryId}
		if (categoryId === 'allvalue') objWhere = {};
		if (currentStatus !== 'all') objWhere = {status: currentStatus};
		if (keyword !== '') objWhere.name = new RegExp(keyword, 'i');
		await schemaArticle.count(objWhere).then((data) => {
			pagination.totalItems = data;
		});
		await schemaArticle.find(objWhere)
			.skip((pagination.currentPage - 1) * pagination.totalItemsPerPage)
			.sort(sort)
			.limit(pagination.totalItemsPerPage)
			.then((items) => {
				res.render(`${folderView}list`, {
					pageTitle: pageTitle,
					items: items,
					statusFilter: statusFilter,
					currentStatus,
					keyword,
					pagination,
					inform: inform,
					layout,
					sortField,
					sortType,
					category: category,
					categoryId
				});
			});

	} catch (error) {
		console.log(error);
	}

});

// change status
router.post('/change-status/(:status)?', async (req, res, next) => {
	try {
		if (req.params.status === 'multi') {
			let arrId = req.body.id.split(",")
			let status = req.body.status
			await schemaArticle.updateMany({ _id: { $in: arrId } }, { status: status })
			res.send({ success: true })
		} else {
			let { status, id } = req.body
			status = (status == 'active') ? 'inactive' : 'active'
			await schemaArticle.updateOne({ _id: id }, { status: status })
			res.send({ success: true })
		}

	} catch (error) {
		console.log(error);
	}

});

// Delete
router.post('/delete/(:status)?', async (req, res, next) => {
	try {
		if (req.params.status === 'multi') {
			let arrId = req.body.id.split(",")
			let arrPhoto = req.body.img.split(",")
			let deletePhoto = await arrPhoto.forEach((value)=>{
				FileHelpers.remove(`public/uploads/${routerName}/`, value)
			})
			await schemaArticle.deleteMany({ _id: { $in: arrId } })
			res.send({ success: true })
		} else {
			let id = req.body.id
			let thumb = req.body.thumb
			let removePhoto = await FileHelpers.remove(`public/uploads/${routerName}/`, thumb)
			await schemaArticle.deleteOne({ _id: id })
			res.send({ success: true })
		}
	} catch (error) {
		console.log(error);
	}
});

// ordering
router.post('/change-ordering',
body('ordering')
		.isInt({ min: 0, max: 99 })
		.withMessage(util.format(notify.ERROR_ORDERING, 0, 99)),
async (req, res, next) => {
	try {
		let { ordering, id } = req.body
		await schemaArticle.updateOne({ _id: id }, { ordering: ordering })
		res.send({ success: true })
	} catch (error) {
		console.log(error);
	}

});

// form
router.get('/form(/:id)?',async (req, res, next) => {
	try {
		let category = await schemaCategory.find({status:'active'})
		let main = {
			pageTitle: pageTitle,
			categoryList: category,
		} 
		if (req.params.id != undefined) {
			schemaArticle.countDocuments({ _id: req.params.id }, async function (err, count) {
				if (count > 0) {
					let item = await schemaArticle.find({ _id: req.params.id });
					res.render(`${folderView}form`, {
						main: main,
						item: item[0],
						layout,
					});
				} else {
					res.redirect(linkIndex);
				}
			});
		} else {
			res.render(`${folderView}form`, {
				main: main,
				item: [],
				layout
			});
		}
	} catch (error) {
		console.log(error)
	}
});

// save

router.post('/save(/:id)?', 
uploadThumb,
body('name')
			.isLength({min: 5, max: 200})
			.withMessage(util.format(notify.ERROR_NAME,5,100))
			.custom(async (val, {req}) => {
			let paramId = (req.params.id != undefined) ? req.params.id : 0
			return await schemaArticle.find({name: val}).then(async user => {
				let length = user.length
				user.forEach((value, index) => {
					if (value.id == paramId) 
						length = length - 1;
				})
				if (length > 0) {
					return Promise.reject(notify.ERROR_NAME_DUPLICATED)
				}
				return
		})}),
	body('slug')
		.isSlug()
		.withMessage(notify.ERROR_SLUG)
		.custom(async (val, {req}) => {
			let paramId = (req.params.id != undefined) ? req.params.id : 0
			return await schemaArticle.find({slug: val}).then(async user => {
				let length = user.length
				user.forEach((value, index) => {
					if (value.id == paramId) 
						length = length - 1;
					
				})
				if (length > 0) {
					return Promise.reject(notify.ERROR_SLUG_DUPLICATED)
				}
				return
	})}),
	body('editordata')
		.not()
		.isEmpty()
		.withMessage(notify.ERROR_DESCRIPTION),
	body('categoryId')
		.custom(async (val, {req}) => {
			if ( val == undefined) {
				return Promise.reject(notify.ERROR_CATEGORY)
			} else {
				try {
					let data = await schemaCategory.findOne({_id: val, status:'active'});
					return data;
				} catch (error) {
					return Promise.reject(notify.ERROR_CATEGORY_INVALID)
				}
			}
		}),
	body('ordering')
		.isInt({min: 0, max: 99})
		.withMessage(util.format(notify.ERROR_ORDERING,0,99)),
	body('status').not().isIn(['novalue']).withMessage(notify.ERROR_STATUS),
	body('group_id').not().isIn(['allvalue']).withMessage(notify.ERROR_GROUP),
	body('editordata')
		.not()
		.isEmpty()
		.withMessage(notify.ERROR_DESCRIPTION),
	body('thumb').custom((value,{req}) => {
		const {image_uploaded , image_old} = req.body;
		if(!image_uploaded && !image_old) {
			return Promise.reject(notify.ERROR_FILE_EMPTY);
		}
		if(!req.file && image_uploaded) {
				return Promise.reject(notify.ERROR_FILE_EXTENSION);
		}
		return true;
	}),
	async function (req, res) { 
		try {
			let item = req.body;
			item.slider = !item.slider ? false : true
			item.toppost = !item.toppost ? false : true
			item.breakingnews = !item.breakingnews ? false : true
			item.fearture = !item.fearture ? false : true
			let itemData = [{}]
			if(req.params.id != undefined){
				itemData = await schemaArticle.find({_id: req.params.id})
			}
			let errors = validationResult(req)
			if(!errors.isEmpty()) {
				let category = await schemaCategory.find({status:'active'})
				let main = {pageTitle: pageTitle,
							showError: errors.errors,
							categoryList: category,
						}
				if(req.file != undefined) FileHelpers.remove(`public/uploads/${routerName}/`, req.file.filename); // xóa tấm hình khi form không hợp lệ
				if (req.params.id !== undefined){
						res.render(`${folderView}form`, {
							main: main,
							item: itemData[0],
							id: req.params.id,
							layout,
						})
				} else {
					res.render(`${folderView}form`, {
						main: main,
						item: req.body,
						layout,
					})
				}
				return
			}else {
				if(req.file == undefined){ //không có upload lại hình
					item.thumb = itemData[0].thumb;
				}else {
					item.thumb = req.file.filename;
					if(req.params.id !== undefined){
						FileHelpers.remove(`public/uploads/${routerName}/`, `${itemData[0].thumb}`);
					} 
				}
			}
				if (req.params.id !== undefined) {
					await schemaArticle.updateOne({_id: req.params.id}, 
						item,  
						 )
					req.flash('success', notify.EDIT_SUCCESS);
					res.redirect(linkIndex);
				} else {
					await schemaArticle(item).save(async function(err,room) {
						let articleArr = await schemaCategory.findById({_id: room.categoryId})
						articleArr.articles.push(room)
						console.log(articleArr.articles.push(room));
						await schemaCategory(articleArr).save()});
					req.flash('success', notify.ADD_SUCCESS);
					res.redirect(linkIndex);
				}
			} catch (error) {
				console.log(error)
			}
		});
// Sort
router.get('/sort/:sort_field/:sort_type', (req, res, next) => {
	req.session.sortField = ParamsHelpers.getParam( req.params, 'sort_field', '');
	req.session.sortType = ParamsHelpers.getParam( req.params, 'sort_type', '');
	res.redirect(linkIndex)
});	

// Fillter
router.get('/Filter-category/:category_id', (req, res, next) => {
	req.session.categoryId = ParamsHelpers.getParam( req.params, 'category_id', '');
	res.redirect(linkIndex)
});
// option
router.post('(/option)', async (req, res, next) => {
	try {
		let {id, field, isCheck} = req.body
			await schemaArticle.updateOne(id, field, isCheck)
		res.send({success: true})
	} catch (error) {
		console.log(error)
	}
})
// changecategory
router.post('/changecategory',
		body('id')
				.custom(async (val, {req}) => {
				return await schemaArticle.findOne({_id: val}).then(async user => {
					if (!user) {
						return Promise.reject(notify.ERROR_NOT_EXITS)
					}
					return
				})}),
		body('newCategory')
				.custom(async (val, {req}) => {
				return await schemaCategory.findOne({_id: val}).then(async user => {
					if (!user) {
						return Promise.reject(notify.ERROR_NOT_EXITS)
					}
					return
			})}),
	async (req, res, next) => {
		try {
			let {id, newCategory} = req.body
			let errors = validationResult(req)
			if(!errors.isEmpty()) {
				res.send({success: false})
			}else{
				await schemaArticle.updateOne({ _id: id }, { ordering: ordering })
				res.send({success: true})
			}
	} catch (error) {
		console.log(error)
		res.send({success: false})
	}
});
module.exports = router;
