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

var cursor = [0, 0, 0];

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
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            -w,h,
            0,h,
            w,0,
            -w,-h,
            0,h,
            -w,0]),
        gl.STATIC_DRAW);

    // cam
    var cam = new Camera([0, 3000, 3000], [0, -0, -1.0], [0, 1.0, 0]);

    var spheres = generateSpheres(10, 0);

    function generateSpheres(c, static) {
        if (static == 1) {
            return [[0, 400, 0, 400, 2, .4,.5,.6], [0, -10000, 0, 10000, 1, .2, .2, .8]];
        }
        var res = []
        for (var i = 0; i < c; i++) {
            var x = 5 * (Math.random() * w - w / 2);
            var y = 5 * (Math.random() * h - h / 2);
            var z = - Math.random() * h / 20.0;
            res.push([x, y, z, 2 * Math.random() * h + 100.0, Math.floor(Math.random() * 2), .2 + .8 * Math.random(), .2 + .8 * Math.random(), .2 + .8 * Math.random()]);
        }
        return res;
    }

    // canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(prog);

    var type = gl.FLOAT;
    var normalize = false;

    gl.enableVertexAttribArray(ppal);
    gl.vertexAttribPointer(ppal, 3, type, normalize, 0, 0);

    function drawScene(sample) {
        // w, h
        gl.uniform1f(gl.getUniformLocation(prog, "w"), w);
        gl.uniform1f(gl.getUniformLocation(prog, "h"), h);

        // u_seed
        var usl = gl.getUniformLocation(prog, "u_seed");
        gl.uniform1f(usl, 1.0);

        // u_cursor
        var ucl = gl.getUniformLocation(prog, "u_cursor");
        gl.uniform3f(ucl, cursor[0], cursor[1], cursor[2]);

        // sample count
        gl.uniform1i(gl.getUniformLocation(prog, "u_sample_count"), sample);

        // proj
        var mat = m3.init();
        mat = m3.tom4(m3.multiply(mat, m3.proj(w, h)));
        var ml = gl.getUniformLocation(prog, "u_matrix");
        gl.uniformMatrix4fv(ml, false, mat);

        // cam
        // gl.uniform3f(gl.getUniformLocation(prog, "u_cam.o"), cam.o[0], cam.o[1], cam.o[2]);
        // gl.uniform3f(gl.getUniformLocation(prog, "u_cam.gaze"), 0, -1.0, -1.0);
        // gl.uniform3f(gl.getUniformLocation(prog, "u_cam.up"), 0, 1.0, -1.0);

        // view
        // var gu = vec3.normalize(vec3.cross(cam.gaze, cam.up));
        // var rotate = m4.transpose(m4.init_v(gu, cam.up, vec3.neg(cam.gaze), [0, 0, 0]));
        // var t = m4.init();
        // t[12] = -cam.o[0]; t[13] = -cam.o[1]; t[14] = -cam.o[2];
        var view = m4.init();//.multiply(rotate, t);

        for (var i = 0; i < spheres.length; i++) {
            var x = spheres[i][0];
            var y = spheres[i][1];
            var z = spheres[i][2];

            var so = vec4.multiply(view, [x, y, z, 1.0]);
            gl.uniform3f(gl.getUniformLocation(prog, "u_spheres[" + i + "].o"), so[0], so[1], so[2]);
            gl.uniform1f(gl.getUniformLocation(prog, "u_spheres[" + i + "].r"), spheres[i][3]);
            gl.uniform1i(gl.getUniformLocation(prog, "u_spheres[" + i + "].mat.i"), spheres[i][4]);
            gl.uniform3f(gl.getUniformLocation(prog, "u_spheres[" + i + "].mat.att"), spheres[i][5], spheres[i][6], spheres[i][7]);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    var drag = false;
    var old_x, old_y;
    var dX = 0, dY = 0;
    var mouseDown = function(e) {
        drag = true;
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
        
        return false;
    };

    var mouseUp = function(e){
        drag = false;
        drawScene(100);
    };

     var mouseMove = function(e) {
        if (!drag) return false;
        dX = (e.pageX-old_x) * Math.PI/canvas.width * .5,
        dY = (e.pageY-old_y) * Math.PI/canvas.height * .5;
        // THETA+= dX;
        // PHI+=dY;
        cursor[0] += dX;
        cursor[1] += dY;

        console.log(dX, dY);

        drawScene(5);

        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
     };

     canvas.addEventListener("mousedown", mouseDown, false);
     canvas.addEventListener("mouseup", mouseUp, false);
     canvas.addEventListener("mouseout", mouseUp, false);
     canvas.addEventListener("mousemove", mouseMove, false);

    drawScene(100);
}
main();