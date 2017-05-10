export const SHOULD_SPEAK_ON_KEY_PRESS  = false;
export const SHOULD_SPEAK_ON_BUTTON_PRESS = false;
export const SHOULD_SPEAK_ON_VOICE_COMMAND  = true;
export const SHOULD_CONNECT = ({mouse, touch}) => {
    if (mouse)  {
        return mouse.get('downX') && !mouse.get('ctrlKey');
    } else if (touch) {
        return !touch.get('isLong');
    } else return false;
};