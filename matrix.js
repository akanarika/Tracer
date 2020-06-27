// matrix 4x4
var m4 = {
    multiply: function(a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];

        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];

        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];

        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];

        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];

        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];

        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];

        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];

     
        return [
                  b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
                  b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
                  b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
                  b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,

                  b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
                  b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
                  b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
                  b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,

                  b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
                  b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
                  b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
                  b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,

                  b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
                  b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
                  b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
                  b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
                ];
        },
    
    init: function() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    init_v: function(a, b, c, d) {
        return [
            a[0], a[1], a[2], 0,
            b[0], b[1], b[2], 0,
            c[0], c[1], c[2], 0,
            d[0], d[1], d[2], 1,
        ];
    },

    translate: function(tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },
     
    scale: function(sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    proj: function(w, h, d) {
        return [
            2 / w, 0, 0, 0,
            0, 2 / h, 0, 0,
            0, 0, 2 / d, 0,
            0, 0, 0, 1,
        ];
    },

    transpose: function(a) {
        return [
                a[0], a[4], a[8], a[12],
                a[1], a[5], a[9], a[13],
                a[2], a[6], a[10], a[14],
                a[3], a[7], a[11], a[15],
        ];
    },
};

// matrix 3x3
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

    init_v: function(a, b, c) {
        return [
            a[0], a[1], a[2],
            b[0], b[1], b[2],
            c[0], c[1], c[2],
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

    transpose: function(a) {
        return [
                a[0], a[3], a[6],
                a[1], a[4], a[7],
                a[2], a[5], a[8],
        ];
    },

    tom4: function(a) {
        return [
                a[0], a[1], a[2], 0,
                a[3], a[4], a[5], 0,
                a[6], a[7], a[8], 0,
                0, 0, 0, 1,
        ];
    }
};