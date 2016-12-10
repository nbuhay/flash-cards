// iterate over all ids
var addMultipleListeners = function (listener, classNames, value, func) {
	for(var i = 0; i < classNames.length; i++) {
		var currentClass = document.getElementsByClassName(classNames[i]);
		for (var j = 0; j < currentClass.length; j++) {
			addListener(listener, currentClass[j], value[i], func);
		}
	}
}

// good learning - require passed function to be wrapped in anonymous function, otherwise func executes immediately
var addListener = function (listener, className, value, func) {
	className.addEventListener(
		listener,
		function () { func(value) },
		false
 	);
}