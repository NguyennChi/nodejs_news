var express = require('express');
var router 	= express.Router();
const util = require('util');
const { body, validationResult } = require('express-validator');
var slug = require('slug');

const Collection = 'settings';
const systemConfig  = require(__path_configs + 'system');
const notify  		= require(__path_configs + 'notify');
const Model 		= require(__path_schemas + Collection);

const UtilsHelpers 	= require(__path_helpers + 'utils');
const ParamsHelpers = require(__path_helpers + 'params');
const FileHelpers = require(__path_helpers + 'file');

const linkIndex		 = '/' + systemConfig.prefixAdmin + `/${Collection}/`;
const pageTitleIndex = UtilsHelpers.firstLetterUppercase(Collection) + ' Management';
const folderView	 = __path_view_admin + `pages/${Collection}/`;
const uploadAvatar	 = FileHelpers.upload('thumbnail', Collection);


router.get(('/'),async (req, res, next) => {
	let errors   = null;
	let item = await Model.findOne({});

	// const {copyright, content} = JSON.parse(item.footer);
	// const {logo} = JSON.parse(item.header);

	// item.copyright = copyright;
	// item.content = content;
	// item.logo = logo;

	res.render(`${folderView}form`, { pageTitle: pageTitleIndex, item, errors,});
});

// SAVE = ADD EDIT
router.post('/save',uploadAvatar,
	body('copyright').notEmpty().withMessage(notify.ERROR_TITLE_EMPTY),
	body('thumbnail').custom((value,{req}) => {
		const {image_uploaded,image_old} = req.body;
		if(!image_uploaded && !image_old) {
			return Promise.reject(notify.ERROR_FILE_EMPTY);
		}
		if(!req.file && image_uploaded) {
				return Promise.reject(notify.ERROR_FILE_EXTENSION);
		}
		return true;
	}),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			let errorsMsg = {};
			errors.errors.forEach(value => {
				errorsMsg[value.param] = value.msg
			});
			req.body.thumbnail = req.body.image_old;
			
			let listCategory = await UtilsHelpers.getCategory();
			res.render(`${folderView}form`, { 
				pageTitle: pageTitleIndex, 
				item: req.body,
				errors: errorsMsg,
				listCategory
			});
			return;
		} 

		let item = req.body;
		let footer = JSON.stringify({
			copyright: item.copyright,
			content: item.content
		})

		let header = JSON.stringify({
			logo:!req.file ? item.image_old : req.file.filename
		});
		if(req.file) FileHelpers.remove(`public/uploads/${Collection}/`, item.image_old);
		Model.update({_id:item.id},{header,footer}).then(() => {
			req.flash('success','Cap nhat thanh cong', linkIndex);
		})
});

module.exports = router;
