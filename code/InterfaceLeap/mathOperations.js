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

    return {
        x: inputVec.x * Math.cos(angle) - inputVec.y * Math.sin(angle),
        y: inputVec.x * Math.sin(angle) + inputVec.y * Math.cos(angle),
        z: inputVec.z
    }
}


/*
 inverse: An inverse distance model calculating the gain induced by the distance according to:
 refDistance / (refDistance + rolloffFactor * (distance - refDistance))
 exponential: An exponential distance model calculating the gain induced by the distance according to:
 pow(distance / refDistance, -rolloffFactor).
 */

/*linear: A linear distance model calculating the gain induced by the distance according to:
    1 - rolloffFactor * (distance - refDistance) / (maxDistance - refDistance)

    g =  (1 - f * (d - r)) / m - r

 gain = (1 - rolloff * (distance - panner.refDistance) / (panner.maxDistance - panner.refDistance))

*/

//gain = (1 - rolloff * (distance - panner.refDistance) / (panner.maxDistance - panner.refDistance))
//var g = (1- f * (d - r) / (m - r))


function calculateLinearDistance(panner, gain){

    var f = panner.rolloffFactor, r = panner.refDistance, m = panner.maxDistance, g = gain

    var d = (r * (f + g -1) - g * m + m) / f

    return d
}


//
// Math.pow(distance / panner.refDistance, -rolloff)
// g =  (d / r ) ^ - f
function calculateExponentialDistance(panner, gain){

    var f = panner.rolloffFactor, r = panner.refDistance, m = panner.maxDistance, g = gain

    var d = r * Math.pow(g, -1 / f )
    console.log("radius: ", d)

    return d
}

function calculateLinearAudioDistance(panner, amplitude) {


    // a = 1 - f * ( d - r) / (m - r) --- original

    /*
    *            max(min(d, d_max), d_ref) - d_ref
    *   a = 1-f -----------------------------------
    *                 d_max - d_ref
    *
    *
    *
    *
    *   a = 1-f * ( (max ( min( d , m ), r ) ) / (m - r) )
    *
    * */


    // d = (r * (a + f - 1) - a * m + m) / f  --- resort
    // f != 0
    // m != r
//    var distance = 1 - panner.rolloffFactor * ( x - panner.refDistance) / (panner.maxDistance - panner.refDistance);

/*    d = -((a-1) (m-r))\/f and r>=0 and m>r and f>0 and (-f m+m-r)\/(m-r)<a<(-f r+m-r)\/(m-r)*/

    var a = amplitude, m = panner.maxDistance, r = panner.refDistance, f = panner.rolloffFactor
    var d = - ( (a - 1) * (m -r) ) /  f

    return d;

//    return (panner.refDistance *  (amp + panner.rolloffFactor - 1) - amp * panner.maxDistance + panner.maxDistance ) / panner.rolloffFactor
}

/*
 inverse: An inverse distance model calculating the gain induced by the distance according to:
 amp = refDistance / (refDistance + rolloffFactor * (distance - refDistance))
 a =   r / (r + f * (d - r))

function calculateInverseAudioDistance(panner, distance) {
    return (panner.refDistance * (amp * (panner.rolloffFactor - 1) +1) ) / amp * panner.rolloffFactor
}
*/


function calculateAmplituteLinear(panner, distance){

    var f = panner.rolloffFactor, m = panner.maxDistance, d = distance, r = panner.refDistance

    var a = 1 - f * ( (Math.max ( Math.min( d , m ), r ) ) / (m - r) )

    return a;
}

/*  pow(distance / refDistance, -rolloffFactor)
*
*   a = pow(d / r , -f)
*
*   d = r * a^(-1/f)
* */
function calculateExponentialAudioDistance(panner, amp) {
    return panner.refDistance * Math.pow(amp, ( -1 /panner.rolloffFactor))
}

function calculateLinearLoudness(panner, distance) {
    return 1 - panner.rolloffFactor * (distance - panner.refDistance) / (panner.maxDistance - panner.refDistance);
}

/* refDistance / (refDistance + rolloffFactor * (distance - refDistance)) */
function calculateInverseLoudness(panner, distance) {
    return panner.refDistance / (panner.refDistance + panner.rolloffFactor * (distance - panner.refDistance))
}


function calculateSphericalShellLoudness(panner, distance){

    var gain = panner.refDistance /  Math.log(distance)

    if(distance >= panner.maxDistance) {
        gain = 0
    }
    return gain
}



// -log2(x-10) +1

// gain = -(1 / (m^2)) * (d^2) +1

function calculateCustomLoudnessContinuous(maxDistance, distance){

    var m = maxDistance, gain, x = distance

    gain = -(1 / (Math.pow(m, 2)) * (Math.pow(x, 2))) +1

    if(x > m) {

        gain = 0
    }
    return gain
}


// Custom gain. At the start it will be go down fast and nearer the end the gain will be decrease slower.
// Formula:         -(x/m)^2*((x/m)+(x/m)-1)+(x/m)^(x/m)
// a = x / m
// Short:           -(a)^2*((a)+(a)-1)+(a)^(a)
// Short:           -(a)^2*(2*a-1)+a^a
function calculateCustomLoudnessFast(maxDistance, distance){

    var m = maxDistance, gain, x = distance
    var a = x / m

    gain = - (Math.pow(a, 2)) * (2*a-1)+Math.pow(a, a)

    if(x > m) {
        gain = 0
    }
    return gain
}



//Formula:  -((x-2)/2)^2*((x-2)/2)
//          -((x-m)/m)^2*((x-m)/m)
function calculateCustomLoudnessSteep(maxDistance, distance){

    var m = maxDistance, gain, x = distance

    gain = - Math.pow(( ( x - m) / m),2) * ((x-m)/m)

    if(x > m) {
        gain = 0
    }
    return gain
}

// Custom gain calculation. In the beginning the volume will decrease slowly and goes fast nearer the end to the maximum distance.
// Formula: /
/*
(- ((( x / (2*2)) +
(x/(2*2))) ^ 2) / (( x / (2*2)) +
(x/(2*2))) ^ ((x/(2*2 )) +
(x/(2*2)))) +1
*/
/*

(- ((( x / (s)) +
(x/(s))) ^ 2) / (( x / (s)) +
(x/(s))) ^ ((x/(s )) +
(x/(s)))) +1
*/

// s = 2 * m
// / a = x / s
// Short: (-2a^2 / 2a ^ 2a) +1

// -(((x/(2*2))+(x/(2*2)))^2)/(((x/(2*2))+(x/(2*2))))^((x/(2*2))+(x/(2*2)))+1
// -(((x/(2*m))+(x/(2*m)))^2)/(((x/(2*m))+(x/(2*m))))^((x/(2*m))+(x/(2*m)))+1

// -(((x/(2*m))+(x/(2*m)))^2)/(((x/(2*m))+(x/(2*m))))^((x/(2*m))+(x/(2*m)))+1
// -((2*a)^2)/((2*a))^(2*a) +1


//(- ((2 * ( x / (2*2))) ^ 2) / (2*( x / (2*2)))^(   2*(x/(2*2 )))) +1

// (- (((x / (2))) ^ 2) / (( x / (2)))^(  (x/(2 )))) +1

// (- ( (x / 2  )  ^ 2) / (( x / 2))^(  (x/2))) +1
// (- ( (x / 2  )  ^ 2) / ( x / 2)^(  (x/2))) +1

// Shortend version:
// (- ( (x / 2 )  ^ 2) / ( x / 2)^(  x/2 ) ) +1

function calculateCustomLoudnessSlow(maxDistance, distance){

    var m = maxDistance, gain, x = distance
    var a = x / m

    gain = (-( Math.pow(((x/(2*m))+(x/(2*m))),2) )/  Math.pow( (((x/(2*m))+(x/(2*m)))),((x/(2*m))+(x/(2*m))) )   )+1
//    gain = -(Math.pow(2*a,2)) / Math.pow(2*a,2*a) +1

    if(x > m) {

        gain = 0
    }
    return gain
}


function calculateDistance(v, w){

    var tempX = w.x - v.x
    var tempY = w.y - v.y
    var tempZ = w.z - v.z
    var sum =  Math.pow(tempX, 2) + Math.pow(tempY, 2) + Math.pow(tempZ, 2)
    return Math.sqrt( sum )
}

/*
azimuth = cos^-1 * ( y / Sqrt(x^2 + y2 + z^) )
 */
function calculateAzimuth(x, y , z){

    var azimuth = Math.pow( Math.cos, -1) * ( y / Math.sqrt( Math.pow(x,2 + Math.pow(y, 2) + Math.pow(z, 2)) ))
    return azimuth
}

/*
 phi = tan^-1 * (-z / x)
 */
function calculatePhi(x, y , z){

    var phi = Math.pow( Math.tan( -z/x ), -1)
    return phi
}





























function dotProduct(v1, v2) {

    var d = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    return d;
}