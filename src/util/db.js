var settings = require('./Settings.js'),
    projects = require('./projects.js'),
     ueberDB = require('ueberDB'),
     graffinity=require('../static/js/graffinity.js');

// Database connection
var db = new ueberDB.database(settings.dbType, settings.dbSettings);

// Init..
db.init(function(err){
  if(err){
    console.error(err);
  }
});

// Write to teh database
exports.storeProject = function(room) {
  var project = projects.projects[room].project;
  var json = project.exportJSON();
  console.log("Writing project to database");
  db.set(room, {project: json});
}

// Try to load room from database
exports.load = function(socket,state,callback) {
  var roomName = state.room.name
  var project = (projects.projects[roomName] && projects.projects[roomName].project)
  if (project) {
    db.get(roomName, function(err, value) {
      //console.log('err,value',err,value)
      if (value && project && project.activeLayer) {
        // Clear default layer as importing JSON adds a new layer.
        // We want the project to always only have one layer.
        project.activeLayer.remove();
        project.importJSON(value.project);
        console.log('sending project from database')
      }
      callback(project,graffinity.packState(state))
    });
  } else {
    loadError(socket);
  }
}

exports.db = db;
