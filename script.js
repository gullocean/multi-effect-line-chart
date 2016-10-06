india_time_offset = 5.5;
json_file = "data.json";
x_label = "Time";

arranged 	= d3.map();
isDraw 		= d3.map();
labels 		= [];
options 	= {
	isLegend : true
};

d3.json(json_file, function(error, data) {
	if (error) throw error;
	labels = Object.keys(data[0]);
	labels.forEach (function (d) {
		arranged.set(d, []);
		isDraw.set(d, true);
	});
	var arranged_data = new Array(labels.length);
	for (var i = 0; i < labels.length; i++) {
		arranged_data[i] = new Array();
	}
	data.forEach(function(d) {
		for (var i = 0; i < labels.length; i ++) {
			if (labels[i] == x_label) {
				arranged_data[i].push(convertTimezone(d[labels[i]], india_time_offset));
			}
			else {
				arranged_data[i].push(+d[labels[i]]);
			}
		}
	});
	labels.forEach (function(key) {
		arranged.set(key, arranged_data[labels.indexOf(key)]);
	});
	addLegend(options.isLegend);
});

function convertTimezone(originTime, offset) {
  var d = new Date(originTime);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  var convertedTime = new Date(utc + (60 * 60 * 1000 * offset));
  return convertedTime;
}

var body = d3.select("body"),
	wrapper = d3.select(".svg-wrapper"),
  margin  = {top: 40, right: 40, bottom: 40, left: 40},
  width   = wrapper.node().getBoundingClientRect().width - margin.left - margin.right,
  height  = wrapper.node().getBoundingClientRect().height - margin.top - margin.bottom;

var svg  = wrapper.append("svg")
					.attr("width", width)
					.attr("height", height);

function addLegend(option) {
	if (!option) return;
	var legend = body.append("div")
		.attr("class", "legend");
	labels.forEach (function(d) {
		if (d != x_label) {
			legend.append("input")
						.attr("type", "checkbox")
						.attr("id", "checkbox-" + d)
						.property("checked", isDraw.get(d))
						.on("change", update);
			legend.append("label")
						.text(d);
		}
	});
}

function update() {
	var legend = this.id.split("-")[1];
	var state  = this.checked;
	isDraw.set(legend ,state);
}

var x  = d3.scaleTime().range([0, width]),
    y  = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);