//#region ----- GLOBAL DECLARATIONS -----
var categories = [];

//#endregion ----- GLOBAL DECLARATIONS -----

//#region ----- WINDOW ON LOAD -----
window.onload = function () {
	sessionStorage.clear();
	getAllProductsCategories().then((response) => {
		if (response) {
			categories = response;
			createProductCategoryTable(categories);
			document.getElementById('loaderProductList').hidden = true;
		}
	});
};
//#endregion ----- WINDOW ON LOAD -----

//#region ----- API'S SECTION -----

const getAllProductsCategories = () => {
	document.getElementById('loaderProductList').hidden = false;
	return fetch(baseURL + categoriesURL)
		.then(handleHttpErrors)
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};
//#endregion ----- API'S SECTION -----

//#region ----- NORMAL METHODS -----
/**
 * @description  This function will create product categories listing table
 * @param {categories} categories
 */
const createProductCategoryTable = (categories) => {
	document.getElementById('productCategoriesList').innerText = '';
	let table = document.getElementById('productCategoriesList');
	var row = table.insertRow(0);
	let hcell1 = row.insertCell(0);
	let hcell2 = row.insertCell(1);

	hcell1.innerHTML = '<b> Product Category Name </b>';
	hcell2.innerHTML = `<b> View Product(s) </b>`;

	var header = document
		.getElementById('productCategoriesList')
		.getElementsByTagName('tr');
	header[0].style.backgroundColor = '#f3f3f3';

	for (let i = 0; i < categories.length; i++) {
		row = table.insertRow(i + 1);

		row.insertCell(0).innerHTML = categories[i];

		row.insertCell(1).innerHTML =
			`<button id=` +
			i +
			` type="button" class=" fa fa-eye btn btn-outline-primary" onclick="onView(event) "> View</button>`;
	}
};

/**
 * @description  This function saves selected category in sessionStorage and navigate to products page
 * @param {event} event
 */
const onView = (event) => {
	sessionStorage.setItem('categories', categories[event.target.id]);
	let currentURL = window.location.href.split('/').pop();
	window.open(
		window.location.href.replace(currentURL, 'index.html'),
		'_self'
	);
	return true;
};
//#endregion ----- NORMAL METHODS -----
