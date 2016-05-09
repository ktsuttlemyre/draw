
var RadialMenu=function(layer,collection){
  this.layer=layer
  

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

var HUD=function(element,layer){
  this.hudCanvas=element
  this.radialMenu=new RadialMenu(layer)
}
HUD.prototype.constructor=HUD
HUD.prototype.show=function(){
      this.radialMenu.show()
      this.hudCanvas.fadeIn()
    }
HUD.prototype.hide=function(){
      this.radialMenu.hide()
      this.hudCanvas.fadeOut()
    }
HUD.prototype.toggle=function(){
      if(hudCanvas.is(':visible')){
        hud.hide()
      }else{
        hud.show()
      }
    }


var hudCanvas
$(function(){
  hudCanvas=$('#hudCanvas')
  hudCanvas.hide()
  window.hud=new HUD(hudCanvas,paper.activeLayer)
})
