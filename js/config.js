//#region ----- API'S ENDPOINTS -----
const baseURL = 'https://fakestoreapi.com/';
const productsURL = 'products';
const categoriesURL = 'products/categories';
//#endregion ----- API'S ENDPOINTS -----

//#region ----- REGEX -----
const priceRegex = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
//#endregion ----- REGEX -----

//#region ----- COMMON MESSAGE -----
const showStatus = (message, status) => {
	Swal.fire('', message, status);
};
//#endregion ----- COMMON MESSAGE -----

//#region ----- HANDLE ALL HTTP ERROR & RESPONSE -----
const handleHttpErrors = (response) => {
	if (response.status !== 200) {
		let statusMsg = '';
		if (response.status === 400) {
			statusMsg = 'Bad Request';
		} else if (response.status === 401) {
			statusMsg = 'Unauthorized Request';
		} else if (response.status === 404) {
			statusMsg = 'Not Found';
		} else if (response.status === 500) {
			statusMsg = 'Internal Server Error';
		} else {
			statusMsg = 'Invalid Request';
		}
		throw Error(statusMsg);
	}
	return response.json();
};
//#endregion ----- HANDLE ALL HTTP ERROR & RESPONSE -----
