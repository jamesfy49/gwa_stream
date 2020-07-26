import React, { Component } from 'react';
import '../../css/playlists.css';

import pluswhite from '../../images/plus-white.png';
import playWhite from '../../images/play-circle-white.png';
import menuWhite from '../../images/menu-white.png';
import playBlack from '../../images/play-black.png';
import menu from '../../images/menu.png';
import trash from '../../images/trash.png';

import storageAvailable from '../checkStorage.js';
import { shuffle } from '../tools.js';

import AudioItem from './AudioItem.js';
import { connect } from 'react-redux';
import { 
    playlistActions,
    queueActions,
    nowPlayingActions
} from '../actions/actions';

const mapStateToProps = (state, props) => ({
    settings: state.settings,
    view: state.view,
    playlists: state.playlists
});

const mapDispatchToProps = {
    setPlaylists: playlistActions.setPlaylists,
    addPlaylist: playlistActions.addPlaylist,
    renamePlaylist: playlistActions.renamePlaylist,
    removePlaylist: playlistActions.removePlaylist,

    setQueue: queueActions.setQueue,

    setPlaying: nowPlayingActions.setPlaying
}

class TitleItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newName: '',
            error: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    handleChange(e) {
        this.setState({
            newName: e.target.value
        });
    }
    handleKeyUp(e) {
        if(e.which === 13) {
            this.changeName();
        }
    }
    changeName() {
        if(this.state.newName === '') {
            this.setState({
                error: "Enter a valid name."
            });
            return;
        } else if(this.props.playlistNames.indexOf(this.state.newName) !== -1) {
            this.setState({
                error: "Playlist already exists."
            });
            return;
        } else {
            this.props.onChange(this.state.newName);
        }
    }
    render() {
        if(this.props.playlistNames.length === 0) {
            return "Nothing Selected";
        } else {
            if(this.props.showInput) {
                return(
                    <div className="rename-playlist">
                        <div className="rename-playlist-error">
                            { this.state.error }
                        </div>
                        <input 
                            type="text" 
                            placeholder="New Name"
                            onChange={this.handleChange}
                            onKeyUp={this.handleKeyUp} 
                            maxLength="50"/>
                    </div>
                );
            } else {
                return this.props.currentPlaylist
            }
        }
    }
}

class PlaylistOptions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showDeleteConfirm:false
        }
    }
    toggleDeleteConfirm() {
        this.setState({
            showDeleteConfirm: !this.state.showDeleteConfirm
        });
    }
    render() {
        return(
            <div 
                className={
                    this.state.showDeleteConfirm ? 
                    "playlist-options-dialogue playlist-options-dialogue-expanded"
                    :
                    "playlist-options-dialogue"}>
                <div className="playlist-options-dialogue-inner">
                    <div 
                        className="playlist-options-dialogue-item"
                        onClick={() => this.toggleDeleteConfirm()}>
                        Delete Playlist
                    </div>
                    <div 
                        className="playlist-options-dialogue-item"
                        onClick={() => this.props.onToggleRenameVisible()}>
                        Rename Playlist
                    </div>
                </div>
                {
                    this.state.showDeleteConfirm ?
                    <div 
                        className="delete-confirm"
                        onClick={() => this.props.onDelete()}>
                        <img src={trash} alt="Delete" />
                    </div> : null
                }
            </div>
        )
    }
}

class PlaylistsBind extends Component {
  
    constructor(props){
        super(props);
        this.state = {
            currentPlaylist: undefined,
            newPlaylistVisible: false,
            newName: '',
            addPlaylistError: '',
            optionsVisible: false,
            showRename: false
        }
        this.toggleNewPlaylist = this.toggleNewPlaylist.bind(this);
        this.updateName = this.updateName.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        if(storageAvailable('localStorage')) {
            const items = localStorage['playlists'];
            if(items !== undefined) {
                this.props.setPlaylists(JSON.parse(items));
            }
        }
    }

    componentDidUpdate(nextProps, prevProps) {
        if(this.state.currentPlaylist === undefined) {
            if(Object.keys(this.props.playlists.items).length > 0) {
                const first = Object.keys(this.props.playlists.items)[0];
                this.setState({
                    currentPlaylist: first
                });
            }
        }
    }

    setCurrent(name) {
        this.setState({
            currentPlaylist: name
        });
    }

    playlistLists() {
        if(Object.keys(this.props.playlists.items).length === 0) {
            return (
                <div className="playlist-item no-playlists">No Playlists!</div>
            );
        } else {
            return (
                Object.keys(this.props.playlists.items).map((item, index) => 
                    <div 
                        className={
                            item === this.state.currentPlaylist ?
                            "playlist-item playlist-item-active"
                            :
                            "playlist-item"
                        }
                        onClick={() => this.setCurrent(item)}
                        key={index}>
                        {item}
                    </div>
                )
            );
        }
    }

    playPlaylist() {
        if(this.state.currentPlaylist === undefined) return;
        let playlist = this.props.playlists.items[this.state.currentPlaylist];
        if(this.props.settings.shuffle) {
            playlist = shuffle(playlist);
        }
        this.props.setQueue(playlist);
        this.props.setPlaying(playlist[0], 0);
    }

    updateName(e) {
        this.setState({
            newName: e.target.value
        });
    }

    addPlaylist() {
        const playlistNames = Object.keys(this.props.playlists.items);
        if(this.state.newName === '') {
            this.setState({
                addPlaylistError: "Enter a valid name."
            });
            return;
        } else if(playlistNames.indexOf(this.state.newName) !== -1) {
            this.setState({
                addPlaylistError: "Playlist already exists."
            });
            return;
        } else {
            this.props.addPlaylist(this.state.newName);
            this.setState({
                addPlaylistError: '',
                newPlaylistVisible: false
            });
            if(playlistNames.length === 0) {
                this.setState({
                    currentPlaylist: this.state.newName
                });
            }
            if(storageAvailable('localStorage')) {
                const p = {...this.props.playlists.items};
                p[this.state.newName] = [];
                localStorage['playlists'] = JSON.stringify(p);
            }
        }
    }

    handleKeyUp(e) {
        if(e.which === 13) {
            this.addPlaylist();
        }
    }

    toggleNewPlaylist(e) {
        this.setState({
            newPlaylistVisible: !this.state.newPlaylistVisible
        });
        e.stopPropagation();
    }

    toggleOptionsVisible() {
        if(this.state.currentPlaylist === undefined) return;
        this.setState({
            optionsVisible: !this.state.optionsVisible
        });
    }

    toggleRenameVisible() {
        this.setState({
            showRename: !this.state.showRename
        });
    }

    delete() {
        const { [this.state.currentPlaylist]: value, ...newObj } = this.props.playlists.items;
        const p = {
            ...newObj
        }
        this.props.removePlaylist(this.state.currentPlaylist);
        this.setState({
            currentPlaylist: undefined,
            optionsVisible: false
        });
        if(storageAvailable('localStorage')) {
            localStorage['playlists'] = JSON.stringify(p);
        }
    }

    rename(name) {
        const { [this.state.currentPlaylist]: value, ...newObj } = this.props.playlists.items;
        const p = {
            ...newObj,
            [name]: value
        };
        this.props.renamePlaylist(this.state.currentPlaylist, name);
        this.setState({
            currentPlaylist: name,
            showRename: false
        });
        if(storageAvailable('localStorage')) {
            localStorage['playlists'] = JSON.stringify(p);
        }
    }

    render() {
        const playlistNames = Object.keys(this.props.playlists.items);
        if(this.props.view.browseVisible) return null;
        return (
            <div className="playlists">
                {
                    this.state.newPlaylistVisible ? 
                    <div 
                        className="new-playlist-bg"
                        onClick={this.toggleNewPlaylist}>
                        <div 
                            className="new-playlist-modal"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="new-playlist-header">
                                Add New Playlist
                            </div>
                            <div className="new-playlist-input">
                                <input 
                                    type="text"
                                    maxLength="50"
                                    placeholder="Playlist Name"
                                    onChange={this.updateName}
                                    onKeyUp={this.handleKeyUp}/>
                            </div>
                            {
                                this.state.addPlaylistError !== '' ?
                                <div className="new-playlist-error">
                                    {this.state.addPlaylistError}
                                </div> : null
                            }
                            <div className="new-playlist-enter">
                                <div 
                                    className="new-playlist-enter-button"
                                    onClick={() => this.addPlaylist()}>
                                    OK
                                </div>
                            </div>
                        </div>
                    </div> : null
                }
                <div className="playlists-inner">

                    <div className="playlist-list-container">
                        <div className="playlist-item-container">
                            {
                                this.playlistLists()
                            }
                        </div>

                        <div className="add-playlist-outer">
                            <div className="add-playlist-inner">
                                <div 
                                    className="add-playlist-button-outer"
                                    onClick={this.toggleNewPlaylist}>
                                    <div className="add-playlist-button-inner">
                                        <img src={pluswhite} alt="add-playlist"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="playlist-content-container">
                        <div className="playlist-header">
                            <table className="playlist-header-table">
                                <tbody>
                                    <tr>
                                        <td>
                                            <div className="playlist-title">
                                                <TitleItem
                                                    playlistNames={playlistNames}
                                                    currentPlaylist={this.state.currentPlaylist}
                                                    showInput={this.state.showRename}
                                                    onChange={name => this.rename(name)} />
                                            </div>
                                        </td>
                                        <td>
                                            <div 
                                                className="play-playlist"
                                                onClick={() => this.playPlaylist()}>
                                                <img src={
                                                    this.props.settings.darkMode ?
                                                        playWhite : playBlack
                                                } alt="play-playlist"/>
                                            </div>
                                        </td>
                                        <td>
                                            <div 
                                                className="playlist-options"
                                                onMouseEnter={() => this.toggleOptionsVisible()}
                                                onMouseLeave={() => this.toggleOptionsVisible()}>
                                                <img 
                                                    src={
                                                        this.props.settings.darkMode ?
                                                            menuWhite : menu
                                                    } 
                                                    alt="options"/>
                                                {
                                                    this.state.optionsVisible ?
                                                    <PlaylistOptions 
                                                        onDelete={() => this.delete()}
                                                        onToggleRenameVisible={() => this.toggleRenameVisible()}
                                                        /> : null
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="2">
                                            <div className="playlist-length">
                                                {
                                                    this.state.currentPlaylist === undefined ?
                                                    null : 
                                                        this.props.playlists.items[this.state.currentPlaylist].length
                                                     + (this.props.playlists.items[this.state.currentPlaylist].length 
                                                        === 1 ? 
                                                        " Item" : " Items")
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="playlist-content">
                            
                            {
                                this.state.currentPlaylist === undefined ?
                                <div className="no-playlist-selected">No Playlist Selected</div>
                                :
                                this.props.playlists.items[this.state.currentPlaylist].map((item, index) => 
                                    <AudioItem 
                                        audio={item}
                                        key={index}
                                        index={index}
                                        currentPlaylist={this.state.currentPlaylist}/>
                                )
                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Playlists = connect(
    mapStateToProps,
    mapDispatchToProps
)(PlaylistsBind);

export default Playlists;