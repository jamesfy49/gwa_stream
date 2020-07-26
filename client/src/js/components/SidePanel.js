import React, { Component } from 'react';
import '../../css/sidebar.css';
import Settings from './Settings.js';
import Info from './Info.js';

import audio from '../../images/audio-white.png';
import search from '../../images/search-white.png';
import list from '../../images/list-white.png';
import gear from '../../images/gear-white.png';

import { connect } from 'react-redux';
import { 
  viewActions
} from '../actions/actions.js';
 
const mapStateToProps = (state, props) => ({
    view: state.view
});

const mapDispatchToProps = {
    hideBrowse: viewActions.hideBrowse,
    showBrowse: viewActions.showBrowse
}
class SidePanelBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            settingsPanelVisible: false,
            infoPanelVisible: false
        };
    }

    togglePanelView() {
        this.setState({
            settingsPanelVisible: !this.state.settingsPanelVisible
        });
    }

    toggleInfoView() {
        this.setState({
            infoPanelVisible: !this.state.infoPanelVisible
        });
    }

    render() {

        return (
            <div className="side-panel">
                <div className="side-panel-inner">
                    <div 
                        className="title-ico"
                        onClick={() => this.toggleInfoView()}>
                        <img src={audio} alt="gwa_stream" />
                    </div>
                    <div className="panel-tabs-container">
                        <div className=
                            {this.props.view.browseVisible ? 
                                "panel-tab panel-tab-active" : "panel-tab"
                            }
                            onClick={() => this.props.showBrowse()}>
                            <img src={search} alt="browse" />
                        </div>
                        <div className=
                            {this.props.view.browseVisible ? 
                                "panel-tab" : "panel-tab panel-tab-active"
                            }
                            onClick={() => this.props.hideBrowse()}>
                            <img src={list} alt="playlists" />
                        </div>
                    </div>
                    <div className="settings-button">
                        <img src={gear} alt="settings" 
                            onClick={() => this.togglePanelView()}/>
                    </div>
                    {
                        this.state.settingsPanelVisible ?
                        <Settings /> : null
                    }
                    {
                        this.state.infoPanelVisible ?
                        <Info /> : null
                    }
                </div>
            </div>
        )
    }
}


const SidePanel = connect(
    mapStateToProps,
    mapDispatchToProps
)(SidePanelBind);

export default SidePanel;