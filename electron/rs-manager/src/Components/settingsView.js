import React from 'react'
import PropTypes from 'prop-types';
import path from 'path'
import getProfileConfig, { updateSteamLoginSecureCookie, getSteamLoginSecureCookie } from '../configService';

export default class SettingsView extends React.Component {
  constructor(props) {
    super(props);
    this.tabname = "tab-settings"
    this.state = {
      prfldb: '',
      steamLoginSecure: '',
    };
    this.readConfigs();
  }
  readConfigs = async () => {
    const d = await getProfileConfig();
    const e = await getSteamLoginSecureCookie();
    this.setState({ prfldb: d, steamLoginSecure: e });
  }
  saveSettings = async () => {
    if (this.state.steamLoginSecure !== "" && this.state.steamLoginSecure != null) {
      await updateSteamLoginSecureCookie(this.state.steamLoginSecure);
    }
    this.props.handleChange();
    this.props.updateHeader(this.tabname, "Settings Saved!");
  }
  enterCookie = async () => {
    //eslint-disable-next-line
    //const d = prompt("Please enter value of steamLoginSecure cookie");
    //eslint-disable-next-line
    const d = await window.prompt({
      title: 'Please enter value of steamLoginSecure cookie',
      label: 'steamLoginSecure:',
      value: '',
      inputAttrs: {
        type: 'text',
      },
      type: 'input',
    })
    console.log(d);
    if (d !== "" && d != null) {
      this.setState({ steamLoginSecure: d });

      this.props.handleChange();
    }
  }
  render = () => {
    if (this.props.currentTab === null) {
      return null;
    } else if (this.props.currentTab.id === this.tabname) {
      return (
        <div className="container-fluid">
          <div className="row justify-content-lg-center">
            <div className="col col-lg-7 settings">
              <div style={{ marginTop: -6 + 'px', paddingLeft: 30 + 'px', paddingRight: 30 + 'px' }}>
                <br /><br />
                <span style={{ float: 'left' }}>
                  Rocksmith Profile (_prfldb):
                </span>
                <span style={{ float: 'right' }}>
                  <i>{path.basename(this.state.prfldb).toLowerCase()}</i>
                </span>
                <br />
                <div className="ta-center">
                  <span style={{ color: '#ccc' }}>
                    Choose the rocksmith profile to read the stats from.
                The profile is only read and never written to.
                  </span>
                </div>
                <br />
                <span style={{ float: 'left' }}>
                  Steam Login Cookie (steamLoginSecure):
                </span>
                <span style={{
                  float: 'right',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: 400 + 'px',
                  textAlign: 'right',
                }}>
                  {
                    this.state.steamLoginSecure === '' ?
                      <a onClick={this.enterCookie}>Click to Change </a>
                      :
                      <i>{(this.state.steamLoginSecure).toLowerCase()}</i>
                  }
                </span>
                <br />
                <div className="ta-center">
                  <span style={{ color: '#ccc' }}>
                    Steam Login Cookie is used to update owned status in Songs Available view.
                    The login cookie is valid as long the browser session is valid.
                  </span>
                </div>
                <br />
              </div>
            </div>
          </div>
          <div className="centerButton list-unstyled">
            <a
              onClick={this.saveSettings}
              className="extraPadding download">
              Save Settings
            </a>
          </div>
        </div >
      )
    }
    return null;
  }
}

SettingsView.propTypes = {
  currentTab: PropTypes.object,
  handleChange: PropTypes.func,
  // eslint-disable-next-line
  updateHeader: PropTypes.func,
  // eslint-disable-next-line
  resetHeader: PropTypes.func,
}
SettingsView.defaultProps = {
  currentTab: null,
  handleChange: () => { },
  updateHeader: () => { },
  resetHeader: () => { },
}
