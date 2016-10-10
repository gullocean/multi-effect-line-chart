india_time_offset = 5.5;
json_file = "data.json";
x_label 	= "Time";
y_labels 	= [];
labels 		= [];

arranged 	= d3.map();
options 	= {	isLegend : true,
							tick_size : 6,
							delay_time : 0,
							duration_time : 300
						};

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

	g_xAxis.transition()
				.delay(options.delay_time)
				.duration(options.duration_time)
				.call(xAxis);
	g_yAxis.transition()
				.delay(options.delay_time)
				.duration(options.duration_time)
				.call(yAxis);

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

svg.append("rect")
    .attr("width", width)
    .attr("height", height)                                    
    .attr("x", 0) 
    .attr("y", 0)
    .attr("id", "mouse-tracker")
    .style("fill", "white")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var g = svg.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xScale = d3.scaleTime()
							.range([0, width]),
    yScale = d3.scaleLinear()
    					.range([height, 0]);

var xAxis = d3.axisBottom(xScale),
    yAxis = d3.axisLeft(yScale);

var g_xAxis = g.append("g")
	.attr("class", "axis axis--x")
	.attr("transform", "translate(0," + height + ")");

var g_yAxis = g.append("g")
	.attr("class", "axis axis--y");

var line = d3.line()
						.curve(d3.curveBasis);



// Hover line 
  var hoverLineGroup = svg.append("g") 
            .attr("class", "hover-line");

  var hoverLine = hoverLineGroup // Create line with basic attributes
        .append("line")
            .attr("id", "hover-line")
            .attr("x1", 10).attr("x2", 10) 
            .attr("y1", 0).attr("y2", height + 10)
            .style("pointer-events", "none") // Stop line interferring with cursor
            .style("opacity", 1e-6); // Set opacity to zero 

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

	g_xAxis.transition()
				.delay(options.delay_time)
				.duration(options.duration_time)
				.call(xAxis);
	g_yAxis.transition()
				.delay(options.delay_time)
				.duration(options.duration_time)
				.call(yAxis);

	line.x(function(d) { return xScale(d.time); })
			.y(function(d) { return yScale(d.value); });

	g_line.select("path")
				.transition()
				.delay(options.delay_time)
				.duration(options.duration_time)
				.attr("d", function(d) {
					return d.visible ? line(d.values) : null;
				});

	d3.select("#mouse-tracker")
  .on("mousemove", mousemove)
  .on("mouseout", function() {


      //d3.select("#hover-line")
      //    .style("opacity", 1e-6);
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

function mousemove() { 
  var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
  var graph_x = xScale.invert(mouse_x); // 

  var mouse_y = d3.mouse(this)[1]; // Finding mouse y position on rect
  var graph_y = yScale.invert(mouse_y);
  
  var format = d3.timeFormat('%b %Y'); // Format hover date text to show three letter month and full year
  
  d3.select("#hover-line") // select hover-line and changing attributes to mouse position
      .attr("x1", mouse_x) 
      .attr("x2", mouse_x)
      .style("opacity", 1); // Making line visible

  // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

  //var x0 = xScale.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (date) to range (position on screen). So it takes the position on the screen and converts it into an equivalent date! */
  //i = bisectDate(data, x0, 1), // use our bisectDate function that we declared earlier to find the index of our data array that is close to the mouse cursor
  /*It takes our data array and the date corresponding to the position of or mouse cursor and returns the index number of the data array which has a date that is higher than the cursor position.*/
  //d0 = data[i - 1],
  //d1 = data[i],
  /*d0 is the combination of date and rating that is in the data array at the index to the left of the cursor and d1 is the combination of date and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and date above and below the date that corresponds to the position of the cursor.*/
  //d = x0 - d0.date > d1.date - x0 ? d1 : d0;
  /*The final line in this segment declares a new array d that is represents the date and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the date and close combination on the left is greater than the distance between the mouse cursor and the date and close combination on the right then d is an array of the date and close on the right of the cursor (d1). Otherwise d is an array of the date and close on the left of the cursor (d0).*/

  //d is now the data row for the date closest to the mouse position

  //focus.select("text").text(function(columnName){
     //because you didn't explictly set any data on the <text>
     //elements, each one inherits the data from the focus <g>

     //return (d[columnName]);
  //});
}; 