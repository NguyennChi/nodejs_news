var express = require('express');
var router 	= express.Router();
const { body, validationResult } = require('express-validator');
var util = require('util')


const routerName 				= "weather"
const pageTitle 				= ` Weather Management`
const folderView				= __path_views_backend + `/pages/${routerName}/`;
const layout 					= __path_views_backend + 'backend';

const schemaWeather				= require(__path_schemas + routerName);
const systemConfig 				= require(__path_configs + 'system');
const notify 					= require(__path_configs + 'notify');
const UtilsHelpers 				= require(__path_helpers + 'utils');
const ParamsHelpers 			= require(__path_helpers + 'params');
const upWeather                = 'public/weatherfile/'

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
		sort[sortField] = sortType;
		let pagination = {
			totalItems: 1,
			totalItemsPerPage: 3,
			currentPage: parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
			pageRanges: 3
		};
		if (currentStatus !== 'all') objWhere = {status: currentStatus};
		if (keyword !== '') objWhere.name = new RegExp(keyword, 'i');
		await schemaWeather.count(objWhere).then((data) => {
			pagination.totalItems = data;
		});
		await schemaWeather.find(objWhere)
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
					sortType
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
			await schemaWeather.updateMany({ _id: { $in: arrId } }, { status: status })
			res.send({ success: true })
		} else {
			let { status, id } = req.body
			status = (status == 'active') ? 'inactive' : 'active'
			await schemaWeather.updateOne({ _id: id }, { status: status })
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
            await schemaWeather.deleteMany({_id: {$in: arrId}})
		let deleteWeatherFiles = await arrId.forEach((value)=>{
		try {
			fs.unlinkSync(`${upWeather}${value}`)
			//file removed
		} catch(err) {
			console.error(err)
		}
	})
			res.send({success: true})
	} else {
			let id = req.body.id
	try {
		fs.unlinkSync(`${upWeather}${id}`)
		//file removed
	} catch(err) {
		console.error(err)
	}
    await schemaWeather.deleteOne({_id: id})
			res.send({success: true})
	}
	} catch (error) {
		console.log(error)
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
		await schemaWeather.updateOne({ _id: id }, { ordering: ordering })
		res.send({ success: true })
	} catch (error) {
		console.log(error);
	}

});

// form

router.get('/form(/:id)?', (req, res, next) => {
	try {
		let main = {
			pageTitle: pageTitle,
		}
		if (req.params.id != undefined) {
			schemaWeather.countDocuments({ _id: req.params.id }, async function (err, count) {
				if (count > 0) {
					let item = await schemaWeather.find({ _id: req.params.id });
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
body('name')
			.not()
			.isEmpty()
			.withMessage(notify.ERROR_NAME_EMPTY)
			.custom(async (val, {req}) => {
			let paramId = (req.params.id != undefined) ? req.params.id : 0
			return await schemaWeather.find({name: val}).then(async user => {
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
		body('name')
		.not()
		.isEmpty()
		.withMessage(notify.ERROR_API_EMPTY),
	body('ordering')
			.isInt({min: 0, max: 99})
			.withMessage(util.format(notify.ERROR_ORDERING,0,99)),
	body('status').not().isIn(['novalue']).withMessage(notify.ERROR_STATUS),
	async  (req, res) => {
		try {
			let item = req.body;
		let itemData = [{}]
		if (req.params.id != undefined) {
			itemData = await schemaWeather.find({ _id: req.params.id })
			console.log(itemData);
		}
		let errors = await validationResult(req)
		if (!errors.isEmpty()) {
			let main = {
				pageTitle: pageTitle,
				showError: errors.errors,
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
			await schemaWeather.updateOne({_id: req.params.id}, item)
			req.flash('success', notify.EDIT_SUCCESS);
			res.redirect(linkIndex);
		} else {
			await schemaWeather(item).save();
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

module.exports = router;