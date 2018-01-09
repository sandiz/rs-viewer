# rs-viewer
Rocksmith Profile Stats Generator + Playlist Creator

Setup
```
  install from requirements.txt pip install -r requirements.txt
  change steam base path in rs_profile_viewer.py (basePath var)
  
  create google cloud project here: https://console.cloud.google.com/
  generate API Key and OAuth client id  (client type other)
  change DEVELOPER_KEY in rs_profile_viewer.py with API Key  //for querying youtube
  change client_id, client_secret in client_secret.json      //for creating/update playlist
```
Create Local Rocksmith DLC DB from Steam
```
python update_db.py
```

Generate HTML Completion Stats
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -h
```

Generate CmdLine Completion Stats
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -s
```

Generate Playlist of NonOwned Tracks (prunes ignored tracks)
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -g
```

Update existing Playlist of NonOwned Trakcs (prunes ignored tracks)
```
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -g -p PLs5V9xxV6ZM9UvyaGobZm9HdJ1Zy_A3My
```

Mark tracks as ignore - ignored tracks dont show up in the playlist
``` 
python3 rs_profile_viewer.py -f /path/to/steam_prfldb -1 "Pretty Noose"
```
