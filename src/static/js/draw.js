// Please refactor me, this is mostly a complete car crash with globals everywhere.

tool.minDistance = 10;
tool.maxDistance = 45;
paper.settings.applyMatrix=false
console.log('@settings@',settings)

var room = window.location.pathname.split("/")[2];
var preferences = {
  longClick:300
  ,mouseButtonMap:['primary','middle','secondary','back','forward']
}

var debug=false
function simplePoly(original,options){ //DEV NOTE: Options.simplify isn't suggested to be used
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
  if(event){
    this.point =((event.point)?event.point:event)
  }
  this.group.position=this.point;
  this.group.visible=true
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

var ViewZoom = (function () {
    function ViewZoom(project,ignoreLayers) {
        var _this = this;
        this.factor = 1.25;
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

        $(view.element).mousewheel(function (event) {
            var mousePosition = new paper.Point(event.offsetX, event.offsetY);
            var deltaY = event.originalEvent.deltaY
            var deltaX = event.originalEvent.deltaX
            event.preventDefault()
            if(event.shiftKey){
              if(Math.abs(deltaY)>Math.abs(deltaX)){
                _this.changeZoomCentered(deltaY, mousePosition);
              }else{
                //_this.changeZoomCentered(deltaY, mousePosition,.1);
              }
              return
            }
              _this.pan(deltaX,deltaY,event.deltaFactor)


        });
        view.on("mousedown", function (ev) {
            _this.viewCenterStart = view.center;
            // Have to use native mouse offset, because ev.delta 
            //  changes as the view is scrolled.
            _this.mouseNativeStart = new paper.Point(ev.event.offsetX, ev.event.offsetY);
        });
        view.on("mousedrag", function (ev) {
            if (_this.viewCenterStart) {
                var nativeDelta = new paper.Point(ev.event.offsetX - _this.mouseNativeStart.x, ev.event.offsetY - _this.mouseNativeStart.y);
                // Move into view coordinates to subract delta,
                //  then back into project coords.
                view.center = view.viewToProject(view.viewToProject(_this.viewCenterStart)
                    .subtract(nativeDelta));
            }
        });
        view.on("mouseup", function (ev) {
            if (_this.mouseNativeStart) {
                _this.mouseNativeStart = null;
                _this.viewCenterStart = null;
            }
        });

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
mc.on("pinch pan", function (event) {

    var transforms = [];

    // Adjusting the current pinch/pan event properties using the previous ones set when they finished touching
    currentScale = adjustScale * event.scale;
    currentDeltaX = adjustDeltaX + (event.deltaX / currentScale);
    currentDeltaY = adjustDeltaY + (event.deltaY / currentScale);



    var x=event.offsetX||event.center.x||view.center.x
    var y=event.offsetY||event.center.y||view.center.y
    var mousePosition = new paper.Point(x, y);
    currentScale=currentScale-1
    //_this.changeZoomCentered(currentScale,mousePosition)
    //alert(currentScale)
    _this.pan(currentDeltaX,currentDeltaY)
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    event.gesture.stopPropagation()
    event.gesture.preventDefault()
    // Concatinating and applying parameters.
    //transforms.push('scale({0})'.format(currentScale));
    //transforms.push('translate({0}px,{1}px)'.format(currentDeltaX, currentDeltaY));
    //webpage.style.transform = transforms.join(' ');

});


mc.on("panend pinchend", function (event) {

    // Saving the final transforms for adjustment next time the user interacts.
    adjustScale = currentScale;
    adjustDeltaX = currentDeltaX;
    adjustDeltaY = currentDeltaY;
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
    event.gesture.stopPropagation()
    event.gesture.preventDefault()
});





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
        var offset= new paper.Point(deltaX, -deltaY);
        console.info('factor',factor)
        if(factor){
          offset = offset.multiply(factor);
        }
        offset=offset*(1/ (this.layerScale||view.zoom)) //inverse proportion to zoom level (makes zooming out pan faster)
        var pt = view.center.add(offset);
        view.center=pt
        return pt
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
    ViewZoom.prototype.changeZoomCentered = function (delta, mousePos,factor) {

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


$(document).ready(function() {
  var drawurl = window.location.href.split("?")[0]; // get the drawing url
  $('#embedinput').val("<iframe name='embed_readwrite' src='" + drawurl + "?showControls=true&showChat=true&showLineNumbers=true&useMonospaceFont=false' width=600 height=400></iframe>"); // write it to the embed input
  $('#linkinput').val(drawurl); // and the share/link input
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the drawtool css to show it as active

  $('#myCanvas').bind('mousewheel DOMMouseScroll', function(event) {
    // // var point = paper.DomEvent.getOffset(event, $('#canvas')[0]);
    // // //With this I can then convert to project space using view.viewToProject():
    // // point = paper.view.viewToProject(point);
    // // var delta = event.detail||event.wheelDelta
    // // scrolled(point, -event.wheelDelta);

    //     var mousePosition, newZoom, offset, viewPosition, _ref1;
    //     if (event.shiftKey) {
    //       view.center = panAndZoom.changeCenter(view.center, event.deltaX, event.deltaY, event.deltaFactor);
    //       return event.preventDefault();
    //     } else if (event.altKey) {
    //       mousePosition = new paper.Point(event.offsetX, event.offsetY);
    //       viewPosition = view.viewToProject(mousePosition);
    //       _ref1 = panAndZoom.changeZoom(view.zoom, event.deltaY, view.center, viewPosition), newZoom = _ref1[0], offset = _ref1[1];
    //       view.zoom = newZoom;
    //       view.center = view.center.add(offset);
    //       event.preventDefault();
    //       return view.draw();
    //     }







  });

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

$('#clearImage').click(function() {
  var p = confirm("Are you sure you want to clear the drawing for everyone?");
  if (p) {
    clearCanvas();
    socket.emit('canvas:clear', room);
  }
});

$('.toggleBackground').click(function() {
  $('#myCanvas').toggleClass('whiteBG');
});

// --------------------------------- 
// DRAWING EVENTS


var send_paths_timer;
var timer_is_active = false;
var paper_object_count = 0;
var mouseTimer = 0; // used for getting if the mouse is being held down but not dragged IE when bringin up color picker
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
          rgba: active_color.components,
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


var Select=function(){
  this.item_move_delta;
  this.send_item_move_timer;
  this.item_move_timer_is_active = false;
}
Select.prototype.constructor=Select;
Select.prototype.name='select'
Select.prototype.onMouseDown=function(event){

    // Select item
    $("#myCanvas").css("cursor", "pointer");
    if (event.item) {
      // If holding shift key down, don't clear selection - allows multiple selections
      if (!event.modifiers.shift) {
        paper.project.activeLayer.selected = false;
      }
      event.item.selected = true;
    } else {
      paper.project.activeLayer.selected = false;
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




  tool.minDistance = 10;
  window.view=view

function pathToObject(o){
  return {
    pathData:o.pathData
    ,strokeColor:o.strokeColor
    ,strokeWidth:o.strokeWidth
    ,fillColor:o.fillColor
  }
}

var path;
var brushes={
  draw:{
    name:'draw'
    ,poll:function(data){
      var st = JSON.stringify(data)
      data.path= new Array();
      return st
    }
    ,onMouseDown:function(event){
       path = new Path();
       path.closed=true
       console.log(event.button)
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
        path.fillColor=strokeColor

        path.add(event.point);
        path.name = uid + ":" + (++paper_object_count);


        // The data we will send every 100ms on mouse drag
        path_to_send = {
          name: path.name,
          rgba: strokeColor.components,
          start: project.activeLayer.localToGlobal(path.lastSegment.point),
          path: [],
          pathData:path.pathData,
          tool: brush.name
        };
    }
    ,onMouseDrag:function(event){

    var step = event.delta / 2;
    step.angle += 90;
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;



    path.add(top);
    path.insert(0, bottom);
    path.smooth();


    // Add data to path
    path_to_send.path.push({
      top: project.activeLayer.localToGlobal(path.lastSegment.point),
      bottom: project.activeLayer.localToGlobal(path.firstSegment.point)
    });
    path_to_send.pathData=path.data

  },onMouseUp:function(event){
       // Close the users path
    path.add(event.point);

    path.remove()
    var poly = simplePoly(path)

    // for (var i = 0; i < intersections.length; i++) {
    //     var intersectionPath = new Path.Circle({
    //         center: intersections[i].point,
    //         radius: 4,
    //         fillColor: 'red'
    //     });
    // }


    // Send the path to other users
    path_to_send.end = view.viewToProject(path.lastSegment.point);
    path_to_send.pathData = path.pathData
    // This covers the case where paths are created in less than 100 seconds
    // it does add a duplicate segment, but that is okay for now.
    socket.emit('draw:progress', room, uid, JSON.stringify(path_to_send));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));

    // Stop new path data being added & sent
    path_to_send.path = new Array();

  }


  },

  paint:{
    name:'paint',
    poll:function(data){
      this.debugLayer.activate()

      // if(path.segments.length<3){
      //   return
      // }
      var glob = path

      path=new Path([path.firstSegment,path.lastSegment])
      path.fillColor=active_color
      path.closed=true


      //glob.remove()
      testGlobs.push(glob.pathData)
      console.log('masterGlob',this.masterGlob,path,glob)
      if(!glob){
        return
      }
      this.defaultLayer.activate()
      var addition=this.masterGlob.unite(glob)
      
      if(addition){
        this.masterGlob.remove()
        console.log('new glob',addition)
        this.masterGlob=addition
      }
      console.log('emmit:',glob)
      data.globs.push(glob.pathData)

      var st = JSON.stringify(data) //take a snapshot
      data.globs= []
      return st
    }
    ,onMouseDown:function(event){
      this.defaultLayer=project.activeLayer
      this.debugLayer=new Layer()
      this.debugLayer.name='debug:paintGlobs'
      this.debugLayer.visible=debug
      this.defaultLayer.activate()

      this.iGlob=0

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
        path.name = uid + ":" + (++paper_object_count)+':'+this.iGlob

        this.masterGlob=new Path.Circle({
              center: event.point,
              radius: 4,
              fillColor: 'gold'
          });

        // The data we will send every 100ms on mouse drag
        path_to_send = {
          timeStamp:Date.now(),
          artist:uid,
          name: path.name,
          tool: brush.name,
          options:pathToObject(path),
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
    var top = event.middlePoint + step;
    var bottom = event.middlePoint - step;



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


    // Send the path to other users
    path_to_send.end = view.viewToProject(path.lastSegment.point);
    path_to_send.pathData = path.pathData
    // This covers the case where paths are created in less than 100 seconds
    // it does add a duplicate segment, but that is okay for now.


    socket.emit('draw:progress', room, uid, this.poll(path_to_send));
    socket.emit('draw:end', room, uid, JSON.stringify(path_to_send));

    // Stop new path data being added & sent
    path_to_send.path = new Array();
    !debug && this.debugLayer.remove()

  },progressExternalPath:function(points,path){
    if(!path){
      return
    }
      if(points.pathData){
        path=new Path(points.pathData)
      }else{
        _.forEach(points.globs,function(glob){
          glob = new Path(glob)
          path.remove()
          path=path.union(glob)
        })
      }
    return path
    }
  }
  ,pencil:new Pencil({smoothing:true,closed:false,outline:false})
  ,select:new Select()
  ,lineEditor:new LineEditor()
  ,circle:{
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
  }
}


var brush=brushes.draw
var picker = $('#mycolorpicker');
function onMouseDown(event) {
  if (event.which === 2) return; // If it's middle mouse button do nothing -- This will be reserved for panning in the future.
  $('.popup').fadeOut();

  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]
  
  // // Hide color picker if it is visible already
  // var picker = $('#mycolorpicker');
  // if (picker.is(':visible')) {
  //   picker.toggle(); // show the color picker
  // }

  mouseTimer = 0;
  mouseClickHeld = setInterval(function() { // is the mouse being held and not dragged?
    mouseTimer++;
    if (mouseTimer > preferences.longClick) {
      mouseTimer = 0;
      clearInterval(mouseClickHeld);
      if(brush && brush.onMouseLongClick){
        brush.onMouseLongClick(event)
      } else{ //default function for on mouse long click

          picker.show(); // show the color picker
          if (picker.is(':visible')) {
            // Mad hackery to get round issues with event.point
            var targetPos = $(event.event.target).position();
            var point = event.point + new Point(targetPos.left, targetPos.top);
            positionPickerInCanvas(point);
          }
      }
    }else{ //it wasn't a long click so hide the picker and do whatever 
       picker.hide()
       if(brush && brush.onMouseLongClick){
        brush.onMouseLongClick(false) //THIS SENDS FALSE instead of an event object so it can be used to clean up long click things
      }
    }
  }, 100);


      // Send paths every 100ms
    if (!timer_is_active) {
      send_paths_timer = setInterval(function() { //TODO dont use setinterval cause it is bad. use settimeout cause it is good. duh
        var jsonString = brush.poll(path_to_send)
        if(typeof jsonString!= 'string'){
          jsonString=JSON.stringify(jsonString)
        }
        socket.emit('draw:progress', room, uid, jsonString);
      }, 100);
    }

    timer_is_active = true;
  
  if(brush){
    if(brush.onMouseDown){
      (brush.onMouseDown[event.button]||brush.onMouseDown).call(brush,event)
    }
  }
}


function onMouseDrag(event) {

  mouseTimer = 0;
  clearInterval(mouseClickHeld);

  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]


  if(brush){
    if(brush.onMouseDrag){
      (brush.onMouseDrag[event.button]||brush.onMouseDrag).call(brush,event)
    }
  }
}
function onMouseUp(event){
  //modify the tool event to represent the button we wish to identify as
  event.button=preferences.mouseButtonMap[event.event.button]
  clearInterval(mouseClickHeld);

  if(brush){
    if(brush.onMouseUp){
      (brush.onMouseUp[event.button]||brush.onMouseUp).call(brush,event)
    }
  }
      clearInterval(send_paths_timer);
      timer_is_active=false
}
var lastMousePosition;
function onMouseMove(event){
  lastMousePosition=event
}
/*ktsuttle code end*/




var key_move_delta;
var send_key_move_timer;
var key_move_timer_is_active = false;
var shiftMultiplier=10


function onKeyDown(event) {
    if(event.key == 'c'){
      graffinityPointer.show()
      return
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
  if (event.key == "delete") {
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
$('#myCanvas').bind('dragover dragenter', function(e) {
  e.preventDefault();
});

$('#myCanvas').bind('drop', function(e) {
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
  brush=brushes.circle
  $('#myCanvas').css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});

$('#pencilTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#pencilTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush=brushes.pencil
  $('#myCanvas').css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});
$('#drawTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush=brushes.draw
  $('#myCanvas').css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});
$('#paintTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#drawTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush=brushes.paint
  $('#myCanvas').css('cursor', 'pointer');
  paper.project.activeLayer.selected = false;
});
$('#selectTool').on('click', function() {
  $('#editbar > ul > li > a').css({
    background: ""
  }); // remove the backgrounds from other buttons
  $('#selectTool > a').css({
    background: "#eee"
  }); // set the selecttool css to show it as active
  brush=brushes.select
  $('#myCanvas').css('cursor', 'default');
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
  var canvas = document.getElementById('myCanvas');
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
var radialMenu,graffinityPointer,viewZoom,hud,drawLayer;
socket.on('user:connect', function(user_count) {
  console.log("user:connect");
  drawLayer=paper.project.activeLayer;
  
  hud=new Layer()
  hud.name='hud'

  hud.activate()
  radialMenu=new RadialMenu()
  graffinityPointer=new GraffinityPointer()
  drawLayer.activate()
  console.log('@drawLayer@',drawLayer)

  viewZoom=new ViewZoom(project,[hud])
  viewZoom.setZoomRange([.001,Number.MAX_VALUE-1])

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

// Continues to draw a path in real time
progress_external_path = function(points, artist) {

  var path = external_paths[artist];
  var fn=brushes[points.tool].progressExternalPath
  if(fn){
    path=fn(points,path)
  }else{ //TODO move this to pencil and draw functions

    // The path hasnt already been started
    // So start it
    if (!path) {

      // Creates the path in an easy to access way
      external_paths[artist] = new Path();
      path = external_paths[artist];

      // Starts the path
      var start_point = new Point(points.start[1], points.start[2]);
      var color = new Color(points.rgba[0], points.rgba[1], points.rgba[2], points.rgba[3]);
      if (points.tool == "draw") {
        path.fillColor = color;
      } else if (points.tool == "pencil") {
        path.strokeColor = color;
        path.strokeWidth = 2;
      }

      path.name = points.name;
      path.add(start_point);

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
