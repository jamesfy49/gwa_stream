import React, { Component } from 'react';

import AudioItem from './AudioItem.js';
import Loading from './Loading.js';

import '../../css/browse.css';
import categories from '../../categories_list.js';

import search from '../../images/search.png';
import searchwhite from '../../images/search-white.png';
import down from '../../images/down.png';
import downwhite from '../../images/down-white.png';

import { connect } from 'react-redux';

const mapStateToProps = (state, props) => ({
    browse: state.browse,
    settings: state.settings
});

const sortModes = [
    "Hot",
    "New",
    "Top",
    "Relevant"
];

const timeModes = [
    "Past Hour",
    "Past 24 Hours",
    "Past Week",
    "Past Month",
    "Past Year",
    "All Time"
]

class DropdownOptions extends Component {
    render() {
        if(!this.props.visible) return null;
        return(
            <div className="dropdown-options">
                {
                    this.props.options.map((o, index) => 
                    <div
                        className="dropdown-option"
                        onClick={() => this.props.update(o)}
                        key={index}>
                        {o}
                    </div>    
                    )
                }
            </div>
        )
    }
}

class LoadingSmall extends Component {
    render(){
        return(
            <div className="loading-more-outer">
                <div className="loading-more-section">
                    <div className="loading-more-bubble"></div>
                </div>
                <div className="loading-more-section">
                    <div className="loading-more-bubble"></div>
                </div>
                <div className="loading-more-section">
                    <div className="loading-more-bubble"></div>
                </div>
                <div className="loading-more-section">
                    <div className="loading-more-bubble"></div>
                </div>
            </div>
        )
    }
}

class BrowseBind extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sortVisible: false,
            timeVisible: false,
            loading: false,
            loadingMore: false,
            sort: 'Hot',
            time: 'Past Week',
            search: '',
            categories: [],
            activeCategories: [],
            results: [],
            after: ''
        }
        this.updateSort = this.updateSort.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.updateSearch = this.updateSearch.bind(this);
        this.handleKey = this.handleKey.bind(this);
    }

    componentDidMount() {
        this.setState({
            categories
        });
        this.getResults();
        return;
    }

    categoryActive(category) {
        return this.state.activeCategories.indexOf(category) !== -1;
    }

    toggleCategory(category) {
        if(!this.categoryActive(category)) {
            this.setState({
                activeCategories: [...this.state.activeCategories, category]
            });
        } else {
            this.setState({
                activeCategories: this.state.activeCategories.filter(c => 
                    c !== category    
                )
            });
        }
        return;
    }

    toggleDropdown(which) {
        if(which === "time") {
            this.setState({timeVisible:!this.state.timeVisible});
        } else {
            this.setState({sortVisible:!this.state.sortVisible});
        }
        return;
    }

    updateTime(time) {
        this.setState({
            time,
            timeVisible:false
        });
    }

    updateSort(sort) {
        this.setState({
            sort,
            sortVisible:false
        });
    }

    updateSearch(e) {
        this.setState({
            search:e.target.value
        });
    }

    handleKey(e) {
        if(e.which === 13) {
            this.getResults(false);
        } else {
            return;
        }
    }

    getResults(extend) {
        if(!extend) {
            this.setState({
                loading: true,
                results: []
            });
        } else {
            this.setState({
                loadingMore:true
            });
        }
        fetch("/api/gwa/browse/", {
            method: 'POST',
            body: JSON.stringify({
                after: extend ? this.state.after : '',
                categories: this.state.activeCategories,
                search: this.state.search,
                sort: this.state.sort,
                time: this.state.time
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(response => {
            if(extend) {
                this.setState({
                    loadingMore: false,
                    after: response.after,
                    results: [...this.state.results, ...response.results]
                });
            } else {
                this.setState({
                    loading: false,
                    results: response.results,
                    after: response.after
                });
            }
        });
    }

    render() {
        const dropdownimg = this.props.settings.darkMode ? downwhite : down;
        return (
            <div className="browse">
                <div className="browse-inner">

                    <div className="categories">
                        {
                            this.state.categories.map((c, index) => 
                                <div 
                                    className={
                                        this.categoryActive(c) ?
                                            "category category-active"
                                            :
                                            "category"
                                    }
                                    key={index}
                                    onClick={() => this.toggleCategory(c)}>
                                        {c}
                                </div>
                            )
                        }
                    </div>

                    <div className="content">

                        <div className="search">
                            <div className="search-box">
                                <div className="search-img">
                                    <img src={
                                        this.props.settings.darkMode ?
                                        searchwhite : search
                                    } alt="search"/>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    maxLength="1000"
                                    onChange={this.updateSearch}
                                    onKeyUp={this.handleKey}/>
                            </div>
                        </div>

                        <div className="filter">

                            <div className="filter-item filter-label">
                                Sort by:
                            </div>
                            
                            <div className="filter-item dropdown-outer">
                                <div 
                                    className="dropdown-selected"
                                    onClick={
                                        () => this.toggleDropdown("sort")
                                    }>
                                    <div className="selected-option">
                                        {this.state.sort}
                                    </div>
                                    <div className="dropdown-arrow">
                                        <img src={dropdownimg} alt="select"/>
                                    </div>
                                </div>
                                <DropdownOptions
                                    visible={this.state.sortVisible}
                                    options={sortModes}
                                    update={this.updateSort} />
                            </div>
                            
                            <div className="filter-item filter-label">
                                Posts from:
                            </div>
                            
                            <div className="filter-item dropdown-outer">
                                <div 
                                    className="dropdown-selected"
                                    onClick={
                                        () => this.toggleDropdown("time")
                                    }>
                                    <div className="selected-option">
                                        {this.state.time}
                                    </div>
                                    <div className="dropdown-arrow">
                                        <img src={dropdownimg} alt="select"/>
                                    </div>
                                </div>
                                <DropdownOptions
                                    visible={this.state.timeVisible}
                                    options={timeModes}
                                    update={this.updateTime} />
                            </div>
                            
                            <div className="filter-item execute-filter">
                                <div 
                                    className="execute-filter-button"
                                    onClick={() => this.getResults(false)}>
                                    Go
                                </div>
                            </div>
                        </div>
                        
                        <div className="results">
                            {
                                this.state.results.map((audio, index) => 
                                    <AudioItem audio={audio} key={audio.id} index={index}/>  
                                )
                            }
                            {
                                (
                                    this.state.results.length === 0 
                                    && (this.state.search !== '' || this.state.categories.length > 0)
                                    && !this.state.loading) ?
                                    <div className="no-results">
                                        <div className="no-results-inner">
                                            <div className="no-results-shrug">¯\_(ツ)_/¯</div>
                                            <div className="no-results-text">
                                                No results
                                            </div>
                                        </div>
                                    </div> : null
                            }
                            {
                                this.state.results.length > 0
                                && this.state.after !== null ?
                                <div className="load-more-outer">
                                    {
                                        !this.state.loadingMore ?
                                        <div 
                                            className="load-more-button"
                                            onClick={() => this.getResults(true)}>
                                            Load More
                                        </div> : null
                                    }
                                    <LoadingSmall />
                                </div> : null
                            }
                        </div>
                        {
                            this.state.loading ?
                            <div className="loading-outer">
                                <Loading />
                            </div> : null
                        }
                    </div>

                </div>
            </div>
        )
    }
}

const Browse = connect(
    mapStateToProps,
    null
)(BrowseBind);

export default Browse;