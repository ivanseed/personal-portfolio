import React, { Component } from 'react';
import Tile from '../tile/Tile';

import './TileList.css';

class TileList extends Component {
    render() {
        return (
            <div className="tiles">
                {this.props.tiles.map((tile, key) => {
                    return <Tile tile={tile} key={key} />
                })}
            </div>
        );
    };
}

export default TileList;
