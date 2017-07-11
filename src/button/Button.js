import React, { Component } from 'react';

import './Button.css';

class Button extends Component {
    render() {
        return (
            <a href={this.props.button.link} rel="noopener noreferrer" target="_blank" className="button">
                {this.props.button.text}
            </a>
        );
    };
}

export default Button;
