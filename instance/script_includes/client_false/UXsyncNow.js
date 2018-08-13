var UXsyncNow = Class.create();
UXsyncNow.prototype = {
    initialize: function () {
    },
    getApplications: function () {
        var gr = new GlideRecord('sys_app');
        var tables = [];

        gr.query();
        while (gr.next()) {
            tables.push({
                name: gr.name + "",
                active: gr.active,
                scope: gr.scope + "",
                sys_id: gr.sys_id + "",
                short_description: gr.short_description + "",
                version: gr.version + ""
            })
        }
        return tables;
    },
    getTables: getTables = function () {
        function inTables(tableHash, name) {
            for (var table in tableHash) if (table === name) return true;
            return false;
        }

        function hasScope(table) {
            var gr = new GlideRecord(table);
            gr.initialize();
            var fields = gr.getFields();
            for (var i = 0; i < fields.size(); i++) {
                var glideElement = fields.get(i);
                if (glideElement.getName() == 'sys_scope') return true;
            }
            return false;
        }

        function hasName(table) {
            var gr = new GlideRecord(table);
            gr.initialize();
            var fields = gr.getFields();
            for (var i = 0; i < fields.size(); i++) {
                var glideElement = fields.get(i);
                if (glideElement.getName() == 'name') return true;
            }
            return false;
        }

        //var ignoreTables=['sys_dictionary','sys_ui_policy', 'sys_security_acl'];
        var ignoreTables = ['sys_dictionary'];
        var ignoreFields = {
            'sys_script' : ['message']
        }
        var tables = {};
        var unmappedTables = {};
        var nonApplicationTables = {};
        var gr = new GlideRecord('sys_dictionary');
        gr.addEncodedQuery("internal_type=html_template" +
            "^ORinternal_type=html_script" +
            "^ORinternal_type=html" +
            "^ORinternal_type=translated_html" +
            "^ORinternal_type=css" +
            "^ORinternal_type=json" +
            "^ORinternal_type=script" +
            "^ORinternal_type=script_plain" +
            "^ORinternal_type=script_server" +
            "^ORinternal_type=xml");
        gr.query();
        var numOfFields = 0;
        while (gr.next()) {
            numOfFields++;
            var field = {
                name: gr.element + "",
                table: gr.name + "",
                label: gr.column_label + "",
                type: gr.internal_type + "",
                scope: gr.sys_scope.getDisplayValue(),
                scope_id: gr.sys_scope + ""
            };
            if (ignoreFields[field.table] !== undefined) {
                var ifields = ignoreFields[field.table];
                var ifound = false;
                for (var j=0; j<ifields.length; j++ ) {
                    if (ifields[j] === field.name) ifound = true;
                }

                if (ifound) {
                    continue;  // Ignore this field
                }
            }
            if (field.table.indexOf('var__m_') !== 0 && ignoreTables.indexOf(field.table) === -1) {
                if (typeof tables[field.table] === 'undefined') {
                    tables[field.table] = {key: '', name: gr.name + ""};
                    tables[field.table].fields = [];
                }
                tables[field.table].fields.push(field);
            }
        }

        // Check for application Scope
        for (table in tables) {
            if (!hasScope(table)) {
                // No scope it is unmanaged
                var tmpTable = tables[table];
                nonApplicationTables[table] = tmpTable;
                delete tables[table]
            }
        }

        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('display', '=', true);
        gr.query();
        var display = [];
        while (gr.next()) {
            var name = gr.element + "";
            var table = gr.name + "";
            if (typeof tables[table] !== 'undefined') {
                // Found one that we need to set the key
                tables[table].key = name;
            }
        }
// check for name
        // Now any without keys need local configuration
        for (table in tables) {
            if (tables[table].key === '') {
                // Check and see if the table has a name column and use it
                if (hasName(table)) {
                    tables[table].key = 'name';
                } else {
                    // Move it to the unmappedTables
                    tmpTable = tables[table];
                    unmappedTables[table] = tmpTable;
                    delete tables[table];
                }
            }
        }

        // fill out the label for each table
        for (table in tables) {
            var tbl = tables[table];
            var tlabel = new GlideRecord(tbl.name);
            tbl.label = tlabel.getLabel();
        }


        return ({tables: tables, tables_unmapped: unmappedTables, tables_non_application: nonApplicationTables});
    },
    // Returns:
    // Array of "files" that have changes since the specified date
    // Each file is :
    // [
    //  table
    //  sys_id
    //  Name of "Record"
    //  Last changed date
    //  Last changed User
    //  [ fieldsWithData .. ]
    // ]

    getApplicationFiles: function (application, tables, since) {
        var files = [];
        var d;
        if (since) {
            d = new GlideDateTime();
            d.setNumericValue(since);
        }
        for (var table in tables) {
            var gr = new GlideRecord(table);
            var fields = tables[table].fields;
            gr.addQuery('sys_scope', '=', application);
            if (since) {
                gr.addQuery('sys_updated_on', '>=', d);
            }
            gr.query();
            while (gr.next()) {
                var nonBlankFields = [];
                var crc = [];
                for (var i = 0; i < fields.length; i++) {
                    // if (gr[fields[i].name].getDisplayValue() != '') {
                    if (!this.isBlank(gr[fields[i].name].getDisplayValue(), fields[i].type)) {
                        // have content
                        nonBlankFields.push(fields[i].name);
                        crc.push(this.crc(gr[fields[i].name].getDisplayValue()));
                    }
                }
                if (nonBlankFields.length > 0)
                    files.push([table + "", gr.sys_id + '', gr.getDisplayValue(), gr.sys_updated_on, gr.sys_updated_by, nonBlankFields, crc]);
            }
        }
        return files;
    },
    getBlankTemplates: function (type) {
        if (type === 'script' || type === 'script_plain' || type === 'script_server') {
            return [
                "function onCondition() {\n" +
                "\n" +
                "}",
                // For business rules
                "(function executeRule(current, previous /*null when async*/) {\n" +
                "\n" +
                "\t// Add your code here\n" +
                "\n" +
                "})(current, previous);"
            ]
        }
        return [];
    },
    isBlank: function (value, type) {
        // Check for fields with blank values so we know they have no data in them.
        // Some fields have data but are "blank" templates.  We should ignore them too

        if (value === "") return true;
        var blanks = this.getBlankTemplates(type);
        for (var i = 0; i < blanks.length; i++)
            if (blanks[i] === value) {
                return true;
            }
        return false;
    },
    validUserDetail: function () {
        var result = "SUCCESS";
        var message = "";
        var user = gs.getUser();
        var roles = user.getRoles().toArray();
        var admin = false;
        var uxsyncnow_user = false;
        var userName = user.getFullName() + "";
        for (var i = 0; i < roles.length; i++) {
            if (roles[i] + "" === "admin") admin = true;
            if (roles[i] + "" === "uxsyncnow_user") uxsyncnow_user = true;
        }

        if (!admin) {
            result = "ERROR";
            message += " does not have role : admin\n";
        }

        if (!uxsyncnow_user) {
            result = "ERROR";
            message += " does not have role : uxsyncnow_user\n" + gs.getUserDisplayName() + " Current roles : " + roles.join(',');
        }

        if (result === "SUCCESS") {
            message = "User is properly configured";
        }

        if (result === "ERROR") {
            message = "User " + userName + "\n" + message;
        }

        var ret = {result: result, message: message};
        return ret;
    },
    validUser: function () {
        return (this.validUserDetail().result === 'SUCCESS');
    },
    getFile: function (table, sys_id, fields) {
        var files = {};
        var gr = new GlideRecord(table);
        gr.get(sys_id);
        if (!gr)
            return ({status: "ERROR", error_message: "Could not find record " + table + ":" + sys_id});

        for (var i = 0; i < fields.length; i++) {
            field = fields[i];
            files[field] = gr.getValue(field);
        }
        var now = new GlideDateTime();
        return ({
            status: "SUCCESS",
            files: files,
            last: gr.sys_updated_on.getDisplayValue(),
            now: now.getNumericValue()
        });
    },
    /**
     *
     *  Javascript crc32
     *  http://www.webtoolkit.info/
     *
     **/
    crcOld: function (str) {
        function Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        str = Utf8Encode(str);
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
        var crc = 0;
        var x = 0;
        var y = 0;
        crc = crc ^ (-1);
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            y = (crc ^ str.charCodeAt(i)) & 0xFF;
            x = parseInt(table.substr(y * 9, 8), 16);

            crc = (crc >>> 8) ^ x;
        }
        return crc ^ (-1);
    },
    crc: function (str) {
        /*jshint bitwise:false */
        var i, l,
            hval = 0x811c9dc5;

        for (i = 0, l = str.length; i < l; i++) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    },
    saveApplicationFile: function (table, sys_id, field, content) {
        var gr = new GlideRecord(table);
        if (gr.get(sys_id)) {
            gr[field] = content;
            gr.update();
            return this.crc(content);
        } else {
            // Cant find record.  Return error as we don't create records
            return null;
        }
    },

    type: 'UXsyncNow'
};