
// if(typeof require==undefined&& typeof exports == undefined){
//   console.log('sssssssssssssss')
//   bigInt=
// }



// var fs = require("fs");
// var os = require("os");
// var jsonminify = require('jsonminify');
(function(exports){

   var bigInt=this.bigInt||require('./lib/BigInteger.js') //DEV NOTE: because of inhertiance from other modules dont use instanceof when checking for bigInt

    // your code goes here
    exports.packState = function(state) {

      if(state.server){

        if(typeof state.server.x == 'object'){//DEV NOTE: because of inhertiance from other modules dont use instanceof when checking for bigInt
          console.log('packing server coords')
          console.dir(state.server.x)
          console.log('eer',state.server.x.toString('wordBase62'))
          state.server.x=state.server.x.toString('wordBase62')
          state.server.y=state.server.y.toString('wordBase62')
          console.log(state.server.x,bigInt('EN','wordBase62').toString('wordBase62'))
        }
      }
      if(state.room){
        if(typeof state.room.origin.x == 'object'){//DEV NOTE: because of inhertiance from other modules dont use instanceof when checking for bigInt
          state.room.origin.x=state.room.origin.x.toString('wordBase62')
          state.room.origin.y=state.room.origin.y.toString('wordBase62')
        }
      } 
      return state
    }

    exports.unpackState = function(state){
      if(state.server){
        console.log('unpacking',state.server.x,typeof state.server.x)
        if(state.server.x=='[Object object]'||state.server.y=='[Object object]'){
          console.log('error')
          throw 'NO'
        }else if(typeof state.server.x == 'string'){
          state.server.x=bigInt(state.server.x,'wordBase62')
          state.server.y=bigInt(state.server.y,'wordBase62')
        }
      }else{
        state.server={x:bigInt(0),y:bigInt(0)}
      }
      // if(state.origin){ //TODO should be room
      //   if(typeof state.origin.x == 'string'){
      //     state.origin.x=bigInt(state.origin.x,'wordBase62')
      //     state.origin.y=bigInt(state.origin.y,'wordBase62')
      //   }
      // }else{
      //   state.origin={x:bigInt(0),y:bigInt(0)}
      // }
      return state
    }



var avoidCharacters='$'
avoidCharacters+=String.fromCharCode(0)//addnull
var mustStartWith='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

var maxLength=120/8 //120 bytes or 15 characters
var number=99999999
var maxAscii=127
var string =''
while(number>=0){
  number=number/maxLength-1

  if(number>maxAscii){
    string+=String.fromCharCode(maxAscii)
  }else{
    string+=String.fromCharCode(Math.abs(number))
  }
}
//string now has your answer





var factorial=(function(){
  var f = [new bigInt(1), new bigInt(1)];
  var i = 2;
  return function factorial(n){
    if (typeof f[n] != 'undefined')
      return f[n];
    var result = f[i-1];
    for (; i <= n; i++)
        f[i] = result = result.multiply(i.toString());
    return result;
  }
})()

var permutation=exports=function(items, index, size,replacement) {
  if(typeof items=='string'){
    var temp = permutation.cache[items]
    items=(temp)?temp:(permutation.cache[items]=items.split(''))
  }
  if( replacement ){
    if(index> Math.pow(items.length,size)){
      throw 'Index out of range for permutation with replacement and number items'+items.length+' with n='+index+' and length ='+size;
    }
  }else{
    if(index > factorial(size) / (factorial(n-items.length)) ){
      throw 'Index out of range for permutation with number items'+items.length+' with n='+index+' and length ='+size
    }
  }
    var src = items.slice(), dest = [], item,target;
    for (var i = 0; i < size; i++) {
        item = index % src.length;
        index = Math.floor(index / src.length);
        if(replacement){
          target=src[item];
          dest.unshift(target);
        }else{
          target=src.splice(item, 1)[0]
          dest.push(target);
        }
    }
    return dest;
}
permutation.cache={}

//nthPermutation(' !"#%&\'()*+,-/0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'/*removed $*/,index,103,true)






})(typeof exports === 'undefined'? (this['graffinity']=this['graffinity']||{}): exports);




