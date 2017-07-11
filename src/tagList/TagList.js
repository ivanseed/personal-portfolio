import React, { Component } from 'react';
import Tag from '../tag/Tag';

import './TagList.css';

class TagList extends Component {
    render() {
        return (
            <div className="tags">
                {this.props.tags.map((tag, key) => {
                    return <Tag tag={tag} key={key} />
                })}
            </div>
        );
    };
}

export default TagList;
