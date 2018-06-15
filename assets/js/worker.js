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

function loadList() {
    var userList = new List('tracks', options);
    postMessage(userList);
}

loadList();