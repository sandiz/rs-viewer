import React from 'react'
import PropTypes from 'prop-types';
import StatsTableView from './statsTableView';

export default class DashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = 'tab-dashboard';
    this.state = {
      stats: {},
    }
  }
  render = () => {
    console.log(this.state.stats);
    console.log(this.props.handleChange);
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname) {
      return (
        <div className="container-fluid">
          <div className="centerButton list-unstyled">
            <a
              onClick={this.openDirDialog}
              className="extraPadding download">
              Refresh Stats from Profile
            </a>
          </div>
          <br />
          <div className="row justify-content-md-center">
            <div className="col col-lg-5 ta-center dashboard-top">
              <div>
                General
                <hr />
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Total Playing Time
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  2000 days
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Max Consecutive Days
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  279
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Longest Note Streak
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  970
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Highest Solo Accuracy
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  100
                </div>
              </div>
            </div>
            <div className="col col-lg-5 ta-center dashboard-top">
              <div>
                Songs
                <hr />
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Songs Owned
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  400
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Songs Playthroughs
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  2000
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Most Played Song
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  Mr. Brightside
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 50 + '%' }} className="ta-left">
                  Arrangements Mastered
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  500/1700
                </div>
              </div>
              <br />
            </div>
          </div>
          <br /> <br />
          <div className="row justify-content-md-center">
            <div className="col col-md-3 ta-center dashboard-middle">
              Lead <br />
              <StatsTableView />
            </div>
            <div className="col col-md-3 ta-center dashboard-middle">
              Rhythm <br />
              <StatsTableView />
            </div>
            <div className="col col-md-3 ta-center dashboard-middle">
              Bass <br />
              <StatsTableView />
            </div>
          </div>
        </div>);
    }
    return null;
  }
}
DashboardView.propTypes = {
  currentTab: PropTypes.object,
  // eslint-disable-next-line
  updateHeader: PropTypes.func,
  // eslint-disable-next-line
  resetHeader: PropTypes.func,
  handleChange: PropTypes.func,
}
DashboardView.defaultProps = {
  currentTab: null,
  updateHeader: () => { },
  resetHeader: () => { },
  handleChange: () => { },
}
