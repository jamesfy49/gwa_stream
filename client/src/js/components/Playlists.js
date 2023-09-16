import React, { Component } from 'react';
import '../../css/playlists.css';

import pluswhite from '../../images/plus-white.png';
import playWhite from '../../images/play-circle-white.png';
import menuWhite from '../../images/menu-white.png';
import playBlack from '../../images/play-black.png';
import menu from '../../images/menu.png';
import trashWhite from '../../images/trash-white.png';
import trash from '../../images/trash.png';
import rename from '../../images/rename.png';
import renameWhite from '../../images/rename-white.png';
import exportIcon from '../../images/export.png';
import exportIconWhite from '../../images/export-white.png';
import listTab from '../../images/list-tab.png';
import listTabWhite from '../../images/list-tab-white.png';
import closeButton from '../../images/close.png';

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
    addToPlaylist: playlistActions.addToPlaylist,

    setQueue: queueActions.setQueue,

    setPlaying: nowPlayingActions.setPlaying
}

class TitleItem extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    handleChange(e) {
        this.props.onChange(e);
    }
    handleKeyUp(e) {
        if(e.which === 13) {
            this.props.rename();
        }
    }
    render() {
        if(this.props.currentPlaylist === undefined) return null;
        if(this.props.playlistNames.length === 0) {
            return "Nothing Selected";
        } else {
            if(this.props.showInput) {
                return(
                    <div className="rename-playlist">
                        <div className="rename-playlist-error">
                            { this.props.error }
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
        if(!this.props.currentPlaylist) return;
        if(this.state.showDeleteConfirm) {
            this.props.onDelete();
            this.setState({showDeleteConfirm:false})
            return;
        } else {
            this.setState({
                showDeleteConfirm: !this.state.showDeleteConfirm
            });
        }
        if(this.props.showRename) {
            this.toggleRename()
        }
    }
    cancelDelete() {
        if(!this.props.currentPlaylist) return;
        this.setState({
            showDeleteConfirm:false
        })
    }
    componentDidUpdate(prevProps) {
        if(prevProps.currentPlaylist !== undefined && this.props.currentPlaylist === undefined) {
            this.setState({showDeleteConfirm:false});
        }
    }
    toggleRename() {
        if(!this.props.currentPlaylist) return;
        this.props.onToggleRenameVisible();
        if(this.state.showDeleteConfirm) {
            this.toggleDeleteConfirm();
        }
    }
    confirmRename(e) {
        if(!this.props.currentPlaylist) return;
        this.props.onRename();
        e.stopPropagation();
    }
    render() {

        let trashImg = trash;
        let renameImg = rename; 
        let exportImg = exportIcon;
        if(this.props.darkMode) {
            trashImg = trashWhite;
            renameImg = renameWhite;
            exportImg = exportIconWhite;
        }
        let deleteClass = "playlist-options-dialogue-item";
        if(this.state.showDeleteConfirm) {
            deleteClass += " delete-confirm";
        }
        let deleteInnerClass = "playlist-options-dialogue-item-inner delete-confirm";
        if(this.state.showDeleteConfirm) {
            deleteInnerClass += " expanded";
        }

        return(
            <div className={"playlist-options-dialogue"}>
                <div 
                    className="playlist-options-dialogue-item rename"
                    onClick={() => this.toggleRename()}
                    title="Rename Playlist">
                    {
                        this.props.showRename ?
                        <>
                        <div className="cancel-rename">
                            <div
                                title="Cancel Name Change" 
                                className="playlist-options-dialogue-item-inner rename">
                                Cancel
                            </div>
                        </div>
                        <div className="confirm-rename" onClick={(e) => this.confirmRename(e)}>
                            <div
                                title="Confirm Name Change" 
                                className="playlist-options-dialogue-item-inner rename">
                                Confirm
                            </div>
                        </div> 
                        </>
                        : 
                        <div className="rename-container">
                            <img src={renameImg} alt="rename"/>   
                        </div>  
                    }
                </div>
                <div
                    className="playlist-options-dialogue-item"
                    onClick={() => this.props.onExport()}
                    title="Export Playlist">
                    <div className="playlist-options-dialogue-item-inner">
                        <img src={exportImg} alt="export"/>
                    </div>
                </div>
                <div 
                    className={deleteClass}
                    title="Delete Playlist">
                    <div 
                        className={deleteInnerClass}
                        onClick={() => this.toggleDeleteConfirm()}>
                        {
                            this.state.showDeleteConfirm ?
                            <div>Delete?</div> : <img src={trashImg} alt="trash"/>
                        }
                    </div>
                    {
                        this.state.showDeleteConfirm ?
                        <div 
                            className="playlist-options-dialogue-item-inner delete-cancel"
                            onClick={() => this.cancelDelete()}>
                            <div>Cancel</div>
                        </div> : null
                    }
                </div>
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
            importPlaylistError: '',
            optionsVisible: false,
            showRename: false,
            renameValue: '',
            renameError: '',
            exportCodeVisible: false,
            showCopied: false,
            importVal: '',
            importNameVal: '',
            tabPullout: false,
        }
        this.toggleNewPlaylist = this.toggleNewPlaylist.bind(this);
        this.updateName = this.updateName.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        if(storageAvailable('localStorage')) {
            if(localStorage['playlists'] !== undefined) {
                const items = localStorage['playlists'];
                if(items !== undefined) {
                    this.props.setPlaylists(JSON.parse(items));
                }
            }
        }
    }

    componentDidUpdate(prevProps) {
        if(this.state.currentPlaylist === undefined) {
            if(Object.keys(this.props.playlists.items).length > 0) {
                const first = Object.keys(this.props.playlists.items)[0];
                this.setState({
                    currentPlaylist: first
                });
            }
        }
        if(!prevProps.playlists) return;
        if(!this.props.playlists) return;
        let oldPlaylistNames = Object.keys(prevProps.playlists.items);
        let newPlaylistNames = Object.keys(this.props.playlists.items);
        if(oldPlaylistNames.length < newPlaylistNames.length) {
            let newPlaylist = "";
            for(let i = 0; i < newPlaylistNames.length; i++) {
                if(oldPlaylistNames.indexOf(newPlaylistNames[i]) === -1) {
                    newPlaylist = newPlaylistNames[i];
                    break;
                }
            }
            this.selectNewPlaylist(newPlaylist);
            this.savePlaylists();
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

    validateName(name) {
        const playlistNames = Object.keys(this.props.playlists.items);
        if(name === '') {
            return "Enter a valid name";
        } else if(name.length > 30) {
            return "Name too long";
        } else if(playlistNames.indexOf(name) !== -1) {
            return "Playlist already exists.";
        } else {
            return "";
        }
    }

    addPlaylist() {
        let newName = this.state.newName;
        const invalidPlaylist = this.validateName(newName);
        this.setState({
            addPlaylistError: invalidPlaylist
        });
        if(!invalidPlaylist) {
            this.props.addPlaylist(newName);
            this.setState({
                addPlaylistError: '',
                newPlaylistVisible: false
            });
        }
    }

    selectNewPlaylist(playlistName) {
        this.setState({
            currentPlaylist: playlistName
        });
    }

    savePlaylists() {
        if(storageAvailable('localStorage')) {
            const p = {...this.props.playlists.items};
            localStorage['playlists'] = JSON.stringify(p);
        }
    }

    handleKeyUp(e) {
        if(e.which === 13) {
            this.addPlaylist();
        }
    }

    toggleNewPlaylist(e) {
        this.setState({
            addPlaylistError: "",
            importPlaylistError: "",
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
        const { 
            [this.state.currentPlaylist]: value, 
            "": emptyVal,
             ...newObj 
        } = this.props.playlists.items;
        const p = {
            ...newObj
        }
        this.setState({
            currentPlaylist: undefined,
            optionsVisible: false
        });
        this.props.removePlaylist(this.state.currentPlaylist);
        this.props.removePlaylist("");
        if(storageAvailable('localStorage')) {
            localStorage['playlists'] = JSON.stringify(p);
        }
    }

    updateRenameVal(e) {
        this.setState({renameValue: e.target.value})
    }

    updateImportVal(e) {
        this.setState({importVal: e.target.value});
    }

    updateImportNameVal(e) {
        this.setState({importNameVal: e.target.value});
    }

    importPlaylist() {
        
        let newName = this.state.importNameVal;
        const invalidPlaylist = this.validateName(newName);
        this.setState({
            importPlaylistError: invalidPlaylist
        });
        if(!invalidPlaylist) {
            if(!this.state.importVal || this.state.importVal.length === 0) {
                this.setState({importPlaylistError: "Enter a playlist code to import."});
                return;
            }
            fetch("/api/gwa/getPlaylistData/", {
                method: 'POST',
                body: JSON.stringify({
                    names: this.state.importVal
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.json())
            .then(response => {
                if(response.error) {
                    this.setState({importPlaylistError: response.message});
                    return;
                }

                const playlistNames = Object.keys(this.props.playlists.items);         
                this.props.addPlaylist(newName);
                this.setState({
                    importPlaylistError: '',
                    newPlaylistVisible: false
                });
                if(playlistNames.length === 0) {
                    this.setState({
                        currentPlaylist: newName
                    });
                }
                const p = {...this.props.playlists.items};
                if(!p[newName]) {
                    p[newName] = [];
                }

                if(response.results) {
                    for(let i = 0; i < response.results.length; i++) {
                        const a = new Array(response.results[i]);
                        this.props.addToPlaylist(newName, a);
                        if(storageAvailable('localStorage')) {
                            p[newName].push(response.results[i]);
                        }
                    }
                    localStorage["playlists"] = JSON.stringify(p);
                }
            })
            .catch(error => {
                console.log(error);
            })
        }
    }

    rename() {
        const playlistNames = Object.keys(this.props.playlists.items);
        const newName = this.state.renameValue;
        if(newName === '') {
            this.setState({
                renameError: "Enter a valid name."
            });
            return;
        } else if(playlistNames.indexOf(newName) !== -1) {
            this.setState({
                renameError: "Playlist already exists."
            });
            return;
        } else {
            const { [this.state.currentPlaylist]: value, ...newObj } = this.props.playlists.items;
            const p = {
                ...newObj,
                [newName]: value
            };
            this.props.renamePlaylist(this.state.currentPlaylist, newName);
            this.setState({
                currentPlaylist: newName,
                showRename: false
            }, () => {
                this.setState({
                    renameValue: "",
                    renameError: ""
                });
            });
            if(storageAvailable('localStorage')) {
                localStorage['playlists'] = JSON.stringify(p);
            }
        }
    }

    getExportText() {
        let playlists = this.props.playlists.items;
        let currentPlaylist = this.state.currentPlaylist;
        if(playlists[currentPlaylist] === undefined) return;
        let names = playlists[currentPlaylist].map((p) => {
            return "t3_" + p.id;
        }).join(",");
        return names;
    }

    toggleExport() {
        this.setState({exportCodeVisible:!this.state.exportCodeVisible});
    }

    export() {
        let playlistNames = this.getExportText();
        navigator.clipboard.writeText(playlistNames);
        this.setState({showCopied:true}, () => {
            setTimeout(() => {
                this.setState({showCopied:false})
            }, 1500);
        })
    }

    toggleTabPullout() {
        this.setState({
            tabPullout:!this.state.tabPullout
        });
    }

    render() {
        const playlistNames = Object.keys(this.props.playlists.items);
        if(this.props.view.browseVisible) return null;

        let playlistListClass = "playlist-list-container";
        if(!this.state.tabPullout) {
            playlistListClass += " hidden";
        }

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

                            <div
                                onClick={this.toggleNewPlaylist} 
                                className="close-new-playlist">
                                <img src={closeButton} title="Close" />
                            </div>

                            <div className="new-playlist-header">
                                Add New Playlist
                            </div>
                            <div className="new-playlist-content">
                                <div className="new-playlist-new-container">
                                    <div className="new-playlist-header">
                                        Create
                                    </div>
                                    <div className="new-playlist-input">
                                        <input 
                                            type="text"
                                            maxLength="30"
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
                                <div className="new-playlist-import-container">
                                    <div className="new-playlist-header">
                                        Import
                                    </div>
                                    <div className="new-playlist-import-textarea">
                                        <input 
                                            type="text"
                                            maxLength="30"
                                            placeholder="Playlist Name"
                                            onChange={(e) => this.updateImportNameVal(e)}/>
                                        <textarea
                                            placeholder="Code"
                                            onChange={(e) => this.updateImportVal(e)}
                                            ></textarea>
                                    </div>
                                    {
                                        this.state.importPlaylistError !== '' ?
                                        <div className="new-playlist-error">
                                            {this.state.importPlaylistError}
                                        </div> : null
                                    }
                                    <div className="new-playlist-enter">
                                        <div 
                                            className="new-playlist-enter-button"
                                            onClick={() => this.importPlaylist()}>
                                            OK
                                        </div>
                                    </div>
                                </div>
                            
                            </div>
                            
                        </div>
                    </div> : null
                }
                {
                    this.state.exportCodeVisible ?
                    <div
                        className="export-playlist-bg"
                        onClick={() => this.toggleExport()}>
                        <div
                            className="export-playlist-modal"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="export-playlist-header">
                                Export Playlist
                            </div>
                            <div className="export-playlist-content-container">
                                <textarea 
                                    readOnly={true}
                                    value={this.getExportText()}>
                                </textarea>
                            </div>
                            <div className="export-playlist-copy">
                                <div
                                    onClick={() => this.export()} 
                                    className="export-playlist-copy-button">
                                    {this.state.showCopied ? "Copied" : "Copy"}
                                </div>
                            </div>
                        </div>
                    </div> : null
                }
                <div className="playlists-inner">

                    <div className={playlistListClass}>
                        <div className="playlist-list-container-inner">

                            <div 
                                className="playlist-list-pullout"
                                onClick={() => this.toggleTabPullout()}>
                                <img src={
                                    this.props.settings.darkMode ?
                                        listTabWhite : listTab}/>
                            </div>


                            <div className="playlist-item-container">
                                {
                                    this.playlistLists()
                                }

                            </div>
                            
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
                                                    error={this.state.renameError}
                                                    playlistNames={playlistNames}
                                                    currentPlaylist={this.state.currentPlaylist}
                                                    showInput={this.state.showRename}
                                                    onChange={(e) => this.updateRenameVal(e)}
                                                    rename={() => this.rename()} />
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
                                            <PlaylistOptions 
                                                currentPlaylist={this.state.currentPlaylist}
                                                darkMode={this.props.settings.darkMode}
                                                onDelete={() => this.delete()}
                                                onExport={() => this.toggleExport()}
                                                onRename={() => this.rename()}
                                                showRename={this.state.showRename}
                                                onToggleRenameVisible={() => this.toggleRenameVisible()}
                                                />
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