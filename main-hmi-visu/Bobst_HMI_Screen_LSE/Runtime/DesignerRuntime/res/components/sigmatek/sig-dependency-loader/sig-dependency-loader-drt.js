import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import { BOOT_LOGO, RELOAD_ICON, LOGLEVEL_INFO, LOGLEVEL_WARN, LOGLEVEL_ERROR } from './sig-dependency-loader-rt.js';

export class SigDependencyLoaderDrt extends LasalRuntimeSigElement {

    static get is() {
        return 'sig-dependency-loader';
    }

    static get template() {
        return SigPolymer.html`
        <style  include="sig-element-css">
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
                display: flex;
                flex-direction: column;
                color: var(--color);
                background-color: var(--background-color);
                font-family: var(--font-family);
                font-size: var(--font-size);
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
                width: 50%;
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
            .critical {
                position: absolute;
                display: none;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background: var(--critical-error-background-color);
                color: var(--critical-error-color);
                text-align: center;
            }
            .critical p {
                width: 60%;
            }
            .critical button {
                background: var(--critical-error-color);
                color: var(--critical-error-background-color);
                border:none; 
                border-radius: 4px; 
                padding: 10px 20px;  
                cursor: pointer;  
            }
            :host([hidelogo]) .logo,
            :host([hideprogressbar]) .bar,
            :host([hideprogresscount]) .loaded,
            :host([hidemessages]) .messages {
                display: none !important;
            }
            :host([showreloadicon]) .reload {
                display: block;
            }
            :host([showcriticalerror]) .critical {
                display: flex;
            }
        </style>
        <div id="top" class="row top">&nbsp;</div>
        <div class="row middle">
            <div id="logo" class="logo"></div>
            <div id="loaded" class="loaded">Loaded <span>[[currentCount]]</span> of  <span>[[totalCount]]</span> System dependencies.</div>
            <div id="bar" class="bar">
                <div id="background" class="background">
                    <div id="finished" class="finished"></div> 
                </div>
            </div>
        </div>
        <div id="bottom" class="row bottom">
            <div id="reload" class="reload"></div>
            <div id="messages" class="messages"></div>
        </div>
        <div id="critical" class="critical">
            <p>A critical error occured!</p>
            <button>Reload</button>
        </div>
      `;
    }

    static get properties() {
        return {
            bootlogo: {
                type: String,
                value: '',
                observer: '_updateBootLogo'
            },
            reloadicon: {
                type: String,
                value: '',
                observer: '_updateReloadIcon'
            },
            loglevel: {
                type: Number,
                value: 2,
                observer: '_updateMessages'
            },
            hidelogo: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            hideprogressbar: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            hideprogresscount: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            hidemessages: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            showreloadicon: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            showcriticalerror: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            }
        };
    }

    constructor() {
        super();
        this.currentCount = 5;
        this.totalCount = 10;
    }

    _updateBootLogo(src) {
        if (typeof src === 'string' && src.length > 0) {
            this.$.logo.innerHTML = `<img id="bootlogo" src="${src}" />`;
        } else {
            this.$.logo.innerHTML = BOOT_LOGO;
        }
    }

    _updateReloadIcon(src) {
        if (typeof src === 'string' && src.length > 0) {
            this.$.reload.innerHTML = `<img id="reloadicon" src="${src}" />`;
        } else {
            this.$.reload.innerHTML = RELOAD_ICON;
        }
    }

    _updateMessages(loglevel) {
        if (!loglevel) return;
        const currentLevel = '(Current loglevel)';
        const _loglevel = parseInt(loglevel, 10);
        this.$.messages.innerHTML = `
            <p class="info">Info Message ${_loglevel === LOGLEVEL_INFO ? currentLevel : ''} </p >
            <p class="warn">Warning Message ${_loglevel === LOGLEVEL_WARN ? currentLevel : ''}</p>
            <p class="error">Error Message ${_loglevel === LOGLEVEL_ERROR ? currentLevel : ''}</p>
        `;
    }
}
