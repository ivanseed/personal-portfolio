import React, { Component } from 'react';
import ContactLink from '../contactLink/ContactLink';

import './Contact.css';

class Contact extends Component {
    render() {
        const emailLink = `mailto:${this.props.contact.email}`;
        const email = <a href={emailLink} rel="noopener noreferrer" target="_blank" >{this.props.contact.email}</a>;
        return (
          <div className="contact">
            <h3>Say {email}</h3>
            <div className="contact-links">
                {this.props.contact.links.map((link, key) => {
                    return <ContactLink link={link} key={key} />
                })}
            </div>
          </div>
        )
    }
}

export default Contact;