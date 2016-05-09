var Promise = require("bluebird");
var MongoDB = require("mongodb");
Promise.promisifyAll(MongoDB);


var db = null


var client = MongoDB.connectAsync('mongodb://localhost:27017/test')
    .then(function(DB) {
    	db=DB
    //     //return db.collection("myCollection").findOneAsync({ id: 'someId' })
    // //get the user collection
    // var users = db.collection('users');
    // return users.find().then(function(users) {
    //    console.log(users);
    }).catch(function(err) {
        console.error("something went wrong");
    });

var sixtyFourPartition=bigInt('7FFFFFFFFFFFFFFF',16) // =9,223,372,036,854,775,807

exports.getDataInView=function(canopy,user,viewPort,callback){

	var db =connections[canopy] //get a database or create it

	var userID=user.id
	var center=user.position
	var width=viewPort.width
	var heigh=viewPort.height
	var zoom = viewPort.zoom
	var halfWidth=width/2
		,halfHeight=height/2
		,padding=1.5;



	var viewXLow=center.x.add(halfWidth*padding).divmod(sixtyFourPartition)
	var viewXHigh=center.x.add(-halfWidth*padding).divmod(sixtyFourPartition)
	var viewYLow=center.y.add(halfHeight*padding).divmod(sixtyFourPartition)
	var viewYHigh=center.y.add(-halfHeight*padding).divmod(sixtyFourPartition)

	//var quadrents as ascii
	var viewXLowQuadrent = viewXLow.quotient.toString('ASCIIbetical')
	var viewXHighQuadrent = viewXHigh.quotient.toString('ASCIIbetical')
	var viewYLowQuadrent = viewYLow.quotient.toString('ASCIIbetical')
	var viewYHighQuadrent = viewYHigh.quotient.toString('ASCIIbetical')


	//TODO search across quadrents
	var quadrentsToSearch=_.uniq([viewXLowQuadrent,viewXHighQuadrent,viewYLowQuadrent,viewYHighQuadrent])
	if(quadrentsToSearch.length!=1){ //TODO handle this correctly
		console.warn('not searching all quadrents correctly, chosing the most likely for now')
		quadrentsToSearch=[_.chain(quadrentsToSearch).countBy().pairs().max(_.last).head().value()]
	}

	//Search for entries and return them
	var findXRange=db.collection(quadrentsToSearch[0]).findAsyc(
		{ $and: [ 
			 { minX: {$lte: MongoDB.Long.fromString(viewXLow.remainder.toString()) } /* ,$gte:*/} //todo maybe reduce the range this way?
			,{ maxX: {$gte: MongoDB.Long.fromString(viewXHigh.remainder.toString()) } /* ,$lte:*/} //todo maybe reduce the range this way?
			,{ minY: {$lte: MongoDB.Long.fromString(viewYLow.remainder.toString()) } /* ,$gte:*/} //todo maybe reduce the range this way?
			,{ maxY: {$gte: MongoDB.Long.fromString(viewYHigh.remainder.toString()) } /* ,$lte:*/} //todo maybe reduce the range this way?
			]
		}).then(function(){

			callback()
	})
}


exports.setStroke=function(canopy,entry){




}







