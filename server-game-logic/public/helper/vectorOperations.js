
//vectorOperations.js

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

function rotateAxeY(inputVec, angle) {
  /*
   | cos θ    0   sin θ| |x|   | x cos θ + z sin θ|   |x'|
   |   0      1       0| |y| = |         y        | = |y'|
   |−sin θ    0   cos θ| |z|   |−x sin θ + z cos θ|   |z'|
   */
  angle *= 0.0174533
  return {
    x: inputVec.x * Math.cos(angle) + inputVec.z * Math.sin(angle),
    y: inputVec.y,
    z: -inputVec.x * Math.sin(angle) + inputVec.z * Math.cos(angle)
  }
}

function rotateAxeX(inputVec, angle) {
  /*
   |1     0           0| |x|   |        x        |   |x'|
   |0   cos θ    −sin θ| |y| = |y cos θ − z sin θ| = |y'|
   |0   sin θ     cos θ| |z|   |y sin θ + z cos θ|   |z'|
   */
  angle *= 0.0174533
  return {
    x: round(inputVec.x, 2),
    y: round((inputVec.y * Math.cos(angle) - inputVec.z * Math.sin(angle)),2),
    z: round((inputVec.y * Math.sin(angle) + inputVec.z * Math.cos(angle)),2)
  }
}

function rotateAxeZ(inputVec, angle) {
  /*
   |cos θ   −sin θ   0| |x|   |x cos θ − y sin θ|   |x'|
   |sin θ    cos θ   0| |y| = |x sin θ + y cos θ| = |y'|
   |  0       0      1| |z|   |        z        |   |z'|
   */
  angle *= 0.0174533
  return {
    x: inputVec.x * Math.cos(angle) - inputVec.y * Math.sin(angle),
    y: inputVec.x * Math.sin(angle) + inputVec.y * Math.cos(angle),
    z: inputVec.z
  }
}

function dotProduct(v1, v2) {
  var d = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  return d;
}


function getDistance(v1, v2) {
  var v = substractVector(v1, v2)
  return getNorm(v)
}

function getNorm(v){
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

function substractVector(v1, v2) {
  return {
    x: v1.x - v2.x,
    y: v1.y - v2.y,
    z: v1.z - v2.z
  }
}

function crossProduct(v1, v2){
  return {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x
  }
}

function getRotationMatrix(v){
  return [
    [0, -v.z, v.y],
    [v.z, 0, -v.x],
    [-v.y, v.x, 0]
  ];
}

function matrixMultiplication(m, v){
  return {
    x: m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
    y: m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
    z: m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z,
  }
}

