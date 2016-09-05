// LevelModel - PUBLIC

var LevelModel = function(id, collectables, ambientSounds){
    this.id = id;
    this.collectables = getCollectablesForLevel(id);
    this.ambientSounds = getAmbientSoundsForLevel(id);
};

module.exports = LevelModel;

// LevelModel - Private

function getCollectablesForLevel(levelID, customisedCollectables){
  if (customisedCollectables) {
    // since collectables could be manipulated by game master we need to write and read their positions
  } else {
    // TODO: look up default settings for collatables in a hashmap for level id
  }

  return null
}

function getAmbientSoundsForLevel(levelID){

    //Create scenereySounds - - - beach



  // TODO: look up default settings for ambient sounds in a hashmap for level id
  return null
}
