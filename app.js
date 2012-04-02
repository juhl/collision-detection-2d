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

App = function() {
	var domCanvas;
	var domInfo;
	var ctx;
	var mousePos = new vec2(0, 0);
	var mode = 0;
	var polygonA = {};
	var xfA = new Transform(new vec2(0, 0), 0);
	var polygonB = {};
	var xfB = new Transform(new vec2(0 ,0), 0);	
	var angle = 0;
	var simplexHistoryIndex = 0;
	var polytopeEdgeHistoryIndex = 0;
	var showMinkDiff = false;

	function main() {		
		domCanvas = document.getElementById("canvas");
		if (!domCanvas.getContext) {
			alert("Couldn't get canvas object !");
		}		

		// Main canvas context
		ctx = domCanvas.getContext("2d");

		// Transform coordinate system to y-axis is up
		ctx.translate(0, domCanvas.height);
		ctx.scale(1, -1);

		domInfo = document.getElementById("info");

		domCanvas.addEventListener("mousedown", function(e) { onMouseDown(e) }, false);
		domCanvas.addEventListener("mouseup", function(e) { onMouseUp(e) }, false);
		domCanvas.addEventListener("mousemove", function(e) { onMouseMove(e) }, false);

		domCanvas.addEventListener("touchstart", touchHandler, false);
		domCanvas.addEventListener("touchend", touchHandler, false);
		domCanvas.addEventListener("touchmove", touchHandler, false);
		domCanvas.addEventListener("touchcancel", touchHandler, false);

		document.addEventListener("keydown", onKeyDown, false);
		document.addEventListener("keyup", onKeyUp, false);

		setMode(0);

		setInterval(updateScreen, 1000 / 60);
	}

	function getModeName() {
		return [
			"Line segment VS Point",
			"Triangle VS Point",
			"Line segment VS Line segment",
			"Triangle VS Line segment",
			"Triangle VS Triangle",
			"Box VS Box",
			"Box VS Hexagon"][mode];
	}

	function setMode(m) {
		switch (m) {
		case 0: // Line segment vs Point
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(0, 100);
			polygonA.verts[1] = new vec2(0, 0);

			polygonB.verts = [];
			polygonB.verts[0] = new vec2(0, 0);
			break;
		case 1: // Triangle vs Point
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(50, 0);
			polygonA.verts[1] = new vec2(0, 80);
			polygonA.verts[2] = new vec2(-50, 0);

			polygonB.verts = [];
			polygonB.verts[0] = new vec2(0, 0);
			break;
		case 2: // Line segment vs Line segment
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(0, 100);
			polygonA.verts[1] = new vec2(0, 0);

			polygonB.verts = [];
			polygonB.verts[0] = new vec2(50, 0);
			polygonB.verts[1] = new vec2(-50, 0);
			break;
		case 3: // Triangle vs Line segment
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(50, 0);
			polygonA.verts[1] = new vec2(0, 80);
			polygonA.verts[2] = new vec2(-50, 0);
			
			polygonB.verts = [];
			polygonB.verts[0] = new vec2(50, 0);
			polygonB.verts[1] = new vec2(-50, 0);
			break;
		case 4: // Triangle vs Triangle
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(50, 0);
			polygonA.verts[1] = new vec2(0, 80);
			polygonA.verts[2] = new vec2(-50, 0);
			
			polygonB.verts = [];
			polygonB.verts[0] = new vec2(50, 0);
			polygonB.verts[1] = new vec2(0, 80);
			polygonB.verts[2] = new vec2(-50, 0);
			break;
		case 5: // Box vs Box
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(40, 0);
			polygonA.verts[1] = new vec2(40, 80);
			polygonA.verts[2] = new vec2(-40, 80);
			polygonA.verts[3] = new vec2(-40, 0);
			
			polygonB.verts = [];
			polygonB.verts[0] = new vec2(40, 0);
			polygonB.verts[1] = new vec2(40, 80);
			polygonB.verts[2] = new vec2(-40, 80);
			polygonB.verts[3] = new vec2(-40, 0);
			break;
		case 6: // Box vs Hexagon
			polygonA.verts = [];
			polygonA.verts[0] = new vec2(40, 0);
			polygonA.verts[1] = new vec2(40, 80);
			polygonA.verts[2] = new vec2(-40, 80);
			polygonA.verts[3] = new vec2(-40, 0);
			
			polygonB.verts = [];
			polygonB.verts[0] = new vec2(30, 0);
			polygonB.verts[1] = new vec2(60, 50);
			polygonB.verts[2] = new vec2(30, 100);
			polygonB.verts[3] = new vec2(-30, 100);
			polygonB.verts[4] = new vec2(-60, 50);
			polygonB.verts[5] = new vec2(-30, 0);			
		}

		mode = m;
	}	

	function drawPolygon(v, xf, lineWidth, strokeColor, fillColor) {
		ctx.save();
		ctx.transform(xf.c, xf.s, -xf.s, xf.c, xf.t.x, xf.t.y);

		ctx.beginPath();			

		ctx.moveTo(v[0].x, v[0].y);		
		for (var i = 1; i < v.length; i++) {
			ctx.lineTo(v[i].x, v[i].y);
		}

		if (v.length > 2) {
			ctx.closePath();
		}

		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = strokeColor;
		ctx.stroke();

		if (fillColor) {
			ctx.fillStyle = fillColor;
			ctx.fill();
		}

		ctx.restore();
	}

	function drawPoint(p, radius, color) {
		ctx.beginPath();
		ctx.arc(p.x, p.y, radius, 0, Math.PI*2, false);		

		ctx.fillStyle = color;
		ctx.fill();
	}

	function drawLine(p1, p2, lineWidth, color) {
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);		

		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.stroke();
	}

	function drawText(p, text, color) {
		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		ctx.font = "8pt Verdana";
		ctx.textBaseline = "bottom";
		ctx.fillStyle = color;

		var wp = worldToCanvas(p);
		ctx.fillText(text, wp.x, wp.y);

		ctx.restore();
	}

	function updateScreen() {
		domInfo.innerHTML = getModeName();

		ctx.save();
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, domCanvas.width, domCanvas.height);
		ctx.restore();

		ctx.setTransform(1, 0, 0, -1, domCanvas.width * 0.5, domCanvas.height * 0.5);

		// Draw origin point
		drawPoint(vec2.zero, 2, "#000");

		drawPolygon(polygonA.verts, xfA, 1, "#888");
		drawPolygon(polygonB.verts, xfB, 1, "#888");

		for (var i = 0; i < polygonA.verts.length; i++) {
			var v = xfA.transform(polygonA.verts[i]);
			drawText(vec2.add(v, new vec2(-3, 3)), "" + i, "#888");
		}

		for (var i = 0; i < polygonB.verts.length; i++) {
			var v = xfB.transform(polygonB.verts[i]);
			drawText(vec2.add(v, new vec2(-3, 3)), "" + i, "#888");
		}

		var simplexHistory = doGJK(polygonA, xfA, polygonB, xfB);
		var lastIndex = simplexHistory.length - 1;
		var lastSimplex = simplexHistory[lastIndex];
		var w = lastSimplex.getWitnessPoints();

		if (vec2.distsq(w.p1, w.p2) > 0) {
			// Draw closest line
			drawLine(w.p1, w.p2, 1, "#F80");
			drawPoint(w.p1, 2.5, "#F80");
			drawPoint(w.p2, 2.5, "#F80");
		}

		if (showMinkDiff) {
			// Compute Minkowski Differences
			var mdv = [];
			for (var i = 0; i < polygonA.verts.length; i++) {
				for (var j = 0; j < polygonB.verts.length; j++) {
					var a = xfA.transform(polygonA.verts[i]);
					var b = xfB.transform(polygonB.verts[j]);
					var d = vec2.sub(b, a);
					d.text = "" + j + "-" + i;
					mdv.push(d);			
				}
			}

			// Generate convex hull
			var mdv = createConvexHull(mdv);

			for (var i = 0; i < mdv.length; i++) {
				var v = mdv[i];
				drawText(vec2.add(v, new vec2(-22, 3)), v.text, "rgba(128, 0, 128, 0.5)");
			}

			// Draw Minkowski Differences
			drawPolygon(mdv, new Transform(new vec2(0, 0), 0), 2, "rgba(128, 0, 128, 0.5)", "rgba(128, 0, 128, 0.2)");

			// Draw simplex history
			simplexHistoryIndex %= simplexHistory.length;
			simplex = simplexHistory[simplexHistoryIndex];
			var simplexVerts = [];
			for (var i = 0; i < simplex.count; i++) {
				var p = simplex.verts[i].p;
				simplexVerts.push(p);
				drawPoint(p, 2.5, "#F0F");
				drawText(vec2.add(p, new vec2(3, 3)), "" + i, "#F0F");
			}

			drawPolygon(simplexVerts, new Transform(new vec2(0, 0), 0), 2, "#F0F", "rgba(255, 0, 255, 0.3)");

			// Draw closest point in current simplex history
			var cp = simplex.getClosestPoint();
			drawLine(vec2.add(cp, new vec2(-5, -5)), vec2.add(cp, new vec2(5, 5)), 1, "rgba(0, 0, 255, 0.5)");
			drawLine(vec2.add(cp, new vec2(-5, 5)), vec2.add(cp, new vec2(5, -5)), 1, "rgba(0, 0, 255, 0.5)");
			drawText(vec2.add(cp, new vec2(5, -12)), "simplex CP", "#00F");

			domInfo.innerHTML += ["<br />Simplex history:", simplexHistoryIndex, "/", simplexHistory.length - 1].join(" ");
		}

		// Do EPA if last simplex has full
		if (lastSimplex.count == 3) {
			var result = doEPA(polygonA, xfA, polygonB, xfB, lastSimplex);
			var polytope = result.polytope;
			var edgeHistory = result.edgeHistory;

			// Draw penetration vector
			drawLine(vec2.zero, edgeHistory[edgeHistory.length - 1].dir, 1, "#F00");

			if (showMinkDiff) {
				polytopeEdgeHistoryIndex %= edgeHistory.length;
				var edge = edgeHistory[polytopeEdgeHistoryIndex];

				// Draw polytope edge history
				var v1 = polytope.verts[edge.index1];
				var v2 = polytope.verts[edge.index2];
				drawLine(v1.p, v2.p, 2, "#084");

				// Draw closest point on edge
				drawPoint(edge.dir, 3, "#0F0");

				domInfo.innerHTML += ["<br />Polytope edge history:", polytopeEdgeHistoryIndex, "/", edgeHistory.length - 1].join(" ");
			}
		}
	}

	function worldToCanvas(p) {
		return new vec2(
			domCanvas.width * 0.5 + p.x,
			domCanvas.height * 0.5 - p.y);
	}

	function canvasToWorld(p) {
		return new vec2(
			p.x - domCanvas.width * 0.5,
			domCanvas.height * 0.5 - p.y);
	}

	function getMousePosition(ev) {
		return new vec2(
			ev.offsetX + document.body.scrollLeft - domCanvas.offsetLeft,
			ev.offsetY + document.body.scrollTop - domCanvas.offsetTop);
	}

	function onMouseDown(ev) {		
	}

	function onMouseUp(ev) { 
	}

	function onMouseMove(ev) {
		mousePos = getMousePosition(ev);

		xfA.setPosition(canvasToWorld(mousePos));
	}

	function touchHandler(ev) {
		var touches = ev.changedTouches;
		var first = touches[0];
		var type = {"touchstart":"mousedown", "touchmove":"mousemove", "touchend":"mouseup"}[ev.type];

		var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent(type, true, true, window, 1, 
			first.screenX, first.screenY, 
			first.clientX, first.clientY, false, 
			false, false, false, 0/*left*/, null);

		first.target.dispatchEvent(simulatedEvent);
		ev.preventDefault();
	}

	function onKeyDown(ev) {
		if (!ev) {
			ev = event;
		}

		switch (ev.keyCode) {
		case 49: // '1'
		case 50: // '2'
		case 51: // '3'
		case 52: // '4'
		case 53: // '5'
		case 54: // '6'
		case 55: // '7'
			setMode(ev.keyCode - 49);
			break;
		case 77: // 'm'
			showMinkDiff = !showMinkDiff;
			break;
		case 69: // 'e'
			angle -= 5;
			xfA.setRotation(deg2rad(angle));
			break;
		case 81: // 'q'
			angle += 5;
			xfA.setRotation(deg2rad(angle));
			break;
		case 83: // 's'
			simplexHistoryIndex++;
			break;
		case 80: // 'p'
			polytopeEdgeHistoryIndex++;
			break;
		}
	}

	function onKeyUp(ev) {
		if (!ev) {
			ev = event;
		}		
	}

	return { main: main };
} ();