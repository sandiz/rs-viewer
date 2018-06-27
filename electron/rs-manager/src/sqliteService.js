let db = null;
export async function initSongsOwnedDB() {
  const dbfilename = window.dirname + "/../rsdb.sqlite";
  console.log(dbfilename);
  db = await window.sqlite.open(dbfilename);
  await db.run("CREATE TABLE IF NOT EXISTS songs_owned (album char, artist char, song char, arrangement char, json char, psarc char, dlc char, sku char, difficulty char, dlckey char, songkey char, id char, uniqkey char primary key);");
}

export async function saveSongsOwnedDB() {
  await db.close();
}

export default async function updateSongsOwned(psarcResult) {
  let sqlstr = ";";
  //psarcResults.forEach((psarcResult) => {
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
  const uniqkey = escape(psarcResult.uniquekey);
  sqlstr += `REPLACE INTO songs_owned VALUES ('${album}','${artist}',
      '${song}','${arrangement}','${json}','${psarc}',
      '${dlc}','${sku}','${difficulty}','${dlckey}',
      '${songkey}','${id}', '${uniqkey}');`
  //});
  //console.log(sqlstr);
  await db.run(sqlstr); // Run the query without returning anything
}

