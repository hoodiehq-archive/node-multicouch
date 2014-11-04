var couchr = require('couchr');
var json_tb = require('json-table');
var _ = require('lodash');

function treatErr(err) {
	if (err) {
		console.log(err);
		process.exit(1);		
	}
}

function showData(data) {

	//console.log(_.pluck(data, 'doc'));


	var json_tb_out = new json_tb(_.pluck(data, 'doc'), {
	  chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
	    , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
	    , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
	    , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
	}, function(table) {
	    table.show() // **have to call show() function to print out the table**
	})
}

function api(host, db) {
	return {
		allDocs: function() {
			couchr.get(host + '/' + db + '/_all_docs', { include_docs: true }, function (err, _data, resp) {
				treatErr(err);
				showData(_data.rows);
			})
		},
		get: function(id) {
			couchr.get(host + '/' + db + '/' + id, { include_docs: true }, function (err, data, resp) {
				treatErr(err);
				showData([{doc: data}]);
			})
		},
		post: function(data) {
			couchr.post(host + '/' + db, data, function (err, _data, resp) {
				treatErr(err);
				showData([{doc: _data}])
			})
		},
		head:  function(data) {
			couchr.post(host + '/' + db, data, function (err, _data, resp) {
				treatErr(err);
				showData([{doc: _data}])
			})
		},
		put: function(id, rev, data) {
			data._id = id;
			data._rev = rev;
			couchr.put(host + '/' + db + '/' + id, data, function (err, _data, resp) {
				treatErr(err);
				showData([{doc: _data}])
			})
		},
		del: function(id, rev) {
			var data = {
				rev: rev
			}
			couchr.del(host + '/' + db + '/' + id , data, function (err, _data, resp) {
				treatErr(err);
				showData([{doc: _data}])
			})
		}
	}
}

function wrap_couchr() {
	var wrap = {
		host: process.env.COUCH_URL || 'http://localhost:5984',
		db: {},
		start: function () {
			var self = this;
			couchr.get(this.host + '/_all_dbs', function (err, list) {
				treatErr(err);
				list.forEach(function (key, value) {
					console.log(key, value)
					self.db[key] = api(self.host, key);
				})
			})
		},
		use: function () {

			Object.keys(couchr).forEach(function (propertyValue, propertyName) {
			  	wrap[propertyName] = function () {
			  		return couchr[propertyName].apply(couchr, arguments)
			  	}
			});
		}
	};


	return wrap;
};

module.exports = wrap_couchr();