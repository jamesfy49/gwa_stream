import React, { Component } from 'react';
import '../../css/playlists.css';

import '../../css/audioitem.css';

import plus from '../../images/plus.png';
import grid from '../../images/grid.png';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import { shuffle } from '../tools.js';

import {
    viewActions,
    queueActions,
    nowPlayingActions,
    playlistActions
} from '../actions/actions.js'

const mapStateToProps = (state, props) => ({
    playlists: state.playlists,
    nowPlaying: state.nowPlaying,
    settings: state.settings,
    view: state.view,
    queue: state.queue
});

const mapDispatchToProps = {
    showPlaylistAdd: viewActions.showPlaylistAdd,

    addToQueue: queueActions.addToQueue,
    addToUpnext: queueActions.addToUpnext,
    setQueue: queueActions.setQueue,

    setPlaying: nowPlayingActions.setPlaying,
    seekTo: nowPlayingActions.seekTo,
    play: nowPlayingActions.play,

    setItemStore: playlistActions.setItemStore
}

class QueueActions extends Component {
    
    constructor(props) {
        super(props);
        this.touchFlag = true;
        this.state = {
            activeAudio: 0
        }
    }

    changeActive(index) {
        this.setState({
            activeAudio: index
        });
        return false;
    }

    handleAddToUpNextTouch(e) {
        this.handleAddToUpNext(e)
        return false;
    }

    handleAddToUpNextClick(e) {
        this.handleAddToUpNext(e)
        return false;
    }

    handleAddToQueueTouch(e) {
        this.handleAddToQueue(e)
        return false;
    }

    handleAddToQueueClick(e) {
        this.handleAddToQueue(e)
        return false;
    }

    handleAddToUpNext(e) {
        let audio = {...this.props.audio};
        if(audio.audios.length > 1) {
            audio.activeAudio = this.state.activeAudio;
        }
        this.props.onAddToUpNext(e, audio);
    }
    
    handleAddToQueue(e) {
        let audio = {...this.props.audio};
        if(audio.audios.length > 1) {
            audio.activeAudio = this.state.activeAudio;
        }
        this.props.onAddToQueue(e, audio);
    }

    render() {
        const multiple = this.props.audio.audios.length > 1;
        return(
            <div className={
                multiple ? 
                "audio-options-inner audio-options-inner-big"
                :
                "audio-options-inner"
            }>
                {
                    multiple ?
                    <div className="audio-options-select-audio">
                        {
                            this.props.audio.audios.map((item, index) => 
                                <div 
                                    className="audio-options-audio-item"
                                    key={index}
                                    onTouchStart={(e) => this.changeActive(index)}
                                    onTouchEnd={(e) => e.preventDefault()}
                                    onClick={(e) => this.changeActive(index)}>
                                    <div className="audio-options-radio-outer">
                                        <div 
                                            className={
                                                index === this.state.activeAudio ?
                                                "audio-options-radio audio-options-radio-active"
                                                :
                                                "audio-options-radio"
                                            }>
                                        </div>
                                    </div>
                                    <div className="audio-options-radio-label">
                                        <div className="audio-options-radio-label-inner">
                                        { item }
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </div> : null
                }
                <div className="audio-options-actions">
                    <div 
                        className="audio-options-action"
                        onTouchStart={(e) => this.handleAddToUpNext(e)}
                        onTouchEnd={(e) => e.preventDefault()}
                        onClick={(e) => this.handleAddToUpNext(e)}>
                        Add To Up Next
                    </div>
                    <div 
                        className="audio-options-action"
                        onTouchStart={(e) => this.handleAddToQueue(e)}
                        onTouchEnd={(e) => e.preventDefault()}
                        onClick={(e) => this.handleAddToQueue(e)}>
                        Add To Queue
                    </div>
                </div>
            </div>
        )
    }
}

class AudioItemBind extends Component {
    constructor(props) {
        super(props);
        this.state = {
            textVisible: false,
            optionsVisible: false,
            queueActionTouched: false
        }
        this.addToUpNext = this.addToUpNext.bind(this);
        this.addToQueue = this.addToQueue.bind(this);
    }

    handleAdd() {
        this.props.setItemStore(this.props.audio);
        this.props.showPlaylistAdd();
    }

    playAudio(e) {
        let index;
        if(this.props.view.browseVisible) {
            index = 0;
            this.props.setQueue([this.props.audio]);
        } else {
            let songs = this.props.playlists.items[this.props.currentPlaylist];
            if(this.props.settings.shuffle) {
                songs = shuffle(songs);
                let i = songs.indexOf(this.props.audio);
                songs = [
                    this.props.audio,
                    ...songs.slice(0, i),
                    ...songs.slice(i + 1)
                ];
                index = 0;
            } else {
                index = this.props.index;
            }
            this.props.setQueue(songs);
        }
        this.props.setPlaying(this.props.audio, index);
        e.stopPropagation();
    }

    touchStart() {
        this.toggleOptionVisible(true)
    }

    touchEnd(e) {
        e.preventDefault();
        this.setState({queueActionTouched:false})
        return false;
    }

    toggleSelfText() {
        this.setState({
            textVisible: !this.state.textVisible
        });
    }

    toggleOptionVisible(touch) {
        //if(touch && this.state.optionsVisible) return;
        if(this.state.queueActionTouched) return false;
        this.setState({
            optionsVisible: !this.state.optionsVisible
        });
        return false;
    }

    addToUpNext(e, audio) {
        e.stopPropagation();
        const current = this.props.nowPlaying.current;
        this.props.addToUpnext([audio], current);
        if(this.props.queue === undefined) {
            this.props.setPlaying(audio, 0);
        } else {
            if(this.props.queue.length === 0) {
                this.props.setPlaying(audio, 0);
            }
        }
    }

    addToQueue(e, audio) {
        e.stopPropagation();
        this.props.addToQueue([audio]);
        if(this.props.queue === undefined) {
            this.props.setPlaying(audio, 0);
        } else {
            if(this.props.queue.length === 0) {
                this.props.setPlaying(audio, 0);
            }
        }
    }

    render() {
        if(this.props.audio === undefined) return null;
        let audio = this.props.audio;
        return (
            <div className="audio-item">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <div 
                                    className="audio-title"
                                    onClick={(e) => this.playAudio(e)}
                                    dangerouslySetInnerHTML={
                                        {__html: audio.title}
                                    }>
                                </div>
                            </td>
                        </tr>
                        {
                            this.state.textVisible ?
                            (<tr>
                                <td colSpan="2">
                                    <div className="audio-subtitle">
                                        <ReactMarkdown
                                            source={audio.selftext} />
                                    </div>
                                </td>
                            </tr>) : null
                        }
                        {
                            audio.activeAudio !== undefined ?
                            <tr>
                                <td>
                                    <div
                                        className="audio-active-url">
                                        { audio.audios[audio.activeAudio] }
                                    </div>
                                </td>
                            </tr> : null
                        }
                        <tr>
                            <td>
                                <div className="audio-info">
                                    <div className="audio-author">
                                        {audio.author}
                                    </div>
                                    <div 
                                        className="audio-toggle-text"
                                        onClick={() => this.toggleSelfText()}>
                                        {this.state.textVisible ? 
                                            ("Hide") : ("Show")} Self Text
                                    </div>
                                    <div className="audio-link">
                                        <a href={audio.url} target="__blank">
                                        Original Post
                                        </a>
                                    </div>
                                    <div 
                                        className="add-to-playlist"
                                        onClick={() => this.handleAdd()}>
                                        <img
                                            src={plus}
                                            alt="Add to Playlist"/>
                                    </div>
                                    <div 
                                        className="audio-options"
                                        onTouchStart={() => this.touchStart()}
                                        onTouchEnd={(e) => this.touchEnd(e)}
                                        onMouseEnter={() => this.toggleOptionVisible()}
                                        onMouseLeave={() => this.toggleOptionVisible()}>
                                        <img
                                            src={grid}
                                            alt="Audio Options" />
                                        {
                                            this.state.optionsVisible ? 
                                            <QueueActions
                                                audio={this.props.audio}
                                                onAddToUpNext={this.addToUpNext}
                                                onAddToQueue={this.addToQueue} /> : null
                                        }
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

const AudioItem = connect(
    mapStateToProps,
    mapDispatchToProps
)(AudioItemBind);

export default AudioItem;