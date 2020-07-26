import React, { Component } from 'react';
import '../../css/info.css';

import github from '../../images/github.png';
import githubwhite from '../../images/github-white.png';
import palette from '../../images/palette.png';
import palettewhite from '../../images/palette-white.png';

import { connect } from 'react-redux';
const mapStateToProps = (state, props) => ({
    settings: state.settings
});

class InfoBind extends Component {
    render() {
        return (
            <div className="info-panel">
                <div className="info-panel-inner">
                    <div className="info-title">
                        GWAStream
                    </div>
                    <div className="info-description">
                        Web application for browsing, streaming, and
                        creating playlists from the content of 
                        <a href="https://reddit.com/r/gonewildaudio">
                             r/gonewildaudio
                        </a>
                    </div>
                    <div className="info-links">
                        <div className="info-link-item info-link-github">
                            <a 
                                title="Github"
                                href="https://github.com/jamesfy49/gwa_stream"
                                target="__blank">
                                <img src={
                                    this.props.settings.darkMode ?
                                    githubwhite : github
                                }
                                    alt="Github" />
                            </a>
                        </div>
                        <div 
                            className="info-link-item info-link-icons8"
                            target="__blank">
                            <a 
                                title="Icons"
                                href="https://icons8.com"
                                target="_blank">
                                <img src={
                                    this.props.settings.darkMode ?
                                    palettewhite : palette
                                } 
                                    alt="Icons8"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Info = connect(
    mapStateToProps,
    null
)(InfoBind);

export default Info;