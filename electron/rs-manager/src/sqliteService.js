let db = null;
export async function initSongsOwnedDB() {
  //console.log("__db_call__: initSongsOwnedDB ");
  if (db === null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  await db.run("CREATE TABLE IF NOT EXISTS songs_owned (album char, artist char, song char, arrangement char, json char, psarc char, dlc char, sku char, difficulty float, dlckey char, songkey char, id char, uniqkey char primary key, mastery float default 0, count int default 0, lastConversionTime real);");
}
export async function initSongsAvailableDB() {
  //console.log("__db_call__: initSongsAvailableDB");
  if (db === null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  await db.run("CREATE TABLE IF NOT EXISTS songs_available (appid char primary key, name char, release_date float, owned boolean default false);");
}
export async function addToSteamDLCCatalog(dlc, name, releaseDate) {
  // console.log("__db_call__: addToSteamDLCCatalog");
  let sqlstr = ";";
  let date = Date.parse(releaseDate);
  //eslint-disable-next-line
  if (isNaN(date)) { date = 0; }
  const owned = false;
  sqlstr += `REPLACE INTO songs_available (appid, name, release_date, owned) VALUES ('${dlc}','${name}', ${date}, '${owned}');`
  //});
  console.log(sqlstr);
  await db.run(sqlstr); // Run the query without returning anything
}
export async function getDLCDetails(start = 0, count = 10, sortField = "release_date", sortOrder = "desc", search = "", owned = "") {
  // console.log("__db_call__: getDLCDetails");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  let sql;
  let ownedstring = "";
  if (owned !== "") {
    ownedstring = `where owned='${owned}'`
  }
  let allownedstring = "";
  if (owned !== "") {
    allownedstring = `and owned='${owned}'`
  }
  if (search === "") {
    sql = `select c.acount as acount,d.nopackcount as nopackcount, appid, name, release_date, owned
           from songs_available,  (
           SELECT count(*) as acount
            FROM songs_available
            ${ownedstring}
          ) c , (
           SELECT count(*) as nopackcount
            FROM songs_available
            where name NOT like '%${escape("Song Pack")}%' ${allownedstring}
          ) d
          ${ownedstring}
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  else {
    sql = `select c.acount as acount, d.nopackcount as nopackcount, appid, name, release_date, owned from songs_available, (
          SELECT count(*) as acount 
            FROM songs_available
            where (name like '%${escape(search)}%' or appid like '%${escape(search)}%')
            ${allownedstring}
          ) c , (
           SELECT count(*) as nopackcount
            FROM songs_available
            where (name NOT like '%${escape("Song Pack")}%' AND name like '%${escape(search)}%' or appid like '%${escape(search)}%') ${allownedstring}
          ) d
          where (name like '%${escape(search)}%' or appid like '%${escape(search)}%') ${allownedstring}
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  console.log(sql);
  const output = await db.all(sql);
  return output
}
export async function isDLCInDB(dlc) {
  //  console.log("__db_call__: isDLCInDB");
  let sqlstr = "";
  sqlstr += `SELECT count(appid) as count from songs_available where appid LIKE '%${dlc}%'`
  //});
  //console.log(sqlstr);
  const res = await db.get(sqlstr); // Run the query without returning anything
  if (res.count === 0) {
    return false;
  }
  return true;
}
export async function updateOwnedInDB(dlc) {
  //.console.log("__db_call__: updateOwnedInDB");
  let sqlstr = "";
  sqlstr += `UPDATE songs_available SET owned='true' where appid LIKE ${dlc}`;
  await db.run(sqlstr);
}
export async function countSongsAvailable() {
  // console.log("__db_call__: countSongsAvailable");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  const sql = `select count(*) as count from songs_available`;
  const output = await db.get(sql);
  return output
}

export async function saveSongsOwnedDB() {
  //console.log("__db_call__: saveSongsOwnedDB");
  //await db.close();
}
export async function updateMasteryandPlayed(id, mastery, playedcount) {
  // console.log("__db_call__: updateMasteryandPlayed");
  //await db.close();
  const op = await db.run("UPDATE songs_owned SET mastery=?,count=? where id=?", mastery, playedcount, id);
  return op.changes;
}

export default async function updateSongsOwned(psarcResult) {
  // console.log("__db_call__: updateSongsOwned");
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
  sqlstr += `REPLACE INTO songs_owned (album, artist, song, arrangement, json, psarc, dlc, sku, difficulty, dlckey, songkey, id,uniqkey, lastConversionTime) VALUES ('${album}','${artist}',
      '${song}','${arrangement}','${json}','${psarc}',
      '${dlc}','${sku}',${difficulty},'${dlckey}',
      '${songkey}','${id}', '${uniqkey}', '${lct}');`
  //});
  //console.log(sqlstr);
  await db.run(sqlstr); // Run the query without returning anything
}

export async function getSongsOwned(start = 0, count = 10, sortField = "mastery", sortOrder = "desc", search = "") {
  //  console.log("__db_call__: getSongsOwned");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  let sql;
  if (search === "") {
    sql = `select c.acount as acount, c.songcount as songcount, song, album, artist, arrangement, mastery,
          count, difficulty, uniqkey, id, lastConversionTime from songs_owned,  (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
          ) c 
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  else {
    sql = `select c.acount as acount, c.songcount as songcount, song, album, artist, arrangement, mastery,
          count, difficulty, uniqkey, id, lastConversionTime from songs_owned, (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
            where song like '%${escape(search)}%' or artist like '%${escape(search)}%' or album like '%${escape(search)}%'
          ) c 
          where song like '%${escape(search)}%' or artist like '%${escape(search)}%' or album like '%${escape(search)}%'
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}`;
  }
  //console.log(sql);
  const output = await db.all(sql);
  return output
}
export async function countSongsOwned() {
  // console.log("__db_call__: countSongsOwned");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    console.log(dbfilename);
    db = await window.sqlite.open(dbfilename);
  }
  const sql = `select count(*) as count, count(distinct song) as songcount from songs_owned`;
  // console.log(sql);
  const output = await db.get(sql);
  return output
}
export async function getSongID(ID) {
  // console.log("__db_call__: getSongID");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    console.log(dbfilename);
    db = await window.sqlite.open(dbfilename);
  }
  const sql = `select distinct song from songs_owned where id='${ID}'`;
  const output = await db.get(sql);
  return output.song;
}
export async function getArrangmentsMastered() {
  //console.log("__db_call__: getArrangmentsMastered");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    console.log(dbfilename);
    db = await window.sqlite.open(dbfilename);
  }
  const sql = `select count(mastery) as count from songs_owned where mastery > 0.95`;
  const output = await db.get(sql);
  return output;
}
export async function getLeadStats() {
  // console.log("__db_call__: getLeadStats");
  const sqlstr = "select l.count as l,lh.count as lh,lm.count as lm,ll.count as ll,up.count as lup from (select count(*) as count from songs_owned where arrangement like '%lead%')l, (select count(*) as count from songs_owned where mastery > .95 AND arrangement like '%lead%') lh, (select count(*) as count from songs_owned where mastery > .90 AND mastery <= .95 AND arrangement like '%lead%') lm, (select count(*) as count from songs_owned where mastery >= .1 AND mastery <= .90 AND arrangement like '%lead%') ll, (select count(*) as count from songs_owned where mastery < .1 AND arrangement like '%lead%') up;"
  const output = await db.get(sqlstr);
  return output;
}
export async function getRhythmStats() {
  //console.log("__db_call__: getRhythmStats");
  const sqlstr = "select l.count as r,lh.count as rh,lm.count as rm,ll.count as rl,up.count as rup from (select count(*) as count from songs_owned where arrangement like '%rhythm%')l, (select count(*) as count from songs_owned where mastery > .95 AND arrangement like '%rhythm%') lh, (select count(*) as count from songs_owned where mastery > .90 AND mastery <= .95 AND arrangement like '%rhythm%') lm, (select count(*) as count from songs_owned where mastery >= .1 AND mastery <= .90 AND arrangement like '%rhythm%') ll, (select count(*) as count from songs_owned where mastery < .1 AND arrangement like '%rhythm%') up;"
  const output = await db.get(sqlstr);
  return output;
}
export async function getBassStats() {
  // console.log("__db_call__: getBassStats");
  const sqlstr = "select l.count as b,lh.count as bh,lm.count as bm,ll.count as bl,up.count as bup from (select count(*) as count from songs_owned where arrangement like '%bass%')l, (select count(*) as count from songs_owned where mastery > .95 AND arrangement like '%bass%') lh, (select count(*) as count from songs_owned where mastery > .90 AND mastery <= .95 AND arrangement like '%bass%') lm, (select count(*) as count from songs_owned where mastery >= .1 AND mastery <= .90 AND arrangement like '%bass%') ll, (select count(*) as count from songs_owned where mastery < .1 AND arrangement like '%bass%') up;"
  const output = await db.get(sqlstr);
  return output;
}
export async function initSetlistPlaylistDB(dbname) {
  // console.log("__db_call__: initSetlistPlaylistDB");
  if (db === null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  await db.run(`CREATE TABLE IF NOT EXISTS ${dbname} ( uniqkey char primary key, FOREIGN KEY(uniqkey) REFERENCES songs_owned(uniqkey));`);
}
export async function initSetlistDB() {
  // console.log("__db_call__: initSetlistDB");
  if (db === null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  await db.run("CREATE TABLE IF NOT EXISTS setlist_meta (key char primary key, name char);");
  await db.run("REPLACE INTO setlist_meta VALUES('setlist_practice','Practice List');")
  await initSetlistPlaylistDB("setlist_practice");
  await db.run("REPLACE INTO setlist_meta VALUES('setlist_favorites','RS Favorites');")
  await initSetlistPlaylistDB("setlist_favorites");
}
export async function getAllSetlist(filter = false) {
  // console.log("__db_call__: getAllSetlist");
  await initSetlistDB();
  let sql = ''
  if (filter) {
    sql = "SELECT * FROM setlist_meta where key not like '%setlist_favorites%' order by name collate nocase";
  }
  else {
    sql = "SELECT * FROM setlist_meta  order by name collate nocase;"
  }
  const all = await db.all(sql);
  return all;
}

export async function getSongCountFromPlaylistDB(dbname) {
  //console.log("__db_call__: getSongCountFromPlaylistDB");
  const sql = `SELECT count(*) as songcount, count(distinct song) as count FROM ${dbname} order by uniqkey collate nocase;`
  const all = await db.get(sql);
  return all;
}

export async function getSongsFromPlaylistDB(dbname, start = 0, count = 10, sortField = "mastery", sortOrder = "desc", search = "") {
  // console.log("__db_call__: getSongsFromPlaylistDB");
  if (db == null) {
    const dbfilename = window.dirname + "/../rsdb.sqlite";
    db = await window.sqlite.open(dbfilename);
  }
  let sql;
  if (search === "") {
    sql = `select c.acount as acount, c.songcount as songcount, song, artist, album, arrangement, mastery,
          count, difficulty, id, lastConversionTime from songs_owned,  (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
            JOIN ${dbname} ON ${dbname}.uniqkey = songs_owned.uniqkey
          ) c 
          JOIN ${dbname} ON ${dbname}.uniqkey = songs_owned.uniqkey
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}
          `;
  }
  else {
    sql = `select c.acount as acount, c.songcount as songcount, song, artist, album, arrangement, mastery,
          count, difficulty, id, lastConversionTime from songs_owned, (
          SELECT count(*) as acount, count(distinct song) as songcount
            FROM songs_owned
            JOIN ${dbname} ON ${dbname}.uniqkey = songs_owned.uniqkey
            where song like '%${escape(search)}%' or artist like '%${escape(search)}%' or album like '%${escape(search)}%'
          ) c 
          JOIN ${dbname} ON ${dbname}.uniqkey = songs_owned.uniqkey
          where song like '%${escape(search)}%' or artist like '%${escape(search)}%' or album like '%${escape(search)}%'
          ORDER BY ${sortField} ${sortOrder} LIMIT ${start},${count}
          `;
  }
  //console.log(sql);
  const output = await db.all(sql);
  return output
}

export async function removeSongFromSetlist(dbname, song, artist, album) {
  // console.log("__db_call__: removeSongFromSetlist");
  let sql = `select uniqkey from songs_owned where song like '%${song}%' and artist like '%${artist}%' and album like '%${album}%'`;
  const op = await db.all(sql)
  sql = "";
  for (let i = 0; i < op.length; i += 1) {
    const uniq = op[i].uniqkey;
    sql = `DELETE FROM '${dbname}' where uniqkey='${uniq}';`
    //eslint-disable-next-line
    await db.all(sql);
  }
}
export async function saveSongToSetlist(setlist, song, artist) {
  // console.log("__db_call__: saveSongToSetlist");
  let sql = `select uniqkey from songs_owned where song like '%${escape(song)}%' and artist like '%${escape(artist)}%'`
  const op = await db.all(sql);
  for (let i = 0; i < op.length; i += 1) {
    const uniq = op[i].uniqkey;
    sql = `replace into '${setlist}' values ('${uniq}')`;
    //eslint-disable-next-line
    await db.run(sql)
  }
}
export async function addToFavorites(songkey) {
  // console.log("__db_call__: addToFavorites");
  const sql = `replace into setlist_favorites (uniqkey) select uniqkey from songs_owned where songkey like '%${songkey}%'`
  const op = await db.run(sql)
  return op.changes;
}

export async function getRandomSongOwned() {
  //console.log("__db_call__: getRandomSongOwned");
  await initSongsOwnedDB();
  const sql = "select * from songs_owned order by random() limit 1;"
  const op = await db.get(sql);
  return op;
}
export async function getRandomSongAvailable() {
  //console.log("__db_call__: getRandomSongAvailable");
  await initSongsAvailableDB();
  const sql = "select * from songs_available where name not like '%Song%20Pack%' and owned='false' order by random() limit 1;"
  const op = await db.get(sql);
  return op;
}
window.remote.app.on('window-all-closed', async () => {
  await saveSongsOwnedDB();
  console.log("Saved to db..");
})
