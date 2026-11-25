'use strict';

if (!jsPanel.animations) {
    jsPanel.animations = {
        version: '1.0.0',
        date: '2025-09-10 10:00'
    };

    const log = window.jsPanel.log;

    const EVENT_JSPANEL_ANIMATION_START = 'jspanelanimationstart';
    const EVENT_JSPANEL_ANIMATION_CANCEL = 'jspanelanimationcancel';
    const EVENT_JSPANEL_ANIMATION_END = 'jspanelanimationend';

    const pendingAnimations = new Map();

    let canCancelAnimations = false;
    supportsAnimationCancel().then(supported => canCancelAnimations = supported);

    jsPanel.globalCallbacks = (!jsPanel.globalCallbacks) ? [] : jsPanel.globalCallbacks;
    jsPanel.globalCallbacks.push((panel) => {

        if (!panel.options.animateIn &&
            !panel.options.animateOut &&
            !panel.options.modalAnimateIn &&
            !panel.options.modalAnimateOut) {
            log.debug('No animations applied on', panel.id);
            return;
        }

        const animateInInfo = panel.options.animateIn ? `\n   - animateIn (${panel.options.animateIn})` : '';
        const animateOutInfo = panel.options.animateOut ? `\n   - animateOut (${panel.options.animateOut})` : '';
        const modalAnimateInInfo = panel.options.modalAnimateIn && panel.options.paneltype === 'modal' ? `\n   - modalAnimateIn (${panel.options.modalAnimateIn})` : '';
        const modalAnimateOutInfo = panel.options.modalAnimateOut && panel.options.paneltype === 'modal' ? `\n   - modalAnimateOut (${panel.options.modalAnimateOut})` : '';
        log.debug('Animations applied on', panel.id, animateInInfo, animateOutInfo, modalAnimateInInfo, modalAnimateOutInfo);

        if (panel.options.animateIn) isValidAnimationClass(panel.options.animateIn);
        if (panel.options.animateOut) isValidAnimationClass(panel.options.animateOut);
        if (panel.options.modalAnimateIn) isValidAnimationClass(panel.options.modalAnimateIn);
        if (panel.options.modalAnimateOut) isValidAnimationClass(panel.options.modalAnimateOut);

        panel.options.onbeforeminimize.unshift((panel) => {
            log.debug('onbeforeminimize', panel.id);
            panel.animateStop();
            return panel.options.onbeforeminimize.length === 1 ? true : false;
        });
        panel.options.onbeforemaximize.unshift((panel) => {
            log.debug('onbeforemaximize', panel.id);
            panel.animateStop();
            return panel.options.onbeforemaximize.length === 1 ? true : false;
        });
        panel.options.onbeforesmallify.unshift((panel) => {
            log.debug('onbeforesmallify', panel.id);
            panel.animateStop();
            return panel.options.onbeforesmallify.length === 1 ? true : false;
        });
    });

    if (!jsPanel.animateIn && !jsPanel.animateOut && !jsPanel.animateStop) {
        jsPanel.extend({
            animateIn: function () {
                return animateIn(this);
            },
            animateOut: function () {
                return animateOut(this);
            },
            animateStop: function () {
                return animateStop(this);
            }
        });
    } else {
        log.error('Could not extend jsPanel with the animateIn(), animateOut() and animateStop() methods.');
    }

    document.addEventListener('animationstart', (evt) => {
        const panel = getPanel(evt);
        if (panel === null) return;
        log.debug('animationstart', panel.id, evt.animationName);
        addAnimation(panel, evt.animationName);
        const jspanelanimationstart = new CustomEvent(EVENT_JSPANEL_ANIMATION_START, {
            detail: {
                id: panel.id,
                animationName: evt.animationName,
                sourceEvent: evt
            },
            cancelable: true
        });
        jspanelanimationstart.panel = panel;
        document.dispatchEvent(jspanelanimationstart);
    }, true);

    document.addEventListener('animationiteration', (evt) => {
    }, true);

    document.addEventListener('animationcancel', (evt) => {
        const panel = getPanel(evt);
        if (panel === null) return;
        log.debug('animationcancel', panel.id, evt.animationName);
        resolveAnimation(panel, evt.animationName);
        const jspanelanimationcancel = new CustomEvent(EVENT_JSPANEL_ANIMATION_CANCEL, {
            detail: {
                id: panel.id,
                animationName: evt.animationName,
                sourceEvent: evt
            },
            cancelable: true
        });
        jspanelanimationcancel.panel = panel;
        document.dispatchEvent(jspanelanimationcancel);
    }, true);

    document.addEventListener('animationend', (evt) => {
        const panel = getPanel(evt);
        if (panel === null) return;
        log.debug('animationend', panel.id, evt.animationName);
        resolveAnimation(panel, evt.animationName);
        const jspanelanimationend = new CustomEvent(EVENT_JSPANEL_ANIMATION_END, {
            detail: {
                id: panel.id,
                animationName: evt.animationName,
                sourceEvent: evt
            },
            cancelable: true
        });
        jspanelanimationend.panel = panel;
        document.dispatchEvent(jspanelanimationend);
    }, true);

    function getPanel(evt) {
        if (!evt) return null;
        return evt.target && evt.target.classList.contains('jsPanel') ? evt.target : null;
    }

    function resolveAnimation(panel, animationName) {
        if (!panel || !animationName) return;
        const animations = pendingAnimations.get(panel.id);
        if (Array.isArray(animations) === false) return;
        for (let i = animations.length - 1; i >= 0; i -= 1) { 
            const animation = animations[i];
            if (animation.name === animationName) {
                if (typeof animation.resolve === 'function') {
                    animation.resolve();
                }
                animations.splice(i, 1);
            }
        }
        if (animations.length === 0) pendingAnimations.delete(panel.id);
    }

    function resolveAllAnimations(panel) {
        if (!panel) return;
        const animations = pendingAnimations.get(panel.id);
        if (Array.isArray(animations) === false) return;
        log.debug(`Resolving ${animations.length} pending animation(s) for`, panel.id);
        animations.forEach((animation) => {
            animation.resolve();
        });
        pendingAnimations.delete(panel.id);
    }

    function animationsDone(panel) {
        return new Promise((resolve, reject) => {
            if (!panel) return reject(false);
            const animations = pendingAnimations.get(panel.id);
            if (!animations || animations.length === 0) return resolve(true);
            const promises = [];
            animations.forEach(animation => promises.push(animation.promise));
            Promise.all(promises).then(() => {
                log.debug('All animations resolved for panel', panel.id);
                if (panel.status === 'normalized') savePanel(panel);
                enableInteraction(panel);
                resolve(true);
            });
        });
    }

    function savePanel(panel) {
        if (!panel) return false;
        const options = panel.options;
        const container = document.querySelector(options.container);
        if (container instanceof HTMLElement === false) return false;
        const style = window.getComputedStyle(panel);
        const top = parseInt(style.top, 10);
        const left = parseInt(style.left, 10);
        const height = parseInt(style.height, 10);
        const width = parseInt(style.width, 10);
        panel.resize({
            width: width,
            height: height,
        }).reposition({
            my: 'left-top',
            at: 'left-top',
            of: container,
            offsetX: left,
            offsetY: top,
        });
        panel.saveCurrentDimensions();
        panel.saveCurrentPosition();
        log.debug('Saved position of panel', panel.id, '\n  - top', top, 'left', left, 'height', height, 'width', width);
        return true;
    }

    function animateIn(panel) {
        return new Promise((resolve, reject) => {
            if (!panel) return reject(false);
            const { visibility } = window.getComputedStyle(panel);
            if (visibility === 'hidden') return resolve(false);
            log.debug('animateIn started', panel.id);
            savePanel(panel);
            disableInteraction(panel);
            if (canCancelAnimations === false) {
                log.debug('Manually resolving pending animations for', panel.id);
                resolveAllAnimations(panel);
            }
            panel.classList.remove(panel.options.animateOut);
            panel.classList.add(panel.options.animateIn);
            const waitForAnimation = async (evt) => {
                if (evt.panel !== panel) return;
                const animationName = getAnimationNameFromClass(panel.options.animateIn);
                if (evt.detail.animationName !== animationName) return;
                log.debug('Start waiting for animationsDone() to finish for', panel.id, evt.type);
                await animationsDone(panel);
                panel.classList.remove(panel.options.animateIn);
                document.removeEventListener(EVENT_JSPANEL_ANIMATION_START, waitForAnimation);
                resolve(true);
            };
            document.addEventListener(EVENT_JSPANEL_ANIMATION_START, waitForAnimation);
        });
    }

    function animateOut(panel) {
        return new Promise((resolve, reject) => {
            if (!panel) return reject(false);
            const { visibility } = window.getComputedStyle(panel);
            if (visibility === 'hidden') return resolve(false);
            log.debug('animateOut started', panel.id);
            savePanel(panel);
            disableInteraction(panel);
            if (canCancelAnimations === false) {
                log.debug('Manually resolving pending animations for', panel.id);
                resolveAllAnimations(panel);
            }
            panel.classList.remove(panel.options.animateIn);
            panel.classList.add(panel.options.animateOut);
            const waitForAnimation = async (evt) => {
                if (evt.panel !== panel) return;
                const animationName = getAnimationNameFromClass(panel.options.animateOut);
                if (evt.detail.animationName !== animationName) return;
                log.debug('Start waiting for animationsDone() to finish for', panel.id);
                await animationsDone(panel);
                panel.classList.remove(panel.options.animateOut);
                resolve(true);
                document.removeEventListener(EVENT_JSPANEL_ANIMATION_START, waitForAnimation);
            };
            document.addEventListener(EVENT_JSPANEL_ANIMATION_START, waitForAnimation);
        });
    }

    function animateStop(panel) {
        if (panel instanceof HTMLElement === false) return false;
        if (isAnimating(panel) === false) return false;
        log.debug('Stopping animations on panel', panel.id);
        savePanel(panel);
        panel.classList.remove(panel.options.animateIn);
        panel.classList.remove(panel.options.animateOut);
        if (canCancelAnimations === false) {
            log.debug('Manually resolving pending animations for', panel.id);
            resolveAllAnimations(panel);
        }
        if (panel.options.paneltype === 'modal') {
            const backdrop = panel.getModalBackground();
            if (backdrop instanceof HTMLElement === false) return;
            log.debug('Stopping animations on modal backdrop of panel', panel.id);
            backdrop.classList.remove(panel.options.modalAnimateIn);
            backdrop.classList.remove(panel.options.modalAnimateOut);
        }
        return true;
    }

    function supportsAnimationCancel() {
        return new Promise((resolve) => {
            let supported = false;
            const elm = document.createElement('DIV');
            elm.style = 'position: absolute; width: 0px; height: 0; background: transparent;';
            elm.style.animation = 'jsPanelModalFadeIn 5s';
            function detectSupport() {
                supported = true;
                resolve(supported);
            }
            elm.addEventListener('animationcancel', detectSupport);
            document.body.appendChild(elm);
            setTimeout(() => {
                elm.style.animation = 'none';
                setTimeout(() => {
                    log.debug('animationcancel supported:', supported);
                    resolve(supported);
                    elm.removeEventListener('animationcancel', detectSupport);
                    document.body.removeChild(elm);
                }, 150);
            }, 150);
        });
    }

    function getAnimationNameFromClass(className) {
        const stylesheets = document.styleSheets;
        className = (className.startsWith('.')) ? className : '.' + className;
        for (let i = 0; i < stylesheets.length; i += 1) {
            const stylesheet = stylesheets[i];
            let rules = null;
            try {
                rules = stylesheet.cssRules || stylesheet.rules; 
            } catch (error) {
                log.warn('Cannot access rules for stylesheet due to CORS:', stylesheet.href, error);
                continue; 
            }
            if (!rules) continue; 
            for (let j = 0; j < rules.length; j += 1) {
                const rule = rules[j];
                if (rule.type === CSSRule.STYLE_RULE) {
                    if (rule.selectorText === className) {
                        const animationName = rule.style.animationName;
                        if (animationName) {
                            return animationName; 
                        }
                    }
                }
            }
        }
        return null; 
    }

    function isValidAnimationClass(className) {
        if (!className) return false;
        const animationName = getAnimationNameFromClass(className);
        if (animationName && animationName.split(',').length > 1) {
            log.warn(`The class "${className}" contains more than one keyframe animations. This is currently not supported.`);
            return false;
        }
        return true;
    }

    function isAnimating(panel) {
        if (!panel) return false;
        return pendingAnimations.has(panel.id);
    }

    function disableInteraction(panel) {
        if (!panel) return;
        panel.classList.add('disableInteraction');
    }

    function enableInteraction(panel) {
        if (!panel) return;
        panel.classList.remove('disableInteraction');
    }

    function getAnimationArray(panel) {
        if (!panel) return undefined;
        if (!pendingAnimations.has(panel.id)) pendingAnimations.set(panel.id, []);
        return pendingAnimations.get(panel.id);
    }

    function getAnimationPromise(panel, animationName) {
        if (!panel) return null;
        if (!animationName) return null;
        const animation = {};
        animation.panel = panel;
        animation.name = animationName;
        animation.promise = new Promise((resolve, reject) => {
            const _resolve = () => {
                log.debug('Resolve', animation.name, animation.panel.id);
                resolve(true);
            };
            const _reject = () => {
                log.debug('Reject', animation.name, animation.panel.id);
                reject(false);
            };
            animation.resolve = _resolve;
            animation.reject = _reject;
        });
        return animation;
    }

    function addAnimation(panel, animationName) {
        if (!panel) return null;
        if (!animationName) return null;
        const animations = getAnimationArray(panel);
        if (!animations) return null;
        const hasAnimation = animations.some(animationPromise => animationPromise.panel === panel && animationPromise.name === animationName);
        if (hasAnimation) return;
        const animation = getAnimationPromise(panel, animationName);
        if (!animation) return;
        animations.push(animation);
        log.debug('Added new promise object to pending animation for', panel.id, animationName);
        return animation;
    }
    log.info(`Loaded "jspanel.animations" plugin ${jsPanel.animations.version}`);
} else {
    window.jsPanel.log.error('Could not extend "jsPanel.animations"');
}
