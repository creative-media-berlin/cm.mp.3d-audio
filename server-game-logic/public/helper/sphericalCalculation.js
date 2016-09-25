
function calculatePhi(x, y) {
    return Math.atan2(y, x) * 180 / Math.PI
}

function calculateTheta(x, y, z) {
    var theta = Math.acos(z / Math.sqrt(x*x + y*y + z*z))

    theta = theta * 180 / Math.PI
    theta = -theta + 90
    return theta
}



