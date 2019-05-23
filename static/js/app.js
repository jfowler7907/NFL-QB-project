let roundTable = d3.select("#roundtable");
let roundBar = d3.select("#roundbar")

var svgWidth = 1150;
var svgHeight = 500;

var chartMargin = {
  top: 30,
  right: 20,
  bottom: 50,
  left: 50
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

function buildTable(stat) {
  d3.json().then((data) => {
    buildTable(data);


  });
};

function init() {
 // Grab a reference to the dropdown select element
 var roundSelector = d3.select("#draftround");
 var playerSelector = d3.select("#playerNames");

 d3.json("/names").then((qbName) => {
    qbName.forEach((name) => {
     playerSelector
       .append("option")
       .text(name)
       .property("value", name);
   });
 });

 d3.json("/rounds").then((roundList) => {
   roundList.forEach((round) => {
     roundSelector
      .append("option")
      .text(round)
      .property("value", round);
  });
 });
}

//  d3.json('/bar').then((barData) => {
//    // list of stats = +list of stats
//    console.log(barData["1"]["Avg_Attempts"]);
//  });
// }

function optionChanged(newData) {
  // Fetch new data each time a new sample is selected
  var stringData = String(newData)
  if (stringData == "1" || stringData == "2" || stringData == "3" || stringData == "4" || stringData == "5" || stringData == "6" || stringData == "7") {
    buildBar(stringData)
    // buildTable(stringData)
  } else {
    //PlayerData(newData);
    PlayerData(stringData);
    // otherPlayerData(newData);
  }
}

function buildBar(bdata) {
  var svg = d3.select("#roundbar")
    .html("")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  d3.json('/bar').then((barData) => {
    barData.forEach((round) => {

      let selectedData = "Avg_Attempts"

      round.Draft_Round = round.Draft_Round
      round[`${selectedData}`] = +round[`${selectedData}`]
    });

    var statSelect = Object.keys(barData[0])
    for ( var i = 0; i < statSelect.length; i++){
      if (statSelect[i] === "Draft_Round") {
        statSelect.splice(i, 1);
   }
}

    let selectedData = "Avg_Attempts"
    var xBandScale = d3.scaleBand()
    .domain(barData.map(d => d.Draft_Round))
    .range([0, chartWidth])
    .padding(0.1);

    var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d[`${selectedData}`])])
    .range([chartHeight, 0]);

    var bottomAxis = d3.axisBottom(xBandScale);
    var leftAxis = d3.axisLeft(yLinearScale).ticks(7);

    chartGroup.append("g")
      .attr("id", "yaxis")
      .call(leftAxis);

    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .style("font", "14px sans-serif")
      .call(bottomAxis);

    chartGroup.selectAll("#roundbar")
      .data(barData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xBandScale(d.Draft_Round))
      .attr("y", d => yLinearScale(d[`${selectedData}`]))
      .attr("width", xBandScale.bandwidth())
      .attr("fill", "rgb(68, 109, 186)")
      .attr("height", d => chartHeight - yLinearScale(d[`${selectedData}`]));

      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left + 2)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .attr("id", "yaxistext")
        .text(`${selectedData}`);

      chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight +40})`)
        .attr("class", "axisText")
        .text("Draft Round");

      var yLinearScaleUpdate = chartGroup.append('g')
          .call(leftAxis)

      var updateBar = function (data) {
        d3.selectAll("#roundbar").select("#yaxis").remove()
        d3.selectAll("#roundbar").select("#yaxistext").remove()
        yLinearScale.domain([0, d3.max(barData, d => d[`${data}`])])

        var bars = d3.selectAll("#roundbar");
        bars.selectAll(".bar").remove();
        chartGroup.selectAll("#roundbar")
          .data(barData)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", d => xBandScale(d.Draft_Round))
          .attr("y", d => yLinearScale(d[`${data}`]))
          .attr("width", xBandScale.bandwidth())
          .attr("fill", "rgb(68, 109, 186)")
          .attr("height", d => chartHeight - yLinearScale(d[`${data}`]))

          chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - chartMargin.left + 2)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .attr("class", "axisText")
            .attr("id", "yaxistext")
            .text(`${data}`);

        yLinearScaleUpdate.call(leftAxis)

        bars.exit().remove();
      }

    var dropdown = d3.select("#roundbar")
                    .insert("select", "svg")
                    .on("change", function() {
                        var newStat = d3.select(this).property('value');
                        updateBar(newStat);

                      });

    dropdown.selectAll("option")
          .data(statSelect)
          .enter().append("option")
          .attr("value", function (d) { return d; })
          .text(function (d) {
            return d;});
});
};


// Build line graph
function PlayerData(playerData) {
  
  svg = d3.select("#roundbar")
    .html("")


// Append a group area, then set its margins
// var chartGroup = svg.append("g")
//   .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

// Configure a parseTime function which will return a new Date object from a string
//var parseTime = d3.timeParse("%Y");

// Configure a line function which will plot the x and y coordinates using our scales
  // var drawLine = d3.line()
  //   .x(data => xTimeScale(data.Year))
  //   .y(data => yLinearScale(data.QRB));

  // // Configure a time scale
  // // d3.extent returns the an array containing the min and max values for the property specified
  // var xTimeScale = d3.scaleBand()
  //   .domain(d3.extent(playerProfile.map(data => data.Year)))
  //   .range([0, chartWidth]);

  // // Configure a linear scale with a range between the chartHeight and 0
  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(playerProfile, d => d.QRB)])
  //   .range([chartHeight, 0]);

  var yeardata = [];
  var QBRdata = [];
  var leaugeQBR = [];
// Load data from playerData
d3.json(`/line/${playerData}`).then((playerProfile)=> {
var leagueData = playerProfile.map(d=>d.QBRs).slice(-1)[0];
   // Format the date and cast the playerProfile value to a number
  playerProfile.forEach(function(data) {

    yeardata.push(data.Year);
    QBRdata.push(data.QBR);
  //console.log(data);

var trace1 = {
  x: yeardata,
  y: QBRdata,
  mode: "lines+markers",
};

var trace2 = {
  x: yeardata,
  y: leagueData,
  mode: "lines+markers",
  line: {
    dash: "dot", width: 4
  }
};

var data1 = [
  trace1, trace2
]

var layout = {
  title: "QBR over time"
};

Plotly.newPlot("roundbar", data1, layout);
});



    // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  // var bottomAxis = d3.axisBottom(xTimeScale);
  // var leftAxis = d3.axisLeft(yLinearScale);


  // Append an SVG path and plot its points using the line function
  // chartGroup.append("path")

  // // The drawLine function returns the instructions for creating the line for forceData
  //   .attr("d", drawLine(playerProfile))
  //   .classed("line", true);

  // // Append an SVG group element to the chartGroup, create the left axis inside of it
  // chartGroup.append("g")
  //   .classed("axis", true)
  //   .call(leftAxis);

  // // Append an SVG group element to the chartGroup, create the bottom axis inside of it
  // // Translate the bottom axis to the bottom of the page
  // chartGroup.append("g")
  //   .classed("axis", true)
  //   .attr("transform", `translate(0, ${chartHeight})`)
  //   .call(bottomAxis); 
});

};

// set the dimensions and margins of the graph
// var margin = {top: 20, right: 20, bottom: 30, left: 50},
//     width = 960 - margin.left - margin.right,
//     height = 500 - margin.top - margin.bottom;

// // parse the date / time
// var parseTime = d3.timeParse("%Y");

// // set the ranges
// var x = d3.scaleTime().range([0, width]);
// var y = d3.scaleLinear().range([height, 0]);

// // define the line
// var valueline = d3.line()
//     .x(function(d) { return x(d.Year); })
//     .y(function(d) { return y(d.QBR); });
// // define the line
// var valueline2 = d3.line()
//     .x(function(d) { return x(d.Year); })
//     .y(function(d) { return y(d.QBR); });
  
// // append the svg obgect to the body of the page
// // appends a 'group' element to 'svg'
// // moves the 'group' element to the top left margin
// var svg = d3.select("#roundbar").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// function draw(data, playerData) {
  
//   var data = data[playerData];
  
//   console.log(playerData);

//   // format the data
//   data.forEach(function(d) {
//       d.Year = parseTime(d.Year);
//       d.QBR = +d.QBR;
//       //d.Exports = +d.Exports;
//   });
  
//   // sort years ascending
//   data.sort(function(a, b){
//     return a["Year"]-b["Year"];
// 	})
 
//   // Scale the range of the data
//   x.domain(d3.extent(data, function(d) { return d.Year; }));
//   y.domain([0, d3.max(data, function(d) {
// 	  return Math.max(d.QBR); })]);
  
//   // Add the valueline path.
//   svg.append("path")
//       .data([data])
//       .attr("class", "line")
//       .attr("d", valueline);
//   // Add the valueline path.
//   // svg.append("path")
//   //     .data([data])
//   //     .attr("class", "line")
//   //     .attr("d", valueline2);  
//   // Add the X Axis
//   svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));

//   // Add the Y Axis
//   svg.append("g")
//       .call(d3.axisLeft(y));
//   }
// // Get the data
// d3.json(`/line/${stringData}`, function(error, data) {
//   if (error) throw error;
  
//   // trigger render
//   draw(data, stringData);
// });
init();
