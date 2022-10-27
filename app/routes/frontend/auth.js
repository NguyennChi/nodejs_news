var express = require('express');
var router = express.Router();

var passport = require('passport');

const StringHelpers 	= require(__path_helpers + 'string');
const systemConfig  = require(__path_configs + 'system');

const middleGetUserInfo         = require(__path_middleware + 'get-user-info');
const middleGetCategoryForMenu  = require(__path_middleware + 'get-category-for-menu');
const middleArticleRandom       = require(__path_middleware + 'get-article-random');

// const folderView	= __path_view_blog + 'pages/auth/';
// const layoutLogin   = __path_view_blog + 'login';
const layoutBlog   	= __path_view_blog + 'frontend';
// const linkIndex		= StringHelpers.formatLink('/' + systemConfig.prefixBlog + '/'); 
// const linkLogin		= StringHelpers.formatLink('/' + systemConfig.prefixBlog + '/auth/login/'); 
// const ValidateLogin	= require(__path_validates + 'login');

/* GET logout page. */
// router.get('/logout', function(req, res, next) {
// 	req.logout();
// 	res.redirect(linkLogin);
// });

/* GET login page. */
router.get('/login', function(req, res, next) {
	// if(req.isAuthenticated()) res.redirect(linkIndex);
	
	let item	= {email: '', 'password': ''};
	let errors   = null;
	res.render(`${folderView}login`, { layout: layoutLogin, errors, item });
});

/* GET dashboard page. */
router.get('/no-permission', function(req, res, next) {
	res.render(`${folderView}no-permission`, { layout: layoutBlog});
});
  

/* POST login page. */
router.post('/login', function(req, res, next) {
	// if(req.isAuthenticated()) res.redirect(linkIndex);

	req.body = JSON.parse(JSON.stringify(req.body));
	// ValidateLogin.validator(req);

	let item 	= Object.assign(req.body);
	// let errors 	= req.validationErrors();
	let errors = null;
	if(errors) { 
		res.render(`${folderView}login`, {  layout: layoutLogin, item, errors });
	}else {
		passport.authenticate('local', { 
			successRedirect: '/adminCCC',
			failureRedirect: linkLogin,
        })(req, res, next);
	}
});


module.exports = router;
