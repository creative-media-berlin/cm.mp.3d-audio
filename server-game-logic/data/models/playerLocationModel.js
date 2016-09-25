// PlayerLocationModel

var PlayerLocationModel = function(hipPosition, distanceToHead){
  this.hipPosition = hipPosition  // { x, y, z}
  this.distanceToHead = distanceToHead  * 0.1
};

PlayerLocationModel.prototype.getString = function(){
  return "hipPosition: x: " + this.hipPosition.x + " y: " + this.hipPosition.y + " z: " +  this.hipPosition.z + "\ndistanceToHead: " + distanceToHead
}

module.exports = PlayerLocationModel

// private functions


