
let createFilterStatus = async (currentStatus, collection) => {
	let Model = require(__path_schemas + collection);
	let statusFilter = [
		{ name: 'All', value: 'all', count: 0, class: 'default' },
		{ name: 'Active', value: 'active', count: 0, class: 'default' },
		{ name: 'InActive', value: 'inactive', count: 0, class: 'default' }
	];

	for (let index = 0; index < statusFilter.length; index++) {
		let item = statusFilter[index];
		let condition = (item.value !== "all") ? { status: item.value } : {};
		statusFilter[index].class = 'primary';
		if (item.value === "active") {
			statusFilter[index].class = 'success';
		} else if (item.value === "inactive") {
			statusFilter[index].class = 'danger';
		}
		await Model.count(condition).then((data) => {
			statusFilter[index].count = data;
		});
	}

	return statusFilter;
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

module.exports = {
	createFilterStatus: createFilterStatus,
	countCollection: countCollection
}