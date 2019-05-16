let roundTable = d3.select("#roundtable");
let roundBar = d3.select("#roundbar")

var svgWidth = 1000;
var svgHeight = 700;

var chartMargin = {
  top: 30,
  right: 30,
  bottom: 30,
  left: 30
};

var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;



function buildTable(tdata) {
  roundTable.html('')
    .append('tbody');
  let tbody = d3.select('tbody')
  tdata.forEach((data) => {
    var row = tbody.append("tr");
    Object.values(data).forEach((value) => {
     var cell = row.append("td");
     cell.text(value);
   });
 });
};

// function buildBar(bdata) {
//   var svg = d3.select("#roundbar")
//     .append("svg")
//     .attr("height", svgHeight)
//     .attr("width", svgWidth);
//
//   var chartGroup = svg.append("g")
//     .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
//
//   d3.json('###PLACE ROUTE HERE###').then((barData) {
//     // list of stats = +list of stats
//
//     var xBandScale = d3.scaleBand()
//     .domain(barData.map(d => d.round))
//     .range([0, chartWidth])
//     .padding(0.1);
//
//     var yLinearScale = d3.scaleLinear()
//     .domain([0, d3.max(barData, d => d.hours)])
//     .range([chartHeight, 0]);
//   });
// };

function nflData(stat) {
  d3.json(`/search/${stat}`).then((data) => {
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

init();
