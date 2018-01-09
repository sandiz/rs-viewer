from __future__ import print_function
from steamapiwrapper.SteamGames import Games
import pdb
import time
from datetime import date
from unidecode import unidecode

import sqlite3
conn = sqlite3.connect("rocksmithdlc.db")
c = conn.cursor()
sql_create_table = """ CREATE TABLE IF NOT EXISTS songs (
                                        id integer PRIMARY KEY,
										appid integer,
                                        name text NOT NULL,
                                        created_at text,
                                        updated_at text,
										owned integer
										ignore integer
                                    ); """
c.execute(sql_create_table)
sql_create_entry = ''' INSERT INTO songs(appid,name,created_at,updated_at,owned,ignore)
              VALUES(?,?,?,?,0,0) '''
sql_search_entry = 'SELECT * from songs where appid=?'
sql_update_entry = ''' UPDATE songs
              SET appid = ? ,
                name = ? ,
                created_at = ?,
		 		updated_at = ?,
				owned = 0,
				ignore = 0
              WHERE id = ?'''
def fetch_and_save(dlcs):
	for game in games.get_info_for(dlcs, 'US'):
		print ("Processing dlc " + unidecode(game.name) + "...", end='')
		c = conn.cursor()
		c.execute(sql_create_entry, (game.appid,
                               unidecode(game.name), date.today(), date.today()))
		print (" Done")
		conn.commit()
	

def is_dlc_present(dlc):
	c = conn.cursor()
	c.execute(sql_search_entry, (dlc,))
	rows = c.fetchall()
	return (len(rows) > 0)

games = Games()
appids = [221680] #rocksmith 2014 appid
for game in games.get_info_for(appids, 'US'):
	dlcs = game.raw_json["dlc"]
	print ("DLCs: " + str(len(dlcs)))

dlc_to_query = []
for dlc in dlcs:
	if is_dlc_present(dlc):
		print ("Skipping dlc with appid: " + str(dlc))
		continue
	else:
		dlc_to_query.append(dlc)
	
	if(len(dlc_to_query) == 1):
		fetch_and_save(dlc_to_query)
		dlc_to_query = []
		#time.sleep(0.5)
	
if(len(dlc_to_query) > 0):
	fetch_and_save(dlc_to_query)
	dlc_to_query = []
conn.close()


