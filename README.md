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