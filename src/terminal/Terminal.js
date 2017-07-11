import React, { Component } from 'react';
import CommandList from '../commandList/CommandList';

import './Terminal.css';

class Terminal extends Component {
    render() {
        return (
            <div className="terminal">
                <div className="terminal-header">
                    <div className="terminal-header__button button-red"></div>
                    <div className="terminal-header__button button-yellow"></div>
                    <div className="terminal-header__button button-green"></div>
                </div>
                <div className="terminal-window">
                    <CommandList commands={this.props.commands}/>
                </div>
            </div>
        );
    };
}

export default Terminal;
