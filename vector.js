var vec3 = {
	cross: function(a, b) {
		return [a[1] * b[2] - a[2] * b[1],
				a[2] * b[0] - a[0] * b[2],
				a[0] * b[1] - a[1] * b[0]];
	},

	normalize: function(a) {
		var len = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
		return [a[0] / len, a[1] / len, a[2] / len];
	},

	neg: function(a) {
		return [-a[0], -a[1], -a[2]];
	}
};

var vec4 = {
	multiply: function(m, a) {
		return [
			m[0] * a[0] + m[4] * a[1] + m[8] * a[2] + m[12] * a[3],
			m[1] * a[0] + m[5] * a[1] + m[9] * a[2] + m[13] * a[3],
			m[2] * a[0] + m[6] * a[1] + m[10] * a[2] + m[14] * a[3],
			m[3] * a[0] + m[7] * a[1] + m[11] * a[2] + m[15] * a[3],
		];
	}
}