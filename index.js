const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

async function getPriceFeed() {
    try {
        const siteUrl = 'https://coinmarketcap.com/';

        const { data } = await axios({
            method: 'GET',
            url: siteUrl,
        });

        const keys = [
            'ranks',
            'name',
            'price',
            '24h',
            '7d',
            'marketCap',
            'volume',
            'circulatingSupply',
        ];

        const coinArray = [];

        const $ = cheerio.load(data);
        const elementSelecotr =
            '#__next > div > div.main-content > div.cmc-body-wrapper > div > div:nth-child(1) > div.sc-beb003d5-2.bkNrIb > table > tbody > tr';
        $(elementSelecotr).each((parentIndex, parentElement) => {
            let keyIndex = 0;
            const coinObj = {};
            if (parentIndex <= 9) {
                $(parentElement)
                    .children()
                    .each((childIndex, childElement) => {
                        let tdValue = $(childElement).text();

                        if (keyIndex == 1 || keyIndex == 6) {
                            tdValue = $(
                                'p:first-child',
                                $(childElement).html()
                            ).text();
                        }

                        if (tdValue) {
                            coinObj[keys[keyIndex]] = tdValue;
                            keyIndex++;
                        }
                    });
                coinArray.push(coinObj);
            }
        });

        return coinArray;
    } catch (err) {
        console.log(err);
    }
}

const app = express();

app.get('/api/get/price-feed', async (req, res) => {
    try {
        const priceFeed = await getPriceFeed();
        return res.status(200).json({
            result: priceFeed,
        });
    } catch (err) {
        return res.status(520).json({
            err: err.toString(),
        });
    }
});

app.listen(3000, () => {
    console.log('running on port 3000');
});
