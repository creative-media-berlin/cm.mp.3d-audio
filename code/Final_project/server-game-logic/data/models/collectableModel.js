// CollectableModel

var CollectableModel = function(id, maxDistance, location, soundResourceRef, points){
  this.id = id
  this.location = location
  this.soundResourceRef = soundResourceRef
  this.points = points
  this.maxDistance = maxDistance
};

// private functions

module.exports = CollectableModel