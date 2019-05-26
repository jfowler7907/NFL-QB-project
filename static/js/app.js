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

function buildTable(round) {
//   d3.json(`/statsTable/${round}`).then((data) => {
//     var svg = d3.select("#roundtable")
//       .html("")
//       .append("svg")
//       .attr("height", svgHeight)
//       .attr("width", svgWidth);
//     var tableData = data
//
//   var table = new Tabulator("roundtable", {
//     data:tableData, //set initial table data
//     columns:[
//         {title:"Player", field:"Player"},
//         {title:"Year Drafted", field:"Year_Drafted"},
//         {title:"Round Drafted", field:"Round_Drafted"},
//         {title:"Overall Pick", field:"Overall_Pick"},
//         {title:"Avg Attempts", field:"Avg_Attempts"},
//         {title:"Avg. Completions", field:"Avg_Completions"},
//         {title:"Avg. Passing Yards", field:"Avg_Passing_Yards"},
//         {title:"Avg. Yards/Attempt", field:"Avg_Yards_per_Attempt"},
//         {title:"Avg. TDs", field:"Avg_TDs"},
//         {title:"Avg. Sacks", field:"Avg_Sacks"},
//         {title:"Avg. Loss of Yards", field:"Avg_Loss_of_Yards"},
//         {title:"Avg. QBR", field:"Avg_QBR_REAL"},
//         {title:"Avg. Points", field:"Avg_Points"},
//         {title:"Total Games Played", field:"Game_Total"},
//     ],
// });
//
//   });
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

function optionChanged(newData) {
  // Fetch new data each time a new sample is selected
  var stringData = String(newData)
  if (stringData == "1" || stringData == "2" || stringData == "3" || stringData == "4" || stringData == "5" || stringData == "6" || stringData == "7") {
    buildBar(stringData)
    buildTable(stringData)
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
<<<<<<< HEAD
  svg2 = d3.select("roundtable")
=======
  svg2 = d3.select("#roundtable")
>>>>>>> 19365b38edb7a011a7e2d4bf69d6837da05cdd65
    .html("")

  var yeardata = [];
  var QBRdata = [];
  var leaugeQBR = [];
// Load data from playerData
d3.json(`/line/${playerData}`).then((playerProfile)=> {
var leagueData = playerProfile.map(d=>d.QBRs).slice(-1)[0];
  console.log(playerProfile);
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


<<<<<<< HEAD
=======
});

d3.json(`/doubleBar/${PlayerData}`).then((data)=>{
var statName = d3.keys(data[0]);
var individualStats = d3.values(data[0]);
var allStats = data.map(d=>d);
// var stats = data.map(d=>d);
//   data.forEach(function(d){
//     statName.push()
//   })
console.log(allStats);
console.log(statName);
console.log(individualStats);

var trace1 = {
   x: statName,
   y: individualStats,
   type: 'bar'
 };
var trace2 = {
x: statName,
y: allStats,
type: 'bar'
};
var chart = [trace1, trace2];
var layout = {barmode: 'group'};
Plotly.newPlot('roundtable', chart, layout);

>>>>>>> 19365b38edb7a011a7e2d4bf69d6837da05cdd65
});

};

<<<<<<< HEAD

=======
>>>>>>> 19365b38edb7a011a7e2d4bf69d6837da05cdd65
init();
