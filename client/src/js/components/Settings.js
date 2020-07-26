import React, { Component } from 'react';
import '../../css/settings.css';

import storageAvailable from '../checkStorage.js';

import { connect } from 'react-redux';
import { 
  settingsActions
} from '../actions/actions.js';

const mapStateToProps = (state, props) => ({
    settings: state.settings
});

const mapDispatchToProps = {
    toggleDarkmode: settingsActions.toggleDarkmode
}

class SettingsBind extends Component {
    toggleDarkmode() {
        const before = this.props.settings.darkMode;
        this.props.toggleDarkmode(!before);
        if(storageAvailable('localStorage')) {
            localStorage['darkMode'] = !before;
        }
    }
    render() {
        return(
            <div className="settings-panel">
                <div className="settings-row">
                    <div className="settings-label">
                        Dark Mode
                    </div>
                    <div className="settings-control">
                        <div 
                            className={
                                this.props.settings.darkMode ?
                                "switch-container switch-container-active" : 
                                "switch-container"
                            }
                            onClick={() => this.toggleDarkmode()}>
                            <div className="switch-container-inner">
                                <div className="switch">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const Settings = connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsBind);

export default Settings;