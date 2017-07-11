import React, { Component } from 'react';
import scroll from 'smoothscroll-polyfill';

import './Navbar.css';

class Navbar extends Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        scroll.polyfill();

        console.log(event.currentTarget.innerHTML);
        const element = document.getElementById(event.currentTarget.innerHTML);

        if (element) {
            element.scrollIntoView({behavior: 'smooth'});
        }
    }

    render() {
        return (
            <div className="navbar">
                <div className="logo">
                    <div className="logo-header">
                        <div className="logo-header__button button-red"></div>
                        <div className="logo-header__button button-yellow"></div>
                        <div className="logo-header__button button-green"></div>
                    </div>
                    <div className="logo-window">
                        <span className="logo-window__prefix">$</span>
                        <span className="logo-window__initials">is</span>
                    </div>
                </div>
                <div className="links">
                    <a onClick={this.handleClick} className="link">Projects</a>
                    <a onClick={this.handleClick} className="link">Contact</a>
                </div>
            </div>
        )
    }
}

export default Navbar;