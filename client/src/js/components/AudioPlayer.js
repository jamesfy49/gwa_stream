import React, { Component } from 'react';

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
    seekTo: nowPlayingActions.seekTo,
    setBuffer: nowPlayingActions.setBuffer,

    setQueue: queueActions.setQueue
};

class AudioPlayerBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingSrc: false,
            id: undefined,
            src: undefined,
            active: undefined
        };
        this.handleOnPlaying = this.handleOnPlaying.bind(this);
        this.handleOnLoading = this.handleOnLoading.bind(this);
    }

    nextSong() {
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

    handleOnPlaying(e) {
        this.props.setDuration(e.duration);
        this.props.updateTime(e.position);
    }

    handleOnLoading(e) {
        let total = 0;
        for(let i = 0; i < e.buffered.length; i++) {
            let elapsed = e.buffered[i].end - e.buffered[i].start;
            total += elapsed;
        }
        this.props.setBuffer(total);
        this.props.setDuration(e.duration);
    }

    componentDidUpdate(prevProps, prevState) {
        /*
        Object.entries(this.props).forEach(([key, val]) =>
            prevProps[key] !== val && console.log(`Prop '${key}' changed`)
        );
        if (this.state) {
            Object.entries(this.state).forEach(([key, val]) =>
            prevState[key] !== val && console.log(`State '${key}' changed`)
            );
        }
        */
        if(this.state.loadingSrc) return;
        if(this.props.nowPlaying.audio === undefined) return;
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
                if(this.props.nowPlaying.audio.audios.length > 1) {
                    url = this.props.nowPlaying.audio.audios[this.props.nowPlaying.audio.activeAudio];
                } else {
                    url = this.props.nowPlaying.audio.audios[0];
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

    render() {
        /*if(!this.props.nowPlaying.playing) return null;
        console.log("PLAYING FROM TIME: " + this.props.nowPlaying.currentTime);
        */
        if(this.state.src === undefined) return null;
        return(
            <Sound
                url={"/api/gwa/audio?src=" + this.state.src}
                playStatus={this.props.nowPlaying.playing ?
                    Sound.status.PLAYING : Sound.status.PAUSED}
                playFromPosition={this.props.nowPlaying.currentTime}
                volume={this.props.settings.muted ? 
                    0 :this.props.settings.volume}
                onLoading={this.handleOnLoading}
                whileLoading={this.handleOnLoading}
                onPlaying={this.handleOnPlaying}
                stream={true}
                onFinishedPlaying={() => this.nextSong()} />
        )
    }
}

const AudioPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AudioPlayerBind);

export default AudioPlayer;