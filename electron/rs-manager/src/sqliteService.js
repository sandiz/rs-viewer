let db = null;
const worker = new Worker("./sqliteWorker.js");
worker.onerror = (e) => { console.log("Worker error: ", e) };
function readFileASync(path) {
  return new Promise((resolve, reject) => {
    window.electronFS.readFile(path, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
function existsAsync(path) {
  return new Promise((resolve, reject) => {
    window.electronFS.exists(path, (exists) => {
      resolve(exists);
    });
  });
}
function writeFileASync(path, data) {
  return new Promise((resolve, reject) => {
    window.electronFS.writeFile(path, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function initSongsOwnedDB() {
  const dbfilename = window.dirname + "/../rsdb.sqlite";
  console.log(dbfilename);
  if (await existsAsync(dbfilename)) {
    //const filebuffer = window.electronFS.readFileSync(dbfilename);
    const filebuffer = await readFileASync(dbfilename);
    db = new window.sqlite.Database(filebuffer);
  }
  else {
    db = new window.sqlite.Database();
    db.run("CREATE TABLE IF NOT EXISTS songs_owned (album char, artist char, song char, arrangement char, json char, psarc char, dlc char, sku char, difficulty char, dlckey char, songkey char, id char primary key);");
  }
  return db;
}

export async function saveSongsOwnedDB() {
  const dbfilename = window.dirname + "/../rsdb.sqlite";
  const data = db.export();
  const buffer = Buffer.from(data);
  //window.electronFS.writeFileSync(dbfilename, buffer);
  await writeFileASync(dbfilename, buffer);
}

export default async function updateSongsOwned(psarcResults) {
  let sqlstr = "";
  psarcResults.forEach((psarcResult) => {
    const album = escape(psarcResult.album);
    const artist = escape(psarcResult.artist);
    const song = escape(psarcResult.song);
    const arrangement = escape(psarcResult.arrangement);
    const json = escape(psarcResult.json);
    const psarc = escape(psarcResult.psarc);
    const dlc = escape(psarcResult.dlc);
    const sku = escape(psarcResult.sku);
    const difficulty = escape(psarcResult.difficulty);
    const dlckey = escape(psarcResult.dlckey);
    const songkey = escape(psarcResult.songkey);
    const id = escape(psarcResult.id);
    sqlstr += `REPLACE INTO songs_owned VALUES ('${album}','${artist}',
      '${song}','${arrangement}','${json}','${psarc}',
      '${dlc}','${sku}','${difficulty}','${dlckey}',
      '${songkey}','${id}');`
  });
  //console.log(sqlstr);
  db.run(sqlstr); // Run the query without returning anything
}

