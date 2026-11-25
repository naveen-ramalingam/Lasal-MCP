'use strict';


if (!jsPanel.hideonclose) {

    jsPanel.hideonclose = {

        version: '1.0.3',
        date: '2025-08-28 13:00',

        close: function (callback, panel, closedByUser) {
            panel.hide(callback, panel, closedByUser);
        }
    };

    const log = window.jsPanel.log;

    jsPanel.globalCallbacks = (!jsPanel.globalCallbacks) ? [] : jsPanel.globalCallbacks;

    jsPanel.globalCallbacks.push((panel) => {

        if (panel.options.hideOnClose) {
            panel.close = (callback, closedByUser) => {
                jsPanel.hideonclose.close(callback, panel, closedByUser);
            };
        }
        if (panel.content.dir) {
            panel.content.removeAttribute('dir');
        }
    });

    if (!jsPanel.show) {
        jsPanel.extend({
            show: function () {
                const panel = this;
                if (panel instanceof HTMLElement) {
                    if (panel.hidden) {
                        const options = panel.options;
                        const jspanelloaded = new CustomEvent('jspanelloaded', {
                            detail: options.id,
                            cancelable: true
                        });
                        jspanelloaded.panel = panel;
                        if (panel.options.animateIn && typeof panel.animateIn === 'function') {
                            panel.animateIn();
                        }
                        if (panel.options.autoclose && typeof panel.options.autoclose.time === 'number') {
                            panel.closetimer = setTimeout(() => {
                                panel.close();
                            }, panel.options.autoclose.time);
                        }

                        panel.style.display = 'flex';
                        panel.hidden = false;
                        if (panel.options.paneltype === 'modal') {
                            const md = document.getElementById(`jsPanel-modal-backdrop-${panel.id}`);
                            if (panel.options.modalAnimateIn)
                                md.classList.add(panel.options.modalAnimateIn);

                            md.style.display = 'block';
                            jsPanel.modal.ziModal.toFront(panel, panel.options.sigLayer);
                        } else {
                            panel.front();
                        }

                        switch (panel.status) {
                            case 'minimized':
                                panel.normalize();
                                break;
                            case 'normalized':
                                panel.resize(`${panel.currentData.width} ${panel.currentData.height}`);
                                break;
                        }


                        document.dispatchEvent(jspanelloaded);
                    }
                } else {
                    log.error('jsPanel.hideonclose.show: Panel is no valid HTML Element');
                }
            }
        });
    } else {
        log.error('jsPanel.hideonclose.show: Could not extend .show() method');
    }

    if (!jsPanel.hide) {
        jsPanel.extend({
            hide: function (callback, panel, closedByUser) {
                if (panel instanceof HTMLElement) {
                    if (!panel.hidden) {
                        const options = panel.options;
                        const jspanelbeforeclose = new CustomEvent('jspanelbeforeclose', {
                            detail: options.id,
                            cancelable: true
                        });
                        const jspanelcloseduser = new CustomEvent('jspanelcloseduser', {
                            detail: options.id,
                            cancelable: true
                        });
                        const jspanelclosed = new CustomEvent('jspanelclosed', {
                            detail: options.id,
                            cancelable: true
                        });
                        [jspanelbeforeclose, jspanelcloseduser, jspanelclosed].forEach((evt) => {
                            return evt.panel = panel;
                        });
                        const closetimer = panel.closetimer;

                        const doClose = () => {
                            panel.style.display = 'none';
                            panel.hidden = true;
                            const panelId = options.id;

                            if (closetimer) {
                                window.clearTimeout(closetimer);
                            }


                            if (panel.removeOnClose) {
                                panel.closeChildpanels();
                                if (panel.parentElement) {
                                    panel.parentElement.removeChild(panel);
                                }
                                if (document.querySelector('#' + panelId)) {
                                    return false;
                                }
                            }

                            panel.removeMinimizedReplacement();

                            if (closedByUser) {
                                document.dispatchEvent(jspanelcloseduser);
                            }

                            document.dispatchEvent(jspanelclosed);

                            if (callback instanceof Function) {
                                callback.call(panelId, panelId);
                            }

                            if (options.onclosed) {
                                jsPanel.processCallbacks(panel, options.onclosed, 'every');
                            }

                            jsPanel.autopositionRemaining(panel);

                        };

                        document.dispatchEvent(jspanelbeforeclose);
                        panel.statusBefore = panel.status;
                        if (options.onbeforeclose && options.onbeforeclose.length > 0 && !jsPanel.processCallbacks(panel, options.onbeforeclose)) {
                            return panel;
                        }

                        if (options.animateOut && typeof panel.animateOut === 'function' && (panel.status === 'normalized' || panel.status === 'maximized')) {
                            panel.animateOut().then(() => doClose());
                        } else {
                            doClose();
                        }
                    }
                } else {
                    log.error('jsPanel.hideonclose.hide: Panel is no valid HTML Element');
                }
            }
        });
    } else {
        log.error('jsPanel.hideonclose.hide: Could not extend .hide() method');
    }
    log.info(`Loaded "jspanel.hideonclose" plugin ${jsPanel.hideonclose.version}`);
} else {
    window.jsPanel.log.error('Could not extend "jsPanel.hideonclose"');
}