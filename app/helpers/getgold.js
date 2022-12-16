const fs = require('fs');
const fetch = (...args) =>
import('node-fetch').then(({default: fetch}) => fetch(...args));
const newDate = require('new-date');
const upGoldPrice         = 'public/goldprice/'
const upGoldPriceName     = 'goldprice'

let getGoldPrice = async () => {
    let delay = 120000;
    let dataFile, dataStore, feed
    const linkAPI = "http://apiforlearning.zendvn.com/api/get-gold"
    try {
      dataFile = fs.readFileSync(`${upGoldPrice}${upGoldPriceName}`,'utf8')
      dataFile = JSON.parse(dataFile)
      let datePub = newDate(dataFile.pubDate)
      let dateNow = newDate(Date.now())
      if(dateNow-datePub > delay){
                  // change the endpoint with yours
                  result = await fetch(`${linkAPI}`);
                  feed = await result.json();
                  feed.pubDate = newDate(Date.now())
                  dataStore  =  JSON.stringify(feed);
                  fs.writeFile(`${upGoldPrice}${upGoldPriceName}`, dataStore, err => {
                      console.log('File successfully written to disk ');
                  });

      } else {
              feed = dataFile;
      }
  } catch (error) {
          // change the endpoint with yours
          result = await fetch(`${linkAPI}`);
          feed = await result.json();
          feed.pubDate = newDate(Date.now())
          dataStore  =  JSON.stringify(feed);
          fs.writeFile(`${upGoldPrice}${upGoldPriceName}`, dataStore, err => {
              console.log('File successfully written to disk 3');
          });
  }
return feed;
}

module.exports = {
  getGoldPrice
}