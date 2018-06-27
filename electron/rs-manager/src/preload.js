window.ipcRenderer = require("electron").ipcRenderer;
window.shell = require("electron").shell;
window.remote = require('electron').remote;
window.electronFS = window.remote.require('fs');
window.spawn = require("await-spawn");
window.dirname = __dirname;
window.sqlite = require("sqlite");

