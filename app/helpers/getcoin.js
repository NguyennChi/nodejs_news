const fs = require('fs');
const fetch = (...args) =>
import('node-fetch').then(({default: fetch}) => fetch(...args));
const newDate = require('new-date');
const upCoinPrice         = 'public/coinprice/'
const upCoinPriceName     = 'coinprice'

let getCoinPrice = async () => {
    let delay = 120000;
    let dataFile, dataStore, feed
    const linkAPI = "https://apiforlearning.zendvn.com/api/get-coin"
    try {
      dataFile = fs.readFileSync(`${upCoinPrice}${upCoinPriceName}`,'utf8')
      dataFile = JSON.parse(dataFile)
      let datePub = newDate(dataFile.pubDate)
      let dateNow = newDate(Date.now())
      if(dateNow-datePub > delay){
                  // change the endpoint with yours
                  result = await fetch(`${linkAPI}`);
                  feed = await result.json();
                  feed.pubDate = newDate(Date.now())
                  dataStore  =  JSON.stringify(feed);
                  fs.writeFile(`${upCoinPrice}${upCoinPriceName}`, dataStore, err => {
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
          fs.writeFile(`${upCoinPrice}${upCoinPriceName}`, dataStore, err => {
              console.log('File successfully written to disk 3');
          });
  }
return feed;
}

module.exports = {
  getCoinPrice
}