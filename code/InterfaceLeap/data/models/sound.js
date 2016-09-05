// PlayerModel
module.exports = {
  id: null,
  resourcePath: "",

  init: function(resourcePath){
    this.id = getNewUniqueIdentifier()
    this resourcePath = resourcePath
    return this
  }
};

// private fucntions

function getNewUniqueIdentifier(){
  return 1
}
