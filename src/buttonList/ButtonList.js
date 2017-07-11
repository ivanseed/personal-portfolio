import React, { Component } from 'react';
import Button from '../button/Button';

import './ButtonList.css';

class ButtonList extends Component {
    render() {
        return (
            <div className="buttons">
                {this.props.buttons.map((button, key) => {
                    return <Button button={button} key={key} />
                })}
            </div>
        );
    };
}

export default ButtonList;
