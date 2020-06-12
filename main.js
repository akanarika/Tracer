var w = 800;
var h = 600;
var time = 0.0;
function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) return shader;
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl, vs, fs) {
	var prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	var success = gl.getProgramParameter(prog, gl.LINK_STATUS);
	if (success) return prog;
	console.log(gl.getProgramInfoLog(prog));
	gl.deleteProgram(prog);
}

function setPixel(gl) {
    var arr = new Float32Array(w * h * 2);
    var row;
    var col;
    for (row = 0; row < h; row++) {
        for (col = 0; col < w; col++) {
            arr[row * w * 2 + col * 2] = col - w / 2;
            arr[row * w * 2 + col * 2 + 1] = row - h / 2;
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
}

function main() {
    // matrix
    var m3 = {
        multiply: function(a, b) {
            var a00 = a[0 * 3 + 0];
            var a01 = a[0 * 3 + 1];
            var a02 = a[0 * 3 + 2];
            var a10 = a[1 * 3 + 0];
            var a11 = a[1 * 3 + 1];
            var a12 = a[1 * 3 + 2];
            var a20 = a[2 * 3 + 0];
            var a21 = a[2 * 3 + 1];
            var a22 = a[2 * 3 + 2];
            var b00 = b[0 * 3 + 0];
            var b01 = b[0 * 3 + 1];
            var b02 = b[0 * 3 + 2];
            var b10 = b[1 * 3 + 0];
            var b11 = b[1 * 3 + 1];
            var b12 = b[1 * 3 + 2];
            var b20 = b[2 * 3 + 0];
            var b21 = b[2 * 3 + 1];
            var b22 = b[2 * 3 + 2];
         
            return [
                      b00 * a00 + b01 * a10 + b02 * a20,
                      b00 * a01 + b01 * a11 + b02 * a21,
                      b00 * a02 + b01 * a12 + b02 * a22,
                      b10 * a00 + b11 * a10 + b12 * a20,
                      b10 * a01 + b11 * a11 + b12 * a21,
                      b10 * a02 + b11 * a12 + b12 * a22,
                      b20 * a00 + b21 * a10 + b22 * a20,
                      b20 * a01 + b21 * a11 + b22 * a21,
                      b20 * a02 + b21 * a12 + b22 * a22,
                    ];
            },
        
        init: function() {
            return [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ];
        },

        translate: function(tx, ty) {
            return [
                1, 0, 0,
                0, 1, 0,
                tx, ty, 1,
            ];
        },
         
        rotate: function(angleInRadians) {
            var c = Math.cos(angleInRadians);
            var s = Math.sin(angleInRadians);
            return [
                c,-s, 0,
                s, c, 0,
                0, 0, 1,
            ];
        },
         
        scale: function(sx, sy) {
            return [
                sx, 0, 0,
                0, sy, 0,
                0, 0, 1,
            ];
        },

        proj: function(w, h) {
            return [
                2 / w, 0, 0,
                0, 2 / h, 0,
                0, 0, 1,
            ];
        },
    };

    var start = new Date();
	var canvas = document.querySelector("#c");	
	var gl = canvas.getContext("webgl");
	if (!gl) {
		// No GL
		return;
	}
    // get shaders
	var vss = document.querySelector("#vs").text;
	var fss = document.querySelector("#fs").text;
	var vs = createShader(gl, gl.VERTEX_SHADER, vss);
	var fs = createShader(gl, gl.FRAGMENT_SHADER, fss);
	var prog = createProgram(gl, vs, fs);

    // pixel_pos
    var ppal = gl.getAttribLocation(prog, "a_pixel");
    var ppb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ppb);
    setPixel(gl);

    // canvas
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(prog);

    // w, h
    var wl = gl.getUniformLocation(prog, "w");
    gl.uniform1f(wl, w);
    var hl = gl.getUniformLocation(prog, "h");
    gl.uniform1f(hl, h);

    // u_seed
    var usl = gl.getUniformLocation(prog, "u_seed");
    gl.uniform1f(usl, 1.0);

    // cameta location
    var cl = gl.getUniformLocation(prog, "cam.o");
    gl.uniform3f(cl, 0, 400.0, 1000.0);

    // spheres
    /**
    for (var i = 0; i < 10; i++) {
        var x = Math.random() * w - w / 2;
        var y = Math.random() * h - h / 2;
        var z = - Math.random() * h / 5.0 - h / 10.0;;
        gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].o"), x, y, z);
        gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + i + "].r"), Math.random() * h / 5.0 + 20.0);
    }
    **/
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 0 + "].o"), 0, -2200.0, -1.0);
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 0 + "].r"), 2200.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 0 + "].mat.i"), 1);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 0 + "].mat.att"), 0.0, 0.0, 0.0);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 1 + "].o"), -180.0, 80.0, -1.0);
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 1 + "].r"), 80.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 1 + "].mat.i"), 2);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 1 + "].mat.att"), 1.0, 0.2, 0.0);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 2 + "].o"), 0, 100.0, -1.0);
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 2 + "].r"), 100.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 2 + "].mat.i"), 1);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 2 + "].mat.att"), 0.0, 0.2, 0.7, 1.0);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 3 + "].o"), 180.0, 80.0, -1.0);
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 3 + "].r"), 80.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 3 + "].mat.i"), 2);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 3 + "].mat.att"), 0.2, 0.8, 0.2);

    // var tra = m3.translate(100, 150);
    // var rot = m3.rotate(0);
    // var sca = m3.scale(0.01, 0.03);
    // var mat = m3.multiply(tra, rot);
    // mat = m3.multiply(mat, sca);
    var mat = m3.init();
    mat = m3.multiply(mat, m3.proj(w, h));
    var ml = gl.getUniformLocation(prog, "u_matrix");
    gl.uniformMatrix3fv(ml, false, mat);

    var type = gl.FLOAT;
    var normalize = false;

	gl.enableVertexAttribArray(ppal);
    gl.vertexAttribPointer(ppal, 2, type, normalize, 0, 0);
    gl.drawArrays(gl.POINTS, 0, w * h);
}
main();