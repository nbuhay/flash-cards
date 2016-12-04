// iterate over all ids
var addMultipleListeners = function(listener, id, value, func) {
	for(var i=0; i<id.length; i++) {
		addListener(listener, id[i], value[i], func);
	}
}

// good learning - require passed function to be wrapped in anonymous function, otherwise func executes immediately
var addListener = function(listener, id, value, func) {
	document.getElementById(id).addEventListener(
		listener,
		function() { func(value) },
		false
 	);
}