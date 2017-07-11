import React, { Component } from 'react';
import TagList from '../tagList/TagList';
import ButtonList from '../buttonList/ButtonList';

import './Tile.css';

class Tile extends Component {
    render() {
        return (
            <div className="tile">
                <div className="tile-image">
                    <img className="tile-image__image" src={this.props.tile.image.source} alt={this.props.tile.image.alt} height="500px" />
                </div>
                <div className="tile-image-splitter"></div>
                <div className="tile-content">
                    <h3>{this.props.tile.title}</h3>
                    <p>{this.props.tile.description}</p>
                    <TagList tags={this.props.tile.tags}/>
                    <ButtonList buttons={this.props.tile.buttons}/>
                </div>
            </div>
        )
    }
}

export default Tile;