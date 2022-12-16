const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');
const sharp = require('sharp');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('./settings.ini');
const sleep = waitTime => new Promise( resolve => setTimeout(resolve, waitTime) );

(async() => {

  const url = properties.get('site.url');

  const top = properties.get('sharp.top');
  const left = properties.get('sharp.left');
  const height = properties.get('sharp.height');
  const width = properties.get('sharp.width');

  const token = properties.get('discord.token');
  const chid = properties.get('discord.chid'); //文字列として扱うために先頭にidって付いてる

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  /*const cookies = JSON.parse(fs.readFileSync('./cookies.json', 'utf-8'));
  await page.setCookie(...cookies);*/
  await page.setViewport({
    width: 1366,
    height: 768
  });
  await page.goto(url);
  await sleep( 3000 );
  await page.screenshot({path: 'Screenshot.png', fullPage:true})

  browser.close();
  console.log('Shot!');

  //トリミング
  sharp('Screenshot.png')
  .extract({
    top: top,
    left: left,
    height: height,
    width: width
  })
  .toFile('extract.png');

  console.log('Extracted!');

  const { Client, Intents } = require('discord.js')
  const client = new Client({ intents: Object.keys(Intents.FLAGS) })

  client.on('ready', () => {
    console.log(`Login ${client.user.tag} successful!`);
  })

  client.on('ready', async () => {
    const channel = await client.channels.fetch(chid.slice(2)); //先頭の'id'を削除
    await channel.send({files: ['./extract.png'] });
    console.log('Posted!!!');
  })

  await client.login(token)
})();

function hoge(){
  process.exit(0);
}
setTimeout(hoge, 25000);
