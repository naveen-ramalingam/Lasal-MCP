if (!jsPanel.log) {
    let loglevel = 1;

    const levels = {
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        off: 0
    };

    jsPanel.log = {
        version: '1.0.0',
        date: '2025-08-20',
        debug: function (...args) {
            if (loglevel < levels.debug) return;
            console.log('[jsPanel]', ...args);
        },
        info: function (...args) {
            if (loglevel < levels.info) return;
            console.info('[jsPanel]', ...args);
        },
        warn: function (...args) {
            if (loglevel < levels.warn) return;
            console.warn('[jsPanel]', ...args);
        },
        error: function (...args) {
            if (loglevel < levels.error) return;
            console.error('[jsPanel]', ...args);

        },
        setLoglevel: function (level) {
            if (Number.isInteger(level) === false) return;
            loglevel = level;
        },
        levels: levels
    };
} else {
    console.error('[jsPanel] Could not extend "jsPanel.log"');
}