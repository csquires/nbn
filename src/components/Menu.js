// external
import React, {Component} from 'react';
// components
// other
import * as utils from '../utils/utils';


class Menu extends Component {
    render() {
        const w = (decimal) => decimal*this.props.width;
        const h = (decimal) => decimal*this.props.height;


        return (
            <g>
                {
                    this.props.menuItems.map(({xd,yd,widthd,heightd,text,onClick}) => {
                        const [x1,y1] = [this.props.xt + xd*w(1), this.props.yt + yd*h(1)];
                        const [width, height] = [w(widthd), h(heightd)];
                        return (
                            <g
                                className="menu-item"
                                onMouseDown={utils.onLeftClick(onClick)}
                                onMouseUp={utils.stopPropagation}
                            >
                                <rect
                                    x={x1}
                                    y={y1}
                                    width={width}
                                    height={height}
                                >

                                </rect>
                                {
                                    text ?
                                        <text
                                            x={x1+width/2}
                                            y={y1+height}
                                            textAnchor="middle"
                                        > {text } </text> :
                                        null
                                }
                            </g>
                        )
                    })
                }
            </g>
        )
    }
}

const menuItemPropType = React.PropTypes.shape({
    xd: React.PropTypes.number,
    yd: React.PropTypes.number,
    widthd: React.PropTypes.number,
    heightd: React.PropTypes.number,
    text: React.PropTypes.string,
    onClick: React.PropTypes.func
});
Menu.propTypes = {
    xt: React.PropTypes.number.isRequired,
    yt: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    menuItems: React.PropTypes.arrayOf(
        menuItemPropType
    )
};
export default (Menu);