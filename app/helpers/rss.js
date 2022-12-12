let Parser = require('rss-parser');
let parser = new Parser();
const fetch = (...args) => import ('node-fetch').then(({default: fetch}) => fetch(...args));
const newDate = require('new-date');
const fs = require('fs');

let splitRss = async (link, lengthArr)=>{
  let feedRSS = await parser.parseURL(link);
  let totalRss = feedRSS.items.length
  const result = new Array(Math.ceil(feedRSS.items.length / lengthArr))
                                .fill()
                                .map(_ => feedRSS.items.splice(0, lengthArr))
  feedRSS.items = result
  return {feedRSS: feedRSS, totalRss:totalRss}
}

let getFeedRss = async (path, id, link, delay, lengthArr) => {
    let dataFileRSS, feedRSS, dataStoreRSS, processfeedRSS, totalRss
    if(fs.existsSync(`${path}${id}`)){
          dataFileRSS = fs.readFileSync(`${path}${id}`, 'utf8')
          dataFileRSS = JSON.parse(dataFileRSS)
          let datePub = newDate(dataFileRSS.pubDate)
          let dateNow = newDate(Date.now())
          if (dateNow - datePub > delay) {
              processfeedRSS = await splitRss(link, lengthArr);
              feedRSS        = processfeedRSS.feedRSS
              totalRss       = processfeedRSS.totalRss
              feedRSS.totalRss = totalRss
              dataStoreRSS = JSON.stringify(feedRSS);
              fs.writeFile(`${path}${id}`, dataStoreRSS, err => {
                  console.log('File successfully written RSS to disk');
              });
          } else {
              feedRSS = dataFileRSS;
          }
    }
    else {
        processfeedRSS = await splitRss(link, lengthArr);
        feedRSS        = processfeedRSS.feedRSS
        totalRss       = processfeedRSS.totalRss
        feedRSS.totalRss = totalRss
        dataStoreRSS = JSON.stringify(feedRSS);
        fs.writeFile(`${path}${id}`, dataStoreRSS, err => {
            console.log('File successfully written RSS to disk NEW');
        });
    }
  return feedRSS
}

module.exports = {
  getFeedRss
}