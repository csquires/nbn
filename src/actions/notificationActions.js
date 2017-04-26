// external
import Notifications from 'react-notification-system-redux';
// other
import * as modeActions from '../actions/modeActions';

export const showHint = (commandName) => {
    return (dispatch, getState) => {
        const command = getState().commandReducer.getIn(['commands', commandName]);
        const hintTitle = command.get('title');
        const hintText = command.get('hint_text');
        const shouldShow = command.getIn(['hint_settings', 'should_show']);
        const alreadyShowing = command.getIn(['hint_settings', 'showing']);

        if (shouldShow && !alreadyShowing) {
            dispatch(modeActions.setHintSettings(commandName, {showing: true}));
            dispatch(Notifications.success({
                title: hintTitle,
                message: hintText,
                position: 'tr',
                autoDismiss: 0,
                action: {
                    label: "Don't show me this again",
                    callback: () => dispatch(modeActions.setHintSettings('connect', {show: false}))
                }
            }))
        }
    }
};