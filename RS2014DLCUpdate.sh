#!/bin/sh
cd /Users/sandi/Projects/rocksmith_browser
python update_db.py
python3 rs_profile_viewer.py -f /Users/sandi/Library/Application\ Support/Steam/userdata/25347454/221680/remote/0976b41ec00d496f9f4214aa2c752700_prfldb -u -n
