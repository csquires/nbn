export const SHOULD_SPEAK_ON_KEY_PRESS  = false;
export const SHOULD_SPEAK_ON_BUTTON_PRESS = false;
export const SHOULD_SPEAK_ON_VOICE_COMMAND  = true;
export const SHOULD_CONNECT = (mouse) => mouse.get('downX') && !mouse.get('ctrlKey');