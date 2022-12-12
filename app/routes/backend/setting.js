var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');
const notify = require(__path_configs + 'notify');
const fs = require('fs');
var util = require('util')

const routerName = "setting"
const pageTitle = `Setting Management`
const folderView = __path_views_backend + `pages/${routerName}/`;
const systemConfig = require(__path_configs + 'system');
const linkIndex = '/' + systemConfig.prefixAdmin + '/' + routerName;
const schemaSetting = require(__path_schemas + routerName);
const layout = __path_views_backend + 'backend';
const FileHelpers = require(__path_helpers + 'file');
const uploadThumb = FileHelpers.uploadFileSetting([
  {
    name: 'logoLarge'
  }, {
    name: 'logoSmall'
  }, {
    name: 'logoTitle'
  },
	{
    name: 'logoBanner'
  }
], `${routerName}`);
// List items

// access FORM
router.get('/', async function (req, res, next) {
  try {
    let inform = req.flash()
    let settingObj = await schemaSetting.findOne({})
    let main = {
      inform: inform,
      pageTitle: pageTitle,
    }
    if (settingObj.id != undefined) { // document exists });
          res.render(`${folderView}form`, {
            main: main,
            settingObj,
            item: JSON.parse(settingObj.setting),
            layout
          });
      } else {
        res.render(`${folderView}form`, {
          main: main,
          item: [],
          layout
        });
        console.log(folderView);
      }
} catch (error) {
  console.log(error)
}
});


router.post('/save/(:id)?', 
	uploadThumb, 
	async function (req, res) { // Finds the validation errors in this request and wraps them in an object with handy functions
        try {
          let settingObj = await schemaSetting.findOne({})
          let settingData = JSON.parse(settingObj.setting)
          let item = req.body;
          let errors = validationResult(req)
              item.logosmall = (settingData.logosmall!=undefined) ? settingData.logosmall : undefined
              item.logolarge = (settingData.logolarge!=undefined) ? settingData.logolarge : undefined
              item.logotitle = (settingData.logotitle!=undefined) ? settingData.logotitle : undefined
          if (! errors.isEmpty()) {
            let main = {
              pageTitle: pageTitle,
              showError: errors.errors,
            }
            if (req.files != undefined) {
              for (const [key, value] of Object.entries(req.files)) {
                FileHelpers.remove(`public/uploads/${routerName}/`, value[0].filename)
              }
            }
            res.render(`${folderView}form`, {
              main: main,
              settingObj,
              item: settingData,
                      layout
            });
            return
          } else {
                  for (const [key, value] of Object.entries(req.files)) {
                              let key = value[0].filename.split(".")[0]
                              FileHelpers.remove(`public/uploads/${routerName}/`, `${settingData[key]}`)
                  }
                  for (const [key, value] of Object.entries(req.files)) {
                      let key = value[0].filename
                      item[key.split(".")[0]] = "uploaded" + key;
                      fs.renameSync(`public/uploads/${routerName}/${key}`, `public/uploads/${routerName}/uploaded${
                          value[0].filename
                      }`);
                  }
                  item = JSON.stringify(item)
                  await schemaSetting.updateOne(settingObj.id, {setting: item})
                  req.flash('success', notify.SUCCESS_SETTING_SAVE);
                  res.redirect(linkIndex);
            }
        } catch (error) {
          console.log(error)
        }
      });


module.exports = router;
