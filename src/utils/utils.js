export const listenFor = (commands) => (transcript, resetTranscript) => {
    for (const command of commands) {
        if (transcript.toLowerCase().includes(command.command)) {
            command.action();
            resetTranscript();
            break;
        }
    }
};

