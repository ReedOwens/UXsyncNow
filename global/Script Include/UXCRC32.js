var UXCRC32 = Class.create();
UXCRC32.prototype = {
    initialize: function () {
        if (!UXCRC32.table) {
            UXCRC32.reversedPolynomial = 0xEDB88320;
            UXCRC32.crc32_initial = 0xFFFFFFFF;
            UXCRC32.table = this.crc32_generate(UXCRC32.reversedPolynomial);
        }
    },
    crc32_generate: function (reversedPolynomial) {
        var table = [];
        var i, j, n;

        for (i = 0; i < 256; i++) {
            n = i;
            for (j = 8; j > 0; j--) {
                if ((n & 1) === 1) {
                    n = (n >>> 1) ^ reversedPolynomial;
                } else {
                    n = n >>> 1;
                }
            }
            table[i] = n;
        }
  
        return table;
    },
    crc32_add_byte: function (table, crc2, byte2) {
        crc2 = (crc2 >>> 8) ^ table[(byte2) ^ (crc2 & 0x000000FF)];
        return crc2;
    },
    crc32_final: function (crc) {
        crc = ~crc;
        crc = (crc < 0) ? (0xFFFFFFFF + crc + 1) : crc;
        return crc;
    },

    crc32_compute_string: function (reversedPolynomial, str) {
        var table = this.crc32_generate(reversedPolynomial);
        var i;

        var crc = UXCRC32.crc32_initial;

        for (i = 0; i < str.length; i++)
            crc = this.crc32_add_byte(table, crc, str.charCodeAt(i));

        crc = this.crc32_final(crc);
        return crc;
    },
    computeString: function (str) {
        var table = UXCRC32.table;
        var crc = 0;
        var i;

        crc = UXCRC32.crc32_initial;

        for (i = 0; i < str.length; i++)
            crc = this.crc32_add_byte(table, crc, str.charCodeAt(i));

        crc = this.crc32_final(crc);
        return this.toHex(crc);
    },
    toHex: function (value, len) {
        if (typeof (len) === 'undefined') len = 8;
        var num = value < 0 ? (0xFFFFFFFF + value + 1) : value;
        var hex = num.toString(16).toUpperCase();
        var pad = hex.length < len ? len - hex.length : 0;
        return "0".repeat(pad) + hex;
    },

    type: "UXCRC32"
};
