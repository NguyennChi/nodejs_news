var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "users"
const pageTitle 				= ` Users Management`
const folderView				= __path_views_backend + `/pages/${routerName}/`;
const layout 					= __path_views_backend + 'backend';

const schemaUsers				= require(__path_schemas + routerName);
const systemConfig 				= require(__path_configs + 'system');
const notify 					= require(__path_configs + 'notify');
const UtilsHelpers 				= require(__path_helpers + 'utils');
const ParamsHelpers 			= require(__path_helpers + 'params');
const schemaGroup 				= require(__path_schemas + 'group');
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
		let groupID = ParamsHelpers.getParam(req.session, 'groupID', '');
		let sort	=  {};
		let groupsItems = await schemaGroup.find({},{_id:1, name:1})
		groupsItems.unshift({_id: 'allvalue', name: 'All Group'})
		sort[sortField] = sortType;
		let pagination = {
			totalItems: 1,
			totalItemsPerPage: 3,
			currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
			pageRanges: 3
		};
		if (groupID !== '') objWhere = {'group.id': groupID}
		if (groupID === 'allvalue') objWhere = {};
		if (currentStatus !== 'all') objWhere = {status: currentStatus};
		if (keyword !== '') objWhere.name = new RegExp(keyword, 'i');
		await schemaUsers.count(objWhere).then((data) => {
			pagination.totalItems = data;
		});
		await schemaUsers.find(objWhere)
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
					groupsItems: groupsItems,
					groupID,
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
			await schemaUsers.updateMany({ _id: { $in: arrId } }, { status: status })
			res.send({ success: true })
		} else {
			let { status, id } = req.body
			status = (status == 'active') ? 'inactive' : 'active'
			await schemaUsers.updateOne({ _id: id }, { status: status })
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
			await schemaUsers.deleteMany({ _id: { $in: arrId } })
			res.send({ success: true })
		} else {
			let id = req.body.id
			let thumb = req.body.thumb
			let removePhoto = await FileHelpers.remove(`public/uploads/${routerName}/`, thumb)
			await schemaUsers.deleteOne({ _id: id })
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
		await schemaUsers.updateOne({ _id: id }, { ordering: ordering })
		res.send({ success: true })
	} catch (error) {
		console.log(error);
	}

});

// form
router.get('/form(/:id)?',async (req, res, next) => {
	try {
		 let groupsItems = await schemaGroup.find({},{_id:1, name:1})
		 groupsItems.unshift({_id: 'novalue', name: 'Choose Group'})
		
		let main = {
			pageTitle: pageTitle,
			groupsItems: groupsItems,
		} 
		if (req.params.id != undefined) {
			schemaUsers.countDocuments({ _id: req.params.id }, async function (err, count) {
				if (count > 0) {
					let item = await schemaUsers.find({ _id: req.params.id });
					res.render(`${folderView}form`, {
						main: main,
						item: item[0],
						layout,
						itemGroup:item[0].group.name,
					});
				} else {
					res.redirect(linkIndex);
				}
			});
		} else {
			res.render(`${folderView}form`, {
				main: main,
				item: [],
				itemGroup: '',
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
			.isLength({min: 5, max: 100})
			.withMessage(util.format(notify.ERROR_NAME,5,100))
			.custom(async (val, {req}) => {
			let paramId = (req.params.id != undefined) ? req.params.id : 0
			return await schemaUsers.find({name: val}).then(async user => {
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
			return await schemaUsers.find({slug: val}).then(async user => {
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
			console.log( item)
			let itemData = [{}]
			let groupsItems = await schemaGroup.find({},{_id:1, name:1})
				groupsItems.unshift({_id: 'novalue', name: 'Choose Group'})
			if(req.params.id != undefined){
				itemData = await schemaUsers.find({_id: req.params.id})
			}
			let errors = validationResult(req)
			if(!errors.isEmpty()) {
				
				let main = {pageTitle: pageTitle,
							showError: errors.errors,
							groupsItems: groupsItems
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
					await schemaUsers.updateOne({_id: req.params.id}, 
						item,  
						item.group = {
						id : item.group_id,
						name : item.group_name
					} )
					await schemaUsers.updateMany({'group.id': req.params.id}, 
					item.group= {
						id : item.group_id,
						name : item.group_name
					} )
					req.flash('success', notify.EDIT_SUCCESS);
					res.redirect(linkIndex);
				} else {
					item.group = {
						id : item.group_id,
						name : item.group_name
					},
					await schemaUsers(item).save();
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
router.get('/fillter-group/:group_id', (req, res, next) => {
	req.session.groupID = ParamsHelpers.getParam( req.params, 'group_id', '');
	res.redirect(linkIndex)
});	

module.exports = router;
