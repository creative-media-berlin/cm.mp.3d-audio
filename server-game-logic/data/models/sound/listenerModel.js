var soundDebugContainer = document.getElementById('sound-debug-text');

var ListenerModel = function (audioCtx) {
  this.listenerObject = audioCtx.listener
  this.position = { x:0, y:0, z:0 }
  this.setPosition(0, 0, 0)
  // set default orientation
  this.listenerObject.setOrientation(0, 0, -1, 0, 1, 0);
}

ListenerModel.prototype.setPosition = function (x, y, z) {
  this.position.x = x
  this.position.y = y
  this.position.z = z
  this.listenerObject.setPosition(x, y, z)
}

ListenerModel.prototype.setOrientation = function (viewDirection) {
  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML  + "<b><u>Listener vd:</b></u> <br>x: " + viewDirection.x + "<br>y: " + viewDirection.y + "<br>z: " + viewDirection.z + "<br>"
  var topHeadVector = rotateAxeX(viewDirection, 90);
  // soundDebugContainer.innerHTML = soundDebugContainer.innerHTML  + "<b><u>Listener topHeadVector vd: x: <b><u>" + topHeadVector.x + " y: " + topHeadVector.y + " z: " + topHeadVector.z + "\n"
  this.listenerObject.setOrientation(viewDirection.x, viewDirection.y, viewDirection.z, topHeadVector.x, topHeadVector.y, topHeadVector.z);
}

module.exports = ListenerModel

