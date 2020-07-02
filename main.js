// UI
const c = document.querySelector('#c');
var w = c.width;
var h = c.height;

// shader
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

// cam
function generateSpheres(c, static) {
    if (static == 1) {
        return [[0, 400, 0, 400, 2, .4,.5,.6], [0, -10000, 0, 10000, 1, .2, .2, .8]];
    }
    var res = [];
    for (var i = 0; i < c; i++) {
        var x = 5 * (Math.random() * w - w / 2);
        var y = 5 * (Math.random() * h - h / 2);
        var z = - Math.random() * h / 20.0 - 20.0;
        res.push([x, y, z, 
            2 * Math.random() * h + 100.0, 
            Math.floor(Math.random() * 2), 
            .2 + .8 * Math.random(), .2 + .8 * Math.random(), .2 + .8 * Math.random()]);
    }
    return res;
}
var cam = new Camera([0, 3000, 3000], [0, -0, -1.0], [0, 1.0, 0]);
var spheres = generateSpheres(10, 0);
var hasGround = 1;


function drawScene(sample, gl, prog) {
    // w, h
    gl.uniform1f(gl.getUniformLocation(prog, "w"), w);
    gl.uniform1f(gl.getUniformLocation(prog, "h"), h);

    // u_seed
    var usl = gl.getUniformLocation(prog, "u_seed");
    gl.uniform1f(usl, 1.0);

    // u_cursor
    var ucl = gl.getUniformLocation(prog, "u_cursor");
    gl.uniform3f(ucl, cursor[0], cursor[1], cursor[2]);

    // u_cursor
    var ugl = gl.getUniformLocation(prog, "u_ground");
    gl.uniform1i(ugl, hasGround);

    // sample count
    gl.uniform1i(gl.getUniformLocation(prog, "u_sample_count"), sample);

    // proj
    var mat = m3.init();
    mat = m3.tom4(m3.multiply(mat, m3.proj(w, h)));
    var ml = gl.getUniformLocation(prog, "u_matrix");
    gl.uniformMatrix4fv(ml, false, mat);

    for (var i = 0; i < spheres.length; i++) {
        gl.uniform3f(gl.getUniformLocation(prog, "u_spheres[" + i + "].o"), spheres[i][0], spheres[i][1], spheres[i][2]);
        gl.uniform1f(gl.getUniformLocation(prog, "u_spheres[" + i + "].r"), spheres[i][3]);
        gl.uniform1i(gl.getUniformLocation(prog, "u_spheres[" + i + "].mat.i"), spheres[i][4]);
        gl.uniform3f(gl.getUniformLocation(prog, "u_spheres[" + i + "].mat.att"), spheres[i][5], spheres[i][6], spheres[i][7]);
    }

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function main() {
    var canvas = document.querySelector("#c");  
    var gl = canvas.getContext("webgl");
    if (!gl) {
        // No GL
        return;
    }

    var prog = initShaders(gl);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    
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
    gl.enableVertexAttribArray(ppal);
    gl.vertexAttribPointer(ppal, 3, gl.FLOAT, false, 0, 0);

    // mouse
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
        drawScene(100, gl, prog);
    };

     var mouseMove = function(e) {
        if (!drag) return false;
        dX = (e.pageX-old_x) * Math.PI/canvas.width * .5,
        dY = (e.pageY-old_y) * Math.PI/canvas.height * .5;
        cursor[0] += dX;
        cursor[1] += dY;
        drawScene(5, gl, prog);
        old_x = e.pageX, old_y = e.pageY;
        e.preventDefault();
     };

    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    var param = function() {
      this.ground = true;
      this.spheres = function() { spheres = generateSpheres(10, 0); drawScene(10, gl, prog); };
    };
    var params = new param();

    function initPanel() {
        var gui = new dat.GUI();
        gui.add(params, 'ground').onChange(function(){hasGround = !hasGround; drawScene(100, gl, prog);});
        gui.add(params, 'spheres');
    };

    drawScene(100, gl, prog);
    initPanel();
}
main();