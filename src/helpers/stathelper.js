const client = require('axios');
const cheerio = require('cheerio');
const htmlhelper = require('./htmlhelper.js')


async function getStats(row) {
  

  const { data } = await client.get(row.url);

  var away_section = htmlhelper.getHtml(data, 'div.boxscore-2017__wrap--away');
  var home_section = htmlhelper.getHtml(data, 'div.boxscore-2017__wrap--home');
  var away_batting_table = htmlhelper.getHtml(away_section, 'table[data-type=batting]');

  var away_batting = []
  var away_pitching = [];

  away_batting = await getHitting(away_batting_table);
  row.awayHitting = away_batting;

  var away_pitching_table = htmlhelper.getHtml(away_section, 'table[data-type=pitching]');          
  away_pitching = await getPitching(away_pitching_table);
  row.awayPitching = away_pitching;

  var home_batting = [];
  var home_pitching = [];

  var home_batting_table = htmlhelper.getHtml(home_section, 'table[data-type=batting]');
  home_batting = await getHitting(home_batting_table);
  row.homeHitting = home_batting;
  var home_pitching_table = htmlhelper.getHtml(home_section, 'table[data-type=pitching]');
  home_pitching = await getPitching(home_pitching_table);
  row.homePitching = home_pitching;
  return row;
}

async function getHitting(table_html) {
  const $ = cheerio.load(table_html, { xmlMode: true });
  var hitting_stats = [];
  $('tbody.athletes').each(async function (id, ele) {
    let body = $(this).html();
    var player = {};
    let url = htmlhelper.getAttributeValue(body, 'a', 'href');
    player.url = url;
    player.name = await getPlayerName(url);
    player.ab = htmlhelper.getHtml(body, 'td.batting-stats-ab');
    player.run = htmlhelper.getHtml(body, 'td.batting-stats-r');
    player.hit = htmlhelper.getHtml(body, 'td.batting-stats-h');
    player.rbi = htmlhelper.getHtml(body, 'td.batting-stats-rbi');
    player.walk = htmlhelper.getHtml(body, 'td.batting-stats-bb');
    player.strikeout = htmlhelper.getHtml(body, 'td.batting-stats-k');
    player.avg = htmlhelper.getHtml(body, 'td.batting-stats-avg');
    player.obp = htmlhelper.getHtml(body, 'td.batting-stats-obp');
    player.slg = htmlhelper.getHtml(body, 'td.batting-stats-slg');
    hitting_stats.push(player);

  });
  return hitting_stats;

}

async function getPitching(table_html) {
  const $ = cheerio.load(table_html, {xmlMode:true});

  var pitching_stats = [];
  $('tbody.athletes').each(async function (id, ele) {
    let body = $(this).html();
    var player = {};

    let url = htmlhelper.getAttributeValue(body, 'a', 'href');
    player.url = url;
    player.name = await getPlayerName(url);
    player.ip = htmlhelper.getHtml(body, 'td.pitching-stats-ip');
    player.hits = htmlhelper.getHtml(body, 'td.pitching-stats-h');
    player.runs = htmlhelper.getHtml(body, 'td.pitching-stats-r');
    player.earnedRuns = htmlhelper.getHtml(body, 'td.pitching-stats-er');
    player.walks = htmlhelper.getHtml(body, 'td.pitching-stats-bb');
    player.strikeout = htmlhelper.getHtml(body, 'td.pitching-stats-k');
    player.homerun = htmlhelper.getHtml(body, 'td.pitching-stats-hr');
    player.pcst = htmlhelper.getHtml(body, 'td.pitching-stats-pc-st');
    player.era = htmlhelper.getHtml(body, 'td.pitching-stats-era');
    player.pc = htmlhelper.getHtml(body, 'td.pitching-stats-pc');
    pitching_stats.push(player);
  });
  
  return pitching_stats;

}

async function getPlayerName(url) {
  if (url) {
    var name;
    const { data } = await client.get(url);
    var name = htmlhelper.getHtml(data, 'h1.PlayerHeader__Name');
    const $ = cheerio.load(name, {xmlMode:true});
    let parts = [];
    $('span').each(function(idx, ele) {
      var part =  $(this).html();
      parts.push(part);
    });
    
    return parts.join(' ');    
  } else {
    return 'None';
  }
}

exports.getStats = getStats;
exports.getHitting = getHitting;
exports.getPitching = getPitching;
exports.getPlayerName = getPlayerName;