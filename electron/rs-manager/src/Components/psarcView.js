import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';

import PropTypes from 'prop-types';
import readPSARC, { psarcToJSON, extractFile } from '../fileservice';


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
        cursor: 'pointer',
      };
    },
    sort: true,
    filter: textFilter({
      style: {
        marginTop: '10px',
        marginLeft: '20px',
        display: 'none',
      },
    }),
  },
  {
    dataField: "artist",
    text: "Artist",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '25%',
        cursor: 'pointer',
      };
    },
    sort: true,
    filter: textFilter({
      style: {
        marginTop: '10px',
        marginLeft: '20px',
        display: 'none',
      },
    }),
  },
  {
    dataField: "arrangement",
    text: "Arrangement",
    style: (cell, row, rowIndex, colIndex) => {
      return {
        width: '15%',
        cursor: 'pointer',
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
        cursor: 'pointer',
      };
    },
    sort: true,
    filter: textFilter({
      style: {
        marginTop: '10px',
        marginLeft: '20px',
        display: 'none',
      },
    }),
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
      showpsarcDetail: false,
      selectedpsarcData: null,
      selectedFileName: "",
      showSearch: false,
    };
    this.rowEvents = {
      onClick: (e, row, rowIndex) => {
        this.handleShow(row);
      },
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
      this.props.updateHeader(this.tabname, `Processesing PSARC:  ${currentResults[0].name} (${index}/${count})`);
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
  extract = async (file, psarc) => {
    const res = await extractFile(psarc, file)
    console.log(res)
    window.shell.showItemInFolder(res.filename)
  }
  handleShow = async (row) => {
    const psarcdata = await psarcToJSON(row.filename);
    this.setState({
      selectedFileName: row.filename,
      selectedpsarcData: psarcdata,
      showpsarcDetail: true,
    });
  }
  handleHide = () => {
    this.setState({ showpsarcDetail: false });
  }
  toggleSearch = () => {
    columns.forEach((item) => {
      console.log(item);
      //item.filter.props.style.display = !this.state.showSearch ? "" : "none";
      //this.setState({ showSearch: !this.state.showSearch });
      /*
      filter: textFilter({
      style: {
        marginTop: '10px',
        marginLeft: '20px',
        display: 'none',
      },
    }),
      */
    })
  }

  render = () => {
    const stopprocessingstyle = this.state.processing ? "" : "none";
    const choosepsarchstyle = "extraPadding download " + (this.state.processing ? "isDisabled" : "");
    const psarcdetailsstyle = "modal-window " + (this.state.showpsarcDetail ? "" : "hidden");
    const options = {
      sizePerPage: 25,
      pageStartIndex: 1,
      sizePerPageList: [],
    }
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
              style={{ width: 100 + 'px' }}
              onClick={this.toggleSearch}
              className="extraPadding download">
              Search
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
              rowEvents={this.rowEvents}
              pagination={paginationFactory(options)}
              filter={filterFactory()}
            />
          </div>
          <div id="open-modal" className={psarcdetailsstyle} style={{ opacity: 1, pointerEvents: "auto" }}>
            <div id="modal-info" className="width-75">
              <a title="Close" className="modal-close" onClick={this.handleHide}>Close</a>
              <br />
              {(() => {
                if (this.state.selectedpsarcData != null) {
                  const filecolumns = [
                    {
                      dataField: "file",
                      text: "File",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '80%',
                          cursor: 'pointer',
                        };
                      },
                      sort: true,
                    },
                  ]
                  const arrcolumns = [
                    {
                      dataField: "song",
                      text: "Song",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "artist",
                      text: "Artist",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "album",
                      text: "Album",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "arrangement",
                      text: "Arrangement",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "dlc",
                      text: "DLC",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "sku",
                      text: "SKU",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                    {
                      dataField: "difficulty",
                      text: "Difficulty",
                      style: (cell, row, rowIndex, colIndex) => {
                        return {
                          width: '15%',
                        };
                      },
                    },
                  ]
                  const tableData = [];
                  const extractRowEvents = {
                    onClick: (e, row, rowIndex) => {
                      this.extract(row.file, this.state.selectedFileName)
                    },
                  };
                  for (let i = 0; i < this.state.selectedpsarcData.files.length; i += 1) {
                    const cell = {
                      file: this.state.selectedpsarcData.files[i],
                    }
                    tableData.push(cell);
                  }
                  return (
                    <div >
                      <h1> PSARC: {this.state.selectedpsarcData.key + ".psarc"} </h1>
                      <h1> Files: {this.state.selectedpsarcData.files.length}</h1>
                      <div className="psarcFiles">
                        <BootstrapTable
                          keyField="file"
                          data={tableData}
                          columns={filecolumns}
                          classes="psarcTable"
                          hover
                          bordered={false}
                          noDataIndication="No Data"
                          rowEvents={extractRowEvents}
                        />
                      </div>
                      <br />
                      <h1> Arrangements: {this.state.selectedpsarcData.arrangements.length}</h1>
                      <div className="psarcFiles">
                        <BootstrapTable
                          keyField="difficulty"
                          data={this.state.selectedpsarcData.arrangements}
                          columns={arrcolumns}
                          classes="psarcTable"
                          hover
                          bordered={false}
                          noDataIndication="No Data"
                        />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            </div>
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
