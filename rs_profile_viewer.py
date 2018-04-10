from Crypto.Cipher import AES
from datetime import datetime
import json, struct, zlib, getopt, math
import sys, pdb, os, glob, traceback
from rocksmith.utils import pack, unpack, convert, print_sng
from rocksmith import PSARC
import sqlite3
import pickle
from unidecode import unidecode
import google.oauth2.credentials
import google_auth_oauthlib.flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google_auth_oauthlib.flow import InstalledAppFlow

header = b'\x45\x56\x41\x53\x01\x00\x00\x00' \
    b'\x78\x11\xFD\x01\x00\x00\x10\x01'
key = b'\x72\x8B\x36\x9E\x24\xED\x01\x34' \
      b'\x76\x85\x11\x02\x18\x12\xAF\xC0' \
      b'\xA3\xC2\x5D\x02\x06\x5F\x16\x6B' \
      b'\x4B\xCC\x58\xCD\x26\x44\xF2\x9E'

Profile = {}
MasteryCache = {}
SongCache = {}
OtherStatCache = {}
DEVELOPER_KEY = os.environ["YT_DEV_KEY"]
YOUTUBE_API_SERVICE_NAME = 'youtube'
YOUTUBE_API_VERSION = 'v3'
CLIENT_SECRETS_FILE = 'client_secrets.json'
SCOPES = ['https://www.googleapis.com/auth/youtube']
API_SERVICE_NAME = 'youtube'
API_VERSION = 'v3'


def print_stats():
    global MasteryCache
    global SongCache
    notFound = []
    sortedM = [
        (k, MasteryCache[k])
        for k in sorted(MasteryCache, key=MasteryCache.get, reverse=True)
    ]

    for (id, mastery) in sortedM:
        if id not in SongCache:
            notFound.append(id)
            continue
        SongDetails = SongCache[id]
        print(SongDetails["artist"] + " - " + SongDetails["song"] + " - " +
              SongDetails["arrangement"] + " " + str(mastery) + "%" + " ")
        #SongDetails["arrangement"] + " " + str(mastery) + "%" + " " + SongDetails["json"] + " " + SongDetails["psarc"])

    print("Not found ids: " + str(len(notFound)))


def clip(lo, x, hi):
    return lo if x <= lo else hi if x >= hi else x


def print_html():
    global MasteryCache
    global SongCache
    global OtherStatCache
    notFound = []
    sortedM = [
        (k, MasteryCache[k])
        for k in sorted(MasteryCache, key=MasteryCache.get, reverse=True)
    ]
    datatowrite = ""
    for (id, mastery) in sortedM:
        if id not in SongCache:
            notFound.append(id)
            continue
        SongDetails = SongCache[id]
        datatowrite += "<tr><td class='song'>{}</td> <td class='artist'>{}</td> <td class='arrangement'>{}</td> <td class='mastery'>{}</td><td>".format(
            SongDetails["song"], SongDetails["artist"],
            SongDetails["arrangement"],
            str(round(mastery, 2)) + "%")

        if (mastery > 95):
            datatowrite += "<svg width='100%' height='20%'><rect width='" + \
                str(math.ceil(clip(0, mastery, 100))) + "%' height='100%' style='fill:lightgreen;stroke-width:2;stroke:rgb(0,0,0)'></rect></svg>" + "</td>"
        elif (mastery < 95 and mastery > 90):
            datatowrite += "<svg width='100%' height='20%'><rect width='" + \
                str(math.ceil(clip(0, mastery, 100))) + "%' height='100%' style='fill:#C8F749;stroke-width:2;stroke:rgb(0,0,0)'></rect></svg>" + "</td>"
        else:
            datatowrite += "<svg width='100%' height='20%'><rect width='" + \
                str(math.ceil(clip(0, mastery, 100))) + "%' height='100%' style='fill:yellow;stroke-width:2;stroke:rgb(0,0,0)'></rect></svg>" + "</td>"

        OtherStats = OtherStatCache[id] if id in OtherStatCache else {}

        PlayedCount = OtherStats.get("PlayedCount", 0)
        datatowrite += "<td class='count'>{}</td>".format(PlayedCount)

        #end row
        datatowrite += "</tr>"

    for id in SongCache:
        if id not in MasteryCache:
            SongDetails = SongCache[id]
            if not SongDetails['song']:
                continue
            if (SongDetails["arrangement"] in ["Vocals"]):
                continue
            datatowrite += "<tr><td class='song'>{}</td> <td class='artist'>{}</td> <td class='arrangement'>{}</td> <td class='mastery'>{}</td><td>".format(
                SongDetails["song"], SongDetails["artist"],
                SongDetails["arrangement"], "-")

            OtherStats = OtherStatCache[id] if id in OtherStatCache else {}

            PlayedCount = OtherStats.get("PlayedCount", 0)
            datatowrite += "<td class='count'>{}</td>".format(PlayedCount)

            datatowrite += "</tr>"

    fin = open("template.html", "r")
    fout = open("output.html", "w")
    for x in fin:
        if "--INSERTMARKER--" in x:
            fout.write(datatowrite)
        elif "--STATSMARKER--" in x:
            stats = print_dlc_stats(True)
            fout.write(stats)
        else:
            fout.write(x)
    print("output.html generated")


def open_and_print_profile(file):
    global OtherStatCache
    global MasteryCache
    global SongCache
    f = open(file, 'rb')
    data = f.read()
    unk1 = struct.unpack('<L', data[16:20])
    aes = AES.new(key, AES.MODE_ECB)
    decrypted = aes.decrypt(data[20:])
    decompressed = zlib.decompress(decrypted)
    Profile = json.loads(decompressed[0:-1])
    f.close()
    f = open("player_data.json", "w")
    f.write(
        json.dumps(Profile, sort_keys=True, indent=4, separators=(',', ': ')))
    f.close()
    # print learn a song stats
    for id in Profile["Stats"]["Songs"]:
        detail = Profile["Stats"]["Songs"][id]
        mastery = -1
        #if(id in SongCache):
        #    if(SongCache[id]['song'] == "Mean Bitch"):
        #        pdb.set_trace()

        #used MasteryLast before
        if ("MasteryPeak" in detail):
            mastery = detail["MasteryPeak"] * 100
        else:
            mastery = 0
        MasteryCache[id] = mastery

        # record non mastery stats
        if ("PlayedCount" in detail):
            #if any(s in detail for s in set("PlayedCount")):
            OtherStatCache[id] = {"PlayedCount": detail["PlayedCount"]}


def read_psarc():
    global SongCache
    psarcList = []
    basePath = "/Users/sandi/Library/Application Support/Steam/steamapps/common/Rocksmith2014/"

    #psarcList.append(basePath + "/songs.psarc")
    #dlcPath = basePath + "/dlc/"
    #os.chdir(dlcPath)
    psarcblacklist = [
        "session.psarc", "static.psarc", "gears.psarc", "etudes.psarc",
        "crowd.psarc", "audio.psarc", "video.psarc"
    ]
    for root, dirs, files in os.walk(basePath):
        for file in files:
            fullpath = os.path.join(root, file)
            if file.endswith(
                    ".psarc"
            ) and file not in psarcblacklist and "Tmp" not in fullpath:
                psarcList.append(fullpath)

    jsonblacklist = ["manifests/venues.database.json"]
    for psarc in psarcList:
        print("Songs in " + psarc)
        with open(psarc, 'rb') as fh:
            content = PSARC(True).parse_stream(fh)
            for filepath, data in content.items():
                if "json" in filepath:
                    print("Reading " + filepath)
                    if filepath in jsonblacklist:
                        continue
                    songData = json.loads(data)
                    if "Entries" not in songData:
                        continue
                    for id in songData["Entries"]:
                        data = songData["Entries"][id]["Attributes"]
                        songDict = {}
                        songDict["album"] = data.get("AlbumName", "")
                        songDict["artist"] = data.get("ArtistName", "")
                        songDict["song"] = data.get("SongName", "")
                        songDict["arrangement"] = data.get(
                            "ArrangementName", "")
                        if (songDict["arrangement"] == "Combo"):
                            songDict["arrangement"] = "LeadCombo"
                        songDict["json"] = filepath
                        songDict["psarc"] = psarc
                        songDict["dlc"] = data.get("DLC", False)
                        songDict["sku"] = data.get("SKU", "")
                        SongCache[id] = songDict

    songCacheFile = open("SongCache.pickle", "wb")
    pickle.dump(SongCache, songCacheFile)


def update_owned_status():
    conn = sqlite3.connect("rocksmithdlc.db")
    c = conn.cursor()
    for id in SongCache:
        SongDetails = SongCache[id]
        if not SongDetails["song"] or not SongDetails["artist"] or SongDetails["sku"] in [
                "RS1"
        ]:
            continue
        c.execute("PRAGMA case_sensitive_like=OFF;")
        c.execute("select * from songs where name LIKE ?",
                  ('%' + SongDetails["song"] + '%', ))
        rows = c.fetchall()
        if (len(rows) == 0):
            if SongDetails["dlc"]:
                print("No song name match for " + SongDetails["song"] +
                      " isDLC: " + str(SongDetails["dlc"]) + " SKU: " +
                      SongDetails["sku"])
            continue
        row = None
        for potentialrow in rows:
            if unidecode(
                    SongDetails["artist"]).lower() in potentialrow[2].lower():
                row = potentialrow
        if row != None:
            print("for song: " + SongDetails["song"] + " matches: " +
                  str(len(rows)) + " marking db entry: " + row[2] +
                  " owned.." + " index: " + str(row[0]))
            sql_update_entry = ''' UPDATE songs
                  SET owned = 1
                  WHERE id = ?'''
            c.execute(sql_update_entry, (row[0], ))

        else:
            print("no song/artist matches for song: " + SongDetails["song"] +
                  " " + SongDetails["artist"] + " isDLC: " +
                  str(SongDetails["dlc"]) + " SKU: " + SongDetails["sku"])
    conn.commit()
    conn.close()


def generate_yt_missing_playlist(playlistID):
    update_owned_status()
    conn = sqlite3.connect("rocksmithdlc.db")
    c = conn.cursor()
    generate_playlist(conn, playlistID)
    conn.commit()
    conn.close()


def generate_playlist(conn, playlistID):
    print("\n\nGenerating playlist...")
    youtube = get_authenticated_service()
    playlist = None
    if (playlistID is None):
        playlist = create_playlist(youtube)
    else:
        playlist = playlistID
        print("Using playlist " + playlist)
    videos = list_playlist_videos(youtube, playlist)
    c = conn.cursor()
    c.execute("select * from songs where owned = 0")
    count = 1
    for row in c.fetchall():
        fulltrack = row[2]
        splittrack = []
        if "Song Pack" in fulltrack:
            continue
        fulltrack = " ".join(fulltrack.split())
        if "Rocksmith(r) 2014 Edition - Remastered -" in fulltrack:
            splittrack = fulltrack.split(
                "Rocksmith(r) 2014 Edition - Remastered -")
        else:
            splittrack = fulltrack.split("Rocksmith(r) 2014 -")
        if (len(splittrack) > 1):
            parsedtrack = splittrack[1]
            video = search_yt(parsedtrack)
            if (len(video) == 0):
                print("No videos found for " + parsedtrack)
                count += 1
                continue
            chosenvideo = video[0]["id"]["videoId"]
            playlistItemId = None
            if (chosenvideo in videos.keys()):
                print(
                    "Track: " + str(count) + " " + parsedtrack + " YTID: " +
                    str(chosenvideo),
                    end='')
                print(" - Already in playlist")
                playlistItemId = videos[chosenvideo]
            else:
                print(
                    "Track: " + str(count) + " " + parsedtrack + " YTID: " +
                    str(chosenvideo),
                    end='')
                response = add_to_playlist(youtube, playlist, chosenvideo)
                playlistItemId = response["id"]
                print(" - Added to playlist")

            if (row[6] == 1):  #ignore tracks
                response = remove_from_playlist(youtube, playlist,
                                                playlistItemId)
                print(
                    "Track: " + str(count) + " " + parsedtrack + " YTID: " +
                    str(chosenvideo) + " ItemID: " + playlistItemId,
                    end='')
                print(" - Removed from playlist")
        else:
            print(fulltrack + " failed to split")
            sys.exit(-1)
        count += 1


def list_playlist_videos(youtube, playlist_id):
    # Retrieve the list of videos uploaded to the authenticated user's channel.
    playlistitems_list_request = youtube.playlistItems().list(
        playlistId=playlist_id, part='snippet', maxResults=5)

    VideoIDS = {}
    print('Videos in list %s' % playlist_id)
    while playlistitems_list_request:
        playlistitems_list_response = playlistitems_list_request.execute()
        # Print information about each video.
        for playlist_item in playlistitems_list_response['items']:
            id = playlist_item['id']
            title = playlist_item['snippet']['title']
            video_id = playlist_item['snippet']['resourceId']['videoId']
            VideoIDS[video_id] = id
            print('%s (%s)' % (title, video_id))

        playlistitems_list_request = youtube.playlistItems().list_next(
            playlistitems_list_request, playlistitems_list_response)

    return VideoIDS


def add_to_playlist(youtube, playlist, chosenvideo):
    return playlist_items_insert(
        youtube, {
            'snippet.playlistId': playlist,
            'snippet.resourceId.kind': 'youtube#video',
            'snippet.resourceId.videoId': chosenvideo,
            'snippet.position': ''
        },
        part='snippet',
        onBehalfOfContentOwner='')


def remove_from_playlist(youtube, playlist, itemid):
    return playlist_items_delete(youtube, id=itemid, onBehalfOfContentOwner='')


def playlist_items_delete(client, **kwargs):
    kwargs = remove_empty_kwargs(**kwargs)

    response = client.playlistItems().delete(**kwargs).execute()
    return response


def playlist_items_insert(client, properties, **kwargs):
    resource = build_resource(properties)
    kwargs = remove_empty_kwargs(**kwargs)
    response = client.playlistItems().insert(body=resource, **kwargs).execute()
    return response


def create_playlist(youtube):
    body = dict(
        snippet=dict(
            title="Rocksmith Available Tracks",
            description="Tracks not yet purchased on steam"),
        status=dict(privacyStatus='private'))

    playlists_insert_response = youtube.playlists().insert(
        part='snippet,status', body=body).execute()
    print("Created Playlist: " + playlists_insert_response["id"])
    return playlists_insert_response["id"]


def get_authenticated_service():
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_FILE,
                                                     SCOPES)
    #credentials = flow.run_console()
    credentials = flow.run_local_server(
        host='localhost',
        port=8080,
        authorization_prompt_message='Please visit this URL: {url}',
        success_message='The auth flow is complete; you may close this window.',
        open_browser=True)
    return build(API_SERVICE_NAME, API_VERSION, credentials=credentials)


def search_yt(q, num=5):
    youtube = build(
        YOUTUBE_API_SERVICE_NAME,
        YOUTUBE_API_VERSION,
        developerKey=DEVELOPER_KEY)

    q = q.replace('"', '').replace('-', '')
    # Call the search.list method to retrieve results matching the specified
    # query term.
    search_response = youtube.search().list(
        q=q, part='id,snippet', maxResults=num).execute()

    videos = []
    for search_result in search_response.get('items', []):
        if search_result['id']['kind'] == 'youtube#video':
            videos.append(search_result)
    return videos


def main():
    global SongCache
    try:
        opts, args = getopt.getopt(sys.argv[1:], "f:ghnup:1:2:0:")
    except getopt.GetoptError as err:
        # print help information and exit:
        print(str(err))  # will print something like "option -a not recognized"
        sys.exit(2)
    file = ""
    generate = False
    html = False
    noPickle = False
    playlistID = None
    updateDB = False
    for o, a in opts:
        if o in ("-f"):
            file = a
        elif o in ("-g", "--output"):
            generate = True
        elif o in ("-h"):
            html = True
        elif o in ("-n"):
            noPickle = True
        elif o in ("-p"):
            playlistID = a
        elif o in ("-1"):
            mark_song(a, 1)
            sys.exit(1)
        elif o in ("-2"):
            mark_song(a, 2)
            sys.exit(1)
        elif o in ("-0"):
            mark_song(a, 0)
            sys.exit(1)
        elif o in ("-u"):
            updateDB = True
        else:
            assert False, "unhandled option"

    if noPickle:
        print("Reading psarcs from disk...")
        read_psarc()
    else:
        try:
            songCacheFile = open("SongCache.pickle", "rb")
            if songCacheFile:
                print("Reading psarcs from cache...")
                SongCache = pickle.load(songCacheFile)
            else:
                print("Reading psarcs from disk(file error)...")
                read_psarc()
        except:
            print("Reading psarcs from disk(file exception)...")
            read_psarc()

    if file != "":
        open_and_print_profile(file)
    if generate:
        generate_yt_missing_playlist(playlistID)
        sys.exit(1)
    if updateDB:
        update_owned_status()

    if (html):
        print_html()
    else:
        print_stats()

    print_dlc_stats()


def mark_song(a, v):
    print("Marking song: " + a + " with tag: " + str(v))
    conn = sqlite3.connect("rocksmithdlc.db")
    c = conn.cursor()
    c.execute("update songs set ignore=? where name LIKE ?",
              (v, "%" + a + "%"))
    conn.commit()
    c = conn.cursor()
    c.execute("select * from songs where name LIKE ?", ("%" + a + "%", ))
    rows = c.fetchall()
    if (len(rows) > 0):
        print(str(rows[0]))

    c.execute(
        "select name, appid from songs where ignore=? ORDER by appid ASC",
        (v, ))

    print("\nAll tracks with tag: " + str(v))
    for row in c.fetchall():
        print(row[0] + " - " + "http://store.steampowered.com/app/" +
              str(row[1]))


def print_dlc_stats(dontprint=False):
    conn = sqlite3.connect("rocksmithdlc.db")
    c = conn.cursor()
    c.execute("PRAGMA case_sensitive_like=OFF;")
    c.execute("select count(*) from songs;")
    total_dlc = c.fetchall()[0][0]

    c.execute("select count(*) from songs where name NOT LIKE '%SONG PACK%'")
    total_dlc_no_sp = c.fetchall()[0][0]

    c.execute(
        "select count(*) from songs where name NOT LIKE '%SONG PACK%' AND owned=1"
    )
    total_owned = c.fetchall()[0][0]

    c.execute(
        "select count(*) from songs where name NOT LIKE '%SONG PACK%' AND owned=0"
    )
    total_not_owned = c.fetchall()[0][0]

    if dontprint:
        pass
    else:
        print(
            "Total DLC(steam): {} Excluding SongPacks: {} Owned: {} Not Owned: {}".
            format(total_dlc, total_dlc_no_sp, total_owned, total_not_owned))

    conn.commit()
    conn.close()
    return "Total DLC(steam): {} Excluding SongPacks: {} Owned: {} <a href=\"https://www.youtube.com/playlist?list=PLs5V9xxV6ZM_DQ5BO3mPH4IXnaXW6XE2-\">Not Owned</a>: {}".format(
        total_dlc, total_dlc_no_sp, total_owned, total_not_owned)


def build_resource(properties):
    resource = {}
    for p in properties:
        # Given a key like "snippet.title", split into "snippet" and "title", where
        # "snippet" will be an object and "title" will be a property in that object.
        prop_array = p.split('.')
        ref = resource
        for pa in range(0, len(prop_array)):
            is_array = False
            key = prop_array[pa]

            # For properties that have array values, convert a name like
            # "snippet.tags[]" to snippet.tags, and set a flag to handle
            # the value as an array.
            if key[-2:] == '[]':
                key = key[0:len(key) - 2:]
                is_array = True

            if pa == (len(prop_array) - 1):
                # Leave properties without values out of inserted resource.
                if properties[p]:
                    if is_array:
                        ref[key] = properties[p].split(',')
                    else:
                        ref[key] = properties[p]
            elif key not in ref:
                # For example, the property is "snippet.title", but the resource does
                # not yet have a "snippet" object. Create the snippet object here.
                # Setting "ref = ref[key]" means that in the next time through the
                # "for pa in range ..." loop, we will be setting a property in the
                # resource's "snippet" object.
                ref[key] = {}
                ref = ref[key]
            else:
                # For example, the property is "snippet.description", and the resource
                # already has a "snippet" object.
                ref = ref[key]
    return resource


def remove_empty_kwargs(**kwargs):
    good_kwargs = {}
    if kwargs is not None:
        for key, value in kwargs.items():
            if value:
                good_kwargs[key] = value
    return good_kwargs


if __name__ == "__main__":
    try:
        main()
    except:
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
