import React from 'react';

export default class Sidebar extends React.Component {
    constructor(props) {
        super(props);
        this.activeClass = "active activeList";
        this.collapseClass = "collapse list-unstyled ";
        this.expandedClass = "list-unstyled";
        this.state = {
            currentTab: "tab-psarc",
            expandedTabs: [],
            activeChildTab: ""
        };
        this.props.handleChange(TabsData[3]);
    }
    toggleActive(val) {
        var index = this.state.expandedTabs.indexOf(val.id);
        var tabs = this.state.expandedTabs;
        if (index !== -1) {
            tabs.splice(index, 1);
        }
        else {
            tabs.push(val.id);
        }
        this.setState({ currentTab: val.id, expandedTabs: tabs });
        if (val.child.length === 0) {
            this.props.handleChange(val, null);
        }
    }
    setChildActive(val, cid) {
        this.setState({ currentTab: val.id, activeChildTab: cid.id });
        this.props.handleChange(val, cid);
    }
    render() {
        var tabsList = {};
        tabsList = TabsData.map((tab, index) => {
            var ulclassList = "";
            if (this.state.currentTab === tab.id) {
                ulclassList += this.activeClass;
                if (tab.child.length === 0) {
                    ulclassList += " activeChildTab";
                }

            }
            else {
                ulclassList += "inactiveList";
                if (tab.child.length === 0) {
                    ulclassList += " inactiveChildTab";
                }
            }

            return (
                <li key={"key-" + index} className={ulclassList}>
                    <a onClick={() => this.toggleActive(tab)} className={tab.child.length > 0 ? "dropdown-toggle" : ""} data-toggle={tab.child.length > 0 ? "collapse" : ""}>{tab.name}</a>
                    <ul className={this.state.expandedTabs.indexOf(tab.id) !== -1 ? this.expandedClass : this.collapseClass}>
                        {
                            tab.child.map((childtab, index2) => {
                                return (
                                    <li key={"child-key-" + index2}>
                                        <a className={this.state.currentTab === tab.id && this.state.activeChildTab === childtab.id ? "activeChildTab" : "inactiveChildTab"} onClick={() => this.setChildActive(tab, childtab)}>{childtab.name}</a>
                                    </li>
                                );
                            })
                        }
                    </ul>
                </li>
            );
        });
        return (
            <nav id="sidebar" className={this.props.showSidebar ? "" : "active"}>
                <div className="sidebar-header">
                    <h3>Rocksmith 2014</h3>
                </div>

                <ul className="list-unstyled components" style={{ padding: 0 + "px" }}>
                    <div style={{ "borderBottom": "1px solid #47748b" }}>
                        <p style={{ margin: 0 + "em" }}>
                            Profile: {this.props.currentProfile}<br />
                            Steam: {this.props.steamConnected ? "Connected" : "Disconnected"} <br />
                            YouTube: {this.props.ytConnected ? "Connected" : "Disconnected"}
                        </p>
                    </div>
                    {tabsList}
                </ul>

                <ul className="list-unstyled CTAs">
                    <li>
                        <a href="https://github.com" className="download">Download source</a>
                    </li>
                </ul>
            </nav>
        );
    }
}

var TabsData = [
    {
        "id": "tab-dashboard",
        "name": "Dashboard",
        "child": []
    },
    {
        "id": "tab-songs",
        "name": "Songs",
        "child": [
            {
                "name": "Owned",
                "id": "songs-owned"
            },
            {
                "name": "Available",
                "id": "songs-purchased"
            }
        ]
    },
    {
        "id": "tab-setlist",
        "name": "Setlist",
        "child": [
            {
                "name": "Practice List",
                "id": "setlist-practice"
            },
            {
                "name": "Gigs to play",
                "id": "setlist-gigs"
            }
        ]
    },
    {
        "id": "tab-psarc",
        "name": ".psarc Explorer",
        "child": []
    }
]