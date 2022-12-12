var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "menu"
const pageTitle 				= ` Menu Management`
const folderView				= __path_views_backend + `/pages/${routerName}/`;
const layout 					= __path_views_backend + 'backend';

const schemaMenu				= require(__path_schemas + routerName);
const systemConfig 				= require(__path_configs + 'system');
const notify 					= require(__path_configs + 'notify');
const UtilsHelpers 				= require(__path_helpers + 'utils');
const ParamsHelpers 			= require(__path_helpers + 'params');

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
		let sort	=  {};
		let parentMenuList = await schemaMenu.find({parentMenu : "parentmenu"})
		sort[sortField] = sortType;
		let pagination = {
			totalItems: 1,
			totalItemsPerPage: 3,
			currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
			pageRanges: 3
		};
		if (currentStatus !== 'all') objWhere = {status: currentStatus};
		if (keyword !== '') objWhere.name = new RegExp(keyword, 'i');
		await schemaMenu.count(objWhere).then((data) => {
			pagination.totalItems = data;
		});
	    await schemaMenu.find(objWhere)
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
					parentMenuList
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
			await schemaMenu.updateMany({ _id: { $in: arrId } }, { status: status })
			res.send({ success: true })
		} else {
			let { status, id } = req.body
			status = (status == 'active') ? 'inactive' : 'active'
			await schemaMenu.updateOne({ _id: id }, { status: status })
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
			await schemaMenu.deleteMany({ _id: { $in: arrId } })
			res.send({ success: true })
		} else {
			let id = req.body.id
			await schemaMenu.deleteOne({ _id: id })
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
		await schemaMenu.updateOne({ _id: id }, { ordering: ordering })
		res.send({ success: true })
	} catch (error) {
		console.log(error);
	}

});

// form

router.get('/form(/:id)?', async (req, res, next) => {
	try {
		let parentMenuList = await schemaMenu.find({parentMenu : "parentmenu"})
		let main = {
			pageTitle: pageTitle,
			parentMenuList,
		}
		
		if (req.params.id != undefined) {
			schemaMenu.countDocuments({ _id: req.params.id }, async function (err, count) {
				if (count > 0) {
					let item = await schemaMenu.find({ _id: req.params.id });
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
				item: [{name: '', ordering: 0, status: 'novalue'}],
				layout
			});
		}
	} catch (error) {
		console.log(error)
	}
});

// save

router.post('/save(/:id)?',
body('name')
	.isLength({ min: 5, max: 100 })
	.withMessage(util.format(notify.ERROR_NAME, 5, 100))
	.custom(async (val, { req }) => {
		let paramId = await (req.params.id != undefined) ? req.params.id : 0
		return await schemaMenu.find({ name: val }).then(async user => {
			let length = user.length
			user.forEach((value, index) => {
				if (value.id == paramId)
					length = length - 1;
			})
			if (length > 0) {
				return Promise.reject(notify.ERROR_NAME_DUPLICATED)
			}
			return
		})
	}),
	body('slug')
	.isSlug()
	.withMessage(notify.ERROR_SLUG)
	.custom(async (val, { req }) => {
		let paramId = (req.params.id != undefined) ? req.params.id : 0
		return await schemaMenu.find({ slug: val }).then(async user => {
			let length = user.length
			user.forEach((value, index) => {
				if (value.id == paramId)
					length = length - 1;
			})
			if (length > 0) {
				return Promise.reject(notify.ERROR_SLUG_DUPLICATED)
			}
			return
		})
	}),
	body('ordering')
		.isInt({ min: 0, max: 99 })
		.withMessage(util.format(notify.ERROR_ORDERING, 0, 99)),
	body('status').not().isIn(['novalue']).withMessage(notify.ERROR_STATUS),

	async  (req, res) => {
		try {
		let parentMenuList = await schemaMenu.find({parentMenu : "parentmenu"})
		let item = req.body;
		let itemData = [{}]
		if (req.params.id != undefined) {
			itemData = await schemaMenu.find({ _id: req.params.id })
		}
		let errors = await validationResult(req)
		if (!errors.isEmpty()) {
			let main = {
				pageTitle: pageTitle,
				showError: errors.errors,
				parentMenuList
			}
			if (req.params.id !== undefined) {
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
					layout
				})
			}
			return
		}
		if (req.params.id !== undefined) {
			await schemaMenu.updateOne({_id: req.params.id}, item)
			req.flash('success', notify.EDIT_SUCCESS);
			res.redirect(linkIndex);
		} else {
			await schemaMenu(item).save();
			req.flash('success', notify.ADD_SUCCESS);
			res.redirect(linkIndex);
		}
		} catch (error) {
			console.log(error);
		}	
	});

// Sort
router.get('/sort/:sort_field/:sort_type', (req, res, next) => {
	req.session.sortField = ParamsHelpers.getParam( req.params, 'sort_field', '');
	req.session.sortType = ParamsHelpers.getParam( req.params, 'sort_type', '');
	res.redirect(linkIndex)
});	

// changeparentmenu

router.post('/changeparentmenu',
	body('id')
				.custom(async (val, {req}) => {
				return await schemaMenu.findOne({_id: val}).then(async user => {
					console.log(user)
					if (!user) {
						return Promise.reject(notify.ERROR_NOT_EXITS)
					}
					return
				})}),
	body('newParent')
				.custom(async (val, {req}) => {
				if(val == 'parentmenu') return
				return await schemaMenu.findOne({_id: val}).then(async user => {
					console.log(user)
					if (!user) {
						return Promise.reject(notify.ERROR_NOT_EXITS)
					}
					return
				})}),
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (! errors.isEmpty()) {
				res.send({success: false, errors: errors})
				return
			} else{
				let {newParent, id} = req.body
				await schemaMenu.updateOne({_id: id}, {parentMenu: newParent})
				res.send({success: true})
			}
		} catch (error) {
			console.log(error)
			res.send({success: false})
		}
});



	

module.exports = router;