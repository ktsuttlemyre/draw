var redis = require("redis");

var Promise = require("bluebird");
Promise.promisifyAll(require("redis"));


var client = redis.createClient();
// if you'd like to select database 3, instead of 0 (default), call 
// client.select(3, function() { /* ... */ }); 
 
client.on("error", function (err) {
    console.log("Error " + err);
});
 
// client.set("string key", "string val", redis.print);
// client.hset("hash key", "hashtest 1", "some value", redis.print);
// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
// client.hkeys("hash key", function (err, replies) {
//     console.log(replies.length + " replies:");
//     replies.forEach(function (reply, i) {
//         console.log("    " + i + ": " + reply);
//     });
//     client.quit();
// });

// exports.updateUserCoords=function(canopy,userID,x,y,viewW,viewH,callback){ //TODO implment a queue here within nodejs so we can call zadd with multiple entries
// 	var xSetID='Canopy:'+canopy+'.usersX'
// 	var ySetID='Canopy:'+canopy+'.usersY'
// 	//TODO search up to 4 quadrents?
// 	async.parallel([
// 	    function(callback){
// 			client.zadd([ xSetID, x, userID ], function (err, response) {
// 			    if (err) callback(err)
// 			    console.log('added '+response+' items.');

// 			    client.zrangebyscore([ xSetID, x-(viewW*1.5), x+(viewW*1.5) ], function (err, response) {
// 			        if (err) callback(err)
// 			        console.log('users close to '+userID+' on the x axis', response);
// 			        // write your code here
// 			        callback(null, response);
// 			    });
// 			});
// 	    },
// 	    function(callback){
// 			var argsY = [ySetID, y, userID ];
// 			client.zadd(argsY, function (err, response) {
// 				if (err) callback(err)
// 			    console.log('added '+response+' items.');

// 			    client.zrangebyscore([ ySetID, y-(viewH*1.5), y+(viewH*1.5) ], function (err, response) {
// 			        if (err) callback(err)
// 			        console.log('users close to '+userID+' on the y axis', response);
// 			        // write your code here
// 			        callback(null, response);
// 			    });
// 			});
// 	    }
// 	],
// 	// optional callback
// 	function(err, results){
// 	    // the results array will equal [[xCords],[yCords]] even though
// 	    // the second function had a shorter timeout.
// 	    var users = _.intersection(results)

// 		//var roster = io.sockets.clients('chatroom1');
// 		// roster.forEach(function(client) {
// 		//     console.log('Username: ' + client.nickname);
// 		// });

// 	    callback(roomIDs)
// 	});

// 	return 
// }



exports.updateUserCoords=function(canopy,userID,x,y,viewW,viewH,callback){ //TODO implment a queue here within nodejs so we can call zadd with multiple entries
	var xSetID='Canopy:'+canopy+'.usersX'
	var ySetID='Canopy:'+canopy+'.usersY'
	//TODO search up to 4 quadrents?

	var insertXSearch = client.zaddAsync([xSetID, x, userID ])
					.then(function(response) {
						console.log('*** 1 added x '+response+' items.');
						return client.zrangebyscoreAsync([ xSetID, x-(viewW*1.5), x+(viewW*1.5) ]).then(function(response){
						    console.log('*** 2 users close to '+userID+' on the x axis', response);
						    return response
						})
					}) 
	var insertYSearch = client.zaddAsync([ySetID, y, userID ])
					.then(function(response) {
						console.log('*** 1 added y '+response+' items.');
						return client.zrangebyscoreAsync([ ySetID, y-(viewH*1.5), y+(viewH*1.5) ]).then(function(response){
						    console.log('*** 2 users close to '+userID+' on the y axis', response);
						    return response
						})
					})

	Promise.all([insertXSearch,insertYSearch]).then(function(results){
		console.log('*** 3 ***',JSON.stringify(results))
	    // the results array will equal [[xCords],[yCords]] even though
	    // the second function had a shorter timeout.
	    var users = _.intersection(results)

		//var roster = io.sockets.clients('chatroom1');
		// roster.forEach(function(client) {
		//     console.log('Username: ' + client.nickname);
		// });

	    callback(roomIDs)
	})

	return 
}

exports.userLeave=function(userID){


}

