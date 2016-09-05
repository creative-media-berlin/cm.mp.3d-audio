// PlayerModel

var PlayerModel = function(id, location){
  this.id = id
  this.location = location
  this.viewDirection = null
  this.score = 0
  this.active = true
}

// private functions

module.exports = PlayerModel