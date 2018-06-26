import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import PropTypes from 'prop-types';
import readPSARC from '../fileservice';

const { remote } = window.require('electron')
function sizeFormatter(cell, row) {
  return <span>{Math.round(cell / 1024 / 1024)} MB</span>;
}
function dateFormatter(cell, row) {
  return <span>{new Date(cell).toLocaleDateString()}</span>;
}
const columns = [
  {
    dataField: "song",
    text: "Song",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '25%',
      };
    },
    sort: true,
  },
  {
    dataField: "artist",
    text: "Artist",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '25%',
      };
    },
    sort: true,
  },
  {
    dataField: "arrangement",
    text: "Arrangement",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '15%',
      };
    },
    sort: true,
  },
  {
    dataField: "name",
    text: "File Name",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '15%',
      };
    },
    sort: true,
  },
  {
    dataField: "size",
    text: "Size",
    formatter: sizeFormatter,
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '10%',
      };
    },
    sort: true,
  },
  {
    dataField: "created",
    text: "Created At",
    formatter: dateFormatter,
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '10%',
      };
    },
    sort: true,
  },
];
export default class PSARCView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = 'tab-psarc';
    this.processedFiles = []
    this.state = {
      files: [],
      processing: false,
      abortprocessing: false,
    };
  }
  openDirDialog = async () => {
    const dirs = remote.dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    if (dirs.length <= 0) {
      return;
    }
    const results = this.walkSync(dirs[0] + "/", null);
    console.log("psarc found: " + results.length);
    if (results.length > 0) {
      this.setState({ processing: true, files: [] });
      this.psarcRead(results);
    }
  }
  walkSync = (dir, results) => {
    const fs = remote.require("fs");
    const files = fs.readdirSync(dir);

    results = results || [];
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const statres = fs.statSync(dir + file);
      if (statres.isDirectory()) {
        //filelist = this.walkSync(dir + file + "/", filelist);
        results = this.walkSync(dir + file + "/", results);
      } else {
        if (file.endsWith("_m.psarc")) {
          results.push([dir + file, statres]);
        }
      }
    }
    return results;
  }

  psarcRead = async (results) => {
    const count = results.length;
    let index = 1;
    // eslint-disable-next-line
    for (const prObj of results) {
      // eslint-disable-next-line
      const currentResults = await readPSARC(prObj[0], prObj[1], (500 + (index * 100)))
      this.processedFiles = this.processedFiles.concat(currentResults);
      this.props.updateHeader(this.tabname, `Processed PSARC:  ${currentResults[0].name} (${index}/${count})`);
      if (index >= count) {
        this.props.resetHeader(this.tabname);
        this.setState({ files: this.processedFiles, processing: false });
      }
      if (this.state.abortprocessing) {
        this.setState({ processing: false, abortprocessing: false });
        break;
      }
      index += 1
    }
  }
  noData = () => {
    if (this.state.processing) {
      return "Processing...";
    }
    return "No Data"
  }
  forceViewUpdate = () => {
    this.setState({ files: this.processedFiles });
  }
  stopProcessing = async () => {
    this.setState({ files: this.processedFiles, abortprocessing: true });
  }
  render = () => {
    const stopprocessingstyle = this.state.processing ? "" : "none";
    const choosepsarchstyle = "extraPadding download " + (this.state.processing ? "isDisabled" : "");
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname) {
      return (
        <div>
          <div className="centerButton list-unstyled">
            <a
              onClick={this.openDirDialog}
              className={choosepsarchstyle}>
              Choose .psarc Directory
            </a>
            <a
              onClick={this.stopProcessing}
              className="extraPadding download"
              style={{ display: `${stopprocessingstyle}` }}>
              Stop Processing
            </a>
            <a
              onClick={this.forceViewUpdate}
              className="extraPadding download"
              style={{ display: `${stopprocessingstyle}` }}>
              Force Generate View
            </a>
          </div>
          <div>
            <BootstrapTable
              keyField="name"
              data={this.state.files}
              columns={columns}
              classes="psarcTable"
              hover
              bordered={false}
              noDataIndication={this.noData}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}
PSARCView.propTypes = {
  currentTab: PropTypes.object,
  updateHeader: PropTypes.func,
  resetHeader: PropTypes.func,
}
PSARCView.defaultProps = {
  currentTab: null,
  updateHeader: () => { },
  resetHeader: () => { },
}
