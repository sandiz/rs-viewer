import React, { Component } from "react";
import Sidebar from "./Components/Sidebar";
import PSARCView from "./Components/psarcView";
import "./App.css";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentTab: null,
            currentChildTab: null,
            showSidebar: true
        };
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(tab, child) {
        this.setState({ currentTab: tab, currentChildTab: child });
    }
    collapseSidebar(e) {
        this.setState({ showSidebar: !this.state.showSidebar });
    }
    render() {
        return (
            <div className="App">
                <div className="wrapper">
                    <Sidebar
                        handleChange={this.handleChange}
                        showSidebar={this.state.showSidebar}
                        currentProfile={"-"}
                        steamConnected={false}
                        ytConnected={false}
                    />
                    <div id="content">
                        <nav className="navbar navbar-expand-lg navbar-light bg-light">
                            <div className="container-fluid">
                                <button
                                    type="button"
                                    ref="sidebarCollapse"
                                    id="sidebarCollapse"
                                    className={
                                        this.state.showSidebar ? "navbar-btn" : "navbar-btn active"
                                    }
                                    onClick={e => this.collapseSidebar(e)}
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
                                >
                                    <ul className="nav navbar-nav ml-auto mr-auto topHeader">
                                        <li className="nav-item active">
                                            <h2>
                                                <a className="">
                                                    {this.state.currentTab == null
                                                        ? ""
                                                        : this.state.currentTab.name +
                                                        (this.state.currentChildTab == null
                                                            ? ""
                                                            : " > " + this.state.currentChildTab.name)}
                                                </a>
                                            </h2>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                        <div>
                            <PSARCView currentTab={this.state.currentTab} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
