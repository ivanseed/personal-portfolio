import React, { Component } from 'react';

import './ContactLink.css';

class ContactLink extends Component {
    render() {
        return (
          <div className="contact-link">
              <a href={this.props.link.link} rel="noopener noreferrer" target="_blank">
                  <img src={this.props.link.icon} draggable="false" height="50px" alt={this.props.link.link} />
              </a>
          </div>
        )
    }
}

export default ContactLink;
