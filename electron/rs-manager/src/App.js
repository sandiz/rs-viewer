import React, { Component } from 'react'
import path from 'path';
import Sidebar from './Components/Sidebar'
import PSARCView from './Components/psarcView'
import SonglistView from './Components/songlistView'
import getProfileConfig from './configService';
import './App.css'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: null,
      currentChildTab: null,
      showSidebar: true,
      appTitle: '',
      currentProfile: '',
    };
    //this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount = async () => {
    await this.updateProfile();
  }
  updateProfile = async () => {
    const prfldb = await getProfileConfig();
    this.setState({ currentProfile: prfldb });
  }
  handleChange = async (tab, child) => {
    const text = (tab == null) ? "" : tab.name +
      (child == null ? "" : ` >  ${child.name}`);

    this.setState({
      currentTab: tab,
      currentChildTab: child,
      appTitle: text,
    });
  }
  updateHeader = (tabname, text) => {
    if (this.state.currentTab === null) {
      return;
    }
    if (tabname === this.state.currentTab.id) {
      this.setState({ appTitle: text });
    }
  }
  updateChildHeader = (tabname, childname, text) => {
    if (tabname === null || this.state.currentChildTab === null) {
      console.log("");
    }
    else if (tabname === this.state.currentTab.id && childname === this.state.currentChildTab.id) {
      this.setState({ appTitle: text });
    }
  }
  resetHeader = (tabname) => {
    if (this.state.currentTab != null && tabname === this.state.currentTab.id) {
      this.handleChange(this.state.currentTab, this.state.currentChildTab);
    }
  }
  collapseSidebar = () => {
    this.setState({ showSidebar: !this.state.showSidebar });
  }
  render = () => {
    const len = this.state.currentProfile.length;
    let profile = len > 0 ?
      path.basename(this.state.currentProfile).slice(0, 6) + "..." + this.state.currentProfile.slice(len - 6, len) : "-";
    profile = profile.toLowerCase();
    return (
      <div className="App">
        <div className="wrapper">
          <Sidebar
            handleChange={this.handleChange}
            showSidebar={this.state.showSidebar}
            currentProfile={profile}
            steamConnected={false}
            ytConnected={false}
          />
          <div id="content">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
              <div className="container-fluid">
                <button
                  type="button"
                  id="sidebarCollapse"
                  className={
                    this.state.showSidebar ? "navbar-btn" : "navbar-btn active"
                  }
                  onClick={() => this.collapseSidebar()}
                >
                  <span />
                  <span />
                  <span />
                </button>
                <button
                  className="btn btn-dark d-inline-block d-lg-none ml-auto"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarSupportedContent"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <i className="fas fa-align-justify" />
                </button>

                <div
                  className="collapse navbar-collapse"
                  id="navbarSupportedContent"
                  style={{ width: 100 + '%', textAlign: 'center' }}
                >
                  <ul className="nav navbar-nav ml-auto mr-auto topHeader">
                    <li className="nav-item active overflowellipsis">
                      <h2>
                        <a href="#tab-name" className="">
                          {this.state.appTitle}
                        </a>
                      </h2>
                    </li>
                  </ul>
                </div>
              </div>
            </nav>
            <div>
              <PSARCView
                currentTab={this.state.currentTab}
                updateHeader={this.updateHeader}
                resetHeader={this.resetHeader} />
              <SonglistView
                currentTab={this.state.currentTab}
                currentChildTab={this.state.currentChildTab}
                requiredTab="tab-songs"
                requiredChildTab="songs-owned"
                sqliteTable="songs_owned"
                updateHeader={this.updateChildHeader}
                resetHeader={this.resetHeader}
                handleChange={this.updateProfile}
              />

            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
