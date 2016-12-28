Create flash cards to study any subject.  Great for learning!

**Coding Reference**

[Mocha Gist](https://gist.github.com/samwize/8877226)

[Basic Mocha http.request](http://taylor.fausak.me/2013/02/17/testing-a-node-js-http-server-with-mocha/)

[Gracefully Shutdown MongoDb](https://docs.mongodb.com/manual/tutorial/manage-mongodb-processes/#StartingandStoppingMongo-SendingshutdownServer%28%29messagefromthemongoshell)
mongod --dbpath data/db
(separate terminal)
mongo
use admin
db.shutdownServer()
exit

[Arrow Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
Two factors influenced the introduction of arrow functions: shorter functions and non-binding of this.

[Nodejs Docs HTTP.request](https://nodejs.org/dist/latest-v4.x/docs/api/http.html#http_http_request_options_callback)

[Node.js error-first callbacks](http://fredkschott.com/post/2014/03/understanding-error-first-callbacks-in-node-js/)

[Node.js error API docs](https://nodejs.org/api/errors.html)

[API Restful Error Design](https://apigee.com/about/blog/technology/restful-api-design-what-about-errors)
outsiders calling api, the api should be a black box
black box, system can be viewed as input/output function
errors are supposed to be given back to outsiders to help them understand 

APIs are supposed to make the developer successful
good to send correct error code, granular message, and possibly link to find out more

folks only use small set of http error codes
		200
		201
		304
		400
		401
		403
		404
		409
		410
		412
		500
[Joyent Node.js Error Practices](https://www.joyent.com/node-js/production/design/errors)

[MDN Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
	Async computation
	promise represent value which may be available now, or in the future, or never

	new Promise (/* executor */ function(resolve, reject) { ... } );
		immediately executor is invoked and passed resolve and reject functions
			executes some kind of work
			calls either resolve ore reject to resolve or reject the Promise
				if error, promise is rejected, return value of resolve ignored

A Promise is a proxy for a value not necessarily known when the promise is created. It allows you to associate handlers to an asynchronous action's eventual success value or failure reason. This lets asynchronous methods return values like synchronous methods: instead of the final value, the asynchronous method returns a promise for the value at some point in the future.

Pending: Initial state, not fulfilled or rejected
Fulfilled: completed successfully
Rejected:  operation failed


Promise

promise (resolve, reject)
	do your task
		if ok, resolve
		else reject


p.then
	okay what happened?
		do something with the result
	else error

[NODE_ENV for dev/prod](http://himanshu.gilani.info/blog/2012/09/26/bootstraping-a-node-dot-js-app-for-dev-slash-prod-environment/)

[Node Debugger](https://github.com/node-inspector/node-inspector)

[Request Headers - when/not to JSON.parse](http://stackoverflow.com/questions/8081701/i-keep-getting-uncaught-syntaxerror-unexpected-token-o)