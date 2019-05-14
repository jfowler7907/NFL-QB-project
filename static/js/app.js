
const sqlite3 = require('sqlite3').verbose();

let draftDb = new sqlite3.Database('././NFL_ETL.sqlite');

var yearButton = d3.select("#draftyear");

function yearOptions(years) {
  yearButton.html("");

  var option.yearButton
}
