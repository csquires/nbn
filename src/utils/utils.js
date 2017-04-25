export const listenFor = (commands) => ({transcript, resetTranscript}) => {
    for (const command of commands) {
        if (transcript.toLowerCase().includes(command.command)) {
            command.action();
            resetTranscript();
            break;
        }
    }
};


const closeMatchMap = {
    'yo alex': ['no alex', 'young alex', 'your alex', "you're alex"],
    'delete': ['three'],
    'connect': ['max', 'maps', 'black']
};

export const includesCloseMatch = (transcript, speechToFind) => {
    if (transcript.includes(speechToFind)) return true;
    const matches = closeMatchMap[speechToFind];
    matches && matches.forEach((match) => {
        if (transcript.includes(match)) return true;
    });
    return false;
};
