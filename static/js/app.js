let roundData = d3.select("#roundtable");

function buildTable(tdata){
  roundData.html('')
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

function nflData(stat) {
  d3.json(`/search/${stat}`).then((data) => {
    buildTable(data)
  });
});

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

 d3.json("/rounds").then((draftRound) => {
   draftRound.forEach((round) => {
     roundSelector
      .append("option")
      .text(round)
      .property("value", round);
  });
 });
}
