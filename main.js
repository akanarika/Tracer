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

function getPixel() {
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

function initShaders(gl) {
    // get shaders
    var vss = document.querySelector("#vs").text;
    var fss = document.querySelector("#fs").text;
    var vs = createShader(gl, gl.VERTEX_SHADER, vss);
    var fs = createShader(gl, gl.FRAGMENT_SHADER, fss);
    var prog = createProgram(gl, vs, fs);
    return prog;
}

function main() {
    var start = new Date();
    var canvas = document.querySelector("#c");  
    var gl = canvas.getContext("webgl");
    if (!gl) {
        // No GL
        return;
    }
    
    var prog = initShaders(gl);
    
    // pixel_pos
    var ppal = gl.getAttribLocation(prog, "a_pixel");
    var ppb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ppb);
    var pixels = getPixel();
    var arr = new Float32Array(w * h * 2);
    var i = 0;
    pixels.forEach(e => {arr[i++] = e[0]; arr[i++] = e[1]});
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);

    // cam
    var cam = new Camera([0, 3000, 3000], [0, -1.0, -1.0], [0, 1.0, -1.0]);

    function drawScene() {
        // canvas
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(prog);

        // w, h
        gl.uniform1f(gl.getUniformLocation(prog, "w"), w);
        gl.uniform1f(gl.getUniformLocation(prog, "h"), h);

        // u_seed
        var usl = gl.getUniformLocation(prog, "u_seed");
        gl.uniform1f(usl, 1.0);

        // proj
        var mat = m3.init();
        mat = m3.tom4(m3.multiply(mat, m3.proj(w, h)));
        var ml = gl.getUniformLocation(prog, "u_matrix");
        gl.uniformMatrix4fv(ml, false, mat);

        // cam
        gl.uniform3f(gl.getUniformLocation(prog, "u_cam.o"), cam.o[0], cam.o[1], cam.o[2]);
        gl.uniform3f(gl.getUniformLocation(prog, "u_cam.gaze"), 0, -1.0, -1.0);
        gl.uniform3f(gl.getUniformLocation(prog, "u_cam.up"), 0, 1.0, -1.0);

        // view
        var gu = vec3.normalize(vec3.cross(cam.gaze, cam.up));
        var rotate = m4.transpose(m4.init_v(gu, cam.up, vec3.neg(cam.gaze), [0, 0, 0]));
        var t = m4.init();
        t[12] = -cam.o[0]; t[13] = -cam.o[1]; t[14] = -cam.o[2];
        var view = m4.multiply(rotate, t);

        for (var i = 0; i < 10; i++) {
            var x = 5 * (Math.random() * w - w / 2);
            var y = 5 * (Math.random() * h - h / 2);
            var z = - Math.random() * h / 20.0;

            var so = vec4.multiply(view, [x, y, z, 1.0]);
            gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].o"), so[0], so[1], so[2]);
            gl.uniform1f(gl.getUniformLocation(prog, "spheres[" + i + "].r"), 2 * Math.random() * h + 100.0);
            gl.uniform1i(gl.getUniformLocation(prog, "spheres[" + i + "].mat.i"), Math.floor(Math.random() * 2));
            gl.uniform3f(gl.getUniformLocation(prog, "spheres[" + i + "].mat.att"), Math.random(), Math.random(), Math.random());
        }

        var type = gl.FLOAT;
        var normalize = false;

        gl.enableVertexAttribArray(ppal);
        gl.vertexAttribPointer(ppal, 2, type, normalize, 0, 0);
        gl.drawArrays(gl.POINTS, 0, w * h);
    }

    drawScene();
}
main();