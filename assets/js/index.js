var options = {
    valueNames: ['song', 'artist', 'mastery', 'count', 'arrangement', 'difficulty'],
    fuzzySearch: {
        searchClass: "search ",
        location: 0,
        distance: 100,
        threshold: 0.2,
        multiSearch: true
    }
};

var userList;
$(document).ready(function () {
    userList = new List('tracks', options);
    var lt1total = 0, lt2total = 0, lt3total = 0, lt4total = 0;
    var rt1total = 0, rt2total = 0, rt3total = 0, rt4total = 0;
    var bt1total = 0, bt2total = 0, bt3total = 0, bt4total = 0;
    for (var i = 0; i < userList.items.length; i++) {
        var item = userList.items[i];
        if (item._values.arrangement.toLowerCase().includes("lead")) {
            lead.push(i)
            var mastery = parseFloat(item._values.mastery);
            if (mastery > 95)
                lt1total++;
            else if (mastery > 90 && mastery <= 95)
                lt2total++;
            else if (mastery >= 1 && mastery <= 90)
                lt3total++;
            else
                lt4total++;
        }
        else if (item._values.arrangement.toLowerCase().includes("rhythm")) {
            rhythm.push(i);
            var mastery = parseFloat(item._values.mastery);
            if (mastery > 95)
                rt1total++;
            else if (mastery > 90 && mastery <= 95)
                rt2total++;
            else if (mastery >= 1 && mastery <= 90)
                rt3total++;
            else
                rt4total++;
        }
        else if (item._values.arrangement.toLowerCase().includes("bass")) {
            bass.push(i)
            var mastery = parseFloat(item._values.mastery);
            if (mastery > 95)
                bt1total++;
            else if (mastery > 90 && mastery <= 95)
                bt2total++;
            else if (mastery >= 1 && mastery <= 90)
                bt3total++;
            else
                bt4total++;
        }
    }
    $("#lead_total").html(lead.length);
    $("#lead_tier_1_count").text(lt1total);
    $("#lead_tier_1_svg").width(Math.round((lt1total / lead.length) * 100) + "%");
    $("#lead_tier_2_count").text(lt2total);
    $("#lead_tier_2_svg").width(Math.round((lt2total / lead.length) * 100) + "%");
    $("#lead_tier_3_count").text(lt3total);
    $("#lead_tier_3_svg").width(Math.round((lt3total / lead.length) * 100) + "%");
    $("#lead_tier_4_count").text(lt4total);
    $("#lead_tier_4_svg").width(Math.round((lt4total / lead.length) * 100) + "%");

    $("#rhythm_total").html(rhythm.length);
    $("#rhythm_tier_1_count").text(rt1total);
    $("#rhythm_tier_1_svg").width(Math.round((rt1total / rhythm.length) * 100) + "%");
    $("#rhythm_tier_2_count").text(rt2total);
    $("#rhythm_tier_2_svg").width(Math.round((rt2total / rhythm.length) * 100) + "%");
    $("#rhythm_tier_3_count").text(rt3total);
    $("#rhythm_tier_3_svg").width(Math.round((rt3total / rhythm.length) * 100) + "%");
    $("#rhythm_tier_4_count").text(rt4total);
    $("#rhythm_tier_4_svg").width(Math.round((rt4total / rhythm.length) * 100) + "%");

    $("#bass_total").html(bass.length);
    $("#bass_tier_1_count").text(bt1total);
    $("#bass_tier_1_svg").width(Math.round((bt1total / bass.length) * 100) + "%");
    $("#bass_tier_2_count").text(bt2total);
    $("#bass_tier_2_svg").width(Math.round((bt2total / bass.length) * 100) + "%");
    $("#bass_tier_3_count").text(bt3total);
    $("#bass_tier_3_svg").width(Math.round((bt3total / bass.length) * 100) + "%");
    $("#bass_tier_4_count").text(bt4total);
    $("#bass_tier_4_svg").width(Math.round((bt4total / bass.length) * 100) + "%");

    $("#h3_stats").html("Arrangements: " + userList.items.length + " " + $("#h3_stats").html());

});
var lead = []
var rhythm = []
var bass = []
var filteron = false;
$("#filterrs1").click(function () {
    reset_all_filters();
    filteron = !filteron;
    $(this).html((filteron ? "Show " : "Hide ") + "RS1 Compat Tracks");
    $("#filterrs1").css("background-color", (filteron ? "lightgreen" : "#28a8e0"));

    userList.filter(function (item) {
        if (filteron) {
            if (item.values().artist.toLowerCase().includes("rs1")) {
                return false;
            } else {
                return true;
            }
        }
        else {
            return true;
        }
    })
});
$('#myTable tr').click(function () {
    var trindex = $(this).index();
    var song = $(this).find('td:first').text();
    var artist = $(this).find('td:first').next().text();
    var arrangement = $(this).find('td:first').next().next().text();
    var count = $(this).find('td:first').next().next().next().next().text();
    for (var i = 0; i < userList.items.length; i++) {
        var searchitem = userList.items[i];
        if (searchitem._values.song == song
            && searchitem._values.artist.localeCompare(convert(artist), "en", { ignorePunctuation: true }) == 0
            && searchitem._values.arrangement == arrangement
            && searchitem._values.count == count) {
            create_modal(i);
            break;
        }
    }
});
function convert(str) {
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/>/g, "&gt;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/'/g, "&#039;");
    return str;
}

$("#select_pt").on('click', function (e) {
    $(this).css("font-weight", "Bold");
    $("#select_mv").css("font-weight", "normal");
    $("#div_playthrough").show();
    $("#div_musicvideo").hide();
    ptplayer.stopVideo();
    mvplayer.stopVideo();
});
$("#select_mv").on('click', function (e) {
    $(this).css("font-weight", "Bold");
    $("#select_pt").css("font-weight", "normal");
    $("#div_musicvideo").show();
    $("#div_playthrough").hide();
    ptplayer.stopVideo();
    mvplayer.stopVideo();
});
function show_random_song() {
    var songidx = get_random_song();
    create_modal(songidx);
}
function update_stats_in_modal(song) {
    name = song._values.song;
    artist = song._values.artist
    var arrangement = []
    for (var i = 0; i < userList.items.length; i++) {
        var searchitem = userList.items[i];
        if (searchitem._values.song == name && searchitem._values.artist == artist) {
            arrangement.push(searchitem._values.arrangement + "____" + searchitem._values.mastery);
        }
    }
    var str = "";
    for (var index = 0; index < arrangement.length; index++) {
        var marker = (index < arrangement.length - 1) ? " | " : "  ";
        var arr = arrangement[index].split("____");
        str += arr[0] + " " + (arr[1] == "-" ? "0%" : arr[1]) + marker;
    }
    $("#stats_span")[0].innerHTML = str;

    var track = name + "_" + artist;
    console.log("checking from " + track + " in local storage");
    if (inPracticeList(track))
        $("#practiceListButton").text(remText);
    else
        $("#practiceListButton").text(addText);
}
function create_modal(songidx) {
    var song = userList.items[songidx];
    $("#modal-song")[0].innerHTML = "Song: " + song._values.song;
    $("#modal-artist")[0].innerHTML = "Artist: " + song._values.artist;
    $("#modal-path")[0].innerHTML = "Path: " + song._values.arrangement +
        " | Mastery: " + ((song._values.mastery == "-") ? "0%" : song._values.mastery);
    update_stats_in_modal(song)
    var searchterm_pt = song._values.song + " " + song._values.artist + " rocksmith ";
    var searchterm_mv = song._values.song + " " + song._values.artist + " music video "
    getRequest(searchterm_pt, "div_playthrough");
    getRequest(searchterm_mv, "div_musicvideo");
    open_modal('open-modal');
}
function open_modal(id) {
    document.getElementById(id).style.opacity = 1;
    document.getElementById(id).style.pointerEvents = "auto ";
}
function close_modal(id) {
    document.getElementById(id).style.opacity = 0;
    document.getElementById(id).style.pointerEvents = "none ";
    if (ptplayer)
        ptplayer.stopVideo();
    if (mvplayer)
        mvplayer.stopVideo();
}
function get_random_song() {
    var prefer_lead = document.getElementById("lead").checked;
    var prefer_rhythm = document.getElementById("rhythm").checked;
    var prefer_bass = document.getElementById("bass").checked;

    var pot = []
    pot = pot.concat(lead)
    pot = pot.concat(bass)
    pot = pot.concat(rhythm)
    if (prefer_lead)
        pot = pot.concat(lead)
    if (prefer_rhythm)
        pot = pot.concat(rhythm)
    if (prefer_bass)
        pot = pot.concat(bass)

    console.log("pot size: " + pot.length);
    tries = 0;
    match = false;
    matchIdx = -1;
    do {
        var item = pot[Math.floor(Math.random() * pot.length)];
        var itemInfo = userList.items[item];
        var mastery = parseFloat(itemInfo._values.mastery);
        if (mastery < 90) {
            console.log("selected " + itemInfo._values);
            match = true;
            matchIdx = item;
            break;
        }
        tries++;
    } while (match == false && tries <= 10)

    return matchIdx;
}
function getRequest(searchTerm, id) {
    url = 'https://www.googleapis.com/youtube/v3/search';
    if (searchTerm.includes("(RS1 Comptability DLC)"))
        searchTerm = searchTerm.replace("(RS1 Comptability DLC)", "");
    var params = {
        part: 'snippet',
        key: 'AIzaSyAQPZZZVEH-lUTRuN4l2XF-zUB25eR45zo',
        q: searchTerm
    };
    console.log("Searching " + searchTerm);

    $.getJSON(url, params, function (searchTerm) {
        showResults(searchTerm, id);
    });
}
var ptId = "";
var mvid = "";
var ptplayer;
var mvplayer;
function showResults(results, id) {
    var html = " ";
    var entries = results.items;

    if (entries.length > 0) {
        var result = entries[0];
        var vid = result.id.videoId;
        console.log(vid);

        player = new YT.Player(id, {
            height: '390',
            width: '640',
            videoId: vid,
            playerVars: {
                origin: "http://sandi.dev-gen-01.internal.fortmasongames.com",
                widget_referrer: "http://sandi.dev-gen-01.internal.fortmasongames.com",
                referrer: "http://sandi.dev-gen-01.internal.fortmasongames.com",
                autoPlay: 0
            },
            events: {
                'onReady': playerReady
            }
        });
        if (id == "div_playthrough") {
            ptid = vid;
            if (ptplayer) {
                ptplayer.loadVideoById(vid);
                ptplayer.stopVideo();
            } else {
                ptplayer = player;
            }
        }
        else {
            mvid = vid;
            if (mvplayer) {
                mvplayer.loadVideoById(vid);
                mvplayer.stopVideo();
            }
            else {
                mvplayer = player;
            }
        }
    }

}
function playerReady(event) {
    if (event.target.a.id == "div_musicvideo")
        event.target.loadVideoById(mvid);
    else
        event.target.loadVideoById(ptid);
    event.target.stopVideo();
}
$(document).keyup(function (e) {
    if (e.keyCode == 27) { // escape key maps to keycode `27`
        close_modal('open-modal');
        close_modal('detailed-stats-modal');
    }
});
function reset_all_filters() {
    userList.filter();
    $("#filterrs1").html("Hide RS1 Compat Tracks");
    $("#filterrs1").css("background-color", "#28a8e0");

    $("#filterPractice").html("Show Practice List");
    $("#filterPractice").css("background-color", "#28a8e0");
}
function zoomby(percent) {
    console.log("zooming by" + percent);
    if (percent == "0") {
        $("#div_playthrough").css('height', "");
        $("#div_musicvideo").css('height', "");
        $("#modal-info").css('width', "");
        $("#modal-info").css('height', "");
        $("#modal-info").css('margin', "10% auto");
    }
    else {
        $("#div_playthrough").css('height', "80%");
        $("#div_musicvideo").css('height', "80%");
        $("#modal-info").css('width', percent)
        $("#modal-info").css('height', percent)
        if (percent == "100%")
            $("#modal-info").css('margin', "0% auto");
        else
            $("#modal-info").css('margin', "5% auto");
    }
}