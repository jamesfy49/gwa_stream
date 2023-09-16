import React, { Component } from 'react';
import Loading from './Loading';
import "../../css/loadingaudio.css";

class LoadingAudio extends Component {
    render() {
        return (
            <div className="loading-audio">
                <div className="loading-audio-caption">
                    Loading audio, please be patient... (It may take a minute)
                </div>
                <Loading />
            </div>
        )
    }
}

export default LoadingAudio;