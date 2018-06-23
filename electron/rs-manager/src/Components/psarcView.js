import React from "react";
import BootstrapTable from "react-bootstrap-table-next";


const path = require("path");
const { remote } = window.require("electron");
const columns = [
    {
        dataField: "song",
        text: "Song"
    },
    {
        dataField: "artist",
        text: "Artist"
    },
    {
        dataField: "name",
        text: "File Name"
    },
    {
        dataField: "size",
        text: "Size",
        formatter: sizeFormatter
    },
    {
        dataField: "created",
        text: "Created At",
        formatter: dateFormatter
    }
];
function sizeFormatter(cell, row) {
    return <span>{Math.round(cell / 1024 / 1024)} MB</span>;
}
function dateFormatter(cell, row) {
    return <span>{new Date(cell).toISOString()}</span>;
}



export default class PSARCView extends React.Component {
    constructor(props) {
        super(props);
        this.tabname = "tab-psarc";
        this.state = {
            files: []
        };
    }
    componentDidMount() {
        console.log(__dirname);
    }
    async openDirDialog() {
        var dirs = remote.dialog.showOpenDialog({
            properties: ["openDirectory"]
        });
        console.log(dirs);
        //var files = this.walkSync(dirs[0] + "/", null);
        //this.setState({ files: files });
        //console.log(Object.values(files));
        //let result = await fileService.readDir(dirs);
        //console.log(result);
    };
    render = () => {
        if (this.props.currentTab === null) {
            return null;
        } else if (this.props.currentTab.id === this.tabname) {
            return (
                <div>
                    <div className="centerButton list-unstyled">
                        <a onClick={this.openDirDialog} className="extraPadding download">
                            Choose .psarc Directory
            </a>
                    </div>
                    <div>
                        <BootstrapTable
                            keyField="name"
                            data={Object.values(this.state.files)}
                            columns={columns}
                            classes={"psarcTable"}
                            hover
                            bordered={false}
                        />
                    </div>
                </div>
            );
        }
        return null;
    };
    walkSync(dir, filelist) {
        var fs = remote.require("fs");

        var files = fs.readdirSync(dir);

        filelist = filelist || [];
        files.forEach(file => {
            var statres = fs.statSync(dir + file);
            if (statres.isDirectory()) {
                filelist = this.walkSync(dir + file + "/", filelist);
            } else {
                if (file.endsWith("_m.psarc"))
                    filelist[path.basename(file, ".psarc")] = {
                        name: file,
                        size: statres.size,
                        created: statres.ctimeMs,
                        artist: "",
                        song: ""
                    };
            }
        });
        return filelist;
    }
}
