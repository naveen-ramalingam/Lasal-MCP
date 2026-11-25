const html = (strings, ...values) => String.raw({ raw: strings }, ...values);
export const BOOT_LOGO = html`
    <svg id="bootlogo" width="100" height="100" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="m 32.934593,19.988472 c 3.910415,0 6.576863,1.705566 6.980999,4.006739 0,0 0.07018,0.520478 0.07018,0.996208 0,0.475732 -0.07018,1.009869 -0.07018,1.009869 -0.439227,2.202494 -3.070584,3.999202 -6.980999,3.999202 l -3.576932,0.0014 c -3.907353,0 -6.982648,1.764208 -6.982648,4.010743 v 1.010104 l 7.07e-4,0.683922 c 0,0.206071 0.168389,0.373519 0.374932,0.373519 l 0.829232,0.0028 h 20.418281 l 0.624574,0.0042 c 0.205365,0 0.374461,0.168861 0.374461,0.375875 L 45,36.616605 v 2.796216 l -0.0028,0.247521 c 0,0.20772 -0.169096,0.375168 -0.374461,0.375168 l -0.586657,-0.0074 H 17.285634 15.395663 l -3.344955,-0.0075 c -3.9106499,0 -6.5415374,-1.796002 -6.9807641,-3.998731 0,0 -0.069944,-0.535551 -0.069944,-1.009869 0,-0.47573 0.069944,-0.996208 0.069944,-0.996208 0.4043715,-2.30237 3.0698782,-4.007466 6.9807641,-4.007466 l 3.344955,-0.0062 2.163869,-0.0021 c 2.767953,0 5.01331,-2.243943 5.01331,-5.01331 0,-2.767953 -2.245357,-5.012602 -5.01331,-5.012602 l -2.163869,0.01107 -3.344955,-0.0014 c -3.9106499,0 -6.5415374,-1.79671 -6.9807641,-3.99991 0,0 -0.069944,-0.534373 -0.069944,-1.009868 0,-0.475025 0.069944,-0.996915 0.069944,-0.996915 C 5.4743154,11.676656 8.1398221,9.97109 12.050708,9.97109 l 3.344955,-0.0028 h 2.046114 27.045778 l 0.135184,-0.0038 c 0,0 0.374461,0.168861 0.374461,0.374226 L 45,10.491758 v 2.797629 l -0.0028,0.247521 c 0,0.206778 -0.169096,0.375168 -0.374461,0.375168 l -0.31794,-0.0054 H 23.733437 l -0.986788,0.0028 c -0.206308,0 -0.374933,0.168154 -0.374933,0.374932 l 0.003,0.839595 v 0.860319 c 0,2.157747 3.075531,4.000615 6.982648,4.000615 z">
    </svg>
`;
export const RELOAD_ICON = html`
    <svg id="reloadicon" width="50" height="50" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M15.65 4.35A8 8 0 1 0 17.4 13h-2.22a6 6 0 1 1-1-7.22L11 9h7V2z"/>
    </svg>
`;
const RESPATH = '@@RESPATH@@';
const RTPATH = '@@RTPATH@@';
const SYSTEM_DEPENDENCIES_READY = 'SystemDependenciesReady';
const SPLASH_SCREEN_TAG_NAME = 'sig-control-splash-screen';
const SPLASH_SCREEN_ID = 'lvdsplashscreeninstance';
const MESSAGE_TYPES = ['info', 'warn', 'error'];
export const LOGLEVEL_INFO = 0;
export const LOGLEVEL_WARN = 1;
export const LOGLEVEL_ERROR = 2;

export class SigDependencyLoaderRt extends HTMLElement {

    static get is() {
        return 'sig-dependency-loader';
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._logLevel = LOGLEVEL_ERROR;
        this._logToConsole = false;
        this._currentCount = 0;
        this._totalCount = 0;
        this._prefix = '';
        this._suffix = '';
        this._isRemoved = false;
        this._started = 0;
        this._isReloading = false;
        this._isTemplateRendered = false;
        this._contextMenuHandler = (evt) => {
            evt.preventDefault();
        };
        this._reloadHandler = (evt) => {
            this._reload();
        };
    }

    get template() {
        return html`
        <style>
            :host {
                --font-size: var(--theme-sig-dependency-loader-font-size, 14px);
                --font-family:  var(--theme-sig-dependency-loader-font-family, 'Roboto', sans-serif);
                --background-color: var(--theme-sig-dependency-loader-background-color, rgba(47, 47, 47, 1));
                --color: var(--theme-sig-dependency-loader-color,rgba(160, 160, 160, 1));
                --color-count: var(--theme-sig-dependency-loader-color-count, rgba(229, 242, 248, 1));
                --color-info: var(--theme-sig-dependency-loader-color-info, rgba(160, 160, 160, 1));
                --color-warn: var(--theme-sig-dependency-loader-color-warn, rgba(222, 247, 85, 1));
                --color-error: var(--theme-sig-dependency-loader-color-error, rgba(255, 0, 0, 1));
                --progress-width:  var(--theme-sig-dependency-loader-progress-width, 50%);
                --progress-bar-container-width: var(--theme-sig-dependency-loader-progress-bar-container-width, var(--progress-width));
                --progress-bar-width: var(--theme-sig-dependency-loader-progress-bar-width,  100%);
                --progress-bar-height: var(--theme-sig-dependency-loader-progress-bar-height, 20px);
                --progress-bar-border-radius: var(--theme-sig-dependency-loader-progress-bar-border-radius, 0px);
                --progress-bar-background-color: var(--theme-sig-dependency-loader-progress-bar-background-color, rgba(64, 66, 71, 1));
                --progress-finished-background-color:var(--theme-sig-dependency-loader-progress-finished-background-color,  rgba(174, 200, 26, 1));
                --progress-bar-margin-bottom: var(--theme-sig-dependency-loader-progress-bar-margin-bottom, 10px);
                --progress-bar-margin-top: var(--theme-sig-dependency-loader-progress-bar-margin-top, 0px);
                --progress-bar-text-align: var(--theme-sig-dependency-loader-progress-bar-text-align, center);
                --progress-count-margin-top: var(--theme-sig-dependency-loader-progress-count-margin-top, 0px);
                --progress-count-margin-bottom: var(--theme-sig-dependency-loader-progress-count-margin-bottom, 4px);
                --progress-count-text-align: var(--theme-sig-dependency-loader-progress-count-text-align, center);
                --progress-count-container-width: var(--theme-sig-dependency-loader-progress-count-container-width, var(--progress-width));
                --logo-color: var(--theme-sig-dependency-loader-logo-color, rgba(0, 127, 197, 1));
                --logo-width: var(--theme-sig-dependency-loader-logo-width, auto);
                --logo-height: var(--theme-sig-dependency-loader-logo-height, auto);
                --logo-margin-bottom: var(--theme-sig-dependency-loader-logo-margin-bottom, 4px);
                --logo-margin-top: var(--theme-sig-dependency-loader-logo-margin-top, 0px);
                --logo-text-align: var(--theme-sig-dependency-loader-logo-text-align, center);
                --logo-container-width: var(--theme-sig-dependency-loader-logo-container-width, var(--progress-width));
                --messages-font-size: var(--theme-sig-dependency-loader-messages-font-size, 12px);
                --messages-font-family: var(--theme-sig-dependency-loader-messages-font-family, inherit);
                --messages-margin-top: var(--theme-sig-dependency-loader-messages-margin-top, 0px);
                --messages-margin-bottom: var(--theme-sig-dependency-loader-messages-margin-bottom, 10px);
                --messages-container-width: var(--theme-sig-dependency-loader-messages-container-width, var(--progress-width));
                --message-margin-bottom: var(--theme-sig-dependency-loader-message-margin-bottom, 4px);
                --message-text-align: var(--theme-sig-dependency-loader-message-text-align, left);  
                --message-white-space: var(--theme-sig-dependency-loader-message-white-space, wrap);
                --message-line-height: var(--theme-sig-dependency-loader-message-line-height, 115%); 
                
                --scrollbar-track-color:var(--theme-sig-dependency-loader-scrollbar-track-color, transparent);
                --scrollbar-thumb-color:var(--theme-sig-dependency-loader-scrollbar-thumb-color, rgba(160, 160, 160, 0.2));
                --reload-color: var(--theme-sig-dependency-loader-reload-color, rgba(0, 127, 197, 1));
                --reload-width: var(--theme-sig-dependency-loader-reload-width, auto);
                --reload-height: var(--theme-sig-dependency-loader-reload-height, auto);
                --reload-margin-bottom: var(--theme-sig-dependency-loader-reload-margin-bottom, 4px);
                --reload-margin-top: var(--theme-sig-dependency-loader-reload-margin-top, 0px);
                --reload-container-width: var(--theme-sig-dependency-loader-reload-container-width, var(--progress-width));
                --reload-text-align: var(--theme-sig-dependency-loader-reload-text-align, center);
                
                --critical-error-background-color: var( --theme-sig-dependency-loader-critical-error-background-color, rgba(255, 0, 0, 1));
                --critical-error-color: var(--theme-sig-dependency-loader-critical-error-color, rgba(255,255,255,1));
                position: absolute;
                top: 0;
                left:0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                color: var(--color);
                background-color: var(--background-color);
                font-family: var(--font-family);
                font-size: var(--font-size);
                z-index: 2147483550;
            }
            :host * {
                box-sizing: border-box;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none; 
                user-select: none; 
            }
            .row {
              flex-direction: column;
            }
            .top {
                flex: 1; 
                display: flex;
                align-items: center;
                justify-content: flex-start;
            }
            .middle {
                
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bottom {
                flex: 1; 
                display: flex;
                align-items: center;
                justify-content: flex-start;
                overflow: hidden;
            }
            .logo {
                width: var(--logo-container-width);
                margin-top: var(--logo-margin-top);
                margin-bottom: var(--logo-margin-bottom);
                text-align: var(--logo-text-align);
                overflow: hidden;   
            }
            .logo img,
            .logo svg {
                width: var(--logo-width);
                height: var(--logo-height);
                fill: var(--logo-color);
                stroke: var(--logo-color);
            }
            .loaded {
                width: var(--progress-count-container-width);
                margin-top: var(--progress-count-margin-top);
                margin-bottom: var(--progress-count-margin-bottom);
                text-align: var(--progress-count-text-align);
            }
            .loaded span {
                color: var(--color-count);
            }   
            .bar {
                width: var(--progress-bar-container-width);
                height:var(--progress-bar-height);
                margin-top: var(--progress-bar-margin-top);
                margin-bottom: var(--progress-bar-margin-bottom);
                text-align: var(--progress-bar-text-align);
                overflow: hidden;
            }
            .bar .background {
                display: inline-block;
                width: var(--progress-bar-width);
                height: 100%;
                background-color: var(--progress-bar-background-color);
                border-radius: var(--progress-bar-border-radius);
                overflow: hidden;
            }
            .finished {
                width: 0;
                height: 100%;
                border-radius: var(--progress-bar-border-radius);
                background-color: var(--progress-finished-background-color);
            }   
            .reload {
                display: none;
                flex: 0 0 auto; 
                width: var(--reload-container-width);
                margin-top: var(--reload-margin-top);
                margin-bottom: var(--reload-margin-bottom);
                text-align: var(--reload-text-align);
                cursor: pointer;
                overflow: hidden;
            }
            .reload img,
            .reload svg {
                width: var(--reload-width);
                height: var(--reload-height);
                stroke: var(--reload-color);
                fill: var(--reload-color);
            }
            .messages {
                flex: 1;
                width: var(--messages-container-width);
                margin-top: var(--messages-margin-top);
                margin-bottom: var(--messages-margin-bottom);
                font-size: var(--messages-font-size);
                font-family: var(--messages-font-family);
                text-align:left;
                overflow: hidden;
            }
            :host([data-scrollbars=true]) .messages {
                overflow-y: auto;
                overflow-x: hidden;
                scrollbar-width: thin;
                scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
            }
            .messages p { 
                color: var(--color);
                 
                --lh-decimal: calc(var(--message-line-height) / 100%);
                margin-top: calc((var(--lh-decimal) - 1) / -2 * 1em);
                margin-bottom: var(--message-margin-bottom);
                text-align: var(--message-text-align);
                line-height: var(--message-line-height);
                white-space: var(--message-white-space);
                text-overflow:ellipsis;
                overflow: hidden;
            }   
            .messages :last-child {
                margin-bottom: 0;
            }
            .messages p.info {
                color: var(--color-info);
            }
            .messages p.warn {
                color: var(--color-warn);
            }
            .messages p.error {
                color: var(--color-error);
            }
            :host([data-hidelogo=true]) .logo,
            :host([data-hideprogressbar=true]) .bar,
            :host([data-hideprogresscount=true]) .loaded,
            :host([data-hidemessages=true]) .messages {
                display: none !important;
            }
            :host([data-showreload=true]) .reload {
                display: block;
            };
        </style>
        <div id="top" class="row top">&nbsp;</div>
        <div class="row middle">
            <div id="logo" class="logo">
                ${this.dataset.bootlogo ? `<img id="bootlogo" src="${this.dataset.bootlogo}" />` : `${BOOT_LOGO}`}
            </div>
            <div id="loaded" class="loaded">Resolving dependencies ...</div>
            <div id="bar" class="bar">
                <div id="background" class="background">
                    <div id="finished" class="finished"></div> 
                </div>
            </div>
        </div>
        <div id="bottom" class="row bottom">
            <div id="reload" class="reload">
                ${this.dataset.reloadicon ? `<img id="reloadicon"src="${this.dataset.reloadicon}" />` : `${RELOAD_ICON}`}
            </div>
            <div id="messages" class="messages"></div>
        </div>
      `;
    }

    async connectedCallback() {
        if (this._isTemplateRendered === true) return;
        if (this._isRemoved === true) return;
        if (this.shadowRoot === null) return;
        this._started = Date.now();
        this.shadowRoot.innerHTML = this.template;
        this.setLoglevel(parseInt(this.dataset.loglevel, 10));
        this._addEventListeners();
        this._isTemplateRendered = true;
        const dependencies = await this._getDependencies();
        if (Array.isArray(dependencies) === false) {
            this.addMessage('ERROR: Could not resolve dependencies!', LOGLEVEL_ERROR);
            return;
        };
        const totalCount = dependencies.filter(dependency => !dependency.skip).length;
        this.progressInit('Loaded', 'System Dependencies.', totalCount);
        const ready = [];
        dependencies.forEach(dependency => {
            if (dependency.skip === true) return;
            const request = window.loadjs(dependency.attributes.src, {
                async: false, 
                retries: 0, 
                returnPromise: true,
                before: (path, elm) => {
                    this._log(`Queued "${path}" for loading`, LOGLEVEL_INFO);
                    elm.setAttribute('type', dependency.attributes.type);
                    elm.setAttribute('crossorigin', dependency.attributes.crossorigin);
                    if (dependency.target === 'body') {
                        document.body.appendChild(elm);
                        return false; 
                    }
                },
                success: (request) => {
                    this.progressUpdate(this._currentCount += 1);
                    this.addMessage(`Loading "${dependency.id}" finished!`, LOGLEVEL_INFO);
                },
                error: (errors) => {
                    errors.forEach(error => {
                        this.addMessage(`ERROR: Could not fetch: ${error}`, LOGLEVEL_ERROR);
                    });
                }
            });
            ready.push(request);
        });
        Promise.allSettled(ready).then(() => {
            if (this.dataset.splashscreen === String(true)) {
                this._addSplashScreenInstance();
                this.destroy();
            }
            this.addMessage('System Dependencies Ready!', LOGLEVEL_INFO, Date.now() - this._started);
            window.dispatchEvent(new CustomEvent(SYSTEM_DEPENDENCIES_READY));
        });
    }

    disconnectedCallback() {
        this.destroy();
    }

    _addEventListeners() {
        const urlParams = new URLSearchParams(window.location.search);
        if (!urlParams.has('enableContext')) {
            document.addEventListener('contextmenu', this._contextMenuHandler);
        }
        const icon = this.shadowRoot.getElementById('reloadicon');
        if (icon !== null) {
            icon.addEventListener('click', this._reloadHandler);
        }
    }

    _removeEventListeners() {
        document.removeEventListener('contextmenu', this._contextMenuHandler);
        const icon = this.shadowRoot.getElementById('reloadicon');
        if (icon !== null) {
            icon.removeEventListener('click', this._reloadHandler);
        }
    }

    _reload(delay = 500) {
        if (this._isReloading === true) return;
        this._isReloading = true;
        this.addMessage('Reloading application ...', LOGLEVEL_WARN);
        setTimeout(() => {
            document.location.reload();
        }, delay);
    }

    _updateCount() {
        if (this.dataset.hideprogress === String(true)) return;
        if (this.shadowRoot === null) return;
        const loaded = this.shadowRoot.getElementById('loaded');
        if (loaded instanceof HTMLElement === false) return;
        if (this.dataset.hideprogresscount !== String(true)) {
            loaded.innerHTML = `${this._prefix} <span>${this._currentCount}</span> of  <span>${this._totalCount}</span> ${this._suffix}`;
        }
        const finished = this.shadowRoot.getElementById('finished');
        if (finished instanceof HTMLElement === false) return;
        if (this.dataset.hideprogressbar !== String(true)) {
            finished.style.width = (this._currentCount / this._totalCount) * 100 + '%';
        }
    }

    async _getDependencies() {
        const [systemDeps, projectDeps] = await Promise.all([
            this._getJson(`${this.dataset.rtpath}default/dependencies.json`),
            this._getJson(`${this.dataset.respath}data/dependencies.json`)
        ]);
        if (systemDeps === null || projectDeps === null) return null;
        return this._mergeDependencies(systemDeps, projectDeps);
    }

    async _getJson(filename) {
        if (typeof filename !== 'string') return null;
        try {
            const response = await fetch(filename);
            if (response.ok) {
                return await response.json();
            } else {
                this.addMessage(`ERROR: Could not fetch ${filename}`, LOGLEVEL_ERROR);
                return null;
            }
        } catch (error) {
            this.addMessage('ERROR: ' + error.message, LOGLEVEL_ERROR);
            return null;
        }
    }

    _mergeDependencies(systemDeps, projectDeps) {
        if (!systemDeps) return null;
        if (!projectDeps) return null;
        try {
            const sysScripts = Array.isArray(systemDeps.scripts) ? systemDeps.scripts : [];
            const sysComponents = Array.isArray(systemDeps.components) ? systemDeps.components : [];
            const projComponents = Array.isArray(projectDeps.components) ? projectDeps.components : [];
            const projScripts = Array.isArray(projectDeps.scripts) ? projectDeps.scripts : [];
            const dependencies = [].concat(sysScripts, sysComponents, projComponents, projScripts);
            dependencies.forEach(dependency => {
                if (!dependency || !dependency.attributes || typeof dependency.attributes.src !== 'string') return;
                let src = dependency.attributes.src;
                if (src.includes(RTPATH)) {
                    src = src.replace(RTPATH, this.dataset.rtpath);
                } else if (src.includes(RESPATH)) {
                    src = src.replace(RESPATH, this.dataset.respath);
                }
                dependency.attributes.src = src;
            });
            return dependencies;
        } catch (error) {
            this.addMessage(`ERROR: ${error.message}`, LOGLEVEL_ERROR);
            return null;
        }
    }

    _addSplashScreenInstance() {
        const sc = document.createElement(SPLASH_SCREEN_TAG_NAME);
        sc.id = SPLASH_SCREEN_ID;
        document.body.prepend(sc);
        this._log('Added splash screen instance.', LOGLEVEL_INFO);
    }

    _log(message, level = LOGLEVEL_INFO, ...args) {
        if (this._logToConsole === false) return;
        if (level < this._logLevel) return;
        if (!message) return;
        switch (level) {
            case LOGLEVEL_ERROR:
                console.error(message, ...args);
                break;
            case LOGLEVEL_WARN:
                console.warn(message, ...args);
                break;
            case LOGLEVEL_INFO:
            default:
                console.log(message, ...args);
                break;
        }
    }

    progressInit(prefix = '', suffix = '', totalCount = 0, currentCount = 0) {
        if (typeof prefix === 'string') this._prefix = prefix;
        if (typeof suffix === 'string') this._suffix = suffix;
        if (!isNaN(totalCount)) this._totalCount = totalCount;
        if (!isNaN(currentCount)) this._currentCount = currentCount;
    }

    progressUpdate(currentCount) {
        if (isNaN(currentCount)) return;
        this._currentCount = currentCount;
        this._updateCount();
    }

    addMessage(message, level = LOGLEVEL_INFO, ...args) {
        if (level < this._logLevel) return;
        if (typeof message !== 'string') return;
        if (level === LOGLEVEL_ERROR) {
            this.setAttribute('data-showreload', 'true');
        }
        if (this._logToConsole === true) this._log(message, level, ...args);
        if (this.dataset.hidemessages === String(true)) return;
        if (!this.shadowRoot) return;
        const messages = this.shadowRoot.getElementById('messages');
        if (messages instanceof HTMLElement === false) return;
        const msg = document.createElement('p');
        const type = level <= MESSAGE_TYPES.length ? MESSAGE_TYPES[level] : undefined;
        msg.innerText = message;
        msg.classList.add(type);
        messages.prepend(msg);
    }

    clearMessages() {
        const messages = this.shadowRoot.getElementById('messages');
        if (messages instanceof HTMLElement) messages.innerHTML = '';
    }

    setLoglevel(level) {
        if (Number.isFinite(level) == false) return;
        if (level < LOGLEVEL_INFO || level > LOGLEVEL_ERROR) return;
        this._logLevel = level;
    }

    destroy() {
        if (this._isRemoved) return;
        this._isRemoved = true;
        this._logLevel = LOGLEVEL_ERROR;
        this._currentCount = 0;
        this._totalCount = 0;
        this._prefix = '';
        this._suffix = '';
        this._started = 0;
        document.body.classList.remove('isLoading');
        const bootStyles = document.getElementById('bootstyles');
        if (bootStyles) bootStyles.remove();
        this._removeEventListeners();
        this.clearMessages();
        this.remove();
    }
}
