
// GameBoard code below

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function XYtoAngleRad(a, b) {
	return Math.atan2(a.y - b.y, a.x - b.x);
}

function AngleRadtoAngleDeg(rad) {
	return rad * (180 / Math.PI);
}

function AngleDegtoAngleRad(deg) {
	return deg * (Math.PI / 180);
}

function AngleRadtoXY(origin, dist, radAngle) {
	return 0;
}

function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > 0) return { x: dx / dist, y: dy / dist }; else return {x:0,y:0};
}

function randomInt(n) {
    return Math.floor(Math.random() * n);
}

function collideLeft (entity) {
    return (entity.x - entity.radius) < 0;
};

function collideRight (entity) {
    return (entity.x + entity.radius) > 800;
};

function collideTop (entity) {
    return (entity.y - entity.radius) < 0;
};

function collideBottom (entity) {
    return (entity.y + entity.radius) > 800;
};

  /**
   * Calculates the point of interception for one object starting at point
   * <code>a</code> with speed vector <code>v</code> and another object
   * starting at point <code>b</code> with a speed of <code>s</code>.
   * 
   * @see <a
   *      href="http://jaran.de/goodbits/2011/07/17/calculating-an-intercept-course-to-a-target-with-constant-direction-and-velocity-in-a-2-dimensional-plane/">Calculating
   *      an intercept course to a target with constant direction and velocity
   *      (in a 2-dimensional plane)</a>
   * 
   * @param a
   *            start vector of the object to be intercepted
   * @param v
   *            speed vector of the object to be intercepted
   * @param b
   *            start vector of the intercepting object
   * @param s
   *            speed of the intercepting object
   * @return vector of interception or <code>null</code> if object cannot be
   *         intercepted or calculation fails
   * 
   * @author Jens Seiler
   */
  function calculateInterceptionPoint(a, v, b, s) {
    var ox = a.x - b.x;
    var oy = a.y - b.y;
 
    var h1 = v.x * v.x + v.y * v.y - s * s;
    var h2 = ox * v.x + oy * v.y;
    var t;
    if (h1 == 0) { // problem collapses into a simple linear equation 
      t = -(ox * ox + oy * oy) / 2*h2;
    } else { // solve the quadratic equation
      var minusPHalf = -h2 / h1;
 
      var discriminant = minusPHalf * minusPHalf - (ox * ox + oy * oy) / h1; // term in brackets is h3
      if (discriminant < 0) { // no (real) solution then...
        return null;
      }
 
      var root = Math.sqrt(discriminant);
 
      var t1 = minusPHalf + root;
      var t2 = minusPHalf - root;
 
      var tMin = Math.min(t1, t2);
      var tMax = Math.max(t1, t2);
 
      t = tMin > 0 ? tMin : tMax; // get the smaller of the two times, unless it's negative
      if (t < 0) { // we don't want a solution in the past
        return null;
      }
    }
 
    // calculate the point of interception using the found intercept time and return it
    return answer = {x : (a.x + t * v.x), y : (a.y + t * v.y)};
  };