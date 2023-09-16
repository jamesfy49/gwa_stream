import React, { Component } from 'react';
import '../../css/nowplaying.css';

import Queue from './Queue.js';

import { connect } from 'react-redux';

import rewind from '../../images/rewind.png';
import rewindwhite from '../../images/rewind-white.png';
import play from '../../images/play-white.png';
import pause from '../../images/pause-white.png';
import fastforward from '../../images/fast-forward.png';
import fastforwardwhite from '../../images/fast-forward-white.png';
import queue from '../../images/queue.png';
import queuewhite from '../../images/queue-white.png';
import volumelow from '../../images/volume-low.png';
import volumelowwhite from '../../images/volume-low-white.png';
import volumemedium from '../../images/volume-medium.png';
import volumemediumwhite from '../../images/volume-medium-white.png';
import volumehigh from '../../images/volume-high.png';
import volumehighwhite from '../../images/volume-high-white.png';
import mute from '../../images/mute.png';
import mutewhite from '../../images/mute-white.png';
import loop from '../../images/loop.png';
import loopwhite from '../../images/loop-white.png';
import loopone from '../../images/loopone.png';
import looponewhite from '../../images/loopone-white.png';
import shuffle from '../../images/shuffle.png';
import shufflewhite from '../../images/shuffle-white.png';

import storageAvailable from '../checkStorage.js';

import { 
    settingsActions,
    nowPlayingActions,
    queueActions
  } from '../actions/actions.js';

const mapStateToProps = (state, props) => ({
    queue: state.queue,
    nowPlaying: state.nowPlaying,
    settings: state.settings
});

const mapDispatchToProps = {
    changeVolume: settingsActions.changeVolume,
    toggleMute: settingsActions.toggleMute,
    toggleShuffle: settingsActions.toggleShuffle,
    rotateLoop: settingsActions.rotateLoop,

    setQueue: queueActions.setQueue,

    setPlaying: nowPlayingActions.setPlaying,
    setActive: nowPlayingActions.setActive,
    endPlayback: nowPlayingActions.endPlayback,
    togglePlay: nowPlayingActions.togglePlay,
    setDuration: nowPlayingActions.setDuration,
    updateTime: nowPlayingActions.updateTime,
    setSeek: nowPlayingActions.setSeek,
    setLoading: nowPlayingActions.setLoading,
    pause: nowPlayingActions.pause
};

class NowPlayingBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            seekTime: undefined,
            hoverTransform: 0,
            timeVisible:false,
            queueVisible:false,
            hoverVolume: 100,
            volumeVisible: false,
            delay: false
        }
        this.handleMouseMoveSeek = this.handleMouseMoveSeek.bind(this);
        this.handleMouseMoveVolume = this.handleMouseMoveVolume.bind(this);
        this.seekTo = this.seekTo.bind(this);
        this.toggleTimeVisible = this.toggleTimeVisible.bind(this);
        this.toggleQueueVisible = this.toggleQueueVisible.bind(this);
        this.toggleVolumeVisible = this.toggleVolumeVisible.bind(this);
    }

    toggleTimeVisible() {
        this.setState({
            timeVisible: !this.state.timeVisible
        });
    }

    toggleQueueVisible() {
        this.setState({
            queueVisible: !this.state.queueVisible
        });
    }

    toggleVolumeVisible() {
        this.setState({
            hoverVolume: 0,
            volumeVisible: !this.state.volumeVisible
        });
    }

    rotateLoopMode() {
        let m = (this.props.settings.loop + 1) % 3;
        this.props.rotateLoop(m);
    }

    toggleShuffle() {
        this.props.toggleShuffle(this.props.settings.shuffle);
    }

    delayOn() {
        this.setState({delay:true});
        setTimeout(() => {
            this.setState({delay:false});
        },500);
    }

    formatTime(seconds) {
        if(seconds === undefined) return "00:00";
        let m = seconds < 60 ? 0 : Math.floor(seconds / 60);
        let mString = (m < 10) ? "0" + m : m;
        let s = Math.floor(seconds % 60);
        let sString = (s < 10) ? "0" + s : s;
        let time = mString + ":" + sString;
        return time;
    }

    getTime() {
        const current = this.formatTime(this.state.seekTime);
        const total = this.formatTime(this.props.nowPlaying.length);
        return current + "/" + total;
    }

    handlePlayPause() {
        if(this.props.nowPlaying.audio === undefined) return false;
        this.props.togglePlay(this.props.nowPlaying.playing);
    }

    handleMouseMoveSeek(e) {
        if(this.props.nowPlaying.audio === undefined) return;
        let x = e.pageX;
        let width = e.currentTarget.offsetWidth;
        let percent = x / width;
        if(x > (width - 100)) x = width - 100;
        let time = this.props.nowPlaying.length * percent;
        this.setState({
            seekTime: time,
            hoverTransform: x
        });
    }

    handleMouseMoveVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = e.currentTarget.offsetHeight;
        let r = ((height - y) / height);
        r = Math.min(1, Math.max(0, r));
        this.setState({
            hoverVolume: r
        });
    }

    seekTo(e) {
        if(this.props.nowPlaying.audio === undefined) return;
        this.props.setLoading(true);
        this.props.setSeek(this.state.seekTime);
        this.props.pause();
    }

    setVolume(e) {
        this.props.changeVolume(this.state.hoverVolume);
        if(storageAvailable('localStorage')) {
            localStorage['volume'] = this.state.hoverVolume;
        }
    }

    getProgress() {
        if(this.props.nowPlaying.length === undefined) return 0;
        const currentTime = this.props.nowPlaying.currentTime;
        const totalTime = this.props.nowPlaying.length;
        const percent = 100 * (currentTime / totalTime);
        return(percent + "%");
    }

    getBuffer() {
        if(this.props.nowPlaying.bufferTime === undefined) return 0;
        const length = this.props.nowPlaying.length;
        const buffer = this.props.nowPlaying.bufferTime;
        const percent = 100 * (buffer / length);
        return(percent + "%");
    }

    prevSong() {
        if(this.state.delay) return;
        if(this.props.nowPlaying.currentTime > 2000
            || this.props.nowPlaying.current === 0) {
            this.props.setSeek(0);
        } else {
            const current = this.props.nowPlaying.current;
            this.props.setPlaying(this.props.queue[current - 1], current - 1);
        }
        this.delayOn();
    }

    nextSong() {
        if(this.state.delay) return;
        if(this.props.settings.loop === 2) {
            this.props.setSeek(0);
        } else {
            const current = this.props.nowPlaying.current;
            const queue = this.props.queue;
            if(current === queue.length - 1) {
                if(this.props.settings.loop === 1) {
                    this.props.setPlaying(queue[0], 0);
                } else {
                    this.props.endPlayback();
                    this.props.setQueue([]);
                }
            } else {
                this.props.setPlaying(queue[current + 1], current + 1);
            }
        }
        this.delayOn();
    }

    render() {
        const audio = this.props.nowPlaying.audio !== undefined ?
            this.props.nowPlaying.audio
            : {
                title: '',
                titlePlain: '',
                author: ''
            };
        const dark = this.props.settings.darkMode;
        let volumeImg;
        if(this.props.settings.muted) {
            volumeImg = dark ? mutewhite : mute;
        } else {
            if(this.props.settings.volume > .66) {
                volumeImg = dark ? volumehighwhite : volumehigh;
            } else if(this.props.settings.volume > .33) {
                volumeImg = dark ? volumemediumwhite : volumemedium;
            } else {
                volumeImg = dark ? volumelowwhite : volumelow;
            }
        }

        const loopNormal = dark ? loopwhite : loop;
        const loopOne = dark ? looponewhite : loopone;
        let loopMode;
        switch(this.props.settings.loop) {
            case 0:
            case 1:
                loopMode = loopNormal;
                break;
            case 2:
            default:
                loopMode = loopOne;
                break;
        }

        return (
            <div className="now-playing">

                <div className="now-playing-inner">

                    <div
                        className="progress-bar"
                        onMouseEnter={this.toggleTimeVisible}
                        onMouseLeave={this.toggleTimeVisible}
                        onMouseMove={this.handleMouseMoveSeek}
                        onClick={this.seekTo}>
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-inner"
                                style={{
                                    width: this.getProgress()
                                }}>
                            </div>
                            <div
                                className="progress-bar-buffer"
                                style={{
                                    width: this.getBuffer()
                                }}>    
                            </div>
                        </div>
                        {
                            this.state.timeVisible && this.props.nowPlaying.audio !== undefined ?
                            <div
                                className="time-indicator"
                                style={{
                                    transform: `translate(${this.state.hoverTransform}px, -40px)`
                                }}>
                                {this.getTime()}
                            </div> : null
                        }
                    </div>

                    <div className="nowplaying-information">
                        <div
                            className="nowplaying-title"
                            dangerouslySetInnerHTML={
                                {__html: audio.title}
                            }
                            title={audio.titlePlain}>
                        </div>
                        <div className="nowplaying-artist">
                            {audio.author}
                        </div>
                    </div>

                    <div className="controls">
                        <div className="rewind">
                            <div className="control-outer control-outer-small">
                                <div 
                                    className="control-inner control-inner-small"
                                    onClick={() => this.prevSong()}>
                                    <img src={
                                        this.props.settings.darkMode ?
                                        rewindwhite : rewind
                                    } alt="rewind"/>
                                </div>
                            </div>
                        </div>
                        <div className="playpause">
                            <div className="control-outer">
                                <div 
                                    className="control-inner"
                                    onClick={() => this.handlePlayPause()}>
                                    <img 
                                        id="playpause-img"
                                        src={
                                            this.props.nowPlaying.playing ?
                                            pause : play
                                        }
                                        alt="playpause"/>
                                </div>
                            </div>
                        </div>
                        <div className="fastforward">
                            <div className="control-outer control-outer-small">
                                <div 
                                    className="control-inner control-inner-small"
                                    onClick={() => this.nextSong()}>
                                    <img src={
                                        this.props.settings.darkMode ?
                                        fastforwardwhite : fastforward
                                    } alt="fastforward"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <Queue visible={this.state.queueVisible} />

                    <div className="options">
                        <div 
                            className="option-outer"
                            onClick={() => this.rotateLoopMode()}>
                            <img 
                                src={loopMode}
                                className={
                                    this.props.settings.loop === 0 ?
                                        "option-inactive" : null
                                }
                                alt={"loop"} />
                        </div>
                        <div 
                            className="option-outer"
                            onClick={() => this.toggleShuffle()}>
                            <img 
                                src={
                                    dark ? shufflewhite : shuffle
                                }
                                className={
                                    !this.props.settings.shuffle ?
                                        "option-inactive" : null
                                }
                                alt={"shuffle"} />
                        </div>
                        <div 
                            className="option-outer"
                            onMouseEnter={this.toggleVolumeVisible}
                            onMouseLeave={this.toggleVolumeVisible}>
                            <img 
                                src={volumeImg} 
                                onClick={() => this.props.toggleMute(this.props.settings.muted)}
                                alt="volume"/>
                            {
                                this.state.volumeVisible ?
                                <div 
                                    className={this.props.settings.muted ? 
                                        "volume-bar volume-bar-muted" : "volume-bar"}
                                    onMouseMove={this.handleMouseMoveVolume}
                                    onClick={() => this.setVolume()}>
                                    <div className="volume-bar-inner">
                                        <div 
                                            className="volume-pheno"
                                            style={{
                                                height: (this.props.settings.volume * 100) + "%"
                                            }}></div>
                                        <div 
                                            className="volume-hover"
                                            style={{
                                                height: (this.state.hoverVolume * 100) + "%"
                                            }}></div>
                                    </div>
                                </div> : null
                            }
                        </div>
                        <div 
                            className="option-outer"
                            onClick={this.toggleQueueVisible}>
                            <img src={
                                this.props.settings.darkMode ?
                                queuewhite : queue
                            } alt="queue"/>
                        </div>
                    </div>


                </div>
            </div>
        )
    }
}

const NowPlaying = connect(
    mapStateToProps,
    mapDispatchToProps
)(NowPlayingBind);

export default NowPlaying;
