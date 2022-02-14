//#region ----- GLOBAL DECLARATIONS -----
var products = [];
var validationErrors = '';
var _productID = null;
var _productTitle = null;
var _productPrice = null;
var _productDescription = null;
var _productCategory = null;
var _productImage = null;
var fileCheck = false;
var productForEdit = null;
var productSortOrder = 'asc';
var categoriesFilter = [];
var productFilterCatergoryListing = null;
//#endregion ----- GLOBAL DECLARATIONS -----

//#region ----- WINDOW ON LOAD -----
window.onload = function () {
	validationBlockCheck();
	let filter = sessionStorage.getItem('categories') || '';
	document.getElementById('productListingTitle').innerText = filter
		? 'Products of ' + filter
		: 'Product(s)';

	getAllProductsCategoriesFilter().then((data) => {
		categoriesFilter = data;
		autoPopulateProductsDDL(categoriesFilter);
		document.getElementById('loaderProductList').hidden = true;
	});
	getAllProducts(filter);
};
//#endregion ----- WINDOW ON LOAD -----

//#region ----- API'S SECTION -----

/**
 *@description  Get Product categories for dropdown
 *@param {_productTitle,	_productPrice,_productCategory,_productImage,_productDescription} data
 */
const getAllProductsCategoriesFilter = (filter) => {
	document.getElementById('loaderProductList').hidden = false;
	return fetch(baseURL + categoriesURL)
		.then(handleHttpErrors)
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};

/**
 *@description  Handles Add product
 *@param {_productTitle,	_productPrice,_productCategory,_productImage,_productDescription} data
 */
const addProductToCollection = (
	_productTitle,
	_productPrice,
	_productCategory,
	_productImage,
	_productDescription
) => {
	document.getElementById('loaderProductAddEdit').hidden = false;
	fetch(baseURL + productsURL, {
		method: 'POST',
		body: JSON.stringify({
			title: _productTitle,
			price: +_productPrice,
			description: _productDescription,
			image: _productImage,
			category: _productCategory,
		}),
	})
		.then(handleHttpErrors)
		.then((response) => {
			showStatus('Product added succesfullly', 'success');
			clearProductForm();
			document.getElementById('loaderProductAddEdit').hidden = true;
		})
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductAddEdit').hidden = true;
		});
};

/**
 *@description  Get all products and also worked with category wise products api
 *@param {id} id
 */
const getAllProducts = (filter) => {
	document.getElementById('loaderProductList').hidden = false;
	let url = filter ? '/category/' + filter : '';

	fetch(baseURL + productsURL + url)
		.then(handleHttpErrors)
		.then((response) => {
			products = response;
			createProductTable(products);
			document.getElementById('loaderProductList').hidden = true;
		})
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};

/**
 *@description  Get product by id
 *@param {id} id
 */
const getProductById = (id) => {
	document.getElementById('loaderProductList').hidden = false;
	return fetch(baseURL + productsURL + '/' + id)
		.then(handleHttpErrors)
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};

/**
 *@description  Handles add of product
 *@param {data} data
 */
const addProduct = (data) => {
	document.getElementById('loaderProductList').hidden = false;
	fetch(baseURL + productsURL)
		.then(handleHttpErrors)
		.then((response) => {
			products = response;
			createProductTable(products);
			document.getElementById('loaderProductList').hidden = true;
		})
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};

/**
 *@description  Handles edit of product
 *@param {title,price,category,image,description,id} event
 */
const editProductToCollection = (
	title,
	price,
	category,
	image,
	description,
	id
) => {
	document.getElementById('loaderProductAddEdit').hidden = false;
	return fetch(baseURL + productsURL + '/' + id, {
		method: 'PUT',
		body: JSON.stringify({
			title: title,
			price: +price,
			description: description,
			image: image,
			category: category,
		}),
	})
		.then(handleHttpErrors)
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductAddEdit').hidden = true;
		});
};

/**
 * @description  Handles delete of product
 *@param {event} event
 */
const onDelete = (event) => {
	Swal.fire({
		text: 'Are you sure you want to delete this product?',
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#3085d6',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes, delete it!',
	}).then((result) => {
		if (result.isConfirmed) {
			fetch(baseURL + productsURL + '/' + event.target.id, {
				method: 'DELETE',
			})
				.then(handleHttpErrors)
				.then((response) => {
					if (response) {
						showStatus(
							'Product has been deleted.',
							'success'
						);
					}
				})
				.catch((error) => {
					showStatus(error.message, 'error');
				});
		}
	});
};

/**
 * @description  Gets sorted products title by ASC or DESC
 *
 */
const sortProduct = () => {
	document.getElementById('productListingTitle').innerText = 'Product(s)';
	productSortOrder === 'asc'
		? (productSortOrder = 'desc')
		: (productSortOrder = 'asc');
	document.getElementById('loaderProductList').hidden = false;
	fetch(baseURL + productsURL + '?sort=' + productSortOrder)
		.then(handleHttpErrors)
		.then((response) => {
			if (response) {
				products = [];
				products = response;
				createProductTable(products);

				document.getElementById('loaderProductList').hidden = true;
			}
		})
		.catch((error) => {
			showStatus(error.message, 'error');
			document.getElementById('loaderProductList').hidden = true;
		});
};

//#endregion ----- API'S SECTION -----

//#region ----- NORMAL METHODS -----

/**
 * @description  This function will take response from products categories and auto-populate select options
 * @param {response} response
 */
const autoPopulateProductsDDL = (response) => {
	let productCategoryDDL = document.getElementById('productCategoryDDL');
	Object.keys(response).map((key) =>
		productCategoryDDL.add(new Option(response[key], response[key]))
	);
};

/**
 * @description  This function will have event object from product image file input onchange
 * @param {event} event
 */
const validateFileUpload = (event) => {
	const [file] = productImage.files;

	if (file) {
		let extension = file.name.split('.').pop();
		if (
			extension.toLowerCase() === 'png' ||
			extension.toLowerCase() === 'jpg' ||
			extension.toLowerCase() === 'jpeg'
		) {
			imagePreview.src = URL.createObjectURL(file);
			_productImage = document.getElementById('productImage').value;
		} else {
			imagePreview.src = '';
			_productImage = document.getElementById('productImage').value;
		}
	}
};

/**
 * @description  This function will check if any error present or not, based on that it will toggle product error block
 */
const validationBlockCheck = () => {
	if (validationErrors != '') {
		window.scrollTo(0, 0);
		document.getElementById('productErrorBlock').style.display = 'block';
		document.getElementById('productErrorBlock').innerText =
			validationErrors;
	} else {
		document.getElementById('productErrorBlock').style.display = 'none';
	}
};

/**
 * @description  This function will validate product
 */
const validateProduct = () => {
	validationErrors = '';

	if (!_productTitle) {
		validationErrors += '\n - Enter valid product title';
	}
	if (!priceRegex.test(_productPrice)) {
		validationErrors += '\n - Enter valid product price';
	}
	if (_productCategory === '') {
		validationErrors += '\n - Select product category';
	}
	if (!_productDescription) {
		validationErrors += '\n - Enter valid product description';
	}

	if (!_productImage && !productForEdit) {
		validationErrors +=
			'\n - Select valid file with png, jpg, jpeg file types';
	} else {
		if (
			(_productImage && !productForEdit) ||
			(_productImage && productForEdit)
		) {
			let ext = _productImage.split('.').pop();
			if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
			} else {
				validationErrors +=
					'\n - Select valid file with png, jpg, jpeg file types';
			}
		}
	}

	validationBlockCheck();
};

/**
 * @description  This function will call on save and also it bifurcates while add and editing record and call api
 */
const onAddProduct = () => {
	setEnteredData();
	validateProduct();
	if (validationErrors === '') {
		if (productForEdit) {
			let _isOldOrNewImage =
				productForEdit && _productImage
					? _productImage
					: productForEdit.image;

			editProductToCollection(
				_productTitle,
				_productPrice,
				_productCategory,
				_isOldOrNewImage,
				_productDescription,
				productForEdit.id
			).then((response) => {
				if (response) {
					document.getElementById(
						'loaderProductAddEdit'
					).hidden = true;
					showStatus('Product updated succesfullly', 'success');
					clearProductForm();
				}
			});
		} else {
			addProductToCollection(
				_productTitle,
				_productPrice,
				_productCategory,
				_productImage,
				_productDescription
			);
		}
	}
};

/**
 * @description  This function clears all neccessary properties for product form
 */
const clearProductForm = () => {
	document.getElementById('addProductActionLabel').style.display = 'block';
	document.getElementById('editProductActionLabel').style.display = 'none';
	document.getElementById('productTitle').value = '';
	document.getElementById('productPrice').value = '';
	document.getElementById('productImage').value = '';
	document.getElementById('productCategoryDDL').value = '';
	document.getElementById('productDesc').value = '';
	document.getElementById('imagePreview').src = '';
	productForEdit = null;
	validationErrors = '';
	fileCheck = false;
	validationBlockCheck();
};

/**
 * @description  This function will set product form data to declarations
 */
const setEnteredData = () => {
	_productTitle = document.getElementById('productTitle').value;
	_productPrice = document.getElementById('productPrice').value;
	_productCategory = document.getElementById('productCategoryDDL').value;
	_productImage = document.getElementById('productImage').value;
	_productDescription = document.getElementById('productDesc').value;
};

/**
 * @description  This function will create product listing table based in product(s) response and takes product response as a parameter
 * @param {products} products
 */
const createProductTable = (products) => {
	document.getElementById('productsTable').innerText = '';
	let table = document.getElementById('productsTable');
	var row = table.insertRow(0);
	let hcell1 = row.insertCell(0);
	let hcell2 = row.insertCell(1);
	let hcell3 = row.insertCell(2);
	let hcell4 = row.insertCell(3);
	let hcell5 = row.insertCell(4);
	let hcell6 = row.insertCell(5);
	hcell1.innerHTML = '<b> Product Image </b>';
	hcell2.innerHTML = `<b class="selection" onclick="sortProduct()"> Title </b>`;
	hcell3.innerHTML = '<b> Category </b>';
	hcell4.innerHTML = '<b> Price </b>';

	hcell5.innerHTML = '<b> Edit</b>';
	hcell6.innerHTML = '<b> Delete</b>';
	var header = document
		.getElementById('productsTable')
		.getElementsByTagName('tr');
	header[0].style.backgroundColor = '#f3f3f3';

	for (let i = 0; i < products.length; i++) {
		row = table.insertRow(i + 1);

		row.insertCell(0).innerHTML = `
			<img src="${products[i].image}"/>`;

		row.insertCell(1).innerHTML = products[i].title;
		row.insertCell(2).innerHTML = products[i].category;
		row.insertCell(3).innerHTML = products[i].price;

		row.insertCell(4).innerHTML =
			`
		<button id=` +
			products[i].id +
			` type='button' onclick='onEdit(event)' class="btn btn-warning">Edit</button>`;
		row.insertCell(5).innerHTML =
			`
		<button id=` +
			products[i].id +
			` type='button' onclick='onDelete(event)' class="btn btn-danger">Delete</button>`;
	}
};

/**
 * @description  This function will called when user clicks on edit button from listing table and set related info to form
 * @param {event} event
 */
const onEdit = (event) => {
	clearProductForm();
	window.scroll(0, 0);
	document.getElementById('loaderProductList').hidden = false;
	getProductById(event.target.id).then((response) => {
		if (response) {
			clearProductForm();
			productForEdit = response;

			document.getElementById('addProductActionLabel').style.display =
				'none';
			document.getElementById('editProductActionLabel').style.display =
				'block';
			autoFillProduct(productForEdit);
			document.getElementById('loaderProductList').hidden = true;
		} else {
			showStatus('Product not found', 'error');
		}
		document.getElementById('loaderProductList').hidden = true;
	});
};

/**
 * @description  This function will auto-fill all the data received from the get product by id api in product form
 * @param {data} data
 */
const autoFillProduct = (data) => {
	let { title, category, description, price, image } = data;
	document.getElementById('productTitle').value = title;
	document.getElementById('productPrice').value = price;
	document.getElementById('productCategoryDDL').value = category;
	document.getElementById('imagePreview').src = image;
	document.getElementById('productDesc').value = description;
	_productImage = image;
	validationErrors = '';
	validationBlockCheck();
};
//#endregion ----- NORMAL METHODS -----
