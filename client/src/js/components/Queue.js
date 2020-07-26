import React, { Component } from 'react';
import '../../css/queue.css';

import { connect } from 'react-redux';

import { 
    nowPlayingActions,
    queueActions
} from '../actions/actions.js';

const mapStateToProps = (state, props) => ({
    queue: state.queue,
    nowPlaying: state.nowPlaying
});

const mapDispatchToProps = {
    removeFromQueue: queueActions.removeFromQueue,
    setPlaying: nowPlayingActions.setPlaying,
    setActive: nowPlayingActions.setActive
};

class QueueBind extends Component {

    playItem(audio, index) {
        this.props.setActive(index);
        this.props.setPlaying(audio, index);
    }

    render() {
        if(!this.props.visible) return null;
        return(
            <div className="queue">
                <div className="queue-header">
                    Play Queue
                </div>
                <div className="queue-items">
                    {
                        this.props.queue.map((item, index) => 
                        <div className={index === this.props.nowPlaying.current ? 
                            "queue-audio-item queue-audio-item-active" 
                            : "queue-audio-item"}
                            key={index}
                            index={index}
                            onClick={() => this.playItem(item, index)}>
                            <div 
                                className="queue-audio-title"
                                dangerouslySetInnerHTML={{
                                    __html: item.title
                                }}>
                            </div>
                            {
                               item.audios.length > 1 ?
                                <div className="queue-audio-active">
                                    {
                                        item.audios[item.activeAudio]
                                    }
                                </div> : null
                            }
                            <div className="queue-audio-artist">
                                {item.author}
                            </div>
                        </div>
                        )
                    }
                    {
                        this.props.queue.length === 0 ?
                        <div className="no-queue-items">
                            Nothing is in the queue!
                        </div> : null
                    }
                </div>
                
            </div>
        )
    }
}

const Queue = connect(
    mapStateToProps,
    mapDispatchToProps
)(QueueBind);

export default Queue;