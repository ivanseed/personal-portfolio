import React, { Component } from 'react';

import './Command.css';

class Command extends Component {
    render() {
        let resultData;

        if (this.props.command.results) {
            resultData = [];
            const resultsCount = Object.keys(this.props.command.results).length;
            for (let i = 0; i < resultsCount; i++) {
                let result = this.props.command.results[i];
                let formattedResult = [];

                formattedResult.push('"');
                if (result.download) {
                  formattedResult.push(<a key={i} className="command-result__link" download={result.download} href={result.link}>{result.data}</a>);
                } else if (result.link) {
                    formattedResult.push(<a key={i} className="command-result__link" rel="noopener noreferrer" target="_blank" href={result.link}>{result.data}</a>);
                } else {
                    formattedResult.push(result.data);
                }

                formattedResult.push('"');

                if (i < resultsCount - 1) {
                    formattedResult.push(', ');
                }

                resultData.push(formattedResult);
            }

            if (resultsCount > 1) {
                resultData.unshift('[');
                resultData.push(']');
            }
        }
        return (
            <div className="command">
                <div className="command-argument">{this.props.command.argument}</div>
                <div className="command-result">{resultData}</div>
            </div>
        );
    };
}

export default Command;
