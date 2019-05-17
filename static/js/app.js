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



// function buildTable(tdata) {
//   roundTable.html('')
//     .append('tbody');
//   let tbody = d3.select('tbody')
//   tdata.forEach((data) => {
//     var row = tbody.append("tr");
//     Object.values(data).forEach((value) => {
//      var cell = row.append("td");
//      cell.text(value);
//    });
//  });
// };

// function buildBar(bdata) {
//   var svg = d3.select("#roundbar")
//     .append("svg")
//     .attr("height", svgHeight)
//     .attr("width", svgWidth);
//
//   var chartGroup = svg.append("g")
//     .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);
//
//   d3.json('/bar').then((barData) => {
//
//     rounds = []
//     Object.keys(barData).forEach(function(key) {
//       rounds.push(key);
//     });
//     let selectedData = "Avg_QBR"
//     selectedStats = []
//     Object.entries(barData).forEach(function(entry) {
//         selectedStats.push(entry[1][selectedData])
//     });
//
//     let maxStat = Math.max(selectedStats)
//
//     var statSelect = Object.values(barData).forEach(function(value) {
//         Object.keys(value);
//     });
//
//     var xBandScale = d3.scaleBand()
//     .domain(rounds)
//     .range([0, chartWidth])
//     .padding(0.1);
//
//     var yLinearScale = d3.scaleLinear()
//     .domain([0, maxStat])
//     .range([chartHeight, 0]);
//
//     var bottomAxis = d3.axisBottom(xBandScale);
//     var leftAxis = d3.axisLeft(yLinearScale).ticks(7);
//
//     chartGroup.append("g")
//       .call(leftAxis);
//
//     chartGroup.append("g")
//       .attr("transform", `translate(0, ${chartHeight})`)
//       .call(bottomAxis);
//
//     chartGroup.selectAll(".bar")
//       .enter()
//       .append("rect")
//       .attr("class", "bar")
//       .attr("x", rounds)
//       .attr("y", selectedStats)
//       .attr("width", xBandScale.bandwidth())
//       .attr("height", d => chartHeight - yLinearScale(selectedStats));
//
//     // var dropdown = d3.select("#roundbar")
//     //                 .insert("select", "svg")
//     //                 .on("change", dropdownChange);
//     //
//     // dropdown.selectAll("option")
//     //       .data(statSelect)
//     //       .enter().append("option")
//     //       .attr("value", function (d) { return d; })
//     //       .text(function (d) {
//     //         return d;});
//     //
//     // var dropdownChange = function() {
//     //     var newStat = d3.select(this).property('value')
//     //   }
//
//   //   //
//   //
//   // };
// });
// }
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

//  d3.json('/bar').then((barData) => {
//    // list of stats = +list of stats
//    console.log(barData["1"]["Avg_Attempts"]);
//  });
// }

function optionChanged(newData) {
  // Fetch new data each time a new sample is selected
  var stringData = String(newData)
  if (stringData == "1" || "2" || "3" || "4" || "5" || "6" || "7") {
    buildBar(stringData)
    // buildTable(stringData)
  } else {
    console.log(stringData);
    // PlayerData(newData);
    // otherPlayerData(newData);
  }
}

function buildBar(bdata) {
  var svg = d3.select("#roundbar")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  d3.json('/bar').then((barData) => {
    barData.forEach((round) => {
      let selectedData = "Avg_QBR"
      round.Draft_Round = round.Draft_Round
      round[`${selectedData}`] = +round[`${selectedData}`]
    })

    var statSelect = Object.keys(barData[0])
    for ( var i = 0; i < statSelect.length; i++){
      if ( statSelect[i] === "Draft_Round") {
        statSelect.splice(i, 1);
   }
}

    let selectedData = "Avg_QBR"

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
      .style("font", "14px sans-serif")
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
        .text(`${selectedData}`);

      chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight +40})`)
        .attr("class", "axisText")
        .text("Draft Round");

      var yLinearScaleUpdate = chartGroup.append('g')
        .attr("class", "y")
        .call(leftAxis)

      yLinearScaleUpdate.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left + 2)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text(`${selectedData}`);

      var updateBar = function (data) {
        yLinearScale.domain(d3.extent(data))
        yLinearScaleUpdate.call(leftAxis)

        var bars = chartGroup.selectAll(".bar");
        bars.data(barData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xBandScale(d.Draft_Round))
        .attr("y", d => yLinearScale(d[`${data}`]))
        .attr("width", xBandScale.bandwidth())
        .attr("fill", "rgb(68, 109, 186)")
        .attr("height", d => chartHeight - yLinearScale(d[`${data}`]));

        bars.exit().remove();
      }

    var dropdown = d3.select("#roundbar")
                    .insert("select", "svg")
                    .on("change", dropdownChange);

    dropdown.selectAll("option")
          .data(statSelect)
          .enter().append("option")
          .attr("value", function (d) { return d; })
          .text(function (d) {
            return d;});


    var dropdownChange = function() {
        var newStat = d3.select(this).property('value')
        console.log(newStat);
        //   newStatData = barData.forEach((round) => {
        //     let selectedData = newstat
        //     round.Draft_Round = round.Draft_Round
        //     round[`${selectedData}`] = +round[`${selectedData}`]
        //   })
        // updateBars(newStatData);
      }

  //   //
  //
  // };
});
};


init();
