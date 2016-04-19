/**
 * Module dependencies.
 */

var settings = require('./src/util/Settings.js'),
    tests = require('./src/util/tests.js'),
    draw = require('./src/util/draw.js'),
    projects = require('./src/util/projects.js'),
    db = require('./src/util/db.js'),
    express = require("express"),
    paper = require('paper'), //Remove paper from this server file
    socket = require('socket.io'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    https = require('https');
//paper.settings.applyMatrix = false;

/** 
 * SSL Logic and Server bindings
 */ 
if(settings.ssl){
  console.log("SSL Enabled");
  console.log("SSL Key File" + settings.ssl.key);
  console.log("SSL Cert Auth File" + settings.ssl.cert);

  var options = {
    key: fs.readFileSync(settings.ssl.key),
    cert: fs.readFileSync(settings.ssl.cert)
  };
  var app = express(options);
  var server = https.createServer(options, app).listen(settings.ip, settings.port);
}else{
  var app = express();
  var server = app.listen(settings.port);
}

/** 
 * Build Client Settings that we will send to the client
 */
var clientSettings = {
  "tool": settings.tool
}

// Config Express to server static files from /
// app.configure(function(){
//   app.use(express.static(__dirname + '/'));
// });

// Sessions
app.use(express.cookieParser());
app.use(express.session({secret: 'secret', key: 'express.sid'}));

// Development mode setting
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Production mode setting
app.configure('production', function(){
  app.use(express.errorHandler());
});


//http://graffinity.io/@username

// ROUTES

// Static files IE Javascript and CSS
app.use(require("connect-slashes")(false))
app.use("/static", express.static(__dirname + '/src/static'));
app.get('/', function(req, res){
  res.sendfile(__dirname + '/src/static/html/draw.html');//res.sendfile(__dirname + '/src/static/html/index.html');
});
app.all(["/admin"
        ,"/login"
        ,"/graffinity*"
        ,"/site"
        ,"/admins"
        ,'/logout'
        ,'/signup'
        ,'/about'],function(req,res,next){
  res.sendfile(__dirname+'/src/static/html/reserved.html')
})

// View users profile or allow a user to see their public/private works
app.get('/~:user/:canvas', function(req, res){
  var room = req.params.canvas
  console.log('canvas',room,' note: if it is prefixed with a dot it is private')
  res.sendfile(__dirname + '/src/static/html/draw.html');//res.sendfile(__dirname + '/src/static/html/index.html');
});

// Follow an active user
app.get('/@:names', function(req, res){
  var names=req.params.names.split(',')
  console.log(names)
  res.sendfile(__dirname + '/src/static/html/draw.html');//res.sendfile(__dirname + '/src/static/html/index.html');
});


// Follow an active user
app.get('//*', function(req, res){
  res.redirect(req.url.slice(0, 1) + "~" + req.url.slice(1));
});


// Index page
app.get('/:room?/:coords?/:args?', function(req, res){
  var coords=req.params.coords
  if(coords){
    coords=coords.split(',')
  }
  var args=req.params.args
  var room = req.params.room
  if(room &&room.indexOf(',')!=-1){
    res.redirect("/~" + req.url);
    return
  }

  console.log('room:',room,'coords:',coords,'args',args)
  res.sendfile(__dirname + '/src/static/html/draw.html');//res.sendfile(__dirname + '/src/static/html/index.html');
});




// // Drawings
// app.get('/d/*', function(req, res){
//   res.sendfile(__dirname + '/src/static/html/draw.html');
// });

// Front-end tests
app.get('/tests/frontend/specs_list.js', function(req, res){
  tests.specsList(function(tests){
    res.send("var specs_list = " + JSON.stringify(tests) + ";\n");
  });
});

// Used for front-end tests
app.get('/tests/frontend', function (req, res) {
  res.redirect('/tests/frontend/');
});





// LISTEN FOR REQUESTS
var io = socket.listen(server);
io.sockets.setMaxListeners(0);

console.log("Access Etherdraw at http://"+settings.ip+":"+settings.port);

// SOCKET IO
io.sockets.on('connection', function (socket) {
  socket.on('disconnect', function () {
    console.log("Socket disconnected");
    // TODO: We should have logic here to remove a drawing from memory as we did previously
  });

  // EVENT: User stops drawing something
  // Having room as a parameter is not good for secure rooms
  socket.on('draw:progress', function (room, uid, co_ordinates) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }

    //scrub the attributes object //removing segments
    var json = JSON.parse(co_ordinates)
    if(json.attributes){
      for(var i=0,l=json.attributes.length;i<l;i++){
        var segments= json.attributes[i].segments
        if(segments){ //currently only scrubbing the segments away
          //json.segments=segments 
          delete json.attributes[i].segments
        }
      }
    }

    io.in(room).emit('draw:progress', uid, JSON.stringify(json));
    draw.progressExternalPath(room, json, uid);
  });

  // EVENT: User stops drawing something
  // Having room as a parameter is not good for secure rooms
  socket.on('draw:end', function (room, uid, co_ordinates) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }
    
    //TODO here pathData should be populated on the root of the json object
    //TODO need to update boundry
    //TODO make sure the input is sane
    io.in(room).emit('draw:end', uid, co_ordinates);
    draw.endExternalPath(room, JSON.parse(co_ordinates), uid);
  });

  // User joins a room
  socket.on('subscribe', function(data) {
    subscribe(socket, data);
  });

  // User clears canvas
  socket.on('canvas:clear', function(room) {
    if (!projects.projects[room] || !projects.projects[room].project) {
      loadError(socket);
      return;
    }
    draw.clearCanvas(room);
    io.in(room).emit('canvas:clear');
  });

  // User removes an item
  socket.on('item:remove', function(room, uid, itemName) {
    draw.removeItem(room, uid, itemName);
    io.sockets.in(room).emit('item:remove', uid, itemName);
  });

  // User moves one or more items on their canvas - progress
  socket.on('item:move:progress', function(room, uid, itemNames, delta) {
    draw.moveItemsProgress(room, uid, itemNames, delta);
    if (itemNames) {
      io.sockets.in(room).emit('item:move', uid, itemNames, delta);
    }
  });

  // User moves one or more items on their canvas - end
  socket.on('item:move:end', function(room, uid, itemNames, delta) {
    draw.moveItemsEnd(room, uid, itemNames, delta);
    if (itemNames) {
      io.sockets.in(room).emit('item:move', uid, itemNames, delta);
    }
  });

  // User adds a raster image
  socket.on('image:add', function(room, uid, data, position, name) {
    draw.addImage(room, uid, data, position, name);
    io.sockets.in(room).emit('image:add', uid, data, position, name);
  });

});

// Subscribe a client to a room
function subscribe(socket, data) {
  var room = data.room;

  // Subscribe the client to the room
  socket.join(room);

  // If the close timer is set, cancel it
  // if (closeTimer[room]) {
  //  clearTimeout(closeTimer[room]);
  // }

  // Create Paperjs instance for this room if it doesn't exist
  var project = projects.projects[room];
  if (!project) {
    console.log("made room");
    projects.projects[room] = {};
    // Use the view from the default project. This project is the default
    // one created when paper is instantiated. Nothing is ever written to
    // this project as each room has its own project. We share the View
    // object but that just helps it "draw" stuff to the invisible server
    // canvas.
    project = new paper.Project();
    //project.activeLayer.applyMatrix=false;
    projects.projects[room].project = project

    projects.projects[room].external_paths = {};
    db.load(room, socket);
  } else { // Project exists in memory, no need to load from database
    loadFromMemory(room, socket);
  }

  // Broadcast to room the new user count -- currently broken
  var rooms = socket.adapter.rooms[room]; 
  var roomUserCount = Object.keys(rooms).length;
  io.to(room).emit('user:connect', roomUserCount);
}

// Send current project to new client
function loadFromMemory(room, socket) {
  var project = projects.projects[room].project;
  if (!project) { // Additional backup check, just in case
    db.load(room, socket);
    return;
  }
  socket.emit('loading:start');
  var value = project.exportJSON();
  socket.emit('project:load', {project: value});
  socket.emit('settings', clientSettings);
  socket.emit('loading:end');
}

function loadError(socket) {
  socket.emit('project:load:error');
}

