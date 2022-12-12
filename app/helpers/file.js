var multer  = require('multer');
var randomstring = require("randomstring");
const path = require('path');
const fs    = require('fs'); 
const notify  		= require(__path_configs + 'notify');

let uploadFile = (field, folderDes = 'users', fileNameLength = 10, fileSizeMb = 1, fileExtension = 'jpeg|jpg|png|gif') => {
		const storage = multer.diskStorage({
			destination: (req, file, cb) => {
				cb(null, __path_uploads + folderDes + '/')
			},
			filename: (req, file, cb) =>  {
				cb(null,  randomstring.generate(fileNameLength) + Date.now() + path.extname(file.originalname));
			}
		});

	const upload = multer({ 
		storage: storage,
		limits: {
			fileSize: fileSizeMb * 1024 * 1024,
		},
		fileFilter: (req, file, cb) => {
		
			const filetypes = new RegExp(fileExtension);
			const extname 	= filetypes.test(path.extname(file.originalname).toLowerCase());
			const mimetype  = filetypes.test(file.mimetype);
	
			if(mimetype && extname){
				return cb(null,true);
			}
			// else {
			// 	cb(notify.ERROR_FILE_EXTENSION);
			// }	
			return cb(null,false);		
		}
	}).single(field);

	return upload;
}

let uploadFileSetting = (field, folderDes = 'users', fileNameLength = 10, fileSizeMb = 1, fileExtension = 'jpeg|jpg|png|gif') => {
	const storage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, __path_uploads + folderDes + '/')
		},
		filename: (req, file, cb) =>  {
			cb(null, file.fieldname.toLowerCase()  + path.extname(file.originalname));
		}
	});

const upload = multer({ 
	storage: storage,
	limits: {
		fileSize: fileSizeMb * 1024 * 1024,
	},
	fileFilter: (req, file, cb) => {
		const filetypes = new RegExp(fileExtension);
		const extname 	= filetypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype  = filetypes.test(file.mimetype);

		if(mimetype && extname){
			return cb(null,true);
		}
		// else {
		// 	cb(notify.ERROR_FILE_EXTENSION);
		// }	
		return cb(null,false);		
	}
}).fields(field);

return upload;
}

let removeFile = (folder, fileName) => {
	if(fileName != "" && fileName != undefined ){
		let path = folder + fileName;
		if (fs.existsSync(path))   fs.unlinkSync(path, (err) => {if (err) throw err;});
	}
}

let removeFileSetting = (folder, fileName, mainname) => {
	if(fileName != "" && fileName != undefined ){
		let path = folder + fileName;
		if (fs.existsSync(path))   {
			try {
				fs.unlinkSync(path);
				let originalname = fileName.slice(8)
				fs.renameSync(`public/uploads/${mainName}/${key}`, `public/uploads/${mainName}/uploaded${
					value[0].filename
				}`)
				return true;
			 } catch (e) {
				return false;
			 }
		}
	}
}

module.exports = {
	upload: uploadFile,
	remove: removeFile,
	uploadFileSetting: uploadFileSetting,
	removeFileSetting: removeFileSetting,
}