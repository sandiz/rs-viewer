/*
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
*/
import path from 'path';
//const spawn = require('await-spawn')

async function getSongDetails(psarc) {
  const arrangementarr = [];
  try {
    const bl = await window.spawn('python3', [`${window.dirname}/python/psarc-lib.py`, '-f', psarc])
    const json = JSON.parse(bl.toString());
    json.arrangements.forEach((arr) => {
      if (arr.song !== '' && arr.artist !== '') {
        const songDetails = {};
        songDetails.song = arr.song
        songDetails.artist = arr.artist
        songDetails.arrangement = arr.arrangement
        arrangementarr.push(songDetails);
      }
    });
  }
  catch (error) {
    if (error.stderr != null) {
      console.log(error.stderr.toString());
    }
    else {
      console.log(error);
    }
  }

  return arrangementarr;
}
export async function psarcToJSON(psarc) {
  try {
    const bl = await window.spawn('python3', [`${window.dirname}/python/psarc-lib.py`, '-f', psarc])
    return JSON.parse(bl.toString());
  }
  catch (error) {
    if (error.stderr != null) {
      console.log(error.stderr.toString());
    }
    else {
      console.log(error);
    }
  }
  return null;
}
export default async function readPSARC(psarc, statResult, sleepms) {
  //await sleep(sleepms);
  const ret = await getSongDetails(psarc);
  const psarcData = []
  let count = 1
  ret.forEach((item) => {
    const psarchBlurb = {
      filename: psarc,
      name: path.basename(psarc, ".psarc") + "_" + count,
      size: statResult.size,
      created: statResult.ctimeMs,
      artist: item.artist,
      song: item.song,
      arrangement: item.arrangement,
    };
    count += 1
    psarcData.push(psarchBlurb);
  })
  return psarcData;
}
