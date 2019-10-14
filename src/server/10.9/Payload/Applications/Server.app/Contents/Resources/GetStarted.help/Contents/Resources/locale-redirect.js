(function apd_language_redirect () {
	var localePath = location.pathname.replace(/^.*\/([^\/]+.lproj)\/.*$/, "$1"),
		url = "../index.html?localePath=" + localePath,
		topic;
	if (location.search.match(/topic=[^&]+/)) {
		topic = location.search.replace(/^.*topic=([^&]+).*$/, "$1");
	}
	url += topic ? "#" + topic : location.hash;
	location.replace(url);
}());
