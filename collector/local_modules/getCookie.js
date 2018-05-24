module.exports = (user_cookies, this_cookie, delimiter) => {
	try {
		const delimit = delimiter || '; ';
		const cookies = user_cookies.split(delimit);
		const cookie_array2 = {};
		for (var cookie in cookies) {
			let theCookie = cookies[cookie];
			let indOfEq=theCookie.indexOf("=");
			if(indOfEq >-1) {
				cookie_array2[theCookie.substr(0,indOfEq)]=theCookie.substr(indOfEq+1);
			}
		}
		return cookie_array2[this_cookie];
	}
	catch(e) {
		console.log(e);
		return false;
	}
};