import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import PropTypes from 'prop-types';
import readPSARC from '../fileservice';

const { remote } = window.require('electron')
function sizeFormatter(cell, row) {
  return <span>{Math.round(cell / 1024 / 1024)} MB</span>;
}
function dateFormatter(cell, row) {
  return <span>{new Date(cell).toISOString()}</span>;
}
const columns = [
  {
    dataField: "song",
    text: "Song",
  },
  {
    dataField: "artist",
    text: "Artist",
  },
  {
    dataField: "name",
    text: "File Name",
  },
  {
    dataField: "size",
    text: "Size",
    formatter: sizeFormatter,
  },
  {
    dataField: "created",
    text: "Created At",
    formatter: dateFormatter,
  },
];
export default class PSARCView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = 'tab-psarc';
    this.state = {
      files: [],
    };
  }
  openDirDialog = async () => {
    const dirs = remote.dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    const results = this.walkSync(dirs[0] + "/", null);
    console.log("psarc found: " + results.length);
    this.psarcRead(results);
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
          results.push(readPSARC(file, statres, (500 + (i * 100))));
        }
      }
    }
    return results;
  }
  psarcRead = async (results) => {
    const count = results.length;
    let index = 1;
    await results.reduce((promiseChain, currentTask) => {
      return promiseChain.then((chainResults) => {
        currentTask.then((currentResult) => {
          //[...chainResults, currentResult]
          const currFiles = this.state.files;
          currFiles.push(currentResult);
          this.setState({ files: currFiles });
          this.props.updateHeader(`Processed PSARC:  ${currentResult.name} (${index}/${count})`);
          if (index >= count) {
            this.props.resetHeader();
          }
          index += 1
        })
      });
    }, Promise.resolve([])).then((arrayOfResults) => {
      // Do something with all results
      this.props.resetHeader();
    });
  }
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
              classes="psarcTable"
              hover
              bordered={false}
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
