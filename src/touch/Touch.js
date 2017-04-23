// external
import React, { Component } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
// style
import './Touch.css';






class Touch extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ongoingTouchMap: Map(),
            lastTouchKey: 0,
        };
        this._addTouches = this._addTouches.bind(this);
    }


    // helper
    _addTouches(touchesToAdd) {
        eachTouch(touchesToAdd, (newTouch) => {
            const touchId = newTouch.identifier;
            const oldTouch = this.state.ongoingTouchMap.get(touchId);
            if (oldTouch) {
                console.log('old touch');
                const key = oldTouch.get('key');
                const oldTouchCoords = oldTouch.get('touchCoords');
                const newOngoingTouchMap = this.state.ongoingTouchMap.setIn([touchId, 'touchCoords'], newTouch);
                this.setState({ongoingTouchMap: newOngoingTouchMap});
            } else {
                console.log('new touch');
                const newOngoingTouchMap = this.state.ongoingTouchMap.set(touchId, Map({
                    touchCoords: newTouch,
                    key: this.state.lastTouchKey + 1
                }));
                this.setState({ongoingTouchMap : newOngoingTouchMap, lastTouchKey: this.state.lastTouchKey + 1})
            }
        });
    }

    render() {
        return (
            <div className="canvas-container">
            </div>

        );
    }
}

Touch.propTypes = {
};

const mapStateToProps = (state) => ({
    selection: state.modeReducer.get('selection')
});

const mapDispatchToProps = (dispatch) => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(Touch);
