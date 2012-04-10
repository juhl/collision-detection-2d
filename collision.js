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

SimplexVertex = function() {
	this.p1 = new vec2;	// support point in polygon1
	this.p2 = new vec2;	// support point in polygon2
	this.p = new vec2;	// p2 - p1
	this.u = 1;			// unnormalized barycentric coordinate for closest point
	this.index1 = 0;	// p1 index
	this.index2 = 0;	// p2 index
}

SimplexVertex.prototype.copy = function(v) {
	this.p1.copy(v.p1);
	this.p2.copy(v.p2);
	this.p.copy(v.p)
	this.u = v.u;
	this.index1 = v.index1;
	this.index2 = v.index2;
}

Simplex = function() {
	this.verts = new Array(3);
	this.verts[0] = new SimplexVertex;
	this.verts[1] = new SimplexVertex;
	this.verts[2] = new SimplexVertex;
	this.count = 0;
	this.divisor = 1;
}

Simplex.prototype.copy = function(s) {
	this.verts[0].copy(s.verts[0]);
	this.verts[1].copy(s.verts[1]);
	this.verts[2].copy(s.verts[2]);
	this.count = s.count;
	this.divisor = s.divisor;
}

// Find direction toward origin.
Simplex.prototype.getSearchDirection = function() {
	switch (this.count) {
	case 1:
		return vec2.neg(this.verts[0].p);
	case 2:
		var ab = vec2.sub(this.verts[1].p, this.verts[0].p);
		var sgn = vec2.cross(this.verts[0].p, ab);
		if (sgn > 0) {
			return vec2.perp(ab);
		}
		return vec2.rperp(ab);
	}

	//assert(0);
	return vec2.zero;
}

// Compute closest simplex point to origin
Simplex.prototype.getClosestPoint = function() {
	switch (this.count) {
	case 1:
		return this.verts[0].p;
	case 2:
		return vec2.lerp(this.verts[0].p, this.verts[1].p, this.verts[1].u / this.divisor);
	case 3:
		var s = 1 / this.divisor;
		var p = vec2.scale(this.verts[0].p, this.verts[0].u * s);
		p.addself(vec2.scale(this.verts[1].p, this.verts[1].u * s));
		p.addself(vec2.scale(this.verts[2].p, this.verts[2].u * s));
		return p;
	}

	//assert(0);
	return vec2.zero;
}

// Compute witness points between two polygons
Simplex.prototype.getWitnessPoints = function() {
	var w = {};

	switch (this.count) {
	case 1:
		w.p1 = this.verts[0].p1;
		w.p2 = this.verts[0].p2;
		return w;
	case 2:
		var s = this.verts[1].u / this.divisor;
		w.p1 = vec2.lerp(this.verts[0].p1, this.verts[1].p1, s);
		w.p2 = vec2.lerp(this.verts[0].p2, this.verts[1].p2, s);
		return w;
	case 3:
		var s = 1 / this.divisor;
		w.p1 = vec2.scale(this.verts[0].p1, this.verts[0].u * s);
		w.p1.addself(vec2.scale(this.verts[1].p1, this.verts[1].u * s));
		w.p1.addself(vec2.scale(this.verts[2].p1, this.verts[2].u * s));
		w.p2 = w.p1.duplicate();
		//w.p2 = vec2.scale(this.verts[0].p2, this.verts[0].u * s);
		//w.p2.addself(vec2.scale(this.verts[1].p2, this.verts[1].u * s));
		//w.p2.addself(vec2.scale(this.verts[2].p2, this.verts[2].u * s));
		return w;
	}

	//assert(0);
	return null;
}

// Closest p on line segment to Q.
// Voronoi regions: A, B, AB
Simplex.prototype.solve2 = function(q) {
	var a = this.verts[0].p;
	var b = this.verts[1].p;
	var ab = vec2.sub(b, a);

	// Region A
	var aq = vec2.sub(q, a);
	var v = vec2.dot(aq, ab);
	if (v <= 0) {
		this.count = 1;		
		this.verts[0].u = 1;
		this.divisor = 1;
		return;
	}

	// Region B
	var bq = vec2.sub(q, b);
	var u = -vec2.dot(bq, ab);
	if (u <= 0) {
		this.count = 1;
		this.verts[0].copy(this.verts[1]);
		this.verts[0].u = 1;
		this.divisor = 1;
		return;
	}

	// Region AB
	this.count = 2;	
	this.verts[0].u = u;
	this.verts[1].u = v;
	this.divisor = ab.lengthsq();
}

// Closest p on triangle to Q.
// Voronoi regions: A, B, C, AB, BC, CA, ABC
Simplex.prototype.solve3 = function(q) {
	var a = this.verts[0].p;
	var b = this.verts[1].p;
	var c = this.verts[2].p;

	var ab = vec2.sub(b, a);
	var bc = vec2.sub(c, b);
	var ca = vec2.sub(a, c);

	// Region A
	var aq = vec2.sub(q, a);
	var vab = vec2.dot(aq, ab);
	var uca = -vec2.dot(aq, ca);
	if (vab <= 0 && uca <= 0) {		
		this.count = 1;
		this.verts[0].u = 1;
		this.divisor = 1;
		return;
	}

	// Region B
	var bq = vec2.sub(q, b);
	var vbc = vec2.dot(bq, bc);
	var uab = -vec2.dot(bq, ab);
	if (vbc <= 0 && uab <= 0) {
		this.count = 1;
		this.verts[0].copy(this.verts[1]);
		this.verts[0].u = 1;
		this.divisor = 1;
		return;
	}

	// Region C
	var cq = vec2.sub(q, c);
	var vca = vec2.dot(cq, ca);
	var ubc = -vec2.dot(cq, bc);
	if (vca <= 0 && ubc <= 0) {
		this.count = 1;
		this.verts[0].copy(this.verts[2]);
		this.verts[0].u = 1;
		this.divisor = 1;
		return;
	}

	// Compute signed triangle area x 2.
	var area = -vec2.cross(ab, ca);

	// Region AB
	var wabc = vec2.cross(aq, bq);
	if (uab > 0 && vab > 0 && (wabc * area < 0 || area == 0)) {
		this.count = 2;
		this.verts[0].u = uab;
		this.verts[1].u = vab;
		this.divisor = ab.lengthsq();
		return;
	}

	// Region BC
	var uabc = vec2.cross(bq, cq);
	if (ubc > 0 && vbc > 0 && uabc * area < 0) {
		this.count = 2;
		this.verts[0].copy(this.verts[1]);
		this.verts[1].copy(this.verts[2]);
		this.verts[0].u = ubc;
		this.verts[1].u = vbc;
		this.divisor = bc.lengthsq();
		return;
	}

	// Region CA
	var vabc = vec2.cross(cq, aq);
	if (uca > 0 && vca > 0 && vabc * area < 0) {
		this.count = 2;
		this.verts[1].copy(this.verts[0]);
		this.verts[0].copy(this.verts[2]);
		this.verts[0].u = uca;
		this.verts[1].u = vca;
		this.divisor = ca.lengthsq();
		return;
	}	

	// The triangle area is guaranteed to be non-zero.
	//assert(uabc > 0 && vabc > 0 && wabc > 0);
	
	// Region ABC
	this.count = 3;
	this.verts[0].u = uabc;
	this.verts[1].u = vabc;
	this.verts[2].u = wabc;
	this.divisor = area;
}

// Compute farthest polygon point in particular direction.
function supportPoint(polygon, d) {
	var bestIndex = 0;
	var bestValue = vec2.dot(polygon.verts[0], d);

	for (var i = 1; i < polygon.verts.length; i++) {
		var value = vec2.dot(polygon.verts[i], d);
		if (value > bestValue) {
			bestIndex = i;
			bestValue = value;
		}
	}

	return bestIndex;
}

function doGJK(polygon1, xf1, polygon2, xf2) {
	var simplexHistory = [];

	// Initialize the 0-simplex
	var simplex = new Simplex;
	simplex.count = 1;
	var v0 = simplex.verts[0];
	//v0.index1 = 0;	
	v0.index1 = supportPoint(polygon1, xf1.unrotate(new vec2(-1, 0)));
	//v0.index2 = 0;
	v0.index2 = supportPoint(polygon2, xf2.unrotate(new vec2(1, 0)));
	var localPoint1 = polygon1.verts[v0.index1];
	var localPoint2 = polygon2.verts[v0.index2];
	v0.p1 = xf1.transform(localPoint1);
	v0.p2 = xf2.transform(localPoint2);
	v0.p = vec2.sub(v0.p2, v0.p1);
	v0.u = 1;

	var v = simplex.verts;

	// These store the vertices of the last simplex so that we can check for duplicates and prevent cycling.
	var save1 = new Array(3);
	var save2 = new Array(3);
	var saveCount = 0;

	var max_iters = 20;
	for (var iter = 0; iter < max_iters; iter++) {
		// Copy simplex so we can identify duplicates.
		saveCount = simplex.count;
		for (var i = 0; i < saveCount; i++) {
			save1[i] = v[i].index1;
			save2[i] = v[i].index2;
		}

		// Determine the closest point on the simplex and remove unused vertices.
		switch (simplex.count) {
		case 1:
			break;
		case 2:
			simplex.solve2(vec2.zero);
			break;
		case 3:
			simplex.solve3(vec2.zero);
			break;
		default:
			//assert(0);
			break;
		}

		var record = new Simplex;
		record.copy(simplex)
		simplexHistory.push(record);

		// If we have 3 points, then the origin is in the corresponding triangle.
		if (simplex.count == 3) {
			break;
		}

		// Compute search direction to add new vertex.
		var d = simplex.getSearchDirection();
		
		// Ensure the search direction non-zero.
		if (vec2.dot(d, d) == 0) {
			break;
		}

		// Compute a tentative new simplex vertex using support points.
		var new_v = v[simplex.count];
		new_v.index1 = supportPoint(polygon1, xf1.unrotate(vec2.neg(d)));
		new_v.p1 = xf1.transform(polygon1.verts[new_v.index1]);
		new_v.index2 = supportPoint(polygon2, xf2.unrotate(d));
		new_v.p2 = xf2.transform(polygon2.verts[new_v.index2]);
		new_v.p = vec2.sub(new_v.p2, new_v.p1);

		// Check for duplicate support points. This is the main termination criteria.
		var duplicate = false;
		for (var i = 0; i < saveCount; i++) {
			if (new_v.index1 == save1[i] && new_v.index2 == save2[i]) {
				duplicate = true;
				break;
			}
		}

		// If we found a duplicate support point we must exit to avoid cycling.
		if (duplicate) {
			break;
		}

		simplex.count++;
	}

	return simplexHistory;
}

Polytope = function(simplex) {
	//assert(simplex.count == 3);

	this.verts = [];

	for (var i = 0; i < simplex.count; i++) {
		this.verts[i] = new SimplexVertex;
		this.verts[i].copy(simplex.verts[i]);
	}

	this.edgeHead = null;
	this.edgeTail = null;

	if (simplex.count == 2) {
		this.insertEdge(this.edgeTail, new PolytopeEdge(0, 1));
		this.insertEdge(this.edgeTail, new PolytopeEdge(1, 0));
	}
	else if (simplex.count == 3) {
		var a = simplex.verts[0].p;
		var b = simplex.verts[1].p;
		var c = simplex.verts[2].p;

		var ab = vec2.sub(b, a);
		var bc = vec2.sub(c, b);	

		// Ensure the edge winding to CCW
		if (vec2.cross(ab, bc) > 0) {
			this.insertEdge(this.edgeTail, new PolytopeEdge(0, 1));
			this.insertEdge(this.edgeTail, new PolytopeEdge(1, 2));
			this.insertEdge(this.edgeTail, new PolytopeEdge(2, 0));
		}
		else {
			this.insertEdge(this.edgeTail, new PolytopeEdge(0, 2));
			this.insertEdge(this.edgeTail, new PolytopeEdge(2, 1));
			this.insertEdge(this.edgeTail, new PolytopeEdge(1, 0));
		}
	}	
}

Polytope.prototype.insertEdge = function(prevEdge, newEdge) {
	if (this.edgeHead == null) {
		this.edgeHead = newEdge;
		this.edgeTail = newEdge;
	}
	else {
		newEdge.prev = prevEdge;
		newEdge.next = prevEdge.next;	
		newEdge.next.prev = newEdge;
		prevEdge.next = newEdge;	

		if (prevEdge == this.edgeTail) {
			this.edgeTail = newEdge;
		}
	}
}

Polytope.prototype.deleteEdge = function(edge) {
	if (edge == this.edgeHead) {
		this.edgeHead = edge.next;		
	}

	if (edge == this.edgeTail) {
		this.edgeTail = edge.prev;
	}

	edge.prev.next = edge.next;
	edge.next.prev = edge.prev;

	//delete edge;
}

// Find closest polytope edge to origin
Polytope.prototype.getClosestEdge = function() {
	var firstEdge = this.edgeHead;

	if (firstEdge.distsq == undefined) {
		var a = this.verts[firstEdge.index1].p;
		var b = this.verts[firstEdge.index2].p;
		var ab = vec2.sub(b, a);

		var v = -vec2.dot(ab, a);
		if (v <= 0) {
			var cp = new vec2(a.x, a.y);
			firstEdge.distsq = cp.lengthsq();
			firstEdge.dir = cp;			
		}
		else {		
			var u = vec2.dot(ab, b);
			if (u <= 0) {
				var cp = new vec2(b.x, b.y);
				firstEdge.distsq = cp.lengthsq();
				firstEdge.dir = cp;			
			}
			else {
				var s = 1 / ab.lengthsq();
				var cp = vec2.lerp(a, b, v * s);
				firstEdge.distsq = cp.lengthsq();
				firstEdge.dir = vec2.rperp(ab);
			}
		}
	}

	var closestEdge = firstEdge;

	for (var edge = firstEdge.next; edge != this.edgeHead; edge = edge.next) {
		if (edge.distsq == undefined) {
			var a = this.verts[edge.index1].p;
			var b = this.verts[edge.index2].p;
			var ab = vec2.sub(b, a);

			var v = -vec2.dot(ab, a);
			if (v <= 0) {
				var cp = new vec2(a.x, a.y);
				edge.distsq = cp.lengthsq();
				edge.dir = cp;			
			}
			else {		
				var u = vec2.dot(ab, b);
				if (u <= 0) {
					var cp = new vec2(b.x, b.y);
					edge.distsq = cp.lengthsq();
					edge.dir = cp;		
				}
				else {
					var s = 1 / ab.lengthsq();
					cp = vec2.lerp(a, b, v * s);
					edge.distsq = cp.lengthsq();
					edge.dir = vec2.rperp(ab);
				}
			}
		}

		if (edge.distsq > 0.0001 && edge.distsq < closestEdge.distsq) {
			closestEdge = edge;
		}
	}

	return closestEdge;
}

PolytopeEdge = function(index1, index2) {
	this.index1 = index1;
	this.index2 = index2;
	this.next = this;
	this.prev = this;
}

function doEPA(polygon1, xf1, polygon2, xf2, simplex) {
	var polytope = new Polytope(simplex);
	var edgeHistory = [];
	var closestEdge;

	var v = polytope.verts;

	var save1 = [];
	var save2 = [];
	var saveCount = 0;

	var max_iters = 20;
	for (var iter = 0; iter < max_iters; iter++) {
		// Copy polytope so we can identify duplicates.
		saveCount = v.length;
		for (var i = 0; i < saveCount; i++) {
			save1[i] = v[i].index1;
			save2[i] = v[i].index2;
		}

		var edge = polytope.getClosestEdge();

		edgeHistory.push(edge);

		var d = edge.dir;

		// Ensure the search direction non-zero.
		if (vec2.dot(d, d) == 0) {
			break;
		}

		// Compute new closest point to closest edge direction
		var index1 = supportPoint(polygon1, xf1.unrotate(vec2.neg(d)));
		var p1 = xf1.transform(polygon1.verts[index1]);
		var index2 = supportPoint(polygon2, xf2.unrotate(d));
		var p2 = xf2.transform(polygon2.verts[index2]);
		var p = vec2.sub(p2, p1);

		var v1 = v[edge.index1];
		var v2 = v[edge.index2];

		// Check for new point is already on a closest edge
		if ((v1.index1 == index1 && v1.index2 == index2) || (v2.index1 == index1 && v2.index2 == index2)) {
			break;
		}
		
		// Add new polytope point and split the edge
		var new_v = new SimplexVertex;
		new_v.index1 = index1;
		new_v.index2 = index2;
		new_v.p1 = p1;
		new_v.p2 = p2;
		new_v.p = p;

		polytope.verts.push(new_v);
		var new_index = v.length - 1;

		var prevEdge = edge.prev;
		var nextEdge = edge.next;
		polytope.deleteEdge(edge);

		polytope.insertEdge(prevEdge, new PolytopeEdge(prevEdge.index2, new_index));
		polytope.insertEdge(prevEdge.next, new PolytopeEdge(new_index, nextEdge.index1));

		// Check for duplicate support points. This is the main termination criteria.
		var duplicate = false;
		for (var i = 0; i < saveCount; i++) {
			if (new_v.index1 == save1[i] && new_v.index2 == save2[i]) {
				duplicate = true;
				break;
			}
		}

		// If we found a duplicate support point we must exit to avoid cycling.
		if (duplicate) {
			break;
		}
	}

	return { polytope: polytope, edgeHistory: edgeHistory };
}

ContactPoint = function(point, normal, depth) {
	this.p = point.duplicate();
	this.n = normal.duplicate();
	this.d = depth;
}

// Find the separating edge for the given direction
function findSeparationEdge(polygon, xf, n) {
	var verts = polygon.verts;
	var n_local = xf.unrotate(n);
	var index = supportPoint(polygon, n_local);	

	var index_prev = (index + verts.length - 1) % verts.length;
	var index_next = (index + 1) % verts.length;

	var v = verts[index];
	var v_prev = verts[index_prev];
	var v_next = verts[index_next];
	var l = vec2.sub(v, v_next);
	var r = vec2.sub(v, v_prev);

	var edge = {};

	if (vec2.dot(r, n_local) <= vec2.dot(l, n_local)) {		
		edge.v1 = xf.transform(v_prev);
		edge.v2 = xf.transform(v);
		return edge;
	}

	edge.v1 = xf.transform(v);
	edge.v2 = xf.transform(v_next);
	return edge;
}

function clipLineSegment(v1, v2, n, o) {
	var d1 = vec2.dot(n, v1) - o;
	var d2 = vec2.dot(n, v2) - o;
	var cp = [];

	if (d1 >= 0) {
		cp.push(v1);
	}

	if (d2 >= 0) {
		cp.push(v2);
	}

	if (d1 * d2 < 0) {
		var delta = vec2.sub(v2, v1);
		var p = vec2.add(v1, vec2.scale(delta, d1 / (d1 - d2)));
		cp.push(p);
	}

	return cp;
}

function computeContactPoints(polygon1, xf1, polygon2, xf2, n) {
	var e1 = findSeparationEdge(polygon1, xf1, n);
	var e2 = findSeparationEdge(polygon2, xf2, vec2.neg(n));

	var e1d = vec2.sub(e1.v2, e1.v1);
	var e2d = vec2.sub(e2.v2, e2.v1);

	var ref, ref_n;
	var inc;
	var flip;

 	// The reference edge is the edge most perpendicular to the separation normal.
 	// So as to separate both polygons as little as possible.
 	var en1 = Math.abs(vec2.dot(e1d, n));
 	var en2 = Math.abs(vec2.dot(e2d, n));
	if (en1 <= en2) {
		ref = e1;
		ref_n = vec2.normalize(e1d);
		inc = e2;
		flip = true;
	}
	else {
		ref = e2;
		ref_n = vec2.normalize(e2d);
		inc = e1;
		flip = false;
	}

	// Clip incident edge vertices using reference edge v1
	var o1 = vec2.dot(ref_n, ref.v1);
	var v = clipLineSegment(inc.v1, inc.v2, ref_n, o1);
	if (v.length < 2) {
		return null;
	}

	// Clip incident edge vertices using reference edge v2
	var o2 = -vec2.dot(ref_n, ref.v2);
	var v = clipLineSegment(v[0], v[1], vec2.neg(ref_n), o2);
	if (v.length < 2) {
		return null;
	}

	var ref_perp = vec2.perp(ref_n);

	var cp = [];
	var o3 = vec2.dot(ref_perp, ref.v1);
	var depth0 = vec2.dot(ref_perp, v[0]) - o3;
	var depth1 = vec2.dot(ref_perp, v[1]) - o3;

	if (depth0 > 0) {
		cp.push(new ContactPoint(v[0], n, -depth0));
	}

	if (depth1 > 0) {
		cp.push(new ContactPoint(v[1], n, -depth1));
	}

	return { cp: cp, incidentEdge: inc, referenceEdge: ref };
}