const API_URL = "http://api.yogscinemavote.com";

export const ajaxHelper = (url, options) => {

	if(typeof options.credentials === 'undefined') {
		options.credentials = 'include';
	}

	if(typeof options.method !== 'undefined' && (options.method == 'POST' || options.method == 'PATCH')) {
		if(typeof options.headers !== 'undefined' && typeof options.headers['Content-Type'] === 'undefined') {
			// Content-Type header not set, but headers are set
			options.headers['Content-Type'] = 'application/json';
		}
		else if(typeof options.headers === 'undefined') {
			// No headers set
			options.headers = {
				'Content-Type': 'application/json'
			}
		}

		if(typeof options.body !== 'undefined' && typeof options.body !== 'String') {
			// body not a string
			options.body = JSON.stringify(options.body);
		}
	}
	else if (typeof options.method !== 'undefined' && options.method == 'GET' && typeof options.params !== 'undefined') {
		let params = options.params;
		delete options.params;

		if(Object.keys(params).length > 0) {
			// Append the params to url as a query string
			let queryStringArray = [];
			for(let property in params) {
				let value = params[property];
				queryStringArray.push(encodeURIComponent(property)+"="+encodeURIComponent(value));
			}

			let queryString = queryStringArray.join("&");

			url += "?"+queryString;

		}
	}

	return fetch(API_URL+url, options)
	.then((data) => {
		return data.json();
	})
	.then((data) => {
		if(data.result) {
			return Promise.resolve(data);
		}
		else {
			return Promise.reject(data);
		}
	});
}
