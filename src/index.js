const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./helpers/htmlhelper.js')
const stathelper = require('./helpers/stathelper.js');

var date_value = process.argv[2];

client.get('https://www.espn.com/mlb/schedule/_/date/' + date_value).then(({ data }) => {
  var html = htmlhelper.getHtml(data, '.responsive-table-wrap:first');
  var table_body = htmlhelper.getHtml(html, 'tbody');
  var rows = [];
  const $ = cheerio.load(table_body, { xmlMode: true })

  if (table_body) {
    $('tr').each(function (i, e) {
      var row = {};
      // Get the First column
      var schedule_row = $(this).html();

      var first_column = htmlhelper.getHtml('<div>' + schedule_row + '</div>', 'td:first');
      var away_team_url = htmlhelper.getHtml(first_column, 'a.team-name');
      var away_name_html = htmlhelper.getHtml(away_team_url, 'abbr');
      var away_name = htmlhelper.getAttributeValue(away_team_url, 'abbr', 'title');

      row.awayname = away_name;
      row.awaycode = away_name_html;

      // Get the Home Column

      var home_column = htmlhelper.getHtml(schedule_row, 'td.home');
      var home_team_url = htmlhelper.getHtml(home_column, 'a.team-name');
      var home_name_html = htmlhelper.getHtml(home_team_url, 'abbr');
      var home_name = htmlhelper.getAttributeValue(home_team_url, 'abbr', 'title');

      row.homename = home_name;
      row.homecode = home_name_html;
      row.gamedate = date_value;

      // Get the third column 

      columns = cheerio.load('<div>' + schedule_row + '</div>', { xmlMode: true });

      var count = 1;
      columns('td').each(function (idx, ele) {
        column_html = columns(this).html();

        if (count == 3) {
          column_html = columns(this).html();
          var box_url = htmlhelper.getAttributeValue(column_html, 'a', 'href');
          row.url = 'https://www.espn.com' + box_url.replace('game', 'boxscore');
        }
        count++;
      });

      rows.push(row);
      
    });
    return rows;
  }
}).catch((err) => console.log('Error Building Rows: ' + err) )
.then(async (rows) => {
  if (rows) {
    let results = [];
    for (var i = 0; i < rows.length; i++) {
      let result = await stathelper.getStats(rows[i]);      
      results.push(result);
    }
    return results;
  } else {
    console.log('No Rows');
  }
}).catch((err) => console.log('ERROR Pulling Stats:' + err))
.then((results) => {
  const fs = require('fs');
  fs.writeFileSync('output/stats/' + date_value + '.json', JSON.stringify(results));
  console.log('Done');
});



