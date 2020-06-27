const c = document.querySelector('#c');
var w = c.width;
var h = c.height;

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

function getPixel(w, h) {
    var arr = [];
    var row;
    var col;
    for (row = 0; row < h; row++) {
        for (col = 0; col < w; col++) {
            arr.push([col - w / 2, row - h / 2, 0, 1.0]);
        }
    }
    return arr;
}

class Camera {
  constructor(o, g, u) {
    this.o = o;
    if (g == undefined) {
        this.gaze = vec3.normalize([0, 0, -1.0]);
    } else {
        this.gaze = vec3.normalize(g);
    }
    if (u == undefined) {
        this.up = vec3.normalize([0, 1.0, 0]);
    } else {
        this.up = vec3.normalize(u);
    }
  }
}

function main() {
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

    // camera location
    var cam = new Camera([0, 3000, 3000], [0, -1.0, -1.0], [0, 1.0, -1.0]);
    var gu = vec3.normalize(vec3.cross(cam.gaze, cam.up));
    console.log(gu);

    var rotate = m4.transpose(m4.init_v(gu, cam.up, vec3.neg(cam.gaze), [0, 0, 0]));
    var t = m4.init();
    t[12] = -cam.o[0]; t[13] = -cam.o[1]; t[14] = -cam.o[2];
    var view = m4.multiply(rotate, t);
    console.log(view);
    
    // pixel_pos
    var ppal = gl.getAttribLocation(prog, "a_pixel");
    var ppb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ppb);
    var pixels = getPixel(w, h);
    var arr = new Float32Array(w * h * 2);
    var i = 0;
    pixels.forEach(e => {arr[i++] = e[0]; arr[i++] = e[1]});
    console.log(arr);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);

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

    // spheres
    var spheres = [[0, -2000, 0, 2000.0, 1, 0.3, 0.2, 0.7],
                   [-400, 400, 0, 400.0, 2, 1.0, 0.2, 0.0],
                   [400, 400, 0, 400.0, 2, 0.2, 0.6, 0.1]];
    for (var i = 0; i < 3; i++) {
        /**
        var x = Math.random() * w - w / 2;
        var y = Math.random() * h - h / 2;
        var z = - Math.random() * h / 5.0 - h / 10.0;;
        gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].o"), x, y, z);
        gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + i + "].r"), Math.random() * h / 5.0 + 20.0);
        gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + i + "].mat.i"), Math.floor(Math.random() * 2));
        gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].mat.att"), Math.random(), Math.random(), Math.random());
        **/
        var so = vec4.multiply(view, [spheres[i][0], spheres[i][1], spheres[i][2], 1.0]);
        console.log("so: " + so + ";");
        gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].o"), so[0], so[1], so[2]);
        gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + i + "].r"), spheres[i][3]);
        gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + i + "].mat.i"), spheres[i][4]);
        gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].mat.att"), spheres[i][5], spheres[i][6], spheres[i][7], 1.0);
    }

/**
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 2 + "].o"), vec4.multiply(view, [0, 100.0, 0, 1.0]));
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 2 + "].r"), 100.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 2 + "].mat.i"), 1);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 2 + "].mat.att"), 0.0, 0.2, 0.7, 1.0);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 3 + "].o"), vec4.multiply(view, [180.0, 80.0, 0, 1.0]));
    gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + 3 + "].r"), 80.0);
    gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + 3 + "].mat.i"), 2);
    gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + 3 + "].mat.att"), 0.2, 0.8, 0.2);
**/

    var mat = m3.init();
    mat = m3.tom4(m3.multiply(mat, m3.proj(w, h)));
    var ml = gl.getUniformLocation(prog, "u_matrix");
    gl.uniformMatrix4fv(ml, false, mat);

    var type = gl.FLOAT;
    var normalize = false;

    gl.enableVertexAttribArray(ppal);
    gl.vertexAttribPointer(ppal, 2, type, normalize, 0, 0);
    gl.drawArrays(gl.POINTS, 0, w * h);
}
main();