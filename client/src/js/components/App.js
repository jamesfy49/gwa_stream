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
import Loading from './Loading.js';
import LoadingAudio from './LoadingAudio.js';

const mapStateToProps = (state, props) => ({
    view: state.view,
    settings: state.settings,
    nowPlaying: state.nowPlaying
});

const mapDispatchToProps = {
    toggleDarkmode: settingsActions.toggleDarkmode,
    changeVolume: settingsActions.changeVolume,
    setPlaylists: playlistActions.setPlaylists
}

class AppBind extends Component {

    componentDidMount() {
        if(storageAvailable('localStorage')) {
            let dark = localStorage["darkMode"];
            if(dark) {
                dark = JSON.parse(localStorage['darkMode']);
            }
            if(dark) {
                this.props.toggleDarkmode(dark);
            }
            if(localStorage['volume'] !== undefined) {
                let localVolume = JSON.parse(localStorage['volume']);
                if(localVolume > 1) {
                    localVolume = 1;
                }
                this.props.changeVolume(localVolume);
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
                {
                    this.props.nowPlaying.loadingAudio ?
                    <LoadingAudio /> : null
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