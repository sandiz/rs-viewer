// const electron = require("electron");
// var { app, BrowserWindow } = electron;
/*function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}*/
export default async function readPSARC(psarc, statResult, sleepms) {
  //await sleep(sleepms);
  return {
    name: psarc,
    size: statResult.size,
    created: statResult.ctimeMs,
    artist: "",
    song: "",
  };
}

//module.exports = readDir;
/*
filelist[path.basename(file, ".psarc")] = {
          */
