# rs-viewer
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsandiz%2Frs-viewer.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsandiz%2Frs-viewer?ref=badge_shield)

Rocksmith Profile Stats Generator + Playlist Creator

Setup
```
  install from requirements.txt pip install -r requirements.txt
  change steam base path in rs_profile_viewer.py:read_psarc() (basePath var)
  basePath for mac is usually /Users/<username>/Library/Application\ Support/Steam/steamapps/common/Rocksmith2014/
  
  create google cloud project here: https://console.cloud.google.com/
  generate API Key and OAuth client id  (client type other)
  change DEVELOPER_KEY in rs_profile_viewer.py with API Key  //for querying youtube
  change client_id, client_secret in client_secret.json      //for creating/update playlist
```
Create Local Rocksmith DLC DB from Steam (optional if you use the rocksmithdlc.db from the repo)
```
python update_db.py # prone to hitting steam api request limit 
```

Generate HTML Completion Stats (open output.html to see a preview)
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -h
```

Generate CmdLine Completion Stats
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb
```

Generate Youtube Playlist of Non-Owned Tracks (prunes ignored tracks)
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -g
```

Updates existing Youtube Playlist of Non-Owned Trakcs (prunes ignored tracks)
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -g -p PLs5V9xxV6ZM9UvyaGobZm9HdJ1Zy_A3My
```

Mark tracks as ignore - ignored tracks dont show up in the playlist
``` 
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -1 "Pretty Noose"
```

Mark tracks as liked - ignored tracks dont show up in the playlist
``` 
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -2 "Pretty Noose"
```

Reset ignored track
``` 
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -0 "Pretty Noose"
```

Path to Profile DB (for mac) (ends with prfldb)
```
/Users/<username>/Library/Application Support/Steam/userdata/<id>/221680/remote
```

sqlite3 operations
  show all marked tracks: 
  ```
  sqlite3 rocksmithdlc.db  "select * from songs where ignore!=0;"
  ```
  show all liked tracks with store url:
  ```
  sqlite3 rocksmithdlc.db  "select name, appid from songs where ignore=2;"  | sed 's/\(^.*\)\(.*\)|/\1 - http:\/\/store.steampowered.com\/app\/\2/g' #with store url
  ```

My Use Case - An updated playlist of all tracks that i dont own (to find out which dlc's to buy)
  - when new dlc is released, I update the dlc db with `python update_db.py`
  - update existing youtube playlist with new tracks and remove tracks that I have marked ignore with 
    `python3 rs_profile_viewer.py -f mockdata/0976b41ec00d496f9f4214aa2c752700_prfldb -g -p PLs5V9xxV6ZM9UvyaGobZm9HdJ1Zy_A3My`
  - when listening to the playlist, I mark tracks that i dont like with 
    `python3 rs_profile_viewer.py -f mockdata/0976b41ec00d496f9f4214aa2c752700_prfldb -1 "Pretty Noose`


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fsandiz%2Frs-viewer.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fsandiz%2Frs-viewer?ref=badge_large)