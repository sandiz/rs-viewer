#!/bin/sh
cd /Users/sandi/Projects/rocksmith_browser
python3 rs_profile_viewer.py -f /Users/sandi/Library/Application\ Support/Steam/userdata/25347454/221680/remote/0976b41ec00d496f9f4214aa2c752700_prfldb -h
scp -r output.html assets/ dev:/home/sandi/service/public
