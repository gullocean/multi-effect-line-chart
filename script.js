india_time_offset = 5.5;
json_file = "data.json";
x_label = "Time";

arranged = d3.map();
isDraw = d3.map();

d3.json(json_file, function(error, data) {
	if (error) throw error;
	var data_keys = Object.keys(data[0]);
	data_keys.forEach (function (d) {
		arranged.set(d, []);
		isDraw.set(d, true);
	});
	var arranged_data = new Array(data_keys.length);
	for (var i = 0; i < data_keys.length; i++) {
		arranged_data[i] = new Array();
	}
	data.forEach(function(d) {
		for (var i = 0; i < data_keys.length; i ++) {
			if (data_keys[i] == x_label) {
				arranged_data[i].push(convertTimezone(d[data_keys[i]], india_time_offset));
			}
			else {
				arranged_data[i].push(+d[data_keys[i]]);
			}
		}
	});
	data_keys.forEach (function(key) {
		arranged.set(key, arranged_data[data_keys.indexOf(key)]);
	});
});

function convertTimezone(originTime, offset) {
  var d = new Date(originTime);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  var convertedTime = new Date(utc + (3600000*offset));
  return convertedTime;
}