import React from 'react'
import PropTypes from 'prop-types';
import StatsTableView from './statsTableView';
import getProfileConfig, { updateProfileConfig } from '../configService';
import readProfile from '../steamprofileService';
import { getSongID, countSongsOwned, getArrangmentsMastered, getLeadStats, getRhythmStats, getBassStats } from '../sqliteService';

const { remote } = window.require('electron')
export default class DashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = 'tab-dashboard';
    this.state = {
      totalPlayingTime: 0,
      maxConsecutiveDays: 0,
      longestStreak: 0,
      highestSolo: 0,
      songsOwned: 0,
      songPlays: 0,
      mostPlayed: '-',
      arrMaster: 0,
      l: 0,
      lh: 0,
      lm: 0,
      ll: 0,
      lup: 0,
      lhw: 0,
      lmw: 0,
      llw: 0,
      luw: 0,
      r: 0,
      rh: 0,
      rm: 0,
      rl: 0,
      rup: 0,
      rhw: 0,
      rmw: 0,
      rlw: 0,
      ruw: 0,
      b: 0,
      bh: 0,
      bm: 0,
      bl: 0,
      bup: 0,
      bhw: 0,
      bmw: 0,
      blw: 0,
      buw: 0,
    }
  }
  componentWillMount = () => {
    this.fetchStats();
  }
  getStatsWidth = (input, min, max) => {
    return ((input - min) * 100) / (max - min);
  }
  convertMS = (ms) => {
    //eslint-disable-next-line
    let d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s %= 60;
    h = Math.floor(m / 60);
    m %= 60;
    //eslint-disable-next-line
    d = Math.floor(h / 24);
    h %= 24;
    return {
      d, h, m, s,
    };
  };
  fetchStats = async (disbleDialog) => {
    const prfldb = await getProfileConfig();
    let prfldbs = []
    if (prfldb !== "") { //check for file sync also
      prfldbs.push(prfldb);
    }
    else {
      if (disbleDialog) {
        return;
      }
      prfldbs = remote.dialog.showOpenDialog({
        properties: ["openFile"],
      });
    }
    if (prfldbs.length > 0) {
      const steamProfile = await readProfile(prfldbs[0]);
      const stats = steamProfile.Stats;
      await updateProfileConfig(prfldbs[0]);
      this.props.handleChange();
      let mostPlayed = "";
      const keys = Object.keys(stats.Songs);
      let playedCount = -1;
      for (let i = 0; i < keys.length; i += 1) {
        const stat = stats.Songs[keys[i]];
        if (stat.PlayedCount > playedCount) {
          playedCount = stat.PlayedCount;
          mostPlayed = keys[i];
        }
      }
      if (mostPlayed !== "") {
        mostPlayed = unescape(await getSongID(mostPlayed));
      }
      let playingText = "";
      const dateObj = this.convertMS(stats.TimePlayed * 1000);
      if (dateObj.d >= 1) {
        playingText = `${dateObj.d} Days ${dateObj.h} Hours ${dateObj.m} Minutes`
      }
      else {
        playingText = `${dateObj.h} Hours ${dateObj.m} Minutes`
      }
      const songscount = await countSongsOwned();
      const arrmaster = await getArrangmentsMastered();
      this.setState({
        totalPlayingTime: playingText,
        maxConsecutiveDays: stats.MaxConsecutiveDays,
        longestStreak: stats.Streak,
        highestSolo: stats.HighestSoloAccuracy,
        songsOwned: songscount.songcount,
        songPlays: stats.SongsPlayedCount,
        arrMaster: arrmaster.count + "/" + songscount.count,
        mostPlayed,
      });
      const leadStats = await getLeadStats();
      const lup = leadStats.l - (leadStats.lh + leadStats.lm + leadStats.ll)
      const rhythmStats = await getRhythmStats();
      const rup = rhythmStats.r - (rhythmStats.rh + rhythmStats.rm + rhythmStats.rl)
      const bassStats = await getBassStats();
      const bup = bassStats.b - (bassStats.bh + bassStats.bm + bassStats.bl)
      this.setState({
        l: leadStats.l,
        lh: leadStats.lh,
        lm: leadStats.lm,
        ll: leadStats.ll,
        lup,
        lhw: this.getStatsWidth(leadStats.lh, 0, leadStats.l),
        lmw: this.getStatsWidth(leadStats.lm, 0, leadStats.l),
        llw: this.getStatsWidth(leadStats.ll, 0, leadStats.l),
        luw: this.getStatsWidth(lup, 0, leadStats.l),
        r: rhythmStats.r,
        rh: rhythmStats.rh,
        rm: rhythmStats.rm,
        rl: rhythmStats.rl,
        rup,
        rhw: this.getStatsWidth(rhythmStats.rh, 0, rhythmStats.r),
        rmw: this.getStatsWidth(rhythmStats.rm, 0, rhythmStats.r),
        rlw: this.getStatsWidth(rhythmStats.rl, 0, rhythmStats.r),
        ruw: this.getStatsWidth(rup, 0, rhythmStats.r),
        b: bassStats.b,
        bh: bassStats.bh,
        bm: bassStats.bm,
        bl: bassStats.bl,
        bup,
        bhw: this.getStatsWidth(bassStats.bh, 0, bassStats.b),
        bmw: this.getStatsWidth(bassStats.bm, 0, bassStats.b),
        blw: this.getStatsWidth(bassStats.bl, 0, bassStats.b),
        buw: this.getStatsWidth(bup, 0, bassStats.b),
      })
      this.props.updateHeader(this.tabname, "Rocksmith 2014 Dashboard");
    }
  }

  render = () => {
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname) {
      return (
        <div className="container-fluid">
          <div className="centerButton list-unstyled">
            <a
              onClick={this.fetchStats}
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
                <div style={{ width: 70 + '%' }} className="ta-right">
                  {this.state.totalPlayingTime}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Max Consecutive Days
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  {this.state.maxConsecutiveDays}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Longest Note Streak
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  {this.state.longestStreak}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Highest Solo Accuracy
                </div>
                <div style={{ width: 70 + '%' }} className="ta-right">
                  {this.state.highestSolo * 100}%
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
                  {this.state.songsOwned}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Songs Playthroughs
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  {this.state.songPlays}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 30 + '%' }} className="ta-left">
                  Most Played Song
                </div>
                <div style={{ width: 60 + '%' }} className="ta-right">
                  {this.state.mostPlayed}
                </div>
              </div>
              <div className="stat-container">
                <div style={{ width: 50 + '%' }} className="ta-left">
                  Arrangements Mastered
                </div>
                <div style={{ width: 30 + '%' }} className="ta-right">
                  {this.state.arrMaster}
                </div>
              </div>
              <br />
            </div>
          </div>
          <br /> <br />
          <div className="row justify-content-md-center">
            <div className="col col-md-3 ta-center dashboard-middle">
              Lead <br />
              <StatsTableView
                total={this.state.l}
                highscoretotal={this.state.lh}
                mediumscoretotal={this.state.lm}
                lowscoretotal={this.state.ll}
                unplayedtotal={this.state.lup}
                highscorewidth={this.state.lhw}
                mediumscorewidth={this.state.lmw}
                lowscorewidth={this.state.llw}
                unplayedwidth={this.state.luw}
              />
            </div>
            <div className="col col-md-3 ta-center dashboard-middle">
              Rhythm <br />
              <StatsTableView
                total={this.state.r}
                highscoretotal={this.state.rh}
                mediumscoretotal={this.state.rm}
                lowscoretotal={this.state.rl}
                unplayedtotal={this.state.rup}
                highscorewidth={this.state.rhw}
                mediumscorewidth={this.state.rmw}
                lowscorewidth={this.state.rlw}
                unplayedwidth={this.state.ruw}
              />
            </div>
            <div className="col col-md-3 ta-center dashboard-middle">
              Bass <br />
              <StatsTableView
                total={this.state.b}
                highscoretotal={this.state.bh}
                mediumscoretotal={this.state.bm}
                lowscoretotal={this.state.bl}
                unplayedtotal={this.state.bup}
                highscorewidth={this.state.bhw}
                mediumscorewidth={this.state.bmw}
                lowscorewidth={this.state.blw}
                unplayedwidth={this.state.buw}
              />
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
