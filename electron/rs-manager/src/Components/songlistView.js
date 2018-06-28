import React from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory from 'react-bootstrap-table2-filter';
import PropTypes from 'prop-types';
import { getSongsOwned, countSongsOwned } from '../sqliteService';

function unescapeFormatter(cell, row) {
  return <span>{unescape(cell)}</span>;
}
function roundFormatter(cell, row) {
  return <span>{Math.round(cell)}</span>;
}
//eslint-disable-next-line
const RemoteAll = ({ columns, data, page, sizePerPage, onTableChange, totalSize, rowEvents }) => (
  <div>
    <BootstrapTable
      remote={{ pagination: true }}
      keyField="id"
      data={data}
      columns={columns}
      filter={filterFactory()}
      pagination={paginationFactory({
        page,
        sizePerPage,
        totalSize,
        paginationSize: 10,
        sizePerPageList: [],
      })}
      onTableChange={onTableChange}
      classes="psarcTable"
      hover
      bordered={false}
      rowEvents={rowEvents}
      noDataIndication="No Songs"
    />
  </div>
);

RemoteAll.propTypes = {
  data: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  totalSize: PropTypes.number.isRequired,
  sizePerPage: PropTypes.number.isRequired,
  onTableChange: PropTypes.func.isRequired,
};
export default class SonglistView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = this.props.requiredTab
    this.childtabname = this.props.requiredChildTab
    this.state = {
      songs: [],
      page: 1,
      totalSize: 0,
      sizePerPage: 25,
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
        formatter: roundFormatter,
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
      },
      {
        dataField: "difficulty",
        text: "Difficulty",
        style: (cell, row, rowIndex, colIndex) => {
          return {
            width: '10%',
          };
        },
        sort: true,
        formatter: roundFormatter,
      },
    ];
    this.rowEvents = {
      onClick: (e, row, rowIndex) => {
        //this.handleShow(row);
      },
    };
  }
  componentDidMount = async () => {
    const so = await countSongsOwned();
    this.props.updateHeader(
      this.tabname,
      this.childtabname,
      `Songs: ${so.songcount}, Arrangements: ${so.count}`,
    );
    this.setState({ totalSize: so.count });
    this.handleTableChange("cdm", {
      page: this.state.page,
      sizePerPage: this.state.sizePerPage,
      filters: {},
      sortField: null,
      sortOrder: null,
    })
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
    const zeroIndexPage = page - 1
    const start = zeroIndexPage * sizePerPage;
    const output = await getSongsOwned(
      start,
      sizePerPage,
      sortField === null ? "song" : sortField,
      sortOrder === null ? "asc" : sortOrder,
      this.search.value,
    )
    if (output.length > 0) {
      this.props.updateHeader(
        this.tabname,
        this.childtabname,
        `Songs: ${output[0].songcount}, Arrangements: ${output[0].acount}`,
      );
      this.setState({ songs: output, page, totalSize: output[0].acount });
    }
    else {
      this.props.updateHeader(
        this.tabname,
        this.childtabname,
        `Songs: 0, Arrangements: 0`,
      );
      this.setState({ songs: output, page, totalSize: 0 });
    }
  }
  render = () => {
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname &&
      this.props.currentChildTab.id === this.childtabname) {
      const { songs, sizePerPage, page } = this.state;
      return (
        <div>
          <div style={{ width: 100 + '%', margin: "auto", textAlign: "center" }}>
            <input
              ref={(node) => { this.search = node }}
              style={{ width: 50 + '%', border: "1px solid black", padding: 5 + "px" }}
              name="search"
              onChange={this.handleSearchChange}
              placeholder="Search..."
              type="search"
            />
          </div>
          <br />
          <div>
            <RemoteAll
              data={songs}
              page={page}
              sizePerPage={sizePerPage}
              totalSize={this.state.totalSize}
              onTableChange={this.handleTableChange}
              columns={this.columns}
              rowEvents={this.rowEvents}
            />
          </div>
        </div>
      );
    }
    return null;
  }
}
SonglistView.propTypes = {
  currentTab: PropTypes.object,
  currentChildTab: PropTypes.object,
  requiredTab: PropTypes.string,
  requiredChildTab: PropTypes.string,
  // eslint-disable-next-line
  sqliteTable: PropTypes.string,
  // eslint-disable-next-line
  updateHeader: PropTypes.func,
  // eslint-disable-next-line
  resetHeader: PropTypes.func,
}
SonglistView.defaultProps = {
  currentTab: null,
  currentChildTab: null,
  requiredTab: '',
  requiredChildTab: '',
  sqliteTable: '',
  updateHeader: () => { },
  resetHeader: () => { },
}
