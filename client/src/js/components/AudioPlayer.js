import React, { Component } from 'react';

import ReactPlayer from 'react-player';

import Sound from 'react-sound';
import { connect } from 'react-redux';

import { 
    nowPlayingActions,
    queueActions
  } from '../actions/actions.js';

const mapStateToProps = (state, props) => ({
    queue: state.queue,
    nowPlaying: state.nowPlaying,
    settings: state.settings
});

const mapDispatchToProps = {
    endPlayback: nowPlayingActions.endPlayback,
    setDuration: nowPlayingActions.setDuration,
    updateTime: nowPlayingActions.updateTime,
    setPlaying: nowPlayingActions.setPlaying,
    setBuffer: nowPlayingActions.setBuffer,
    setSeek: nowPlayingActions.setSeek,
    setLoading: nowPlayingActions.setLoading,
    play: nowPlayingActions.play,
    setCurrentSrc: nowPlayingActions.setCurrentSrc,

    setQueue: queueActions.setQueue
};

class AudioPlayerBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingSrc: false,
            id: undefined,
            src: undefined,
            active: undefined,
            error: false,
            lastSeekTime: null
        };
        this.handleProgress = this.handleProgress.bind(this);
        this.handleOnDuration = this.handleOnDuration.bind(this);
        this.handleOnSeek = this.handleOnSeek.bind(this);
    }
    
    ref = (player) => {
        this.player = player
    }

    nextSong() {
        if(this.state.error) {
            console.log("handled error, restarting");
            let t = this.props.nowPlaying.currentTime;
            let queue = this.props.queue;
            let current = this.props.nowPlaying.current;
            this.props.endPlayback();
            this.props.setPlaying(queue[current], current);
            this.props.seekTo(t)
        } else {
            if(this.props.settings.loop === 2) {
                this.props.seekTo(0);
            } else {
                const current = this.props.nowPlaying.current;
                const queue = this.props.queue;
                if(current === queue.length - 1) {
                    if(this.props.settings.loop === 1) {
                        this.props.setPlaying(0, queue[0]);
                    } else {
                        this.props.endPlayback();
                        this.props.setQueue([]);
                    }
                } else {
                    this.props.setPlaying(queue[current + 1], current + 1);
                }
            }
        }
    }

    componentWillUnmount() {
        if(this.seekTimer) {
            for(let i = 0; i < this.seekTimer.length; i++) {
                clearInterval(this.seekTimer[i]);
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {

        if(this.state.loadingSrc) return;
        if(this.props.nowPlaying.audio === undefined) return;

        if(this.props.nowPlaying.seekTo !== undefined) {
            this.player.seekTo(this.props.nowPlaying.seekTo, false);
            if(!this.seekTimer) {
                this.seekTimer = [];
            }
            this.seekTimer.push(setInterval(() => {
                let seekTo = Math.round(this.props.nowPlaying.seekTo);
                let lastSeekTime = Math.round(this.state.lastSeekTime);
                if(seekTo === lastSeekTime || !this.props.nowPlaying.seekTo) {
                    this.props.setSeek(undefined);
                    this.props.setLoading(false);
                    this.props.play();
                    for(let i = 0; i < this.seekTimer.length; i++) {
                        clearInterval(this.seekTimer[i]);
                    }
                } else {
                    if(this.props.nowPlaying.seekTo) {
                        this.player.seekTo(this.props.nowPlaying.seekTo, false);
                    }
                }
            },500));
        }

        let shouldUpdate = false;
        if(prevState.id === undefined) {
            shouldUpdate = true;
        } else {
            if(prevState.id !== this.props.nowPlaying.audio.id) {
                shouldUpdate = true;
            } else {
                if(prevState.active !== this.props.nowPlaying.audio.activeAudio) {
                    shouldUpdate = true;
                }
            }
        }
        if(shouldUpdate) {
            this.setState({loadingSrc: true});
            if(this.props.nowPlaying.playing) {
                let url;
                if(this.props.nowPlaying.audio.audios) {
                    if(this.props.nowPlaying.audio.audios.length > 1) {
                        let a = this.props.nowPlaying.audio.activeAudio === undefined ?
                            0 : this.props.nowPlaying.audio.activeAudio
                        url = this.props.nowPlaying.audio.audios[a];
                    } else {
                        url = this.props.nowPlaying.audio.audios[0];
                    }
                }
                fetch("/api/gwa/getSource/", {
                    method: 'POST',
                    body: JSON.stringify({
                        url
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(res => res.json())
                .then(response => {
                    this.setState({
                        loadingSrc: false,
                        src: response.src,
                        id: this.props.nowPlaying.audio.id
                    });
                    this.props.setCurrentSrc(response.src);
                    if(this.props.nowPlaying.audio.audios.length > 1) {
                        this.setState({
                            active: this.props.nowPlaying.audio.activeAudio
                        });
                    }
                });
            } else {
                return null;
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(nextProps.nowPlaying.playing === this.props.nowPlaying.playing
            && nextProps.nowPlaying.currentTime === this.props.nowPlaying.currentTime
            && nextState.src === this.state.src) {
                return false;
        } else {
            return true;
        }
    }

    handleProgress(state) {
        this.props.updateTime(state.playedSeconds);
        this.props.setBuffer(state.loadedSeconds);
    }

    handleOnDuration(e) {
        this.props.setDuration(e);
    }

    handleOnSeek(e) {
        this.setState({lastSeekTime: e});
    }

    render() {

        if(this.state.src === undefined) return null;

        let volume = this.props.settings.volume;
        volume = Math.min(Math.max(0, volume), 1);

        return(
            <ReactPlayer
                ref={this.ref}
                loop={this.props.settings.loop === 2}
                progressInterval={1000}
                onProgress={this.handleProgress}
                playing={this.props.nowPlaying.playing} 
                onDuration={this.handleOnDuration}
                controls={false}
                onSeek={this.handleOnSeek}
                volume={this.props.settings.muted ? 
                    0 : volume}
                url={"/api/gwa/audio?src=" + this.state.src} 
                onEnded={() => this.nextSong()}
                />
        )
    }
}

const AudioPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AudioPlayerBind);

export default AudioPlayer;
