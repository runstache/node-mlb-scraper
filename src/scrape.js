const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./helpers/htmlhelper.js')

var date_value = '20210401';

client.get('https://www.espn.com/mlb/player/_/id/35265').then(({ data }) => {

  const fs = require('fs');

  fs.writeFileSync('./output/player.html', data, (err) => {
    if (err) {
      console.log(err);
    }
  });
});


