const databaseConfig = require(__path_configs + 'database');
let Parser = require('rss-parser');
let parser = new Parser();
let xml2js = require('xml2js');
let fs = require('fs');

let createFilterStatus =  async (currentStatus,collection) => {
	const Model = require(__path_schemas +  collection);
    let statusFilter = [
		{name: 'All', value: 'all', count: 0, class: 'default'},
		{name: 'Active', value: 'active',  count: 0, class: 'default'},
		{name: 'InActive', value: 'inactive',  count: 0, class: 'default'}
	];

	for(let index = 0; index < statusFilter.length; index++) {
		let item = statusFilter[index];
		let condition = (item.value !== "all") ? {status: item.value} : {};
		if(item.value === currentStatus) statusFilter[index].class = 'success';

		await Model.count(condition).then( (data) => {
			statusFilter[index].count = data;
		});
	}

    return statusFilter;
}

const firstLetterUppercase = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const countCollection = async (arrKey, collectionModel) => {
  for (let i = 0; i < arrKey.length; i++) {
		let key = arrKey[i];
		await collectionModel[key].count({}).then( (data) => {
			collectionModel[key] = data;
		});
	}
	return collectionModel;
}
const getCategory = async () => {
	const Model = require(__path_schemas + databaseConfig.col_categories);
	const listCategory = await Model.find({status: 'active'});
	return listCategory;
}
const mapDataRss = async (listRss) => {
		return await Promise.all (listRss.map(async item => {
		let category = item.name;
		let {items} = await parser.parseURL(item.link);
		let result = items.map(item => {
			let obj = {};
			obj.title = item.title;
			obj.content = item.contentSnippet;
			obj.date = item.pubDate;
			obj.link = item.link;
			let match = item.content.match(/<img[^>]+src="([^">]+)"/) ?? [];
			obj.image = match[1];
			obj.category = category;
			return obj;
		})
		return result;
	}))
}
const mapRssPagination = (listRss,totalItemsPerPage) => {
	let newArr = [];
	listRss.map(item => {
		newArr = [...newArr,...item]
	});
	let result = []; let count = 0; let tmp = [];
	for (let i = 1; i <newArr.length; i++) {
		tmp.push(newArr[i]);
		if(i % totalItemsPerPage == 0) {
			result.push(tmp)
			tmp = [];
		}
	}
	return result;
}
const saveFileRss = (data) => {
	fs.writeFile("./rss/data.xml", JSON.stringify(data), function(err) {
    if(err) {
        return console.log(err);
    }
}); 
}

const getRss = async (rssList,req) => {
	if (checkTimeValid(5,req)) {
		let data = fs.readFileSync('./rss/data.xml');
		return JSON.parse(data);
	} else {
		let data = await mapDataRss(rssList);
		saveFileRss(data);
		return data;
	}
 };
const checkTimeValid = (minutes,req) => {
	let limit = minutes * 60 * 1000;
	let {time} = req.session || Date.now();
	if(Date.now() - time < limit) {
		console.log('doc tu file');
		return true;
	} else {
		console.log('doc tu api');
		req.session.time = Date.now();
		return false;
	}
}

module.exports = {
    createFilterStatus: createFilterStatus,
		firstLetterUppercase,
		countCollection,
		getCategory,
		getRss,
		mapRssPagination
}