//paper.settings.applyMatrix = false; 
tool.minDistance = 10;
tool.maxDistance = 45;
//paper.settings.applyMatrix=false
console.log('@settings@',settings)
var odd=true
var debug=true
var debugStrokeColor=new Color(1,0,1,1)
var debugFillColor=new Color(1,0,1,.3)

var preferences = {
  longClick:300
  ,mouseButtonMap:['primary','middle','secondary','back','forward']
}


var hudProject;


var room,coords;
page('/:room?/:coords?/:args?', function(context){
  room = context.params.room;
  if(!room){
    room='~'
  }
  coords=context.params.coords
  if(coords){
    coords=coords.split(',').map(Number);
  }
});
page()

//see christoph answer http://stackoverflow.com/questions/661562/how-to-format-a-float-in-javascript
var fixedPrecision = Math.pow(10, 3 || 0); //3 is decimal length
var setCoordsInURL= function(roomName,X,Y,zoom){
  //set everything if needed
  roomName=roomName||room
  X= view.center.x= Math.round(X||view.center.x||0)
  Y= view.center.y= Math.round(Y||view.center.y||0)
  zoom = view.zoom= Math.round((zoom||view.zoom)* fixedPrecision) / fixedPrecision //this sets precision without using a string

  if(zoom!=1){
    page.redirect('/'+roomName+'/'+X+','+Y+','+zoom)
  }else if(X||Y){
    page.redirect('/'+roomName+'/'+X+','+Y)
  }
  
}
var setCoordsInURLDebounced=_.debounce(setCoordsInURL,150)





function simplePoly(original,options){ //DEV NOTE: Options.simplify isn't suggested to be used
  if(!original){
    return original
  }
  var clone=original.clone(false)
  var complexPath=clone.unite()

  var layer=project.activeLayer
  if(!complexPath.children || !complexPath.children.length){
    layer.addChild(original)
    return original
  }

  options=options||{}
  //set options
  if(options.simplify===true){
    options.simplify=2.5
  }


  complexPath.fillColor="green"
  var db={}
  var paths = []
  console.log('conplexPath',complexPath)

  //Switch layers
  var tmpLayer=new paper.Layer()
  tmpLayer.name='debug:simplePoly'
  tmpLayer.visible=debug
  tmpLayer.activate()


  _.forEach(complexPath.children,function(path,iPath){ 
    path=new Path(path.segments)
    //path.strokeColor = 'green';
    path.fillColor='blue'
    path.closed=true
    options.simplify && path.simplify(options.simplify)
    paths.push(path)
  })
  console.log('paths',paths)
  clone.segments=paths.shift().segments
  var outside=clone
  outside.fillColor='red'
  
  paths=_.sortBy(paths,'area')
   paths=_.remove(paths, function(o) {
     return o.area<0
   })
  

  _.forEach(paths,function(path,iPath){
    //if(!original.hitTest(path.interiorPoint,{ fill: true, stroke: true, segments: true, tolerance: 0 })){
    //if(!original.intersects(path)){
    if(!original.contains(path.interiorPoint)){
      var tmp=outside.subtract(path) //this could return null... if it does then I dont want to lose the shape we have so far
      if(tmp){
        outside=tmp
      }
    }

    // _.forEach(path.segments,function(segment,iSegment){
    //   var point = segment.point
    //       var label = point.x+','+point.y
    //       var exists= db[label]
    //       if(!exists){
    //         db[label]=point
    //         return
    //       }
    //       console.log('exists')
    //       if(point===exists){
    //         console.log('DAE SAME!')
    //       }
    // })
  })
  //console.info(db)
  if(original.area!=outside.area){
    console.info('simplePoly= Original:'+original.area+' Outside:'+outside.area)
  }
  outside.fillColor=original.fillColor
  layer.activate()
  layer.addChild(outside)
  tmpLayer.remove()

  if(options.replace){
    outside.name=original.name
    original.remove()
  }

  return outside
}

var GraffinityPointer=function(){
    this.group = new Group();
    this.group.visible=false
    var circle = new Path.Circle({
        center: new Point(10,10),
        radius: 10,
        fillColor: '#b9b9ff'
    });
    var triangle = new Path.RegularPolygon(new Point(9, 20), 3, 11);
    triangle.fillColor = '#b9b9ff';
    triangle.rotate(90)

    // var p = triangle.lastSegment.point//.bottomRight
    //  var c = new Path.Circle({
    //     center: p,
    //     radius: 2,
    //     fillColor: 'red'
    // });

    this.group.addChildren(Array.prototype.concat(circle,triangle))
    //p=this.group.parentToLocal(p)
    //console.log('ee',circle,triangle,this.group,'sssss')

    //this.group.bounds.selected=true
    console.log('position',this.getPosition())
    //this.group.pivot=this.getPosition()
    this.group.position=view.center

}
GraffinityPointer.prototype.constructor=GraffinityPointer
GraffinityPointer.prototype.hide=function(){
  this.active = this.group.visible=false

  return this
}
GraffinityPointer.prototype.show=function(event){
  this.active = this.group.visible=true
  if(event){
    this.pointTo(event)
  }
  return this
}
GraffinityPointer.prototype.pointTo=function(event){
  console.log('ggg',console.dir(event))
  var point;
  if(event){
    point =((event.point)?event.point:event)
  }

  this.group.position=point;
  this.group.visible=true
}
GraffinityPointer.prototype.getPosition=function(){
  return this.group.position
}


function midPoint(p1,p2){

  var p = p1+((p2-p1)/2)

  console.log('@@@@@',p.x,p.y)
  console.dir(p)
  if(debug){
    new Path.Circle({
        center: p,
        radius: 5,
        fillColor: 'blue'
    });
  }
  return p
}

var RadialMenu=function(collection){
 this.point=view.center

    this.group = new Group();
    this.group.visible=false

  var reference=0

//Create Each segment
// function createSegment(point,fillColor){
//     //Segment One
//     var start = new Point(point.x, point.y-130);
//     var through = new Point(point.x-90, point.y-94);
//     var to = new Point(point.x-113, point.y-64);
//     var name = Path.Arc(start, through, to);

//     name.add(new Point(point.x, point.y));
//     name.closed=true//name.add(new Point(point.x, point.y-130));
//     name.fillColor = fillColor;
//     return name;
// }

    //var path = new Path()

    var spread=15;
    var center = new Path.Circle({
        center: reference,
        radius: 55,
        fillColor: 'blue'
    });
    var menuArea = new Path.Circle({
        center: reference,
        radius:120,
        fillColor: new Color(0,0,1,.5)
    });


    var itemNumber=3
    var items=[]
    for(var i=0;i<itemNumber;i++){
      var item= new Path.Circle({
        center: reference,
        radius: 15,
        fillColor: 'black' //new Color(0,.5,1)
      });
      items.push(item)
    }


  // var point1 = new Point(150, 150);
  // var point2 = new Point(250, 150);
  // path.add(point1);
  // path.add(point2);

  // var handle1 = new Path.Circle({
  //   center    : center.position+new Point(50,0),
  //   radius    : 7,
  //   fillColor : 'green'
  // });

  // var handle2 = new Path.Circle({
  //   center    : center.position-new Point(50, 0),
  //   radius    : 7,
  //   fillColor : 'blue'
  // });



// arcTwo.rotate(-60, view.center);
// arcThree.rotate(-120, view.center);
// arcFour.rotate(60, view.center);
// arcFive.rotate(120, view.center);
// arcSix.rotate(180, view.center);

// var angle=0;angle<Math.PI*2;angle+=(Math.PI*2)/10){
//     var dx = Math.cos(angle)*fuzzyRadius;
//     var dy = Math.sin(angle)*fuzzyRadius;
//     ctx.beginPath();
//       ctx.arc(Mouse.x+dx, Mouse.y+dy, 2, 0, 2*Math.PI, false);
//       ctx.fill();




var archs = []
for(var i = 0,k=1, l = items.length; i < l; i++,k+=2) {

  //calculate left
  var x= ((spread*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4))*2
  //calculate top
  var y= ((spread*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) )*2
  items[i].position=center.position+new Point(x,y)

    var start = center.position.add(new Point(((spread*Math.cos(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4))*6,((spread*Math.sin(-0.5 * Math.PI - 2*(1/l)*i*Math.PI)).toFixed(4) )*6))
    //Segment One
    var through = center.position.add(new Point(((spread*Math.cos(-0.5 * Math.PI - 2*(1/(l*2))*(k)*Math.PI)).toFixed(4))*6,((spread*Math.sin(-0.5 * Math.PI - 2*(1/(l*2))*(k)*Math.PI)).toFixed(4) )*6))
    var to = center.position.add(new Point(((spread*Math.cos(-0.5 * Math.PI - 2*(1/l)*(i+1)*Math.PI)).toFixed(4))*6,((spread*Math.sin(-0.5 * Math.PI - 2*(1/l)*(i+1)*Math.PI)).toFixed(4) )*6))

    var name = Path.Arc(start, through, to);
    name.add(new Point(center.position.x, center.position.y));
    name.closed=true//name.add(new Point(point.x, point.y-130));
    name.fillColor = 'black';
    archs.push(name)

}

  

  this.group.removeChildren()
  this.group.addChildren(Array.prototype.concat(menuArea, archs, center, items))
  this.group.pivot = this.group.position;
  this.group.position=this.point



    // When the mouse enters the item, set its fill color to red:
    this.group.attach('mouseenter', function(event) {
        event.target.fillColor = 'blue';
    });

    //path.onMouseEnter(shiftPath);
    var timer;
    // When the mouse leaves the item, set its fill color to black
    // and remove the mover function:
    var group=this.group
    this.group.attach('mouseleave',function(event) {
        event.target.fillColor = 'black';
        clearTimeout(timer)

        setTimeout(function(){
          if(!group.contains(lastMousePosition.point)){
            group.visible=false
            view.draw() //this one is nessisary
          }
        },700)
      //  path.detach('mouseenter', shiftPath);
    });


  // handle1.onMouseDrag = function(event) {
  //   this.group.position = this.group.position.subtract(handle1.position).add(event.point);
  //     this.group.pivot = event.point;
  // };

  // handle2.onMouseDrag = function(event) {
  //    this.group.rotate(event.point.subtract(handle1.position).angle - (handle2.position.subtract(handle1.position)).angle);
  // };





// var arc = {
//     fill: '#333',
//     stroke: '#333',
//     path: 'M53.286,44.333L69.081,7.904C48.084-1.199,23.615-2.294,0.648,6.78l14.59,36.928C28.008,38.662,41.612,39.27,53.286,44.333z'
// };

// var paper = Raphael(document.getElementById("notepad"), 500, 500);

// var arcDegrees = 45;
// var centerX = 210;
// var centerY = 210;
// var compassRadius = 68;
// var currentlyActive = 45;
// var directions = [
//     {label:'N', degrees:0, rotatedDegrees:270}, 
//     {label:'NE', degrees:45, rotatedDegrees:315}, 
//     {label:'E', degrees:90, rotatedDegrees:0}, 
//     {label:'SE', degrees:135, rotatedDegrees:45}, 
//     {label:'S', degrees:180, rotatedDegrees:90}, 
//     {label:'SW', degrees:225, rotatedDegrees:135}, 
//     {label:'W', degrees:270, rotatedDegrees:180}, 
//     {label:'NW', degrees:315, rotatedDegrees:225}
// ];

// function arcClicked()
// {
//     var label = $(this).data('direction-label');
//     $("#activeArc").attr('id', null);
//     $(this).attr('id', 'activeArc');
// }

// for (i = 0; i < 360; i += arcDegrees) {
//     var direction = _.find(directions, function(d) { return d.rotatedDegrees == i; });
//     var radians = i * (Math.PI / 180);
//     var x = centerX + Math.cos(radians) * compassRadius;
//     var y = centerY + Math.sin(radians) * compassRadius;
        
//     var newArc = paper.path(arc.path);
//     // newArc.translate(x, y);
//     // newArc.rotate(i + 89);
//     newArc.transform('T' + x + ',' + y + 'r' + (i + 89));
    
//     if (direction.degrees == currentlyActive) {
//         $(newArc.node).attr('id', 'activeArc');
//     }
        
//     $(newArc.node)
//         .attr('class', 'arc')
//         .data('direction-label', direction.label)
//         .on('click', arcClicked);
// }
}
RadialMenu.prototype.constructor=RadialMenu
RadialMenu.prototype.update=function(){alert()}
RadialMenu.prototype.hide=function(){
  this.group.visible=false
}
RadialMenu.prototype.show=function(event){
  if(!event){
    this.point=project.view.center
  }else{
    this.point =((event.point)?event.point:event)
  }
  this.group.position=this.point;
  this.group.visible=true
}
RadialMenu.prototype.toggle=function(){
  if(this.group.visible){
    this.hide()
  }else{
    this.show()
  }
}



function pickColor(color) {
  $('#color').val(color);
  var rgb = hexToRgb(color);
  $('#activeColorSwatch').css('background-color', 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')');
  update_active_color();
}

/**
 * Position picker next to cursor in the bounds of the canvas container
 *
 * @param cursor {Point} Cursor position relative to the page
 */
function positionPickerInCanvas(cursor) {
  var picker = $('#mycolorpicker');
  
  // Determine best place for color picker so it isn't off the screen
  var pickerSize = new Point(picker.width(), picker.height());
  var windowSize = new Point($(window).width(), $(window).height());
  var spacer = new Point(10, 0);

  var brSpace = windowSize - spacer - cursor;
  var tlSpace = cursor - spacer;

  var newPos = new Point();

  // Choose sides based on page size
  if (tlSpace.x > pickerSize.x) {
    // Plus a magic number...?
    newPos.x = cursor.x - (pickerSize.x + 20 + spacer.x);
  } else if (brSpace.x > pickerSize.x) {
    newPos.x = cursor.x + spacer.x;
  }
  
  // Get the canvasContainer's position so we can make sure the picker
  // doesn't go outside of the canvasContainer (to keep it pretty)
  var minY = 10;
  // Buffer so we don't get too close to the bottom cause scroll bars
  var bBuffer = Math.max(50, (windowSize.y - ($('#canvasContainer').position().top 
      + $('#canvasContainer').height())) + 70);

  // Favour having the picker in the middle of the cursor
  if (tlSpace.y > ((pickerSize.y / 2) + minY) && brSpace.y > ((pickerSize.y / 2) + bBuffer)) {
    newPos.y = cursor.y - (pickerSize.y / 2);
  } else if (tlSpace.y < ((pickerSize.y / 2) + minY) && brSpace.y > (tlSpace.y - (pickerSize.y + minY))) {
    newPos.y = minY;
  } else if (brSpace.y < ((pickerSize.y / 2) + bBuffer) && tlSpace.y > (brSpace.y - (pickerSize.y + bBuffer))) {
    newPos.y = windowSize.y - (pickerSize.y + bBuffer);
  }
  
  $('#mycolorpicker').css({
    "left": newPos.x,
    "top": newPos.y
  }); // make it in the smae position
}

/*http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb*/
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


//  var __hasProp = {}.hasOwnProperty,
//     __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

//    var SimplePanAndZoom, StableZoom, drawGrid, example1, example2, _ref;
//     SimplePanAndZoom = (function() {
//       function SimplePanAndZoom() {}

//       SimplePanAndZoom.prototype.changeZoom = function(oldZoom, delta) {
//         var factor;
//         factor = 1.05;
//         if (delta < 0) {
//           return oldZoom * factor;
//         }
//         if (delta > 0) {
//           return oldZoom / factor;
//         }
//         return oldZoom;
//       };

//       SimplePanAndZoom.prototype.changeCenter = function(oldCenter, deltaX, deltaY, factor) {
//         var offset;
//         offset = new paper.Point(deltaX, -deltaY);
//         offset = offset.multiply(factor);
//         return oldCenter.add(offset);
//       };

//       return SimplePanAndZoom;

//     })();


//       StableZoom = (function(_super) {
//       __extends(StableZoom, _super);

//       function StableZoom() {
//         _ref = StableZoom.__super__.constructor.apply(this, arguments);
//         return _ref;
//       }

//       StableZoom.prototype.changeZoom = function(oldZoom, delta, c, p) {
//         var a, beta, newZoom, pc;
//         newZoom = StableZoom.__super__.changeZoom.call(this, oldZoom, delta);
//         beta = oldZoom / newZoom;
//         pc = p.subtract(c);
//         a = p.subtract(pc.multiply(beta)).subtract(c);
//         return [newZoom, a];
//       };

//       return StableZoom;

//     })(SimplePanAndZoom);
// var  panAndZoom = new StableZoom();

var ViewZoom = (function () { //https://gist.github.com/ryascl/4c1fd9e2d5d0030ba429
    function ViewZoom(project,ignoreLayers) {
        this.factor = 1.06;
        this.joystickDrivePan=false
        this.dragPan=false
        this.inverseMousewheel={x:false,y:false}


        if(ignoreLayers){
          this.ignoreLayers=(Array.isArray(ignoreLayers))?ignoreLayers:[ignoreLayers];
          this.layerScale=1
          this.ignoreLayerIDs={}
          for(var i=0,l=ignoreLayers.length;i<l;i++){
            this.ignoreLayerIDs[this.ignoreLayers[i].id]=true
            this.ignoreLayers.transformContent=false
          }
        }

        var project=this.project=project
        var view = this.project.view;

        var lastWheelPosition;

        $(document).mousewheel(_.bind(function (event) {
            var mousePosition = new paper.Point(event.offsetX, event.offsetY);
            var deltaY = event.originalEvent.deltaY
            var deltaX = event.originalEvent.deltaX
            event.preventDefault()
            if(this.inverseMousewheel.x){
              deltaX=-deltaX
            }
            if(this.inverseMousewheel.y){
              deltaY=-deltaY
            }
            if(event.shiftKey){
              if(Math.abs(deltaY)>Math.abs(deltaX)){
                this.changeZoomCentered(deltaY, mousePosition);
              }else{
                //this.changeZoomCentered(deltaY, mousePosition,.1);
              }
              return
            }
            this.pan(deltaX,deltaY,event.deltaFactor)


        },this));
        view.on("mousedown", _.bind(function (ev) {
            if(!this.joystickDrivePan){
              return
            }
            this.viewCenterStart = view.center;
            // Have to use native mouse offset, because ev.delta 
            //  changes as the view is scrolled.
            this.mouseNativeStart = new paper.Point(ev.event.offsetX, ev.event.offsetY);
        },this));
        view.on("mousedrag", _.bind(function (ev) {
            if(!this.joystickDrivePan){
              return
            }
            if (this.viewCenterStart) {
                var nativeDelta = new paper.Point(ev.event.offsetX - this.mouseNativeStart.x, ev.event.offsetY - this.mouseNativeStart.y);
                // Move into view coordinates to subract delta,
                //  then back into project coords.
                view.center = view.viewToProject(this.viewCenterStart)
                    .subtract(nativeDelta);
            }
        },this));
        view.on("mouseup", _.bind(function (ev) {
          if(!this.joystickDrivePan){
              return
            }
            if (this.mouseNativeStart) {
                this.mouseNativeStart = null;
                this.viewCenterStart = null;
            }
        },this));

var mc = new Hammer.Manager(view.element);

// create a pinch and rotate recognizer
// these require 2 pointers
var pinch = new Hammer.Pinch({pointers:3});
var pan = new Hammer.Pan({pointers:2});

// we want to detect both the same time
//pinch.recognizeWith(rotate);

// add to the Manager
mc.add([pinch,pan]);

var adjustScale = 1;
var adjustDeltaX = 0;
var adjustDeltaY = 0;

var currentScale = null;
var currentDeltaX = null;
var currentDeltaY = null;

// // Prevent long press saving on mobiles.
// $(document).addEventListener('touchstart', function (e) {
//     e.preventDefault()
// });

// Handles pinch and pan events/transforming at the same time;
mc.on("pinch pan", _.bind(function (event) {

    var transforms = [];

    // Adjusting the current pinch/pan event properties using the previous ones set when they finished touching
    currentScale = adjustScale * event.scale;
    currentDeltaX = adjustDeltaX + (event.deltaX / currentScale);
    currentDeltaY = adjustDeltaY + (event.deltaY / currentScale);



    var x=event.offsetX||event.center.x||view.center.x
    var y=event.offsetY||event.center.y||view.center.y
    var mousePosition = new paper.Point(x, y);
    currentScale=currentScale-1
    //this.changeZoomCentered(currentScale,mousePosition)
    //alert(currentScale)
    this.pan(currentDeltaX,currentDeltaY)
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    event.gesture.stopPropagation()
    event.gesture.preventDefault()
    // Concatinating and applying parameters.
    //transforms.push('scale({0})'.format(currentScale));
    //transforms.push('translate({0}px,{1}px)'.format(currentDeltaX, currentDeltaY));
    //webpage.style.transform = transforms.join(' ');

},this));


mc.on("panend pinchend", _.bind(function (event) {

    // Saving the final transforms for adjustment next time the user interacts.
    adjustScale = currentScale;
    adjustDeltaX = currentDeltaX;
    adjustDeltaY = currentDeltaY;
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    event.gesture.stopPropagation()
    event.gesture.preventDefault()
},this));





        this.setZoomRange([0.001,Number.MAX_VALUE-1])
    }
    Object.defineProperty(ViewZoom.prototype, "zoom", {
        get: function () {
            return this.layerScale||this.project.view.zoom;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewZoom.prototype, "zoomRange", {
        get: function () {
            return [this._minZoom, this._maxZoom];
        },
        enumerable: true,
        configurable: true
    });

    ViewZoom.prototype.pan= function(deltaX, deltaY, factor) {

        var offset;
        if(deltaX.className=='Point'){
          offset=deltaX
          factor=deltaY
          deltaX=offset.x
          deltaY=offset.y
        }else{
          offset = new paper.Point(deltaX, deltaY);
        }
        if(factor){
          offset = offset.multiply(factor);
        }
        offset=offset*(1/ (this.layerScale||view.zoom)) //inverse proportion to zoom level (makes zooming out pan faster)
        var newPoint= this.panTo(view.center.add(offset))
        if(!newPoint){ //if we didn't move then show the old position
          return view.center
        }
        return newPoint
      };

    ViewZoom.prototype.panTo= function(X, Y) {
        var point
        if(X.className=='Point'){
          point=X
          X=point.x
          Y=point.y
        }else{
          point = new paper.Point(X, Y);
        }
        //TODO if x or y is greater than 1000000 force refresh
        if(!debug && point.x>1000000 || point.y>1000000 || point.x<-1000000 || point.y<-1000000){
          setCoordsInURLDebounced.cancel && setCoordsInURLDebounced.cancel()
          setCoordsInURL(room,X,Y)

          //TODO reinitialize everything properly
          location.reload()
          return 
        }
        setCoordsInURLDebounced(room,X,Y)
        view.center = point;
        return view.center
      };



    /**
     * Set zoom level.
     * @returns zoom level that was set, or null if it was not changed
     */
    ViewZoom.prototype.setZoomConstrained = function (zoom,point) {
        if (this._minZoom) {
            zoom = Math.max(zoom, this._minZoom);
        }
        if (this._maxZoom) {
            zoom = Math.min(zoom, this._maxZoom);
        }
        var view = this.project.view;
        if (zoom != (this.layerScale||view.zoom) ){
            if(this.ignoreLayers){
              for(var i=0,l=this.project.layers.length;i<l;i++){
                var layer = this.project.layers[i]
                if(!this.ignoreLayerIDs[layer.id]){ //TODO use id to search (could be sped up to use a hash table)
                  this.project.layers[i].scale(zoom,point)
                }
              }
              //this.layerScale=zoom
            }else{
              view.zoom = zoom;
              setCoordsInURLDebounced()
            }
            return zoom;
        }
        return null;
    };
    ViewZoom.prototype.setZoomRange = function (range) {
        var view = this.project.view;
        var aSize = range.shift();
        var bSize = range.shift();
        var a,b;
        if(typeof aSize=='number'&& typeof bSize=='number'){ 
          a=aSize;
          b=bSize;
        }else{
         //this was the orignal intent. seems to accept boxes? idk why
          a = aSize && Math.min(view.bounds.height / aSize.height, view.bounds.width / aSize.width);
          b = bSize && Math.min(view.bounds.height / bSize.height, view.bounds.width / bSize.width);
        }
        var min = Math.min(a, b);
        if (min) {
            this._minZoom = min;
        }
        var max = Math.max(a, b);
        if (max) {
            this._maxZoom = max;
        }
        return [this._minZoom, this._maxZoom];
    };
    ViewZoom.prototype.changeZoomCentered= function (delta, mousePos,factor) {
        if (!delta) {
            return;
        }
        var view = this.project.view;
        var oldZoom = this.layerScale||view.zoom;
        var oldCenter = view.center;
        var viewPos = view.viewToProject(mousePos);
        var newZoom = delta > 0
            ? (this.layerScale||view.zoom) * (factor||this.factor)
            :(this.layerScale||view.zoom) / (factor||this.factor);
        newZoom = this.setZoomConstrained(newZoom,mousePos);

        if (!newZoom) {
            return;
        }
        var zoomScale = oldZoom / newZoom;
        var centerAdjust = viewPos.subtract(oldCenter);
        var offset = viewPos.subtract(centerAdjust.multiply(zoomScale))
            .subtract(oldCenter);

        if(this.ignoreLayers){

        }else{
          view.center = view.center.add(offset);
        }
    };
    ;
    ViewZoom.prototype.zoomTo = function (rect) {
        if(!(rect instanceof Rectangle)){
          //new paper.Rectangle(new paper.Point(50, 50), new paper.Point(150, 100));
        }
        if(this.layerScale){

        }else{
          var view = this.project.view;
          view.center = rect.center;
          view.zoom = Math.min(view.viewSize.height / rect.height, view.viewSize.width / rect.width);
        }
    };
    return ViewZoom;
}());

var canvas,mainProject;
$(document).ready(function() {
  var drawurl = window.location.href.split("?")[0]; // get the drawing url
  $('#embedinput').val("<iframe name='embed_readwrite' src='" + drawurl + "?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=400></iframe>"); // write it to the embed input
  $('#linkinput').val(drawurl); // and the share/link input
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the drawtool css to show it as active


  canvas=$('#myCanvas')
  mainProject=paper.project
  mainProject.activate()
  // canvas.bind('mousewheel DOMMouseScroll', function(event) {
  //   // // var point = paper.DomEvent.getOffset(event, $('#canvas')[0]);
  //   // // //With this I can then convert to project space using view.viewToProject():
  //   // // point = paper.view.viewToProject(point);
  //   // // var delta = event.detail||event.wheelDelta
  //   // // scrolled(point, -event.wheelDelta);

  //   //     var mousePosition, newZoom, offset, viewPosition, _ref1;
  //   //     if (event.shiftKey) {
  //   //       view.center = panAndZoom.changeCenter(view.center, event.deltaX, event.deltaY, event.deltaFactor);
  //   //       return event.preventDefault();
  //   //     } else if (event.altKey) {
  //   //       mousePosition = new paper.Point(event.offsetX, event.offsetY);
  //   //       viewPosition = view.viewToProject(mousePosition);
  //   //       _ref1 = panAndZoom.changeZoom(view.zoom, event.deltaY, view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
  //   //       view.zoom = newZoom;
  //   //       view.center = view.center.add(offset);
  //   //       event.preventDefault();
  //   //       return view.draw();
  //   //     }







  // });

  // var drawingPNG = localStorage.getItem("drawingPNG"+room)

  // // Temporarily set background as image from memory to improve UX
  // $('#canvasContainer').css("background-image", 'url(' + drawingPNG + ')');

}).on( "contextmenu", function(event){event.preventDefault();return false} );

function scrolled(point, delta) {
  // Far too buggy for now
  console.log("Scrolling");
  // var pt = new Point(x, y),
  // scale = 1;
  // if(delta < 0) {
  //   scale *= scaleFactor;
  // } else if(delta > 0) {
  //   scale /= scaleFactor;
  // }
  // //view.scale(scale, pt);
  // $('#myCanvas').
  view.zoom=view.zoom+delta

  view.draw();
}


$('#activeColorSwatch').css('background-color', $('.colorSwatch.active').css('background-color'));

// Initialise Socket.io
var socket = io.connect('/');

// Random User ID
// Used when sending data
var uid = (function() {
  var S4 = function() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}());

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if (results == null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

// Join the room
socket.emit('subscribe', {
  room: room
});

// JSON data ofthe users current drawing
// Is sent to the user
var path_to_send = {};
var PathToSend=function(){

}
PathToSend.prototype.constructor=PathToSend
PathToSend.prototype.start=function(object){
}
PathToSend.prototype.extend=function(object){
}
PathToSend.prototype.end=function(object){
}
// Calculates colors
var active_color;
//var active_color_json = {};
var $opacity = $('#opacityRangeVal');
var update_active_color = function() {
  var rgb_array = $('#activeColorSwatch').css('background-color');
  $('#editbar').css("border-bottom", "solid 2px " + rgb_array);

  while (rgb_array.indexOf(" ") > -1) {
    rgb_array = rgb_array.replace(" ", "");
  }
  rgb_array = rgb_array.substr(4, rgb_array.length - 5);
  rgb_array = rgb_array.split(',');
  var red = rgb_array[0] / 255;
  var green = rgb_array[1] / 255;
  var blue = rgb_array[2] / 255;
  var opacity = $opacity.val() / 255;

  active_color = new Color(red, green, blue, opacity);
  // active_color_json = {
  //   "red": red || 0,
  //   "green": green,
  //   "blue": blue,
  //   "opacity": opacity
  // };

};
window.testGlobs=[]
// Get the active color from the UI eleements
var authorColor = getParameterByName('authorColor');
var authorColors = {};
if (authorColor != "" && authorColor.substr(0, 4) == "rgb(") {
  authorColor = authorColor.substr(4, authorColor.indexOf(")") - 4);
  authorColors = authorColor.split(",");
  $('#activeColorSwatch').css('background-color', 'rgb(' + authorColors[0] + ',' + authorColors[1] + ',' + authorColors[2] + ')');
}
update_active_color();



$('#colorToggle').on('click', function() {
  if ($('#mycolorpicker').toggle().is(':visible')) {
    positionPickerInCanvas(new Point(event.pageX, event.pageY));
  }
});

  $('#clearCanvas').click(function(){
    clearCanvas();
    socket.emit('canvas:clear', room);
    $('#clearCanvasPopup').fadeToggle()
  })
$('#clearImage').click(function() {
  $('#clearCanvasPopup').fadeToggle()
});

$('.toggleBackground').click(function() {
  canvas.toggleClass('whiteBG');
});

// --------------------------------- 
// DRAWING EVENTS


var send_paths_timer;
var paper_object_count = 0;
var mouseClickHeld; // global timer for if mouse is held.


/*ktsuttle code*/

var LineEditor = function(){
  this.name='lineEditor'
  var handle;
  
  var movementType=null

  this.onMouseDown=function(event) {
    handle = null;
    // Do a hit test on path for handles:
    var hitResult = project.hitTest(event.point,{
    fill:true,
    stroke: true, 
    segments:true,
    curves:false,
    handles:true,
    ends:true,
    bounds:false,
    center:false,
    guides:false,
    selected:true,
    tolerance: 5 })
    console.log(hitResult)
    if (hitResult) {
      switch(hitResult.type){
        case 'handle-in':
          handle=hitResult.segment.handleIn
          movementType='delta'
          break
        case 'handle-out':
          handle=hitResult.segment.handleOut
          movementType='delta'
          break
        case 'bounds':
          movementType='set'
          handle=hitResult
          break
        case 'segment':
          handle=hitResult.segment.point
          movementType='delta'
          break
        default:
          console.warn('can not handle hit type '+hitResult.type)
      }
    }
  }

  this.onMouseDrag = function(event) {
    // If we hit a handle before, move it:
    if (handle) {
      if(movementType=='delta'){
        handle.x += event.delta.x;
        handle.y += event.delta.y;
      }else{
        handle.point=event.point
      }
    }
  }

}



var Pencil=function(kwargs){
  _.forEach(kwargs,function(k,v){
    this[k]=v
  })
}
Pencil.prototype.name='pencil'
Pencil.prototype.constructor=Pencil;
Pencil.prototype.poll=function(data){
      var st = JSON.stringify(data)
      data.path= new Array();
      return st
    }
Pencil.prototype.onMouseDown=function(event){

      // Create a new path and select it:
      path = new Path();
      
      path.strokeColor = active_color;
      path.strokeWidth = 2;

      // Add a segment to the path where
      // you clicked:

      path.add(event.point);
      path.name = uid + ":" + (++paper_object_count);


        // The data we will send every 100ms on mouse drag
        path_to_send = {
          name: path.name,
          start: view.projectToView(path.lastSegment.point),
          path: [],
          pathData:path.pathData,
          tool: brush.name
        };
      }
Pencil.prototype.onMouseDrag=function(event){ //TODO this creates 2 paths that are parallel and then closes them. idk why this archatecture was used but change it in the future please
      var top,bottom;
      var step = event.delta / 2;
      step.angle += 90;

      if(event.modifiers.shift) {
        // If the 'a' key is down, change the point of
        // the last segment to the position of the mouse:
        if(path.length<=1){
          path.add(event.point)
        }
        path.lastSegment.point = event.point;
        return
      } 

      if(this.outline){

        top = event.middlePoint
        bottom = event.middlePoint;


        path.add(top);
        path.insert(0, bottom);
        this.smoothing &&path.smooth();



      }else{
            // Every drag event, add a segment
            // to the path at the position of the mouse:
            path.add(event.point);
            top=bottom=event.point
        
      }

    // Add data to path
    path_to_send.path.push({
      top: view.projectToView(path.lastSegment.point),
      bottom: view.projectToView(path.firstSegment.point)
    });
    path_to_send.pathData=path.pathData


    }
Pencil.prototype.onMouseUp=function(event){
         // Close the users path
    if(!event.modifiers.shift){
      path.add(event.point);
    }
    if(this.closed){
      path.closed = true;
    }
    this.smoothing&& path.smooth();


    // Send the path to other users
    path_to_send.end = view.projectToView(path.lastSegment.point);
    // This covers the case where paths are created in less than 100 seconds
    // it does add a duplicate segment, but that is okay for now.
    socket.emit('draw:progress', room, uid, JSON.stringify(path_to_send));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));

    // Stop new path data being added & sent
    path_to_send.path = new Array();
    }


// create a SpringSystem and a Spring with a bouncy config.
var springSystem = new rebound.SpringSystem();
var mouseDragSpring = springSystem.createSpring(50, 3);
var mouseClickSpring= springSystem.createSpring(50, 3);


var Select=function(){
  this.item_move_delta;
  this.send_item_move_timer;
  this.item_move_timer_is_active = false;
  /*
  this.visualMouseQueEnter=function(event){
    var item = event.target
    if(!item){
      return
    }

    var cache = item.cache = (item.cache||{})
    cache=cache[this.name]=(cache[this.name]||{})

    if(cache.defaultApplyMatrix==null){
      cache.defaultApplyMatrix=item.applyMatrix
      applyMatrix=false
    }

    if(!cache.mouseOverSpring){
      cache.mouseOverSpring = springSystem.createSpring(50, 3)
      cache.mouseOverSpring.addListener({
        onSpringUpdate:function(spring){
          view.draw()
          var val = spring.getCurrentValue();
          val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 1.05);


          if(val>1.05){
            spring.setEndValue(0)
          }
            // if(previousClone){
            //   previousClone.remove()
            // }
            // previousClone=item.clone()
            // previousClone.scale(val)
             item.matrix.reset()
             item.scale(val)
            // item.strokeColor=item.selectedColor||item.parent.selectedColor || project.currentStyle.selectedColor ||new Color('blue')
            // item.strokeWidth=val*.30
            // item.dashArray=[val,10]

            //min,input,max
            // var limit=.10
            // val=Math.max(0,Math.min(val,1))
            // var first=Math.max(0,Math.min(val-limit,1))
            // var second=Math.max(0,Math.min(val+limit,1))


            // var streak = cache.fillColor.clone()
            // streak.alpha=0
            // console.log(first,val,second)
            // item.fillColor= {
            //     gradient: {
            //         stops: [[cache.fillColor, first], [streak,val], [cache.fillColor,second]]
            //     },
            //     origin: item.bounds.topLeft,
            //     destination: item.bounds.bottomRight
            // }
            view.draw()

            // item.style.mozTransform =
            // item.style.msTransform =
            // item.style.webkitTransform =
            // item.style.transform = 'scale3d(' +
            //   val + ', ' + val + ', 1)';
  
        }
        ,onSpringAtRest:function(spring){
            //spring.setEndValue(0)
            //item.fillColor=cache.fillColor
        }
     });
    }

    cache.fillColor=item.fillColor
    // if(cache.over){
    //   return
    // }
    //cache.over=true
    cache.mouseOverSpring.setEndValue(1)
  }
  this.visualMouseQueLeave=function(event){
    var item = event.target
    var cache = item.cache = (item.cache||{})
    cache=cache[this.name]
    if(!cache){
      return
    }
    item.fillColor=cache.fillColor
    cache.mouseOverSpring.setEndValue(0)
    cache.over=false
  }
*/
}
Select.prototype.constructor=Select;
Select.prototype.name='select'
Select.prototype.init=function(){
  //project.activeLayer.on('mouseenter',this.visualMouseQueEnter)
  //project.activeLayer.on('mouseleave',this.visualMouseQueLeave)
}
Select.prototype.denit=function(){
  //project.activeLayer.off('mouseenter',this.visualMouseQueEnter)
  //project.activeLayer.off('mouseleave',this.visualMouseQueLeave)
}

Select.prototype.onMouseDown=function(event){
  // this.dragging=false


  // // Add a listener to the spring. Every time the physics
  // // solver updates the Spring's value onSpringUpdate will
  // // be called.

  // var mouseDown=false
  // // Listen for mouse down/up/out and toggle the
  // //springs endValue from 0 to 1.
  // // item.attach('mouseenter',function(){
  // //   spring.setEndValue(.1)
  // // })
  // item.attach('mousedown', function() {
  //   console.log('moooouseee')
  //   if(mouseDown){
  //     return 
  //   }
  //   mouseDown=true
  //   mouseClickSpring.setEndValue(.5);
  // });

  // item.attach('mouseleave', function() {
  //   mouseDown=false
  //   mouseClickSpring.setEndValue(0);
  // });

  // item.attach('mouseup', function() {
  //   mouseDown=false
  //   mouseClickSpring.setEndValue(0);
  // });








    // Select item
    canvas.css("cursor", "pointer");
    if (event.item) {
      // If holding shift key down, don't clear selection - allows multiple selections
      if (!event.modifiers.shift) {
        for(var i=0,l=project.layers.length;i<l;i++){
          var layer = project.layers[i]
          layer.selected = false;
        }
      }
      event.item.selected = true;
      console.log('event.item.name',event.item.name)
    } else {
        for(var i=0,l=project.layers.length;i<l;i++){
          var layer = project.layers[i]
          layer.selected = false;
        }
    }







    //my original hit test selection
    // var hitResult = project.hitTest(event.point,{ 
    // fill:true,
    // stroke: true, 
    // segments:true,
    // curves:true,
    // handles:false,
    // ends:true,
    // bounds:false,
    // center:false,
    // guides:false,
    // selected:false,
    // tolerance: 5 })

    // console.log(hitResult)

    // if(hitResult){
    //   hitResult.item.fullySelected=true
    //   }
    }
Select.prototype.onMouseDrag=function(event){
        // Move item locally
        for (x in paper.project.selectedItems) {
          var item = paper.project.selectedItems[x];
          item.position += event.delta;
        }

        // Store delta
        if (paper.project.selectedItems) {
          if (!this.item_move_delta) {
            this.item_move_delta = event.delta;
          } else {
            this.item_move_delta += event.delta;
          }
        }

        // Send move updates every 50 ms
        if (!this.item_move_timer_is_active) {
          this.send_item_move_timer = setInterval(function() {
            if (this.item_move_delta) {
              var itemNames = new Array();
              for (x in paper.project.selectedItems) {
                var item = paper.project.selectedItems[x];
                itemNames.push(item._name);
              }
              socket.emit('item:move:progress', room, uid, itemNames, this.item_move_delta);
              this.item_move_delta = null;
            }
          }, 50);
        }
        this.item_move_timer_is_active = true;
    }
Select.prototype.onMouseUp=function(event){
      // End movement timer
      clearInterval(this.send_item_move_timer);
      if (this.item_move_delta) {
        // Send any remaining movement info
        var itemNames = new Array();
        for (x in paper.project.selectedItems) {
          console.info('moved',paper.project.selectedItems[x].name)
          var item = paper.project.selectedItems[x];
          itemNames.push(item._name);
        }
        socket.emit('item:move:end', room, uid, itemNames, this.item_move_delta);
      } else {
        // delta is null, so send 0 change
        socket.emit('item:move:end', room, uid, itemNames, new Point(0, 0));
      }
      this.item_move_delta = null;
      this.item_move_timer_is_active = false;
      }


// var Snap=function(){

// }
// Snap.prototype.updateBounds=function(item){
//   var json=item.toJSON();
//   //removing segments
//   for(var i=0,l=json.length;i<l;i++){
//     var segments= json[i].segments
//     if(segments){ //currently only scrubbing the segments away
//       //json.segments=segments 
//       delete json[i].segments
//     }
//   }
// }


function getBounds(item){
  if(!item){
    return undefined
  }else if(item.bounds){
    return item.bounds.toJSON()
  }else if(item.className=='Point'){
    return ['Rectangle',item.x,item.y,0,0] //emulate rectangle
  }else{
    throw 'error cant get bounds of className'+item.className
  }
}



var brushes={}
function addBrush(brush){
  if(brushes[brush.name]){
    throw 'already added brush'+brush.name
  }
  brushes[brush.name]=brush
}
addBrush({name:'draw'
    ,poll:function(data){
      var st = JSON.stringify(data)
      data.path= new Array();
      return st
    }
    ,onMouseDown:function(event){
       this.path = new Path();
       this.path.closed=true
       var strokeColor;
       switch(event.button){
        case 'primary':
          strokeColor = active_color;
          break
        case 'secondary':
          //strokeColor = new Color(255, 0,255, 100);
          radialMenu.show(event)
          return
        default:
          return
        }
        this.path.fillColor=strokeColor

        this.path.add(event.point);
        this.path.name = uid + ":" + (++paper_object_count);


        // The data we will send every 100ms on mouse drag
       path_to_send={
          name: this.path.name,
          init: this.path.toJSON(),
          //start: project.activeLayer.localToGlobal(this.path.lastSegment.point),
          path: [],
          attributes: this.path.toJSON(),
          tool: this.name,
          bounds:this.path.bounds
        };
    }
    ,onMouseDrag:function(event){

    var step = event.delta / 2;
    step.angle += 90;
    var bottom = event.middlePoint + step;
    var top = event.middlePoint - step;



    this.path.add(top);
    this.path.insert(0, bottom);
    this.path.smooth();


    // Add data to path
    path_to_send.path.push({
      top: project.activeLayer.localToGlobal(this.path.lastSegment.point),
      bottom: project.activeLayer.localToGlobal(this.path.firstSegment.point)
    });
    path_to_send.bounds=this.path.bounds
  },onMouseUp:function(event){
       // Close the users path
    this.path.add(event.point);

    this.path.remove()
    var poly = simplePoly(this.path)

    // for (var i = 0; i < intersections.length; i++) {
    //     var intersectionPath = new Path.Circle({
    //         center: intersections[i].point,
    //         radius: 4,
    //         fillColor: 'red'
    //     });
    // }


    // Send the path to other users
    path_to_send.end = view.viewToProject(this.path.lastSegment.point);
    path_to_send.attributes = this.path.toJSON()
    path_to_send.bounds=this.path.bounds
    // This covers the case where paths are created in less than 100 seconds
    // it does add a duplicate segment, but that is okay for now.
    socket.emit('draw:progress', room, uid, JSON.stringify(path_to_send));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));

    // Stop new path data being added & sent
    path_to_send.path = new Array();

  }

  })



function PaintBrush(color) {
    this.name='paint'
    this.color=color
  }
PaintBrush.prototype.constructor=PaintBrush
//GLOB CREATION
// PaintBrush.prototype.poll=function(data,forceEnd){
//     if(!this.masterGlob){
//         this.defaultLayer.activate()
//         this.masterGlob=this.path.clone()
//         this.masterGlob.closed=true
//         this.masterGlob.visible=false
//         this.masterGlob.fillColor='red'
//         this.masterGlob.name=this.baseStokeName
//         return
//       }



//        if(!forceEnd && Math.abs(this.path.area)<500){
//          return
//        }

//       this.debugLayer.activate()
//       var glob = this.path.clone()
//       glob.closed=true
//       ///DONT TOUCH!!!////
//       var mid=bottomMiddle=topMiddle=Math.floor((0 + glob.segments.length)/2)
//       // if(window.lastMousePosition){
//       //   glob.insert(0,lastMousePosition.point)
//       //   glob.add(lastMousePosition.point)
//       // }else{
//       //   console.error('no mouse position')
//       // }
//       var even = glob.segments.length%2==0
//       if(even){ //even
//         topMiddle=topMiddle
//         bottomMiddle=bottomMiddle-1
//       }
//       if(forceEnd){
//         bottomMiddle--
//       }
//       ///DONT TOUCH!!!////


//       var bottomStart=(0)
//       var bottomEnd=(bottomMiddle)
//       var topStart=(topMiddle)
//       var topEnd=(glob.segments.length-1)
      
//       // if(even){
//       //   bottomStart++
//       //   topStart--
//       // }


//       new Path.Circle({
//                center: glob.segments[topStart].point+{x:0,y:-28},
//                radius: 4,
//                fillColor: 'darkgreen',
//                strokeColor:'black'
//            });
//         new Path.Circle({
//                center: glob.segments[topEnd].point+{x:0,y:-8},
//                radius: 8,
//                fillColor: 'darkred',
//                strokeColor:'black'
//            });

//       new Path.Circle({
//                center: glob.segments[bottomStart].point+{x:0,y:0},
//                radius: 3,
//                fillColor: 'green'
//            });
//         new Path.Circle({
//                center: glob.segments[bottomEnd].point+{x:0,y:0},
//                radius: 4,
//                fillColor: 'red'
//            });




//              // glob.smooth({type:'continuous',from:middleIndex,to:glob.segments.length-1})
//         // for(var i=start,l=end;i<l;i++){
//         //   if(!glob.segments[i].smooth){
//         //     console.log('@@@@',i,'@@@',glob,glob.segments[i],glob.segments[i].smooth)
//         //    new Path.Circle({
//         //        center: glob.segments[i].point,
//         //        radius: 1,
//         //        fillColor: 'red'
//         //    });
//         //   }else{
//         //     glob.segments[i]&&glob.segments[i].smooth()
//         //   }
//         // }
//        // odd=!odd
//       //if(middleIndex==glob.segments.length-middleIndex && odd){

//       if(forceEnd){
//         glob.smooth('catmull-rom')
//       }else{
//         glob.smooth({type:'catmull-rom',from:topStart,to:topEnd})
//         glob.smooth({type:'catmull-rom',from:bottomStart,to:bottomEnd})
//       }
        
//         // var segs=glob.removeSegments(middleIndex,end) //TODO when paperjs supports path.smooth({from:middleIndex,to:end}) use that instead
//         // if(segs.length){
//         //   //console.info('new selection')
//         //   var p=new Path(segs)
//         //   //console.info('p',p.segments.length,p)
//         //   //if(this.lastBottomLineSegments){
//         //   //  p.insertSegments(0,this.lastBottomLineSegments)
//         //   //}
//         //   //this.lastBottomLineSegments=segs;
//         //   //console.info('p',p.segments.length,p)

//         //   //p.applyMatrix=false
//         //   p.smooth('catmull-rom')
          
//         //   //segs=p.removeSegments( p.segments.length-(end-start) )
//         //   //console.info('p',p.segments.length,p)
//         //   //DEV NOTE if you try the append previous line before smoothing appoach here make sure to use segs instead of p.segments
//         //   glob.insertSegments(start,p.segments); //insert at start again
//         //   p.remove()
//         //   //.smooth({from:start,to:end})
//         //   console.info('end selection')
//         // }

//       //}

//       //glob.removeSegment(glob.segments.length-1)
//       //glob.removeSegment(0)

//       glob=simplePoly(glob,{replace:true})

//       this.defaultLayer.activate()
//       if(!glob){
//         throw 'glob was removed after simplePoly funciton'
//         return
//       }
  

//       // this.path=new Path([glob.removeSegment(0)])
//       // this.path.insert(1,glob.firstSegment)

//       // this.path.add(glob.segments[glob.segments.length-2])
//       // this.path.add(glob.removeSegment(glob.segments.length-1))


//       this.path.remove()
//       this.path=new Path()

//       //this.path.addSegments([glob.firstSegment,glob.segments[1],glob.segments[glob.segments.length-2],glob.lastSegment])
//       this.path.add(glob.firstSegment)
//       //this.path.add(glob.segments[1].point)
//       this.path.add(midPoint(glob.segments[1].point,glob.segments[glob.segments.length-2].point))
//       //this.path.add(glob.segments[glob.segments.length-2].point)
//       this.path.add(glob.lastSegment)
//       //this.path=new Path([glob.firstSegment,glob.lastSegment])
//       this.path.name=this.baseStokeName+':'+(++this.iGlob)
//       this.path.fillColor='green'

      
//       var addition=this.masterGlob.unite(glob)
//       if(!addition || addition.area<=this.masterGlob.area){
//         addition.remove()
//         console.warn('not significant addition')
//         return 
//       }

//       //addition replaces masterGlob
//       addition.name=this.masterGlob.name 
//       this.masterGlob.remove()
//       this.masterGlob=addition

//       if(forceEnd){
//         //this.masterGlob.smooth()
//       }

//       //debug cleanup
//       glob.strokeColor=debugStrokeColor
//       glob.fillColor=debugFillColor

//       //data.globs.push(glob.pathData)
//       var st = JSON.stringify(data) //take a snapshot
//       data.globs= []

//       this.lastGlob=glob
//       return st
//     }
function calculateMids(array,offset){
      var ans={
          even:array.length%2==0
        }
      ans.middle=ans.bottomMiddle=ans.topMiddle=Math.floor((0 + array.length)/2) //if odd all mids are same
      if(ans.even){ //even then move the bottom down one
        ans.bottomMiddle=ans.bottomMiddle-1
      }
      if(offset){
        ans.offset=offset
        ans.bottomMiddle=ans.bottomMiddle-offset
        ans.topMiddle=ans.topMiddle+offset
      }
      ans.length=array.length
      return ans
}
window.web=window.web||{}
web.debuggOnCall=function(message,count){
  console.warn(message,count)
  var i= (web.debugOnCall.cache[message]||0)
  web.debugOnCall.cache[message]=i
  if(i==count){
    debugger
  }
}
web.debuggOnCall.cache={}
ggg=0
//streak Creation
PaintBrush.prototype.glob=function(data,forceEnd){
      debug && (this.path.selected=true)
      var minGlobLength=10


      if(forceEnd){
        this.iStablePathLength=this.spline.segments.length
      }
      
      var additionLength=Math.min(this.iStablePathLength-this.masterGlobTheoreticalLength,10)

      var isEndGlob=forceEnd&&this.masterGlobTheoreticalLength+additionLength==this.spline.segments.length
      var isFirstGlob=!this.masterGlobTheoreticalLength


      if(!forceEnd&&additionLength<minGlobLength){
          return
      }
      // if(forceEnd){
      //   //if(additionLength<minGlobLength){
      //   //  this.topStableIndex=this.topMiddle+(this.iStablePathLength-1)
      //   //  this.bottomStableIndex=0
      //   //}
      // }else{

        this.topStableIndex=this.topMiddle+this.masterGlobTheoreticalLength+(additionLength-1) //DO NOT CHANGE!
        this.bottomStableIndex=Math.max(this.bottomMiddle-(this.masterGlobTheoreticalLength+(additionLength-1)),0) //DO NOT CHANGE!!!
      //}

      this.debugLayer.activate()
       //debugger
      var glob = new Path()
      glob.name=this.baseStokeName+':'+(++this.iGlob)
      glob.closed=true


      window.path=this.path

      // ggg++
      // if(ggg==1){
      //   debugger
      // }


      // var bottomStart=(0)
      // var bottomEnd=(mids.bottomMiddle)
      // var topStart=(mids.topMiddle)
      // var topEnd=(mids.length-1)



      // new Path.Circle({
      //          center: this.path.segments[topStart].point+{x:0,y:-28},
      //          radius: 4,
      //          fillColor: 'darkgreen',
      //          strokeColor:'black'
      //      });
      //   new Path.Circle({
      //          center: this.path.segments[topEnd].point+{x:0,y:-8},
      //          radius: 8,
      //          fillColor: 'darkred',
      //          strokeColor:'black'
      //      });

      // new Path.Circle({
      //          center: this.path.segments[bottomStart].point+{x:0,y:0},
      //          radius: 3,
      //          fillColor: 'green'
      //      });
      //   new Path.Circle({
      //          center: this.path.segments[bottomEnd].point+{x:0,y:0},
      //          radius: 4,
      //          fillColor: 'red'
      //      });


      var tpart=this.topMiddle+this.masterGlobTheoreticalLength
      var bpart=this.bottomMiddle-(this.masterGlobTheoreticalLength)

      if(!isFirstGlob){ //only run on subsequent calls
        tpart-=1
        bpart+=1
      }

      new Path.Circle({
               center: this.path.segments[tpart].point+{x:0,y:0},
               radius: 4,
               fillColor: 'blue',
               strokeColor:'green'
           });
     new Path.Circle({
               center: this.path.segments[this.topStableIndex].point+{x:0,y:0},
               radius: 4,
               fillColor: 'blue',
               strokeColor:'red'
           });

      var topSegments=this.path.segments.slice(tpart,this.topStableIndex+1)
      var bottomSegments=this.path.segments.slice(this.bottomStableIndex,bpart+1)

      //remove the handle curves from the last ones so we dont have anything potentially poking out
      if(!isEndGlob){ //dont run this bit of code at the end
        console.log('rightFlat')
        bottomSegments[0].handleIn=null
        topSegments[topSegments.length-1].handleOut=null
      }
      if(!isFirstGlob){ //dont run this bit of code at the beginning
        debugger
        console.log('leftFlat')
        topSegments[0].handleIn =null
        bottomSegments.length && (bottomSegments[bottomSegments.length-1].handleOut=null)
      }
      //topSegments[0].handleOut=null
      //topSegments[topSegments.length-1].handleIn 
      //if(!forceEnd){
        //bottomSegments[0].handleOut=null
        //bottomSegments[bottomSegments.length-1].handleIn=null
      //}


      if(topSegments[0]==bottomSegments[bottomSegments.length-1]){ //this does not happen now because I offset top and middle vars with this.masterGlobTheoreticalLength
        bottomSegments.pop()
      }else if(forceEnd && topSegments[topSegments.length-1]==bottomSegments[0]){
        bottomSegments.shift()
      }

      // if(this.taperStart && this.masterGlob.className=='Path'&&this.masterGlob.segments.length==1){ //detect that masterglob is a point and we are starttapper
      //   alert('put start taper on')
      //   bottomSegments.push(this.path.segments[this.topMiddle])
      // }

      glob.addSegments(bottomSegments)
      glob.addSegments(topSegments)






             // glob.smooth({type:'continuous',from:middleIndex,to:glob.segments.length-1})
        // for(var i=start,l=end;i<l;i++){
        //   if(!glob.segments[i].smooth){
        //     console.log('@@@@',i,'@@@',glob,glob.segments[i],glob.segments[i].smooth)
        //    new Path.Circle({
        //        center: glob.segments[i].point,
        //        radius: 1,
        //        fillColor: 'red'
        //    });
        //   }else{
        //     glob.segments[i]&&glob.segments[i].smooth()
        //   }
        // }
       // odd=!odd
      //if(middleIndex==glob.segments.length-middleIndex && odd){

      // if(forceEnd){
      //   glob.smooth('catmull-rom')
      // }else{
      //   glob.smooth({type:'catmull-rom',from:topStart,to:topEnd})
      //   glob.smooth({type:'catmull-rom',from:bottomStart,to:bottomEnd})
      // }
        
        // var segs=glob.removeSegments(middleIndex,end) //TODO when paperjs supports path.smooth({from:middleIndex,to:end}) use that instead
        // if(segs.length){
        //   //console.info('new selection')
        //   var p=new Path(segs)
        //   //console.info('p',p.segments.length,p)
        //   //if(this.lastBottomLineSegments){
        //   //  p.insertSegments(0,this.lastBottomLineSegments)
        //   //}
        //   //this.lastBottomLineSegments=segs;
        //   //console.info('p',p.segments.length,p)

        //   //p.applyMatrix=false
        //   p.smooth('catmull-rom')
          
        //   //segs=p.removeSegments( p.segments.length-(end-start) )
        //   //console.info('p',p.segments.length,p)
        //   //DEV NOTE if you try the append previous line before smoothing appoach here make sure to use segs instead of p.segments
        //   glob.insertSegments(start,p.segments); //insert at start again
        //   p.remove()
        //   //.smooth({from:start,to:end})
        //   console.info('end selection')
        // }

      //}

      //glob.removeSegment(glob.segments.length-1)
      //glob.removeSegment(0)

      glob=simplePoly(glob,{replace:true})

      this.defaultLayer.activate()
      if(!glob){
        throw 'glob was removed after simplePoly funciton'
        return
      }
  



      var addition;
      //if(this.masterGlob.className=='Path'&&this.masterGlob.segments.length==1){

        // addition=glob.clone()
        // addition.insertSegments(bottomSegments.length,this.masterGlob.segments)
        //      new Path.Circle({
        //        center: this.masterGlob.segments[0].point+{x:0,y:0},
        //        radius: 3,
        //        fillColor: 'blue'
        //    });
        //     addition.smooth('catmull-rom')
      //}else{
        addition=this.masterGlob.unite(glob)
        if(!addition || addition.area<=this.masterGlob.area){
          alert()
          addition.remove()
          console.warn('not significant addition')
          return 
        }else{
          //addition replaces masterGlob
          addition.name=this.masterGlob.name 
          this.masterGlob.remove()
          this.masterGlob=addition
        }
      //}
      debugger
      this.stablePathCounts.fill(null,this.masterGlobTheoreticalLength,this.masterGlobTheoreticalLength+additionLength)
      this.masterGlobTheoreticalLength=this.masterGlobTheoreticalLength+additionLength;
      //console.info(stablePathCounts[this.iStablePathLength])


      //debug cleanup
      glob.strokeColor=debugStrokeColor
      glob.fillColor=debugFillColor

      //data.globs.push(glob.pathData)
      var st = JSON.stringify(data) //take a snapshot
      data.globs= []

      this.lastGlob=glob

      debugger
      if(forceEnd && !isEndGlob){
        st=this.glob(data,'force')
      }
      return st
    }
PaintBrush.prototype.onMouseDown=function(event,spline){
      //create a debug layer. Debug layer will serve as a dumping gound for all the
      // artifacts we create in paperjs. It is also helpful for debuging. doublespeak name.
      this.defaultLayer=project.activeLayer
      this.debugLayer=new Layer()
      this.debugLayer.name='debug:globs'
      this.debugLayer.visible=debug

      //set variables
      this.iGlob=0
      this.masterGlob=null
      this.masterGlobTheoreticalLength=0
      this.lastGlob=null
      this.lastBottomLineSegments=null
      this.taperStart=true
      this.taperEnd=true

      //just use spline.segments.length
      window.stablePathCounts=this.stablePathCounts=[] 
      this.iStablePathLength=0

      this.topMiddle=0
      this.bottomMiddle=0
      this.topStableIndex=0
      this.bottomStableIndex=0

      //create spline
      this.spline = new Path(); //this is the base data spline.
      this.spline.strokeColor=new Color(255, 0,255, 1);
      this.spline.add(event.point)
      //this.spline.data.timeStamp=event.timeStamp
      this.spline.data.timeDelta=[event.timeStamp-this.spline.data.timeStamp]


      this.defaultLayer.activate()
      //init path that will be used to create globs
      this.path = new Path();
      this.path.fillColor=this.color;
      this.path.closed=true

      this.path.add(event.point);
      this.baseStokeName= uid + ":" + (++paper_object_count)
      this.path.name = this.baseStokeName+':'+(this.iGlob)

      this.masterGlob=this.path.clone()
      this.masterGlob.closed=true
      this.masterGlob.visible=false
      this.masterGlob.fillColor='red'
      this.masterGlob.name=this.baseStokeName



        // The data we will send every 100ms on mouse drag
       return {
          timeStamp:Date.now(),
          artist:uid,
          name: this.baseStokeName,
          tool: brush.name,
          object:this.path,
          spline:this.spline,
          significantGlobIndexes:[],
          bounds:getBounds(this.path)
          //pathData:path.pathData, //DONT do path data until it is finished
          //path: [],
        };
    }

PaintBrush.prototype.onMouseDrag=function(event){
    this.spline.add(event.point)
    this.spline.data.timeDelta.push(event.timeStamp-this.spline.data.timeStamp)
    
    var step = event.delta / 2;
    step.angle += 90;
    var bottom = event.middlePoint + step;
    var top = event.middlePoint - step;

    this.path.add(top);
    this.path.insert(0, bottom);

    //set middles
    var l=this.path.segments.length,m=Math.floor(l/2);
    if(l-1%2==0){ //even then start top and bottom
      this.topMiddle=m
      this.bottomMiddle=m-1
    }else{ //odd then start them both on the same
      this.topMiddle=m
      this.bottomMiddle=m
    }

    var previousPath=this.path.clone()
    this.path.smooth() //TODO dont smooth the whole line

    //because of the data structure i chose both top and bottom must be static for n number of counts
    var n=2
    //counts from middle to end where t is iter
    //counts from middle to beginning where b is iter
    for(var i=this.iStablePathLength,t=this.topMiddle+i,b=this.bottomMiddle-(i-1);t<l;i++,b--,t++){
      //console.log('l',l,'m',m,'t',t,'b',b)
      if(
        previousPath.segments[t].handleIn==this.path.segments[t].handleIn
        &&previousPath.segments[t].handleOut==this.path.segments[t].handleOut
        &&previousPath.segments[b].handleIn==this.path.segments[b].handleIn
        &&previousPath.segments[b].handleOut==this.path.segments[b].handleOut
       ){
        this.stablePathCounts[i]=(this.stablePathCounts[i]||0)+1 //both are stable. count up once
        if(this.stablePathCounts[i]>=n){
          this.iStablePathLength=Math.max(this.iStablePathLength,i+1)
        }
      }else{
        this.stablePathCounts.fill(0,i) //one was off. restart count
        this.iStablePathLength=Math.min(i+1,this.iStablePathLength)
        break
      }
    }
    previousPath.remove()

    //if(this.iStablePathLength-this.masterGlobTheoreticalLength>10){
    //  path_to_send=brush.glob(path_to_send,false)
    //}
    return path_to_send
  }
PaintBrush.prototype.onMouseUp=function(event){
    // Close the users path
    this.path.add(event.point);
    //this.path.insert(0,event.point) //this would be repetitive and we use close anyway
    this.path.smooth()

    this.spline.add(event.point)
    this.spline.data.timeDelta.push(event.timeStamp-this.spline.data.timeStamp)

    var temp=this.glob(path_to_send,'force')
    if(temp){
      path_to_send=temp
    }
    socket.emit('draw:progress', room, uid, path_to_send);
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));
    //this.masterGlob.strokeColor='green'
    

    // Stop new path data being added & sent
    path_to_send.path = new Array();
    !debug && this.debugLayer.remove()
    this.masterGlob.visible=true
    this.path.remove()
  }
PaintBrush.prototype.compile=function(path,data){
    if(!path){
      path=this.path
    }
      if(data.pathData){ //see what kind of data this renderer uses //pathData is assumed to be populated on end
        path.remove() //delete current path if exists.
        path= project.importJSON(data.attributes)//import new one.
        path.removeSegments && path.removeSegments() //TODO make this not nessissary
        path.parent=project.activeLayer //TODO put this in users layer or users project
      
        path.remove()
      // }else if(data.globs){ //globs build upon eachother to create a pathitem or complexpath
      //   if(!path){
      //     path=new Path()
      //     path.fillColor=data.rgba||data.color||this.color
      //   }
      //   _.forEach(data.globs,function(glob){
      //     glob = new Path(glob)
      //     path=path.union(glob)
      //     path.remove()
      //   })
      }else if(data.spline){ //spline is the raw data that will create this shape.

      }
    return path
    }
PaintBrush.render=function(json,frame){
  if(user.timeFrame=='live'){
    if(json.pathData){ //we are live so draw it if it is done

    }else if(json.spline){ //if it is in progress then handle it

    }
  }

}

addBrush(new PaintBrush(active_color))















addBrush({
    name:'glob',
    poll:function(data,forceEnd){
       if(!forceEnd &&Math.abs(path.area)<500){
         return
       }
      var glob = path

      ///DONT TOUCH!!!////
      var mid=bottomMiddle=topMiddle=Math.floor((0 + glob.segments.length)/2)
      if(window.lastMousePosition){
        glob.insert(0,lastMousePosition.point)
        glob.add(lastMousePosition.point)
        
      }


      var even = glob.segments.length%2==0
      if(even){ //even
        topMiddle=topMiddle
        bottomMiddle=bottomMiddle-1
      }
      if(forceEnd){
        bottomMiddle--
      }
      ///DONT TOUCH!!!////


      var bottomStart=(0)
      var bottomEnd=(bottomMiddle)
      var topStart=(topMiddle)
      var topEnd=(glob.segments.length-1)
      
      // if(even){
      //   bottomStart++
      //   topStart--
      // }


      this.debugLayer.activate()
      new Path.Circle({
               center: glob.segments[topStart].point+{x:0,y:-28},
               radius: 4,
               fillColor: 'darkgreen',
               strokeColor:'black'
           });
        new Path.Circle({
               center: glob.segments[topEnd].point+{x:0,y:-8},
               radius: 8,
               fillColor: 'darkred',
               strokeColor:'black'
           });

      new Path.Circle({
               center: glob.segments[bottomStart].point+{x:0,y:0},
               radius: 3,
               fillColor: 'green'
           });
        new Path.Circle({
               center: glob.segments[bottomEnd].point+{x:0,y:0},
               radius: 4,
               fillColor: 'red'
           });




             // glob.smooth({type:'continuous',from:middleIndex,to:glob.segments.length-1})
        // for(var i=start,l=end;i<l;i++){
        //   if(!glob.segments[i].smooth){
        //     console.log('@@@@',i,'@@@',glob,glob.segments[i],glob.segments[i].smooth)
        //    new Path.Circle({
        //        center: glob.segments[i].point,
        //        radius: 1,
        //        fillColor: 'red'
        //    });
        //   }else{
        //     glob.segments[i]&&glob.segments[i].smooth()
        //   }
        // }
       // odd=!odd
      //if(middleIndex==glob.segments.length-middleIndex && odd){

      if(forceEnd){
        glob.smooth('catmull-rom')
      }else{
        glob.smooth({type:'catmull-rom',from:topStart,to:topEnd})
        glob.smooth({type:'catmull-rom',from:bottomStart,to:bottomEnd})
      }
        
        // var segs=glob.removeSegments(middleIndex,end) //TODO when paperjs supports path.smooth({from:middleIndex,to:end}) use that instead
        // if(segs.length){
        //   //console.info('new selection')
        //   var p=new Path(segs)
        //   //console.info('p',p.segments.length,p)
        //   //if(this.lastBottomLineSegments){
        //   //  p.insertSegments(0,this.lastBottomLineSegments)
        //   //}
        //   //this.lastBottomLineSegments=segs;
        //   //console.info('p',p.segments.length,p)

        //   //p.applyMatrix=false
        //   p.smooth('catmull-rom')
          
        //   //segs=p.removeSegments( p.segments.length-(end-start) )
        //   //console.info('p',p.segments.length,p)
        //   //DEV NOTE if you try the append previous line before smoothing appoach here make sure to use segs instead of p.segments
        //   glob.insertSegments(start,p.segments); //insert at start again
        //   p.remove()
        //   //.smooth({from:start,to:end})
        //   console.info('end selection')
        // }

      //}

      glob.removeSegment(glob.segments.length-1)
      glob.removeSegment(0)

      // path=new Path([glob.removeSegment(0)])
      // path.insert(1,glob.firstSegment)

      // path.add(glob.segments[glob.segments.length-2])
      // path.add(glob.removeSegment(glob.segments.length-1))

      path=new Path()
      path.closed=true
      //path.addSegments([glob.firstSegment,glob.segments[1],glob.segments[glob.segments.length-2],glob.lastSegment])
      path.add(glob.firstSegment)
      //path.add(glob.segments[1].point)
      path.add(midPoint(glob.segments[1].point,glob.segments[glob.segments.length-2].point))
      //path.add(glob.segments[glob.segments.length-2].point)
      path.add(glob.lastSegment)
      //path=new Path([glob.firstSegment,glob.lastSegment])
      var name = glob.name.split(':')
      name[name.length-1]=(++this.iGlob)

      path.name=name.join(':');

      path.fillColor=active_color


      testGlobs.push(glob.pathData)
      if(!glob){
        return
      }
      glob.remove()
      name=glob.name
      glob=simplePoly(glob)
      glob.name=name
      this.defaultLayer.activate()


      if(!this.masterGlob){
        this.masterGlob=glob.clone()
        name=glob.name.split(':')
        name.pop()
        this.masterGlob.name=name.join(':')
        this.masterGlob.parent=this.defaultLayer
      }else{
        var addition=this.masterGlob.unite(glob)
         if(this.masterGlob.area==addition.area){
          console.log('not significant addition')
           return //not a significant addition
         }
        if(addition){
          addition.name=this.masterGlob.name
          this.masterGlob.remove()
          console.log('new glob',addition)
          this.masterGlob=addition
        }
      }
      this.masterGlob.reduce()
      if(forceEnd){
        this.masterGlob.smooth()
      }
      glob.strokeColor=debugStrokeColor
      glob.fillColor=debugFillColor
      

      console.log('emmit:',glob)
      data.globs.push(glob.pathData)
      var st = JSON.stringify(data) //take a snapshot
      data.globs= []

      this.lastGlob=glob
      return st
    }
    ,onMouseDown:function(event){
      //create a debug layer. Debug layer will serve as a dumping gound for all the
      // artifacts we create in paperjs. It is also helpful for debuging. doublespeak name.
      this.defaultLayer=project.activeLayer
      this.debugLayer=new Layer()
      this.debugLayer.name='debug:globs'
      this.debugLayer.visible=debug
      this.defaultLayer.activate()

      //set variables
      this.iGlob=0
      this.masterGlob=null
      this.lastGlob=null
      this.lastTopLine=null
      this.lastBottomLineSegments=null

       path = new Path();
       path.closed=true
       var fillColor;
       switch(event.button){
        case 'primary':
          fillColor = active_color;
          break
        case 'secondary':
          //fillColor = new Color(255, 0,255, 100);
          radialMenu.show(event)
          return
          default:
            return
        }
        path.fillColor=fillColor

        path.add(event.point);
        path.name = uid + ":" + (++paper_object_count)+':'+(this.iGlob)

        // this.masterGlob=new Path.Circle({
        //       center: event.point,
        //       radius: 4,
        //       fillColor: 'gold'
        //   });

        // The data we will send every 100ms on mouse drag
        path_to_send = {
          timeStamp:Date.now(),
          artist:uid,
          name: path.name,
          tool: brush.name,
          object:path.toJSON(),
          structure:[],
          globs:[],
          bounds:[path.bounds.topLeft.x,path.bounds.topLeft.y,path.bounds.topLeft.x,path.bounds.topLeft.y],
          //pathData:path.pathData, //DONT do path data until it is finished
          //path: [],
        };
    }
    ,onMouseDrag:function(event){

    var step = event.delta / 2;
    step.angle += 90;
    var bottom = event.middlePoint + step;
    var top = event.middlePoint - step;



    path.add(top);
    path.insert(0, bottom);

    //////@@@@ undo stop point! for dev kyle only
    //path = simplePoly(path)


    // Add data to path
    // path_to_send.path.push({
    //   top: project.activeLayer.localToGlobal(path.lastSegment.point),
    //   bottom: project.activeLayer.localToGlobal(path.firstSegment.point)
    // });



  },onMouseUp:function(event){
       // Close the users path
    path.add(event.point);
    //path.insert(0,event.point)
    //path.smooth()

    //path.remove()
    //var poly = simplePoly(path)

    // for (var i = 0; i < intersections.length; i++) {
    //     var intersectionPath = new Path.Circle({
    //         center: intersections[i].point,
    //         radius: 4,
    //         fillColor: 'red'
    //     });
    // }
    //this.masterGlob.smooth('continuous')
    //this.masterGlob.simplify()

    // Send the path to other users
    path_to_send.end = view.viewToProject(path.lastSegment.point);
    path_to_send.pathData = path.pathData
    // This covers the case where paths are created in less than 100 seconds
    // it does add a duplicate segment, but that is okay for now.


    socket.emit('draw:progress', room, uid, this.poll(path_to_send,'force'));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));
    //this.masterGlob.strokeColor='green'
    

    // Stop new path data being added & sent
    path_to_send.path = new Array();
    !debug && this.debugLayer.remove()
    path.remove()

  },compile:function(path,data){
    if(!path){
      return
    }
      if(data.pathData){
        path=new Path(data.pathData)
      }else{
        _.forEach(data.globs,function(glob){
          glob = new Path(glob)
          path.remove()
          path=path.union(glob)
        })
      }
    return path
    }
  })
addBrush(new Pencil({smoothing:true,closed:false,outline:false}))
addBrush(new Select())
addBrush(new LineEditor())

addBrush({
    name:'circle'
    ,onMouseUp:function(event){ 
      // Create a circle shaped path at the center of the view, (view.center = center point of view)
      // with a radius of 100:
      var circle = new Path.Circle({
        center: event.middlePoint,
        radius: event.delta.length / 2
      });
      circle.strokeColor = 'black';
      circle.fillColor = 'white';
    }
  })


var brush=brushes.draw
var picker = $('#mycolorpicker');

function onMouseDown(event) {
  if (event.which === 2) return; // If it's middle mouse button do nothing -- This will be reserved for panning in the future.
  $('.popup').fadeOut();
  if($(event.event.target).is(canvas)){
    picker.hide()
  }

  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]
  
  //DISABLED for now
  // if(!mouseClickHeld){
  //   mouseClickHeld = setTimeout(function() { // is the mouse being held and not dragged?
  //       clearTimeout(mouseClickHeld);
  //       mouseClickHeld=null
  //       if(brush && brush.onMouseLongClick){
  //         brush.onMouseLongClick(event)
  //       } else{ //default function for on mouse long click
  //           switch(event.button){
  //             case 'primary':
  //               picker.show(); // show the color picker
  //               //if (picker.is(':visible')) {
  //               // Mad hackery to get round issues with event.point
  //               var targetPos = $(event.event.target).position();
  //               var point = event.point + new Point(targetPos.left, targetPos.top);
  //               positionPickerInCanvas(point);
  //             //}
  //             break;
  //             case 'secondary':
  //             break;
  //             case 'middle':
  //             break
  //             default:
  //             break
  //           }
  //       }
  //   }, preferences.longClick);
  // }

  _.defer(function(event){

    if(brush){
      if(brush.onMouseDown){
        (brush.onMouseDown[event.button]||brush.onMouseDown).call(brush,event)
      }
    }

    var tmp =new paper.MouseEvent(event.type,event.event,event.point,event.target,event.delta)
    tmp.middlePoint=event.middlePoint
    event=tmp
      // // Send paths every 100ms
      // if (!send_paths_timer) {
      //   send_paths_timer = setInterval(function() { //TODO dont use setinterval cause it is bad. use settimeout cause it is good. duh
      //     var jsonString
      //     if(brush.poll){
      //       jsonString=brush.poll(path_to_send)
      //     }else{
      //       jsonString=JSON.stringify(path_to_send)
      //     }
      //     if(typeof jsonString!= 'string'){
      //       jsonString=JSON.stringify(jsonString)
      //     }
      //     socket.emit('draw:progress', room, uid, jsonString);
      //   }, 100);
      // }
    
  },event)
}


function onMouseDrag(event) {
  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]


  picker.hide()
   if(brush && brush.onMouseLongClick){
    brush.onMouseLongClick(false) //THIS SENDS FALSE instead of an event object so it can be used to clean up long click things
  }

  clearTimeout(mouseClickHeld);
  mouseClickHeld=null

var tmp =new paper.MouseEvent(event.type,event.event,event.point,event.target,event.delta)
    tmp.middlePoint=event.middlePoint
    event=tmp
  _.defer(function(event){
    if(brush){
      if(brush.onMouseDrag){
        (brush.onMouseDrag[event.button]||brush.onMouseDrag).call(brush,event)
      }
    }
  },event)
}
function onMouseUp(event){
  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]

  clearTimeout(mouseClickHeld);
  mouseClickHeld=null


var tmp =new paper.MouseEvent(event.type,event.event,event.point,event.target,event.delta)
    tmp.middlePoint=event.middlePoint
    event=tmp
  _.defer(function(event){
 
    if(brush){
      if(brush.onMouseUp){
        (brush.onMouseUp[event.button]||brush.onMouseUp).call(brush,event)
      }
    }

    clearInterval(send_paths_timer);
    send_paths_timer=null
    
  },event)
}
window.lastMousePosition;
function onMouseMove(event){
  console.log('onMouseMove')
  window.lastMousePosition=event
}
/*ktsuttle code end*/




var key_move_delta;
var send_key_move_timer;
var key_move_timer_is_active = false;
var shiftMultiplier=10
var keyDown={}

function onKeyDown(event) {
      event.preventDefault()
    console.info(event.key,event)
    keyDown[event.event.code]=keyDown[event.key]=true



    var panStep=10
    var handled=true; //defaults to true but is flipped to false if first switch does not handle
    switch(event.event.code){
      case 'Numpad1':
        viewZoom.pan(-panStep,panStep)
        break
      case 'Numpad2':
        viewZoom.pan(0,panStep)
        break
      case 'Numpad3':
        viewZoom.pan(panStep,panStep)
        break
      case 'Numpad4':
        viewZoom.pan(-panStep,0)
        break
      case 'Numpad5':
        radialMenu.toggle()
        break
      case 'Numpad6':
        viewZoom.pan(panStep,0)
        break
      case 'Numpad7':
        viewZoom.pan(-panStep,-panStep)
        break
      case 'Numpad8':
        viewZoom.pan(0,-panStep)
        break
      case 'Numpad9':
        viewZoom.pan(panStep,-panStep)
        break
      default:
        handled=false
    }
    if(!handled){
      switch(event.key){
        case 'page-down':
          viewZoom.pan(0,project.view.bounds.height/2)
          break
        case 'page-up':
          viewZoom.pan(0,-project.view.bounds.height/2)
          break
        case 'home':
          viewZoom.panTo(0,0)
          break
        case 'c':
          graffinityPointer.show()
          break
        case '+':
          viewZoom.changeZoomCentered(3, project.view.center);
          break
        case '-':
          viewZoom.changeZoomCentered(-3, project.view.center);
          break
      } 
    }

    if(graffinityPointer.active){
      console.log('moving')
      var updated=false
      var step=10;

      if(event.modifiers.shift){
        step=step*2
      }

      var position = graffinityPointer.getPosition().clone()
      console.log('moving from position',position)

      switch(event.key){
        case 'a':
          position.x -= step;
          updated=true
          break;
        case 'd':
          position.x += step;
          updated=true
          break;
        case 'w':
          position.y -= step;
          updated=true
          break;
        case 's':
          position.y += step;
          updated=true
          break;
      }
      
      if(updated){
        graffinityPointer.pointTo(position)
        //path.add(position);
      } 
    }

  if (brush.name == "select") {
    var point = null;
    var transpose=1

    if(event.modifiers.shift){
      transpose=shiftMultiplier
    }
    if (event.key == "up") {
      point = new paper.Point(0, -1*transpose);
    } else if (event.key == "down") {
      point = new paper.Point(0, 1*transpose);
    } else if (event.key == "left") {
      point = new paper.Point(-1*transpose, 0);
    } else if (event.key == "right") {
      point = new paper.Point(1*transpose, 0);
    }

    // Move objects 1 pixel with arrow keys
    if (point) {
      moveItemsBy1Pixel(point);
    }

    // Store delta
    if (paper.project.selectedItems && point) {
      if (!key_move_delta) {
        key_move_delta = point;
      } else {
        key_move_delta += point;
      }
    }

    // Send move updates every 100 ms as batch updates
    if (!key_move_timer_is_active && point) {
      send_key_move_timer = setInterval(function() {
        if (key_move_delta) {
          var itemNames = new Array();
          for (x in paper.project.selectedItems) {
            var item = paper.project.selectedItems[x];
            itemNames.push(item._name);
          }
          socket.emit('item:move:progress', room, uid, itemNames, key_move_delta);
          key_move_delta = null;
        }
      }, 100);
    }
    key_move_timer_is_active = true;
  }


}



function onKeyUp(event) {
  keyDown[event.event.code]=keyDown[event.key]=false

  if (event.key == "delete" || event.key=="backspace") {

    // Delete selected items
    var items = paper.project.selectedItems;
    if (items) {
      for (x in items) {
        var item = items[x];
        socket.emit('item:remove', room, uid, item.name);
        item.remove();
      }
    }
  }

  if (brush.name == "select") {
    // End arrow key movement timer
    clearInterval(send_key_move_timer);
    if (key_move_delta) {
      // Send any remaining movement info
      var itemNames = new Array();
      for (x in paper.project.selectedItems) {
        var item = paper.project.selectedItems[x];
        itemNames.push(item._name);
      }
      socket.emit('item:move:end', room, uid, itemNames, key_move_delta);
    } else {
      // delta is null, so send 0 change
      socket.emit('item:move:end', room, uid, itemNames, new Point(0, 0));
    }
    key_move_delta = null;
    key_move_timer_is_active = false;
  }
}



function moveItemsBy1Pixel(point) {
  if (!point) {
    return;
  }

  if (paper.project.selectedItems.length < 1) {
    return;
  }

  // Move locally
  var itemNames = new Array();
  for (x in paper.project.selectedItems) {
    var item = paper.project.selectedItems[x];
    item.position += point;
    itemNames.push(item._name);
  }

  // Redraw screen for item position update
  view.draw();
}

// Drop image onto canvas to upload it
canvas.bind('dragover dragenter', function(e) {
  e.preventDefault();
});

canvas.bind('drop', function(e) {
  e = e || window.event; // get window.event if e argument missing (in IE)
  if (e.preventDefault) { // stops the browser from redirecting off to the image.
    e.preventDefault();
  }
  e = e.originalEvent;
  var dt = e.dataTransfer;
  var files = dt.files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    uploadImage(file);
  }
});




// --------------------------------- 
// CONTROLS EVENTS

var $color = $('.colorSwatch:not(#pickerSwatch)');
$color.on('click', function() {

  $color.removeClass('active');
  $(this).addClass('active');
  $('#activeColorSwatch').css('background-color', $(this).css('background-color'));
  update_active_color();

});

$('#pickerSwatch').on('click', function(event) {
  $('#mycolorpicker').toggle();
});
$('#settingslink').on('click', function() {
  $('#settings').fadeToggle();
});
$('#embedlink').on('click', function() {
  $('#embed').fadeToggle();
});
$('#importExport').on('click', function() {
  $('#importexport').fadeToggle();
});
$('#usericon').on('click', function() {
  $('#mycolorpicker').fadeToggle();
});
$('#clearCanvas').on('click', function() {
  clearCanvas();
  socket.emit('canvas:clear', room);
});
$('#exportSVG').on('click', function() {
  exportSVG();
});
$('#exportPNG').on('click', function() {
  exportPNG();
});


$('#circleTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#pencilTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.circle
  brush.init && brush.init()
  canvas.css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});

$('#pencilTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#pencilTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.pencil
  brush.init && brush.init()
  canvas.css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});
$('#drawTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.draw
  brush.init && brush.init()
  canvas.css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});

$('#paintTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.paint
  brush.init && brush.init()
  canvas.css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});


$('#globTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.glob
  brush.init && brush.init()
  canvas.css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});
$('#selectTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#selectTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush.deinit && brush.deinit()
  brush=brushes.select
  brush.init && brush.init()
  canvas.css('cursor', 'default');
});

$('#uploadImage').on('click', function() {
  $('#imageInput').click();
});

function clearCanvas() {
  // Remove all but the active layer
  if (project.layers.length > 1) {
    var activeLayerID = project.activeLayer._id;
    for (var i = 0; i < project.layers.length; i++) {
      if (project.layers[i]._id != activeLayerID) {
        project.layers[i].remove();
        i--;
      }
    }
  }

  // Remove all of the children from the active layer
  if (paper.project.activeLayer && paper.project.activeLayer.hasChildren()) {
    paper.project.activeLayer.removeChildren();
  }
  view.draw();
}

function exportSVG() {
  var svg = paper.project.exportSVG();
  encodeAsImgAndLink(svg);
}

// Encodes svg as a base64 text and opens a new browser window
// to the svg image that can be saved as a .svg on the users
// local filesystem. This skips making a round trip to the server
// for a POST.
function encodeAsImgAndLink(svg) {
  if ($.browser.msie) {
    // Add some critical information
    svg.setAttribute('version', '1.1');
    var dummy = document.createElement('div');
    dummy.appendChild(svg);
    window.winsvg = window.open('/static/html/export.html');
    window.winsvg.document.write(dummy.innerHTML);
    window.winsvg.document.body.style.margin = 0;
  } else {
    // Add some critical information
    svg.setAttribute('version', '1.1');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    var dummy = document.createElement('div');
    dummy.appendChild(svg);

    var b64 = Base64.encode(dummy.innerHTML);

    //window.winsvg = window.open("data:image/svg+xml;base64,\n"+b64);
    var html = "<img style='height:100%;width:100%;' src='data:image/svg+xml;base64," + b64 + "' />"
    window.winsvg = window.open();
    window.winsvg.document.write(html);
    window.winsvg.document.body.style.margin = 0;
  }
}

// Encodes png as a base64 text and opens a new browser window
// to the png image that can be saved as a .png on the users
// local filesystem. This skips making a round trip to the server
// for a POST.
function exportPNG() {
  var canvas = canvas[0];
  var html = "<img src='" + canvas.toDataURL('image/png') + "' />"
  if ($.browser.msie) {
    window.winpng = window.open('/static/html/export.html');
    window.winpng.document.write(html);
    window.winpng.document.body.style.margin = 0;
  } else {
    window.winpng = window.open();
    window.winpng.document.write(html);
    window.winpng.document.body.style.margin = 0;
  }

}

// User selects an image from the file browser to upload
$('#imageInput').bind('change', function(e) {
  // Get selected files
  var files = document.getElementById('imageInput').files;
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    uploadImage(file);
  }
});

function uploadImage(file) {
  var reader = new FileReader();

  //attach event handler
  reader.readAsDataURL(file);
  $(reader).bind('loadend', function(e) {
    var bin = this.result;

    //Add to paper project here
    var raster = new Raster(bin);
    raster.position = view.center;
    raster.name = uid + ":" + (++paper_object_count);
    socket.emit('image:add', room, uid, JSON.stringify(bin), raster.position, raster.name);
  });
}




// --------------------------------- 
// SOCKET.IO EVENTS
socket.on('settings', function(settings) {
  processSettings(settings);
});


socket.on('draw:progress', function(artist, data) {

  // It wasnt this user who created the event
  if (artist !== uid && data) {
    progress_external_path(JSON.parse(data), artist);
  }

});

socket.on('draw:end', function(artist, data) {

  // It wasnt this user who created the event
  if (artist !== uid && data) {
    end_external_path(JSON.parse(data), artist);
  }

});
var radialMenu,graffinityPointer,viewZoom,hud,drawLayer,splineLayer;

socket.on('user:connect', function(user_count) {
  console.log("user:connect");
  drawLayer=paper.project.activeLayer;
  splineLayer=new Layer()
  splineLayer.name='spline'

  hud=new Layer()
  hud.name='hud'

  hud.activate()
  radialMenu=new RadialMenu()
  graffinityPointer=new GraffinityPointer()
  drawLayer.activate()
  console.log('@drawLayer@',drawLayer)

  window.viewZoom=viewZoom=new ViewZoom(project)
  viewZoom.setZoomRange([.001,Number.MAX_VALUE-1])

  if(coords){
    viewZoom.panTo(coords[0],coords[1])
    coords[2] && viewZoom.setZoomConstrained(coords[2])
  }

  update_user_count(user_count);
});

socket.on('user:disconnect', function(user_count) {
  update_user_count(user_count);
});

socket.on('project:load', function(json) {
  console.log("project:load",json);
  paper.project.activeLayer.remove();
  paper.project.importJSON(json.project);


  // Make color selector draggable
  $('#mycolorpicker').pep({});
  // Make sure the range event doesn't propogate to pep
  $('#opacityRangeVal').on('touchstart MSPointerDown mousedown', function(ev) {
    ev.stopPropagation();
  }).on('change', function(ev) {
    update_active_color();
  })

  view.draw();
  $.get("../static/img/wheel.png");
});

socket.on('project:load:error', function() {
  $('#lostConnection').show();
});

socket.on('canvas:clear', function() {
  clearCanvas();
});

socket.on('loading:start', function() {
  // console.log("loading:start");
  $('#loading').show();
});

socket.on('loading:end', function() {
  $('#loading').hide();
  $('#colorpicker').farbtastic(pickColor); // make a color picker
  // cake
  $('#canvasContainer').css("background-image", 'none');

});

socket.on('item:remove', function(artist, name) {
  if (artist != uid && paper.project.activeLayer._namedChildren[name][0]) {
    paper.project.activeLayer._namedChildren[name][0].remove();
    view.draw();
  }
});

socket.on('item:move', function(artist, itemNames, delta) {
  if (artist != uid) {
    for (x in itemNames) {
      var itemName = itemNames[x];
      if (paper.project.activeLayer._namedChildren[itemName][0]) {
        paper.project.activeLayer._namedChildren[itemName][0].position += new Point(delta[1], delta[2]);
      }
    }
    view.draw();
  }
});

socket.on('image:add', function(artist, data, position, name) {
  if (artist != uid) {
    var image = JSON.parse(data);
    var raster = new Raster(image);
    raster.position = new Point(position[1], position[2]);
    raster.name = name;
    view.draw();
  }
});


console.log(view);

// --------------------------------- 
// SOCKET.IO EVENT FUNCTIONS

// Updates the active connections
var $user_count = $('#online_count');

function update_user_count(count) {  
  $user_count.text((count === 1) ? "1" : " " + count);
}

var external_paths = {};

// Ends a path
var end_external_path = function(points, artist) {

  var path = external_paths[artist];


  var fn=brushes[points.tool].endExternalPath
  if(fn){
    path=fn(points,path)
  }else{ //TODO move this to pencil and draw functions
    if (path) {
      // Close the path
      path.add(new Point(points.end[1], points.end[2]));
      //path.closed = true; //TODO make this optional and flag comes from server per item
      //path.smooth(); //TODO i dont think I need this
      view.draw();

      // Remove the old data
      external_paths[artist] = false;

    }
  }

};

var switchLayer=function(layer){
  var active=project.activeLayer
  layer.activate()
  return activeLayer
}


// Continues to draw a path in real time
progress_external_path = function(points, artist) {
  console.log('progress_external_path',points,artist)

  var path = external_paths[artist];
  var fn=brushes[points.tool].compile
  if(fn){
    path=fn(path,points)
  }else{ //TODO move this to pencil and draw functions

    // The path hasnt already been started
    // So start it
    if (!path){
      // var renderType=points.preferences
      // brush.render[points.perferedRender](data)
      // if(path.svg){

      // }
      // if(path.paperjs){

      // }
      // if(path.raster){

      // }
      // if(path.raw){

      // }
      // Creates the path in an easy to access way
      path=external_paths[artist] = project.importJSON(points.init);
      path.parent=drawLayer||project.activeLayer;
    }

    // Draw all the points along the length of the path
    var paths = points.path;
    var length = paths.length;
    for (var i = 0; i < length; i++) {
      path.add(new Point(paths[i].top[1], paths[i].top[2]));
      path.insert(0, new Point(paths[i].bottom[1], paths[i].bottom[2]));

    }
  }

  view.draw();
};

function processSettings(settings) {

  $.each(settings, function(k, v) {

    // Handle tool changes
    if (k === "tool") {
      $('.buttonicon-' + v).click();
    }

  })

}
function onFrame(event) {
  // Each frame, rotate the path by 3 degrees:
   //if(graffinityPointer){
   //  graffinityPointer.group.rotate(3);
   //}
}

// Periodically save drawing
// setInterval(function(){
//   saveDrawing();
//   console.log('saved')
// }, 1000);

// function saveDrawing(){
//   var canvas = document.getElementById('myCanvas');
//   // Save image to localStorage
//   localStorage.setItem("drawingPNG"+room, canvas.toDataURL('image/png'));
// }





//single spring
web.tendon=function(elem,target,options){
  /*options=
      tention
      friction
      attaction
      snapDistance
  */
  options=options||{}
  if(!(this instanceof web.tendon)){return new web.tendon(elem,target,options)}
  
  if(options=='unhook'){
    
  }
  if(!web.isNode(elem)){
    if(window.paper){
      if(elem instanceof paper.Item || elem instanceof paper.Point||elem instanceof paper.Segment){
        return web.tendon.paperElement.call(this,elem,target,options)
      }
    }
    throw 'error idk the type of target web.tendon should use'
  }
  return web.tendon.domElement.call(this,elem,target,options)
}
web.tendon.paperElement=function(item,target,options){
  var type=options.type||item.className

  var applyMatrixDefault=item.applyMatrix
  item.applyMatrix=false
  
  var dragging=false
  // create a SpringSystem and a Spring with a bouncy config.
  var springSystem = new rebound.SpringSystem();
  var spring = springSystem.createSpring(50, 3);

  // Add a listener to the spring. Every time the physics
  // solver updates the Spring's value onSpringUpdate will
  // be called.
  spring.addListener({
    onSpringUpdate: function(spring) {
      view.draw()
      var val = spring.getCurrentValue();
      val = rebound.MathUtil
                   .mapValueInRange(val, 0, 1, 1, 0.5);
      scale(item, val);
    }
  });
  var mouseDown=false
  // Listen for mouse down/up/out and toggle the
  //springs endValue from 0 to 1.
  // item.attach('mouseenter',function(){
  //   spring.setEndValue(.1)
  // })
  item.attach('mousedown', function() {
    console.log('moooouseee')
    if(mouseDown){
      return 
    }
    mouseDown=true
    spring.setEndValue(.5);
  });

  item.attach('mouseleave', function() {
    mouseDown=false
    spring.setEndValue(0);
  });

  item.attach('mouseup', function() {
    mouseDown=false
    spring.setEndValue(0);
  });


  //var previousClone;
  // Helper for scaling an element with css transforms.
  function scale(item, val) {
    // if(previousClone){
    //   previousClone.remove()
    // }
    // previousClone=item.clone()
    // previousClone.scale(val)
    item.matrix.reset()
    item.scale(val)
    view.draw()
    // item.style.mozTransform =
    // item.style.msTransform =
    // item.style.webkitTransform =
    // item.style.transform = 'scale3d(' +
    //   val + ', ' + val + ', 1)';
  }



}
web.tendon.domElement=function(elem,target,options){
  var whole = $('.web-tendon',elem)
  if(!whole.length){
    whole=$(elem)
  }

  var handle=whole.find('.handle')
  var $elem = whole.find('.item')

  if(!$elem.length){
    $elem=handle
  }
  elem=$elem[0]


  var offset=$elem.offset;
  var icon=elem.children[0];
  var $icon=$(icon);


  var spring = springSystem.createSpring(50, 3);
  var springMouseFollow=springSystem.createSpring();
  var dragging=false;

  var returnToPlaceHolder;
  var win={width:$(window).width(),height:$(window).height()}
  var prevValX, prevValY,destX,destY;
  springMouseFollow.addListener({
    onSpringUpdate:function(spring){
      var val= spring.getCurrentValue();

      var center = true//spring.getEndValue();

      
      if(dragging){
        destX=web.tendon.pointer.x
        destY=web.tendon.pointer.y
        
        if(center){
          destX= destX- $elem.width() / 2;
          destY= destY- $elem.height() / 2;
        }
      }
      var valX=rebound.MathUtil.mapValueInRange(val,0,1,offset.left,destX)
      var valY=rebound.MathUtil.mapValueInRange(val,0,1,offset.top,destY)
      // console.log('tendon.pointer follow',val,valX);
      valX=Math.round(valX)
      valY=Math.round(valY)
      //if(valX==prevValX&&valY==prevValY&&!dragging){
      //  console.warn('premature stop')
      //  spring.setAtRest() 
      //  return
      //}
      //prevValX=valX
      //prevValY=valY
      $elem.css({'left':valX,'top':valY});
    },onSpringAtRest :function(spring){
      if(!dragging && returnToPlaceHolder){
        console.log('returning to placeholder')
        returnToPlaceHolder=false;
        $elem.css('position','static')
      }
    }
  })


  // Add a listener to the spring. Every time the physics
  // solver updates the Spring's value onSpringUpdate will
  // be called.
  spring.addListener({
    onSpringUpdate: function(spring) {
      console.log('bouncing')
      var val = spring.getCurrentValue();
      val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0);//from from, to to
      //console.log('click',val)
      scale(icon, val);
    }
  });
  
  var pullDistanceBeforeRelease=0

  var initialGrabLocation;
  // Listen for mouse down/up/out and toggle the
  //springs endValue from 0 to 1.
  $elem.on('mousedown.web-tendon touchstart.web-tendon', function(e) {
    root.toggleClass('no-select',true)
    if(!pullDistanceBeforeRelease){
      pullDistanceBeforeRelease=Math.sqrt(Math.pow($elem.width(),2)+Math.pow($elem.height(),2))/2 //radius of rectangle
    }
    initialGrabLocation=$elem.offset()
    initialGrabLocation.top+=$elem.height() / 2
    initialGrabLocation.left+=$elem.width() / 2
    spring.setEndValue(.2);
        //dragHandlers.length && dragHandlers.forEach(function(fn){fn()})
  });
  
  var root=$('html')
  var $window=$('window')
  

  var dragOn=function(){
    dragging=true;
    root.toggleClass('no-select',dragging)
    if(elem.style.position!='fixed'){
      var css=$elem.offset()
      css.position='fixed'
      css.width=$elem.innerWidth();
      css.height=$elem.innerHeight();
      $elem.css(css)
      $(elem.children[0]).one('animationiteration webkitAnimationIteration', function() {
        if(dragging){
          $(this).removeClass("alert");
        }
        });

      // web.onEvent('transitionEnd',elem.children[0],function(){
      
      //  web.cssClass(elem.children[0],'-unread')
      // })
    }
  }

  elem.addEventListener('mouseout.web-tendon', function() {
    if(dragging){
      return
    }
    spring.setEndValue(0);
  });

  elem.addEventListener('mouseover.web-tendon', function() {
    spring.setEndValue(0.05);
  });



  $(document).on('mousemove.web-tendon touchmove.web-tendon',function(e){
    if(!dragging){
      var point = e.originalEvent.touches
      point = point && point[0]
      point = point || e
      //console.info(initialGrabLocation,point,web.distance(initialGrabLocation,point))
      if(web.distance(initialGrabLocation,point)>pullDistanceBeforeRelease){
        //alert(initialGrabLocation+' '+ web.distance(initialGrabLocation,point))
        initialGrabLocation=undefined
        dragOn()
        console.log('dragging on')
      }
      return
    }
    e.preventDefault();
    console.log('setting new start')
    var rec = elem.getBoundingClientRect() //get left right coords based on viewport
    offset.left=rec.left
    offset.top=rec.top

    //offset = $elem.offset();
    //offset.top=offset.top+$window.scrollTop()
    //offset.left=offset.left+$window.scrollLeft()

    springMouseFollow.setCurrentValue(0,true)
    springMouseFollow.setEndValue(1)

    // var distance = Math.saqrt(Math.pow(e.clientX-centerX,2)+Math.pow(e.clientY-centerY,2))
    // springMouseFollow.setEndValue(1) //increase tention in distance
  })
  
  $(document).on('mouseup.web-tendon touchend.web-tendon',function(){ //TODO change this to event delegation
    initialGrabLocation=null
    spring.setEndValue(0)
    root.toggleClass('no-select',dragging)
    if(!dragging){
      return
    }
    dragging=false;
    var targ = $(elem.children[0])//TODO cache this
    if(targ.hasClass("unread")){ //TODO make this a callback per web.tendon
      targ.addClass('alert')
    }

    console.log('dragging off')
  

  // $(document).off('.draggingUserIcon') 
  })

  $(window).bind('keypress.web-tendon', function(e) {
    console.log(String.fromCharCode(e.which))
    if(String.fromCharCode(e.which)=='a'){
      //dragging=true
      springMouseFollow.setCurrentValue(0,true)
      springMouseFollow.setEndValue(1)
    }else{
      offset = $elem.parent().offset();
      dragging=false
      returnToPlaceHolder=true
       springMouseFollow.setCurrentValue(1)
        springMouseFollow.setEndValue(0)
    }
  });

  // Helper for scaling an element with css transforms.
  function scale(el, val) {
    el.style.mozTransform =
    el.style.msTransform =
    el.style.webkitTransform =
    el.style.transform = 'scale3d(' +
      val + ', ' + val + ', 1)';
  }
  var dragHandlers=[]
  this.onDragStart=function(fn){
    dragHandlers.push(fn)
  }


  if(!web.tendon.pointer){ //this gets run ONCE when you call tendon the first time
    web.tendon.pointer={x:0,y:0}
    $(document).on('mousemove.web-tendon touchmove.web-tendon',function(e){
        console.log('setting new destination')
        if(e.type=='touchmove'){
          var touch = e.originalEvent.touches[0]
          web.tendon.pointer.x=touch.pageX
          web.tendon.pointer.y=touch.pageY
        }else if(e.type=='mousemove'){
          web.tendon.pointer.x=e.clientX
          web.tendon.pointer.y=e.clientY
        }
    })
  }
  return this
}
