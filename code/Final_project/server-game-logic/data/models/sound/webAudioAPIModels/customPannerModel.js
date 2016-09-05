var CustomPanner = function(position) {
    this.position = position
    this.panner = createPanner(this.position)
}

CustomPanner.prototype.createPanner = function(pos) {
    var panner = this.audioCtx.createPanner()
    panner.panningModel = 'HRTF'
    panner.distanceModel = distanceModel

    panner.refDistance = 1
    panner.maxDistance = 100000;

    panner.rolloffFactor = 1

    panner.coneInnerAngle = 360
    panner.coneOuterAngle = 0
    panner.coneOuterGain = 0
    panner.setOrientation(0,1,0)
    panner.setPosition(pos.x, pos.y, pos.z);
    panner.channelCountMode = 'inverse';
    return panner;
}

module.exports = CustomPanner