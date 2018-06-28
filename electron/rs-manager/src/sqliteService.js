let db = null;
export async function initSongsOwnedDB() {
  const dbfilename = window.dirname + "/../rsdb.sqlite";
  console.log(dbfilename);
  db = await window.sqlite.open(dbfilename);
  await db.run("CREATE TABLE IF NOT EXISTS songs_owned (album char, artist char, song char, arrangement char, json char, psarc char, dlc char, sku char, difficulty float, dlckey char, songkey char, id char, uniqkey char primary key, mastery float, count int, lastConversionTime real);");
}

export async function saveSongsOwnedDB() {
  await db.close();
}
export async function updateMasteryandPlayed(id, mastery, playedcount) {
  //await db.close();
  const op = await db.run("UPDATE songs_owned SET mastery=?,count=? where id=?", mastery, playedcount, id);
  return op.changes;
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
  const lct = escape(psarcResult.lastConversionTime);
  sqlstr += `REPLACE INTO songs_owned VALUES ('${album}','${artist}',
      '${song}','${arrangement}','${json}','${psarc}',
      '${dlc}','${sku}',${difficulty},'${dlckey}',
      '${songkey}','${id}', '${uniqkey}', 0, 0, '${lct}');`
  //});
  //console.log(sqlstr);
  await db.run(sqlstr); // Run the query without returning anything
}

export async function getSongsOwned(start = 0, count = 10, sortField = "mastery", sortOrder = "desc", search = "") {
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    console.log(dbfilename);
    db = await window.sqlite.open(dbfilename);
  }
  let sql;
  if (search === "") {
    sql = `select c.acount as acount, c.songcount as songcount, song, artist, arrangement, mastery,
          count, difficulty, uniqkey, id, lastConversionTime from songs_owned,  (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
          ) c 
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  else {
    sql = `select c.acount as acount, c.songcount as songcount, song, artist, arrangement, mastery,
          count, difficulty, uniqkey, id, lastConversionTime from songs_owned, (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
            where song like '%${escape(search)}%' or artist like '%${escape(search)}%'
          ) c 
          where song like '%${escape(search)}%' or artist like '%${escape(search)}%'
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  console.log(sql);
  const output = await db.all(sql);
  return output
}
export async function countSongsOwned() {
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    console.log(dbfilename);
    db = await window.sqlite.open(dbfilename);
  }
  const sql = `select count(*) as count, count(distinct song) as songcount from songs_owned`;
  const output = await db.get(sql);
  return output
}
window.remote.app.on('window-all-closed', async () => {
  await saveSongsOwnedDB();
  console.log("Saved to db..");
})
