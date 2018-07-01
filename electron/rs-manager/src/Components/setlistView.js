import React from 'react'
import PropTypes from 'prop-types';
import { getSongsFromPlaylistDB, removeSongFromSetlist } from '../sqliteService';
import { RemoteAll } from './songlistView';
import SongDetailView from './songdetailView';


function unescapeFormatter(cell, row) {
  return <span>{unescape(cell)}</span>;
}
function difficultyFormatter(cell, row) {
  return <span />;
}
function round100Formatter(cell, row) {
  if (cell == null) { cell = 0; }
  cell = (cell * 100).toFixed(2);
  if (cell >= 100) { cell = 100; }
  const width = cell + "%";
  return (<span>
    <span className="mastery">{cell}%</span>
    <span>
      <svg height="100%">
        <rect width={width} height="100%" style={{ fill: "lightgreen", strokeWidth: 2, stroke: 'rgb(0, 0, 0)' }} />
        <text x="40%" y="18" fontSize="15px">{cell} %</text>
      </svg>
    </span>
  </span>);
}
function countFormmatter(cell, row) {
  if (cell == null) {
    return <span>0</span>;
  }
  return <span>{cell}</span>;
}
export default class SetlistView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = this.props.requiredTab
    this.state = {
      songs: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 25,
      showDetail: false,
      showSong: '',
      showArtist: '',
    };
    this.search = "";
    this.columns = [
      {
        dataField: "id",
        text: "ID",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '25%',
            cursor: 'pointer',
          };
        },
        hidden: true,
      },
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
        formatter: unescapeFormatter,
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
        formatter: unescapeFormatter,
      },
      {
        dataField: "album",
        text: "Album",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '25%',
            cursor: 'pointer',
          };
        },
        sort: true,
        formatter: unescapeFormatter,
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
        dataField: "mastery",
        text: "Mastery",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '25%',
            cursor: 'pointer',
          };
        },
        sort: true,
        formatter: round100Formatter,
      },
      {
        dataField: "count",
        text: "Count",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '10%',
          };
        },
        sort: true,
        formatter: countFormmatter,
      },
      {
        classes: (cell, row, rowIndex, colIndex) => {
          const def = "iconPreview difficulty ";
          let diff = "diff_0";
          if (cell <= 20) {
            diff = "diff_0"
          }
          else if (cell >= 21 && cell <= 40) {
            diff = "diff_1"
          }
          else if (cell >= 41 && cell <= 60) {
            diff = "diff_2"
          }
          else if (cell >= 61 && cell <= 80) {
            diff = "diff_3"
          }
          else if (cell >= 81) {
            diff = "diff_4"
          }
          return def + diff;
        },
        dataField: "difficulty",
        text: "Difficulty",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '10%',
          };
        },
        sort: true,
        formatter: difficultyFormatter,
      },
    ];
    this.rowEvents = {
      onClick: (e, row, rowIndex) => {
        this.setState({
          showDetail: true,
          showSong: row.song,
          showArtist: row.artist,
          showAlbum: row.album,
        })
      },
    };
    this.lastChildID = ""
  }

  shouldComponentUpdate = async (nextprops, nextstate) => {
    if (nextprops.currentChildTab === null) { return false; }
    if (this.lastChildID === nextprops.currentChildTab.id) { return false; }
    if (nextprops.currentChildTab.id.indexOf("setlist_") === -1) { return false; }
    this.lastChildID = nextprops.currentChildTab.id;
    await this.handleTableChange("cdm", {
      page: this.state.page,
      sizePerPage: this.state.sizePerPage,
      filters: {},
    })
    return true;
  }
  handleSearchChange = (e) => {
    this.handleTableChange('filter', {
      page: 1,
      sizePerPage: this.state.sizePerPage,
      filters: { search: e.target.value },
      sortField: null,
      sortOrder: null,
    })
  }
  handleTableChange = async (type, {
    page,
    sizePerPage,
    sortField, //newest sort field
    sortOrder, // newest sort order
    filters, // an object which have current filter status per column
    data,
  }) => {
    if (this.lastChildID === null) { return; }
    const zeroIndexPage = page - 1
    const start = zeroIndexPage * sizePerPage;
    const output = await getSongsFromPlaylistDB(
      this.lastChildID,
      start,
      sizePerPage,
      sortField === null ? "song" : sortField,
      sortOrder === null ? "asc" : sortOrder,
      this.search.value,
    )
    if (output.length > 0) {
      this.props.updateHeader(
        this.tabname,
        this.lastChildID,
        `Songs: ${output[0].songcount}, Arrangements: ${output[0].acount}`,
      );
      this.setState({ songs: output, page, totalSize: output[0].acount });
    }
    else {
      this.props.updateHeader(
        this.tabname,
        this.lastChildID,
        `Songs: 0, Arrangements: 0`,
      );
      this.setState({ songs: output, page, totalSize: 0 });
    }
  }

  removeFromSetlist = async () => {
    console.log("removing ", this.state.showSong, this.state.showArtist, this.state.showAlbum);
    await removeSongFromSetlist(
      this.lastChildID,
      this.state.showSong,
      this.state.showArtist,
      this.state.showAlbum,
    );
    this.handleTableChange('filter', {
      page: 1,
      sizePerPage: this.state.sizePerPage,
      filters: { search: this.search },
      sortField: null,
      sortOrder: null,
    })
  }

  render = () => {
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname) {
      const { songs, sizePerPage, page } = this.state;
      return (
        <div>
          <div style={{
            width: 100 + '%',
            margin: "auto",
            textAlign: "center",
            height: 70 + 'px',
          }}>
            <input
              ref={(node) => { this.search = node }}
              style={{ width: 50 + '%', border: "1px solid black", padding: 5 + "px" }}
              name="search"
              onChange={this.handleSearchChange}
              placeholder="Search..."
              type="search"
            />
            <br />
          </div>
          <div>
            <RemoteAll
              keyField="id"
              data={songs}
              page={page}
              sizePerPage={sizePerPage}
              totalSize={this.state.totalSize}
              onTableChange={this.handleTableChange}
              columns={this.columns}
              rowEvents={this.rowEvents}
            />
          </div>
          <div>
            <SongDetailView
              song={this.state.showSong}
              artist={this.state.showArtist}
              album={this.state.showAlbum}
              showDetail={this.state.showDetail}
              close={() => this.setState({ showDetail: false })}
              isSetlist
              removeFromSetlist={this.removeFromSetlist}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}
SetlistView.propTypes = {
  currentTab: PropTypes.object,
  // eslint-disable-next-line
  currentChildTab: PropTypes.object,
  requiredTab: PropTypes.string,
  // eslint-disable-next-line
  updateHeader: PropTypes.func,
  // eslint-disable-next-line
  resetHeader: PropTypes.func,
}
SetlistView.defaultProps = {
  currentTab: null,
  currentChildTab: null,
  requiredTab: '',
  updateHeader: () => { },
  resetHeader: () => { },
}
