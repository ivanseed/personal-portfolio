import React, { Component } from 'react';
import Command from '../command/Command';

import './CommandList.css';

class CommandList extends Component {
    render() {
        return (
            <div className="commands">
                {this.props.commands.map((command, key) => {
                    return <Command command={command} key={key} />
                })}
                <div className="command">
                    <div className="command-argument">
                        <span className="terminal-indicator">&nbsp;</span>
                    </div>
                </div>
            </div>
        );
    };
}

export default CommandList;
