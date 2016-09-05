// PlayerModel

var PlayerModel = function(id, name, location){
  this.id = id
  this.piId = getCorrespondingPiId(id)
  this.name = name
  this.location = location
  this.score = 0
}

// private functions

function getCorrespondingPiId(id){
  return id
}

module.exports = PlayerModel