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

Math.clamp = function(v, min, max) { return v < min ? min : (v > max ? max : v); }
Math.log2 = function(a) { return Math.log(a) / Math.log(2); }

function deg2rad(deg) { return (deg / 180) * Math.PI; }
function rad2deg(rad) { return (rad / Math.PI) * 180; }

//-----------------------------------
// 2D Vector
//-----------------------------------

function vec2(x, y) {
	this.x = x || 0;
	this.y = y || 0;
}

vec2.zero = new vec2(0, 0);

vec2.prototype.toString = function() {
	return ["x:", this.x, "y:", this.y].join(" ");
}

vec2.prototype.set = function(x, y) {
	this.x = x;
	this.y = y;

	return this;
}

vec2.prototype.copy = function(v) {
	this.x = v.x;
	this.y = v.y;
	
	return this;
}

vec2.prototype.duplicate = function() {
	return new vec2(this.x, this.y);
}

vec2.prototype.equal = function(v) {
	return (this.x != v.x || this.y != v.y) ? false : true;
}

vec2.prototype.add = function(v1, v2) {
	this.x = v1.x + v2.x;
	this.y = v1.y + v2.y;

	return this;
}

vec2.prototype.addself = function(v) {
	this.x += v.x;
	this.y += v.y;

	return this;
}

vec2.prototype.sub = function(v1, v2) {
	this.x = v1.x - v2.x;
	this.y = v1.y - v2.y;

	return this;
}

vec2.prototype.subself = function(v) {
	this.x -= v.x;
	this.y -= v.y;

	return this;
}

vec2.prototype.scale = function(s) {
	this.x *= s;
	this.y *= s;

	return this;
}

vec2.prototype.scale2 = function(s) {
	this.x *= s.x;
	this.y *= s.y;

	return this;
}

vec2.prototype.mad = function(v, s) {
	this.x += v.x * s;
	this.y += v.y * s;
}

vec2.prototype.neg = function() {
	this.x *= -1;
	this.y *= -1;

	return this;
}

vec2.prototype.rcp = function() {
	this.x = 1 / this.x;
	this.y = 1 / this.y;

	return this;
}

vec2.prototype.lengthsq = function() {
	return this.x * this.x + this.y * this.y;
}

vec2.prototype.length = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

vec2.prototype.normalize = function() {
	var inv = (this.x != 0 || this.y != 0) ? 1 / Math.sqrt(this.x * this.x + this.y * this.y) : 0;
	this.x *= inv;
	this.y *= inv;

	return this;
}

vec2.prototype.dot = function(v) {
	return this.x * v.x + this.y * v.y;
}

// Z-component of 3d cross product (ax, ay, 0) x (bx, by, 0)
vec2.prototype.cross = function(v) {
	return this.x * v.y - this.y * v.x;
}

vec2.prototype.toAngle = function() {
	return Math.atan2(this.y, this.x);
}

vec2.prototype.rotation = function(angle) {
	this.x = Math.cos(angle);
	this.y = Math.sin(angle);
	return this;
}

vec2.prototype.rotate = function(angle) {
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	return this.set(this.x * c - this.y * s, this.x * s + this.y * c);
}

vec2.prototype.lerp = function(v1, v2, t) {
	return this.add(vec2.scale(v1, 1 - t), vec2.scale(v2, t));
}

vec2.add = function(v1, v2) {
	return new vec2(v1.x + v2.x, v1.y + v2.y);
}

vec2.sub = function(v1, v2) {
	return new vec2(v1.x - v2.x, v1.y - v2.y);
}

vec2.scale = function(v, s) {
	return new vec2(v.x * s, v.y * s);
}

vec2.scale2 = function(v, s) {
	return new vec2(v.x * s.x, v.y * s.y);
}

vec2.mad = function(v1, v2, s) {
	return new vec2(v1.x + v2.x * s, v1.y + v2.y * s);
}

vec2.neg = function(v) {
	return new vec2(-v.x, -v.y);
}

vec2.rcp = function(v) {
	return new vec2(1 / v.x, 1 / v.y);
}

vec2.normalize = function(v) {
	var inv = (v.x != 0 || v.y != 0) ? 1 / Math.sqrt(v.x * v.x + v.y * v.y) : 0;
	return new vec2(v.x * inv, v.y * inv);
}

vec2.dot = function(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y;
}

vec2.cross = function(v1, v2) {
	return v1.x * v2.y - v1.y * v2.x;
}

vec2.toAngle = function(v) {
	return Math.atan2(v.y, v.x);
}

vec2.rotation = function(angle) {
	return new vec2(Math.cos(angle), Math.sin(angle));
}

vec2.rotate = function(v, angle) {
	var c = Math.cos(angle);
	var s = Math.sin(angle);
	return new vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Return perpendicular vector (90 degree rotation)
vec2.perp = function(v) {
	return new vec2(-v.y, v.x);
}

// Return perpendicular vector (-90 degree rotation)
vec2.rperp = function(v) {
	return new vec2(v.y, -v.x);
}

vec2.dist = function(v1, v2) {
	var dx = v2.x - v1.x;
	var dy = v2.y - v1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

vec2.distsq = function(v1, v2) {
	var dx = v2.x - v1.x;
	var dy = v2.y - v1.y;
	return dx * dx + dy * dy;
}

vec2.lerp = function(v1, v2, t) {
	return vec2.add(vec2.scale(v1, 1 - t), vec2.scale(v2, t));
}

vec2.truncate = function(v, length) {
	var ret = v.duplicate();
	var length_sq = v.x * v.x + v.y * v.y;
	if (length_sq > length * length) {
		ret.scale(length / Math.sqrt(length_sq));
	}

	return ret;
}

//-----------------------------------
// 2D Transform
//-----------------------------------

Transform = function(pos, angle) {
	this.t = pos.duplicate();
	this.c = Math.cos(angle);
	this.s = Math.sin(angle);
}

Transform.prototype.set = function(pos, angle) {
	this.t.copy(pos);
	this.c = Math.cos(angle);
	this.s = Math.sin(angle);
	return this;
}

Transform.prototype.setRotation = function(angle) {
	this.c = Math.cos(angle);
	this.s = Math.sin(angle);
	return this;
}

Transform.prototype.setPosition = function(p) {
	this.t.copy(p);
	return this;
}

Transform.prototype.identity = function() {
	this.t.set(0, 0);
	this.c = 1;
	this.s = 0;
	return this;
}

Transform.prototype.rotate = function(v) {
	return new vec2(v.x * this.c - v.y * this.s, v.x * this.s + v.y * this.c);
}

Transform.prototype.unrotate = function(v) {
	return new vec2(v.x * this.c + v.y * this.s, -v.x * this.s + v.y * this.c);
}

Transform.prototype.transform = function(v) {
	return new vec2(v.x * this.c - v.y * this.s + this.t.x, v.x * this.s + v.y * this.c + this.t.y);
}

Transform.prototype.untransform = function(v) {
	var px = v.x - this.t.x;
	var py = v.y - this.t.y;
	return new vec2(px * this.c + py * this.s, -px * this.s + py * this.c);
}
