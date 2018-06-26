from lib.rocksmith import PSARC
import json, struct, zlib, getopt, math, sys, traceback, os


def read_psarc(psarc):
    psarcData = {}
    files = []
    arrangments = []
    with open(psarc, 'rb') as fh:
        content = PSARC(True).parse_stream(fh)
        for filepath, data in content.items():
            files.append(filepath)
            if "json" in filepath:
                arrgmentData = json.loads(data)
                if "Entries" not in arrgmentData:
                    continue
                for id in arrgmentData["Entries"]:
                    data = arrgmentData["Entries"][id]["Attributes"]
                    songDict = {}
                    songDict["album"] = data.get("AlbumName", "")
                    songDict["artist"] = data.get("ArtistName", "")
                    songDict["song"] = data.get("SongName", "")
                    songDict["arrangement"] = data.get("ArrangementName", "")
                    if (songDict["arrangement"] == "Combo"):
                        songDict["arrangement"] = "LeadCombo"
                    if (songDict["arrangement"] == "Vocals"):
                        continue
                    songDict["json"] = filepath
                    songDict["psarc"] = os.path.basename(psarc)
                    songDict["dlc"] = data.get("DLC", False)
                    songDict["sku"] = data.get("SKU", "")
                    songDict["difficulty"] = data.get("SongDifficulty",
                                                      0) * 100
                    arrangments.append(songDict)

    psarcData["key"] = os.path.splitext(os.path.basename(psarc))[0]
    psarcData["files"] = files
    psarcData["arrangements"] = arrangments

    print(json.dumps(psarcData, sort_keys=False))
    pass


def main():
    try:
        opts, args = getopt.getopt(sys.argv[1:], "f:")
    except getopt.GetoptError as err:
        # print help information and exit:
        print(str(err))  # will print something like "option -a not recognized"
        sys.exit(2)

    file = ""
    for o, a in opts:
        if o in ("-f"):
            file = a
    try:
        read_psarc(file)
    except:
        print_error()


def print_error():
    data = {}
    data["error"] = True
    print(json.dumps(data, sort_keys=False))


if __name__ == "__main__":
    try:
        main()
    except:
        #type, value, tb = sys.exc_info()
        #traceback.print_exc()
        print_error()