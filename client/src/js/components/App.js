import React, { Component } from 'react';
import SidePanel from './SidePanel.js';
import NowPlaying from './NowPlaying.js';
import Browse from './Browse.js';
import Playlists from './Playlists.js';
import AddToPlaylist from './AddToPlaylist.js';
import AudioPlayer from './AudioPlayer.js';

import storageAvailable from '../checkStorage.js';

import { connect } from 'react-redux';
import { 
    playlistActions,
    settingsActions } from '../actions/actions.js';

const mapStateToProps = (state, props) => ({
    view: state.view,
    settings: state.settings
});

const mapDispatchToProps = {
    toggleDarkmode: settingsActions.toggleDarkmode,
    changeVolume: settingsActions.changeVolume,
    setPlaylists: playlistActions.setPlaylists
}

class AppBind extends Component {

    componentDidMount() {
        if(storageAvailable('localStorage')) {
            const dark = JSON.parse(localStorage['darkMode']);
            if(dark) {
                this.props.toggleDarkmode(dark);
            }
            if(localStorage['volume'] !== undefined) {
                this.props.changeVolume(JSON.parse(localStorage['volume']));
            }
        }
    }

    render() {
        return(
            <div className={
                this.props.settings.darkMode ? 
                "dark" : null
            }>
                <AudioPlayer />
                <SidePanel />
                <NowPlaying />
                <Browse />
                <Playlists />
                {
                    this.props.view.playlistAddVisible ? 
                    <AddToPlaylist /> : null
                }
            </div>
        )
    }
}

const App = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppBind);

export default App;