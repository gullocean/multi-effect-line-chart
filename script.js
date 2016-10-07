india_time_offset = 5.5;
json_file = "data.json";
x_label 	= "Time";
y_labels 	= [];
labels 		= [];

arranged 	= d3.map();
options 	= {	isLegend : true };

var g_line;

d3.json(json_file, function(error, data) {
	if (error) throw error;
	labels = Object.keys(data[0]);
	labels.forEach(function(label) {
		if(label != x_label) {
			y_labels.push(label);
		}
	});

	data.forEach(function(d) {
		d[x_label] = convertTimezone(d[x_label], india_time_offset);
		y_labels.forEach(function(label) {
			d[label] = +d[label];
		});
	});
	
	arranged = y_labels.map(function(name) {

    return {
      name: name,
      values: data.map(function(d) {
        return {
          time: d[x_label], 
          value: +(d[name]),
          };
      }),
      visible: true
    };
  });

  xScale.domain(getXExtent(arranged));
	yScale.domain([0, findMaxY(arranged)]);

	g_xAxis.transition().call(d3.axisBottom(xScale));
	g_yAxis.transition().call(d3.axisLeft(yScale));

	line.x(function(d) { return xScale(d.time); })
			.y(function(d) { return yScale(d.value); });

	g_line = g.selectAll(".line")
						.data(arranged)
					.enter().append("g")
						.attr("class", "line");

	g_line.append("path")
				.attr("class", "path")
				.attr("id", function(d) {
					return "line-" + d;
				})
				.attr("d", function(d) {
					return d.visible ? line(d.values) : null;
				});

	addLegend(options.isLegend, y_labels);
	update();
});

function convertTimezone(originTime, offset) {
  var d = new Date(originTime);
  var utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  var convertedTime = new Date(utc + (60 * 60 * 1000 * offset));
  return convertedTime;
}

var container = d3.select(".container"),
	wrapper = d3.select(".svg-wrapper"),
  margin  = {top: 40, right: 40, bottom: 40, left: 40},
  width   = wrapper.node().getBoundingClientRect().width - margin.left - margin.right,
  height  = wrapper.node().getBoundingClientRect().height - margin.top - margin.bottom;

var svg = wrapper.append("svg")
									.attr("width", width + margin.left + margin.right)
									.attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scaleTime()
							.range([0, width]),
    yScale = d3.scaleLinear()
    					.range([height, 0]);

var xAxis = d3.axisBottom(xScale)
							.ticks((width + 2) / (height + 2) * 10)
					    .tickSize(height)
					    .tickPadding(8 - height),
    yAxis = d3.axisLeft(yScale)
    					.ticks(10)
    					.tickSize(width)
    					.tickPadding(8 - width);

var g_xAxis = g.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")");

var g_yAxis = g.append("g")
	.attr("class", "axis axis--y");

var line = d3.line()
						.curve(d3.curveBasis);

function addLegend(option, str) {
	if (!option) return;
	if (str == null) return;
	var legend = container.append("div")
		.attr("class", "legend");
	str.forEach (function(label) {
		legend.append("input")
					.attr("type", "checkbox")
					.attr("id", "checkbox-" + label)
					.property("checked", true)
					.on("change", update);
		legend.append("label")
					.text(label);
	});
}

function update() {
	if (this != window) {
		var legend = this.id.split("-")[1];
		var state  = this.checked;
		var flag = false;

		arranged.filter(function(d){return d.name != legend;}).some(function(d) {
			if (d.visible) {
				arranged.filter(function(d){return d.name == legend;})[0].visible = state;
				flag = true;
				return;
			}
		});
		if (!flag) {
			this.checked = true;
		}
	}
	addLines(arranged);
}

function addLines(data) {
	xScale.domain(getXExtent(data));
	yScale.domain([0, findMaxY(data)]);

	g_xAxis.transition().call(d3.axisBottom(xScale));
	g_yAxis.transition().call(d3.axisLeft(yScale));

	line.x(function(d) { return xScale(d.time); })
			.y(function(d) { return yScale(d.value); });

	g_line.select("path")
				.attr("d", function(d) {
					return d.visible ? line(d.values) : null;
				});
}

function findMaxY(data) {
  var maxYValues = data.map(function(d) { 
    if (d.visible){
      return d3.max(d.values, function(value) {
        return value.value; })
    }
  });
  return d3.max(maxYValues);
}

function getXExtent(data) {
	var maxXValues = data.map(function(d) { 
    if (d.visible){
      return d3.max(d.values, function(value) {
        return value.time; })
    }
  });
  var minXValues = data.map(function(d) { 
    if (d.visible){
      return d3.min(d.values, function(value) {
        return value.time; })
    }
  });
  return [d3.min(minXValues), d3.max(maxXValues)];
}