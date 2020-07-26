import React, { Component } from 'react';

import '../../css/loading.css';

class Loading extends Component {
    render() {
        return(
            <div className="loading">
                <div className="loading-inner">
                    <div className="loading-ball"></div>
                    <div className="loading-ball"></div>
                    <div className="loading-ball"></div>
                    <div className="loading-ball"></div>
                </div>
            </div>
        )
    }
}

export default Loading;