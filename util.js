/*
* Copyright (c) 2012 Ju Hyung Lee
*
* Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
* and associated documentation files (the "Software"), to deal in the Software without 
* restriction, including without limitation the rights to use, copy, modify, merge, publish, 
* distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
* Software is furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all copies or 
* substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING 
* BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// Create the convex hull using the Gift wrapping algorithm
// http://en.wikipedia.org/wiki/Gift_wrapping_algorithm
function createConvexHull(points) {	
	// Find the right most point on the hull
	var i0 = 0;
	var x0 = points[0].x;
	for (var i = 1; i < points.length; i++) {
		var x = points[i].x;
		if (x > x0 || (x == x0 && points[i].y < points[i0].y)) {
			i0 = i;
			x0 = x;
		}
	}

	var n = points.length;
	var hull = [];
	var m = 0;
	var ih = i0;

	while (1) {
		hull[m] = ih;

		var ie = 0;
		for (var j = 1; j < n; j++) {
			if (ie == ih) {
				ie = j;
				continue;
			}

			var r = vec2.sub(points[ie], points[hull[m]]);
			var v = vec2.sub(points[j], points[hull[m]]);
			var c = vec2.cross(r, v);
			if (c < 0) {
				ie = j;
			}

			// Collinearity check
			if (c == 0 && v.lengthsq() > r.lengthsq()) {
				ie = j;
			}
		}

		m++;
		ih = ie;

		if (ie == i0) {
			break;
		}		
	}

	// Copy vertices
	var newPoints = [];
	for (var i = 0; i < m; ++i) {
		newPoints.push(points[hull[i]]);
	}

	return newPoints;
}