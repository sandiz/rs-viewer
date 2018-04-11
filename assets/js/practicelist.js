var lstorage = window.localStorage;
var showPracticeList = false;
var storageKey = "practice_list";
var remText = "Rem. from Practice";
var addText = "Add to Practice";
function addToPracticeList(track) {
    console.log("add to practice: " + track);
    var curr = [];
    var savedList = lstorage.getItem(storageKey);
    if (savedList)
        curr = JSON.parse(savedList);
    curr.push(track);
    lstorage.setItem(storageKey, JSON.stringify(curr));
}

function removeFromPracticeList(track) {
    console.log("remove from practice: " + track);
    var curr = [];
    var savedList = lstorage.getItem(storageKey);
    if (savedList)
        curr = JSON.parse(savedList);
    var index = curr.indexOf(track);
    if (index > -1) {
        curr.splice(index, 1)
    }
    lstorage.setItem(storageKey, JSON.stringify(curr));
}

function inPracticeList(track) {
    var curr = [];
    var savedList = lstorage.getItem(storageKey);
    if (savedList)
        curr = JSON.parse(savedList);
    var index = curr.indexOf(track);
    if (index != -1) {
        return true;
    }
    return false;
}

function show_practice_list() {
    reset_all_filters();
    showPracticeList = !showPracticeList;
    $("#filterPractice").html((showPracticeList ? "Hide " : "Show ") + "Practice List");
    $("#filterPractice").css("background-color", (showPracticeList ? "lightgreen" : "#28a8e0"));
    var curr = []
    var savedList = lstorage.getItem(storageKey);
    if (savedList)
        curr = JSON.parse(savedList);

    userList.filter(function (item) {
        if (showPracticeList) {
            var track = item.values().song + "_" + item.values().artist;
            if (curr.includes(track)) {
                return true;
            } else {
                return false;
            }
        }
        else {
            return true;
        }
    })
}

$("#practiceListButton").on("click", function () {
    var song = $("#modal-song").text().split("Song: ")[1];
    var arist = $("#modal-artist").text().split("Song: ")[1]
    var track = song + "_" + artist;
    if (inPracticeList(track)) {
        $(this).text(addText);
        removeFromPracticeList(track);
    }
    else {
        $(this).text(remText);
        addToPracticeList(track);
    }
});