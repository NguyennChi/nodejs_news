var express = require('express');
var router 	= express.Router();
const util = require('util');
const { body, validationResult } = require('express-validator');
const systemConfig  = require(__path_configs + 'system');
const notify  		= require(__path_configs + 'notify');
const UsersModel 	= require(__path_schemas + 'users');
const ValidateUsers	= require(__path_validates + 'users');
const UtilsHelpers 	= require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');

const linkIndex		 = '/' + systemConfig.prefixAdmin + '/users/';
const pageTitleIndex = 'Users Management';
const pageTitleAdd   = pageTitleIndex + ' - Add';
const pageTitleEdit  = pageTitleIndex + ' - Edit';
const folderView	 = __path_views + 'pages/users/';

// List items
router.get('(/status/:status)?', async (req, res, next) => {
	let objWhere	 = {};
	let keyword		 = ParamsHelpers.getParam(req.query, 'keyword', '');
	let currentStatus= ParamsHelpers.getParam(req.params, 'status', 'all'); 
	let statusFilter = await UtilsHelpers.createFilterStatus(currentStatus,'users');

	let pagination 	 = {
		totalItems		 : 1,
		totalItemsPerPage: 4,
		currentPage		 : parseInt(ParamsHelpers.getParam(req.query, 'page', 1)),
		pageRanges		 : 3
	};

	if(currentStatus !== 'all') objWhere.status = currentStatus;
	if(keyword !== '') objWhere.name = new RegExp(keyword, 'i');

	await UsersModel.count(objWhere).then( (data) => {
		pagination.totalItems = data;
	});
	
	UsersModel
		.find(objWhere)
		.skip((pagination.currentPage-1) * pagination.totalItemsPerPage)
		.limit(pagination.totalItemsPerPage)
		.then( (items) => {
			res.render(`${folderView}list`, { 
				pageTitle: pageTitleIndex,
				items,
				statusFilter,
				pagination,
				currentStatus,
				keyword
			});
		});
});

// Change status
router.get('/change-status/:id/:status', (req, res, next) => {
	let currentStatus	= ParamsHelpers.getParam(req.params, 'status', 'active'); 
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 
	let status			= (currentStatus === "active") ? "inactive" : "active";
	
	UsersModel.updateOne({_id: id}, {status: status}, (err, result) => {
		req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Change status - Multi
router.post('/change-status/:status', (req, res, next) => {
	let currentStatus	= ParamsHelpers.getParam(req.params, 'status', 'active'); 
	UsersModel.updateMany({_id: {$in: req.body.cid }}, {status: currentStatus}, (err, result) => {
		req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.n) , false);
		res.redirect(linkIndex);
	});
});

// Change ordering - Multi
router.post('/change-ordering', (req, res, next) => {
	let cids 		= req.body.cid;
	let orderings 	= req.body.ordering;
	
	if(Array.isArray(cids)) {
		cids.forEach((item, index) => {
			UsersModel.updateOne({_id: item}, {ordering: parseInt(orderings[index])}, (err, result) => {});
		})
	}else{ 
		UsersModel.updateOne({_id: cids}, {ordering: parseInt(orderings)}, (err, result) => {});
	}

	req.flash('success', notify.CHANGE_ORDERING_SUCCESS, false);
	res.redirect(linkIndex);
});

// Delete
router.get('/delete/:id', (req, res, next) => {
	let id				= ParamsHelpers.getParam(req.params, 'id', ''); 	
	UsersModel.deleteOne({_id: id}, (err, result) => {
		req.flash('success', notify.DELETE_SUCCESS, false);
		res.redirect(linkIndex);
	});
});

// Delete - Multi
router.post('/delete', (req, res, next) => {
	UsersModel.remove({_id: {$in: req.body.cid }}, (err, result) => {
		req.flash('success', util.format(notify.DELETE_MULTI_SUCCESS, result.n), false);
		res.redirect(linkIndex);
	});
});

// FORM
router.get(('/form(/:id)?'), (req, res, next) => {
	let id		= ParamsHelpers.getParam(req.params, 'id', '');
	let item	= {name: '', ordering: 0, status: 'novalue'};
	let errors   = null;
	if(id === '') { // ADD
		res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors});
	}else { // EDIT
		UsersModel.findById(id, (err, item) =>{
			res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors});
		});	
	}
});

// SAVE = ADD EDIT
router.post(
	'/save', 
	body('username').isLength({ min: 5 }).withMessage('Username 5 ky tu').custom(value => {
		return UsersModel.find({username: value}).then(user => {
		  if (user.length > 0) {
			return Promise.reject('Username already in use');
		  }
		})
	}),
	body('password').isLength({ min: 5 }).withMessage('Password 5 ky ty'),
	(req, res, next) => {
	// req.body = JSON.parse(JSON.stringify(req.body));
	// ValidateUsers.validator(req);
	const errors = validationResult(req);
    if (!errors.isEmpty()) {
		res.render(`${folderView}form`, { 
			pageTitle: pageTitleEdit, 
			item: req.body,
			errors: errors.errors
		});
    }
	// UsersModel.create({
	// 	username: req.body.username,
	// 	password: req.body.password,
	//   }).then(user => res.json(user));
	// let item = Object.assign(req.body);
	// let errors = req.validationErrors();
	// if(typeof item !== "undefined" && item.id !== "" ){	// edit
	// 	if(errors) { 
	// 		res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item, errors});
	// 	}else {
	// 		UsersModel.updateOne({_id: item.id}, {
	// 			ordering: parseInt(item.ordering),
	// 			name: item.name,
	// 			status: item.status
	// 		}, (err, result) => {
	// 			req.flash('success', notify.EDIT_SUCCESS, false);
	// 			res.redirect(linkIndex);
	// 		});
	// 	}
	// }else { // add
	// 	if(errors) { 
	// 		res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item, errors});
	// 	}else {
	// 		new UsersModel(item).save().then(()=> {
	// 			req.flash('success', notify.ADD_SUCCESS, false);
	// 			res.redirect(linkIndex);
	// 		})
	// 	}
	// }	
});

module.exports = router;
