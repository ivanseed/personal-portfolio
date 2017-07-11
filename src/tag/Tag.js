import React, { Component } from 'react';

import './Tag.css';

class Tag extends Component {
    render() {
        return (
            <span className="tag">{this.props.tag.text}</span>
        )
    }
}

export default Tag;