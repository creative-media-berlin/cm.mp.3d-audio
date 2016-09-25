// AmbientModel

var AmbientModel = function(id, maxDistance, location, soundResourceRef, points){
  this.id = id
  this.location = location
  this.soundResourceRef = soundResourceRef
  this.maxDistance = maxDistance
};

// private functions

module.exports = AmbientModel