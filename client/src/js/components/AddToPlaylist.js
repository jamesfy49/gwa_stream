import React, { Component } from 'react';
import '../../css/addtoplaylist.css';

import check from '../../images/check.png';
import down from '../../images/down-white.png';

import storageAvailable from '../checkStorage.js';

import { connect } from 'react-redux';
import { playlistActions, viewActions } from '../actions/actions';

const mapStateToPropsCheck = (state, props) => ({
    playlists: state.playlists
});

const mapDispatchToPropsCheck = {
    addToPlaylist: playlistActions.addToPlaylist,
    removeFromPlaylist: playlistActions.removeFromPlaylist
}

class PlaylistCheckBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checked: false
        }
    }

    updateCheck() {
        const audios = this.props.playlists.items[this.props.playlistName];
        for(let i = 0; i < audios.length; i++) {
            const audio = audios[i];
            if(audio.id === this.props.playlists.itemStore.id) {
                let checked = false;
                if(audio.audios.length > 1) {
                    if(audio.activeAudio === this.props.activeAudio) {
                        checked = true;
                    }
                } else {
                    checked = true;
                }
                this.setState({checked: checked});
                if(checked) {
                    break;
                }
            }
        }
    }

    componentDidMount() {
        this.updateCheck();
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.activeAudio === this.props.activeAudio) return;
        this.updateCheck();
    }

    toggleItem() {
        let newPlaylists = {...this.props.playlists.items};
        if(this.state.checked) {
            const playlist = this.props.playlists.items[this.props.playlistName];
            for(let i = 0; i < playlist.length; i++) {
                let removed = false;
                if(playlist[i].id === this.props.playlists.itemStore.id) {
                    if(this.props.playlists.itemStore.audios.length > 1) {
                        if(playlist[i].activeAudio === this.props.activeAudio) {
                            this.props.removeFromPlaylist(this.props.playlistName, i);
                            removed = true;
                        }
                    } else {
                        this.props.removeFromPlaylist(this.props.playlistName, i);
                        removed  = true;
                    }
                }
                if(removed) {
                    newPlaylists[this.props.playlistName] = [
                        ...newPlaylists[this.props.playlistName].slice(0, i),
                        ...newPlaylists[this.props.playlistName].slice(i + 1)
                    ];
                    break;
                }
            }
        } else {
            const item = {...this.props.playlists.itemStore};
            if(item.audios.length > 1) {
                item.activeAudio = this.props.activeAudio;
            }
            const a = new Array(item);
            this.props.addToPlaylist(this.props.playlistName, a);
            newPlaylists[this.props.playlistName] = [
                ...newPlaylists[this.props.playlistName],
                item
            ];
        }
        this.setState({
            checked: !this.state.checked
        });
        if(storageAvailable('localStorage')) {
            localStorage['playlists'] = JSON.stringify(newPlaylists);
        }
    }

    render() {
        return(
            <div className="playlist-add-item">
                <div className="playlist-add-check-outer">
                    <div 
                        className={
                            this.state.checked ? 
                                "playlist-add-check playlist-add-check-active"
                                :
                                "playlist-add-check"}
                        
                        onClick={() => this.toggleItem()}>
                        <img src={check} alt="checked" />
                    </div>
                </div>
                <div className="playlist-add-label">
                    {this.props.playlistName}
                </div>
            </div>
        )
    }
}

class AudioSelect extends Component {

    render(){
        return(
            <div className="audio-select">
                {
                    this.props.audios.map((item, index) => 
                        <div 
                            className="audio-select-item"
                            key={index}>
                            <div className="audio-radio-outer">
                                <div 
                                    className=
                                    {
                                        this.props.activeAudio === index ?
                                        "audio-radio audio-radio-active"
                                        : "audio-radio"
                                    }
                                    onClick={() => this.props.onSelectAudio(index)}
                                    >
                                </div>
                            </div>
                            <div className="audio-select-label">
                                <div className="audio-select-label-inner">
                                { item }
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}

const PlaylistCheck = connect(
    mapStateToPropsCheck,
    mapDispatchToPropsCheck
)(PlaylistCheckBind);


const mapStateToProps = (state, props) => ({
    view: state.view,
    playlists: state.playlists
});

const mapDispatchToProps = {
    hidePlaylistAdd: viewActions.hidePlaylistAdd,
}

class AddToPlaylistBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            activeAudio: 0,
            showScroll: false
        };
        this.scrollable = React.createRef();
        this.handleSelectAudio = this.handleSelectAudio.bind(this);
    }

    componentDidMount() {
        if(this.props.playlists.itemStore.activeAudio !== undefined) {
            this.setState({
                activeAudio: this.props.playlists.itemStore.activeAudio
            });
        }
        const showScroll = 
            this.scrollable.current.scrollHeight 
                > this.scrollable.current.clientHeight;
        this.setState({
            showScroll
        });
    }

    handleSelectAudio(audio) {
        this.setState({
            activeAudio: audio
        });
    }

    handleScroll = (e) => {
        const bottom = 
            e.target.scrollHeight - e.target.scrollTop 
            === e.target.clientHeight;
        this.setState({
            showScroll: !bottom
        });
    }

    noPlaylists() {
        if(Object.keys(this.props.playlists.items).length === 0) {
            return(
                <div className="playlist-add-none">
                    No Playlists!
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        return(
            <div 
                className="playlist-add"
                onClick={this.props.hidePlaylistAdd}>
                <div className="playlist-add-modal"
                    onClick={(e) => e.stopPropagation()}>
                    <div 
                        className="playlist-add-modal-inner"
                        onScroll={this.handleScroll}
                        ref={this.scrollable}>

                        <div className="playlist-add-header">
                            Add to playlist
                        </div>

                        {
                            this.props.playlists.itemStore.audios.length > 1 ?
                            <AudioSelect 
                                audios={this.props.playlists.itemStore.audios}
                                activeAudio={this.state.activeAudio}
                                onSelectAudio={this.handleSelectAudio}
                                /> : null
                        }
                        
                        {
                            Object.keys(this.props.playlists.items).map((item, index) => (
                                <PlaylistCheck 
                                    activeAudio={this.state.activeAudio}
                                    playlistName={item}
                                    key={index}/>
                            ))
                        }

                        {
                            this.noPlaylists()
                        }

                    </div>
                    {
                        this.state.showScroll ?
                        <div className="scroll-indicator">
                            <img src={down} alt="down" />
                        </div> : null
                    }
                </div>
            </div>
        )
    }

}

const AddToPlaylist = connect(
    mapStateToProps,
    mapDispatchToProps
)(AddToPlaylistBind);

export default AddToPlaylist;