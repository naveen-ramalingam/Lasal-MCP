import { LasalRuntimeSigElement, SigPolymer } from '../sig-element/sig-element.js';

class SigRulersElement extends LasalRuntimeSigElement {
    static get is() {
        return "sig-designer-rulers";
    }

    static get importMeta() {
        return import.meta;
    }

    static get template() {
        return SigPolymer.html`
            <style>
                :host {
                    --rulers-background-color: var(--theme-sig-designer-rulers-background-color, rgba(100,245,160,.3));
                    --rulers-border-color: var(--theme-sig-designer-rulers-border-color, rgba(51, 51, 51, 1));
                    --tick-label-color: var(--theme-sig-designer-rulers-tick-label-color, rgba(51, 51, 51, 1)); 
                    --tick-major-color: var(--theme-sig-designer-rulers-tick-major-color, rgba(102, 102, 102, 1));
                    --tick-minor-color: var(--theme-sig-designer-rulers-tick-minor-color, rgba(102, 102, 102, 1));
                    --carret-color: var(--theme-sig-designer-rulers-carret-color, var(--theme-sig-app-gridcolor,rgba(51, 51, 51, 1)));
                    --guideline-set-color-x: var(--theme-sig-designer-rulers-guideline-set-color, var(--theme-sig-app-gridcolor));
                    --guideline-set-color-y: var(--theme-sig-designer-rulers-guideline-set-color, var(--theme-sig-app-gridcolor));
                    --guideline-new-color-x: var(--theme-sig-designer-rulers-guideline-new-color, var(--carret-color));
                    --guideline-new-color-y: var(--theme-sig-designer-rulers-guideline-new-color, var(--carret-color));
                    --theme-sig-app-crosslinex:  0px;
                    --theme-sig-app-crosslinehx: 0px;
                    --theme-sig-app-crossliney:  0px;
                    --theme-sig-app-crosslinehy: 0px;
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    padding: 0;
                    margin: 0;
                    z-index: 95;
                    height: 100%;
                    width: 100%;
                }
                :host([enableguidelines]) {
                    background:
                        linear-gradient( to right, transparent  var(--theme-sig-app-crosslinex),  var(--guideline-set-color-x) 0px, transparent calc(var(--theme-sig-app-crosslinex) + 2px) ),
                        linear-gradient( to bottom, transparent var(--theme-sig-app-crossliney),  var(--guideline-set-color-y) 0px, transparent calc(var(--theme-sig-app-crossliney) + 2px) ),
                        linear-gradient( to right,  transparent var(--theme-sig-app-crosslinehx), var(--guideline-new-color-x) 0px, transparent calc(var(--theme-sig-app-crosslinehx) + 2px) ),
                        linear-gradient( to bottom, transparent var(--theme-sig-app-crosslinehy), var(--guideline-new-color-y) 0px, transparent calc(var(--theme-sig-app-crosslinehy) + 2px) );
                    
                    background-position: 0 20px, 20px 0, 0 20px, 20px;
                    background-repeat: no-repeat;
                }
                .corner {
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 20px;
                    height: 20px;   
                }
                .hRuler {
                    position: absolute;
                    width: 100%;
                    height: 19px;
                    left: 0px;
                    top: 0px;
                    border-bottom: 1px solid var(--rulers-border-color);
                    background-color: var(--rulers-background-color);
                }
                .vRuler {
                    position: absolute;
                    height: 100%;
                    width: 19px;
                    left: 0px;
                    top: 0px;
                    border-right: 1px solid var(--rulers-border-color);
                    background-color: var(--rulers-background-color);
                }
                .hRuler .tickLabel {
                    position: absolute;
                    top: 0px;
                    width: 1px;
                    height: 100%;
                    text-indent: 1px;
                    background: var(--tick-label-color);
                    font-size: 10px;
                    color: var(--tick-label-color);
                }
                .hRuler .tickMajor {
                    position: absolute;
                    bottom: 0px;
                    width: 1px;
                    height: 6px;
                    background: var(--tick-major-color);
                }
                .hRuler .tickMinor {
                    position: absolute;
                    bottom: 0px;
                    width: 1px;
                    height: 4px;
                    background: var(--tick-minor-color);
                }
                .vRuler .tickLabel {
                    position: absolute;
                    right: 0px;
                    height: 1px;
                    width: 100%;
                    text-indent: 1px;
                    background: var(--tick-label-color);
                    font-size: 10px;
                    color: var(--tick-label-color);
                }
                .vRuler .tickLabel span {
                    display: block;
                    position: absolute;
                    top: 1px;
                    right: 0px;
                    margin-right: 18px;
                    transform: rotate(-90deg);
                    transform-origin: top right;
                }
                .vRuler .tickMajor {
                    position: absolute;
                    right: 0px;
                    height: 1px;
                    width: 6px;
                    background: var(--tick-major-color);
                }
                .vRuler .tickMinor {
                    position: absolute;
                    right: 0px;
                    height: 1px;
                    width: 4px;
                    background: var(--tick-minor-color);
                }
                .hRulerCarret {
                    position: absolute;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-top: 8px solid var(--carret-color);
                    cursor: not-allowed;
                    display: none;
                }
                .vRulerCarret {
                    position: absolute;
                    border-top: 5px solid transparent;
                    border-bottom: 5px solid transparent;
                    border-left: 8px solid var(--carret-color);
                    cursor: not-allowed;
                    display: none;
                }
                :host([hidex]) {
                   --guideline-set-color-x: transparent;
                }
                :host([hidey]) {
                   --guideline-set-color-y: transparent;
                }
                :host([hidehx]) {
                   --guideline-new-color-x: transparent;
                }
                :host([hidehy]) {
                   --guideline-new-color-y: transparent;
                }
                :host([enableguidelines]:not([hidex])) .hRulerCarret {
                   display: block;
                }
                :host([enableguidelines]:not([hidey])) .vRulerCarret {
                    display: block;
                }
                :host([enableguidelines]) {
                    .corner {
                      cursor: not-allowed;    
                    }
                    .hRuler,
                    .vRuler {
                        cursor:crosshair;
                    }
                }
                :host([hidden]) {
                    display:none;
                }
            </style>
            <div class="rulers hRuler" id="hRuler" on-mousemove="_hRulerMove" on-mouseleave="_hRulerMoveOut" on-mousedown="_hRulerClick"></div>
            <div class="rulers vRuler" id="vRuler" on-mousemove="_vRulerMove" on-mouseleave="_vRulerMoveOut" on-mousedown="_vRulerClick"></div>
            <div class="rulers hRulerCarret" id="hRulerCarret" on-mousedown="_hCarretClick"></div>
            <div class="rulers vRulerCarret" id="vRulerCarret" on-mousedown="_vCarretClick"></div>
            <div class="rulers corner" id="corner" on-tap="_resetRulers"></div>
        `;
    }

    static get properties() {
        let props = {
            hidden: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            vRulerSize: {
                type: Number,
                value: 20
            },
            hRulerSize: {
                type: Number,
                value: 20
            },
            enableguidelines: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
            },
            displayrulers: {
                type: Boolean,
                value: false
            },
            guidelinex: {
                type: Number,
                value: 0
            },
            guideliney: {
                type: Number,
                value: 0
            },
            guidelinecolor: {
                type: String,
                value: "rgba(51, 51, 51, 1)",
                observer: '_guidelinesColorChanged'
            },
            iswindow: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            offsetX: {
                type: Number,
                value: 0
            },
            offsetY: {
                type: Number,
                value: 0
            },
            visibility: {
                type: Object,
                value: {
                    hidex: true,
                    hidey: true,
                    hidehx: true,
                    hidehy: true,
                }
            }
        }
        return props;
    }

    static get observers() {
        return [
            '_visibilityChanged(visibility.*)'
        ];
    }

    constructor() {
        super();
        this.coreEvent = null;
        this.coreEventHandler = null;
        this.controlEvent = null;
        this.controlEventHandler = null;
    }

    connectedCallback() {
        super.connectedCallback();
        this.APP_ELEMENT = document.querySelector('sig-app');
        this.APP_WRAPPER_ELEMENT = this.APP_ELEMENT?.querySelector('sig-wrapper');
        this._subscribeEvents();
    }

    ready() {
        super.ready();
        this._resetRulers();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._unsubscribeEvents();
    }

    _subscribeEvents() {
        if (this.coreEventHandler === null) {
            this.coreEventHandler = (e) => {
                this._handleCoreEvent(e);
            }
        }
        if (this.coreEvent === null) {
            this.coreEvent = sigApi.designer.getCoreEventInstance();
            this.coreEvent.subscribe(this.coreEventHandler);
        }

        if (this.controlEvent === null) {
            this.controlEvent = sigApi.designer.getControlEventInstance();
            this.controlEvent.source = this;
        }
    }

    _handleCoreEvent(evt) {
        if (!evt) return;
        const {
            type,
            source,
            target,
            data,
            sourceEvent
        } = evt.detail;

        if (type === 'setrulers') {
            this._setRulers(data);
            this._init();
        }
    }
    _unsubscribeEvents() {
        if (this.coreEvent && this.coreEventHandler) {
            this.coreEvent.unsubscribe(this.coreEventHandler);
        }
    }

    _setRulers(data) {
        if (!data) return;
        if (data.displayrulers !== undefined) this.displayrulers = data.displayrulers;
        if (data.enableguidelines !== undefined) this.enableguidelines = data.enableguidelines;
        if (data.guidelinecolor !== undefined) this.guidelinecolor = data.guidelinecolor;
        if (data.guidelinex !== undefined) this.guidelinex = data.guidelinex;
        if (data.guideliney !== undefined) this.guideliney = data.guideliney;
        if (data.iswindow !== undefined) this.iswindow = data.iswindow;
    }

    _guidelinesColorChanged(color) {
        if (!color) return;
        this._setGuidelinesColor(color);
    }

    _resetRulers() {
        this.guidelinex = 0;
        this.guideliney = 0;
        this._setGuidelines(this.guidelinex, this.guideliney);
    }

    _setGuidelinesColor(_color = null) {
        if (_color !== null) {
            this.style.setProperty('--theme-sig-app-gridcolor', _color);
        }
    }

    _setFrameOffset(offsetrulers) {
        if (typeof offsetrulers !== 'number' || isNaN(offsetrulers)) return;
        this.APP_WRAPPER_ELEMENT.style.setProperty('margin', offsetrulers + 'px');
        this.APP_ELEMENT.style.setProperty('padding-right', offsetrulers + 'px');
        this.APP_ELEMENT.style.setProperty('padding-bottom', offsetrulers + 'px');
    }

    _setGuidelines(_xpos = null, _ypos = null) {
        if (_xpos !== null) {
            const _carret = this.$.hRulerCarret;
            _carret.style.setProperty('left', (_xpos - 4.5) + 'px');
            _carret.style.setProperty('top', '12px');
            this.guidelinex = _xpos;
            this.style.setProperty('--theme-sig-app-crosslinex', _xpos + 'px');
            if (_xpos === 0) this.set('visibility.hidex', true);
            else this.set('visibility.hidex', false)
        }

        if (_ypos !== null) {
            const _carret = this.$.vRulerCarret;
            _carret.style.setProperty('top', (_ypos - 4.5) + 'px');
            _carret.style.setProperty('left', '12px');
            this.guideliney = _ypos;
            this.style.setProperty('--theme-sig-app-crossliney', _ypos + 'px');
            if (_ypos === 0) this.set('visibility.hidey', true);
            else this.set('visibility.hidey', false);
        }
        this._dispatchEvent();
    }

    _dispatchEvent() {
        if (this.controlEvent !== null) {
            const _data = {
                enableguidelines: this.enableguidelines,
                displayrulers: this.displayrulers,
                guidelinecolor: this.guidelinecolor,
                guidelinex: this.guidelinex,
                guideliney: this.guideliney
            };
            this.controlEvent.data = _data;
            this.controlEvent.setRulers();
        }
    }

    _hRulerMoveOut(evt) {
        if (!evt) return;
        this.set('visibility.hidehx', true);
        this.style.setProperty('--theme-sig-app-crosslinehx', "0px");
    }

    _vRulerMoveOut(evt) {
        if (!evt) return;
        this.set('visibility.hidehy', true);
        this.style.setProperty('--theme-sig-app-crosslinehy', "0px");
    }

    _hRulerMove(evt) {
        if (!evt) return;
        this.set('visibility.hidehx', false);
        const preferences = sigApi.designer.getPreferences();
        this.offsetX = preferences.app.offsetLeft - this.vRulerSize;
        this.style.setProperty('--theme-sig-app-crosslinehx', (evt.pageX - this.offsetX) + "px");
    }

    _vRulerMove(evt) {
        if (!evt) return;
        this.set('visibility.hidehy', false);
        const preferences = sigApi.designer.getPreferences();
        this.offsetY = preferences.app.offsetTop - this.hRulerSize;
        this.style.setProperty('--theme-sig-app-crosslinehy', (evt.pageY - this.offsetY) + "px");
    }

    _hRulerClick(evt) {
        if (!evt) return;
        if (this.enableguidelines === true) {
            const preferences = sigApi.designer.getPreferences();
            this.offsetX = preferences.app.offsetLeft - this.vRulerSize;
            this._setGuidelines(evt.pageX - this.offsetX, null);
        }
    }
    _vRulerClick(evt) {
        if (!evt) return;
        if (this.enableguidelines === true) {
            const preferences = sigApi.designer.getPreferences();
            this.offsetY = preferences.app.offsetTop - this.hRulerSize;
            this._setGuidelines(null, evt.pageY - this.offsetY);
        }
    }

    _hCarretClick(evt) {
        if (!evt) return;
        this.guidelinex = 0;
        this._setGuidelines(this.guidelinex, null);
        this.set('visibility.hidex', true)
    }
    _vCarretClick(evt) {
        if (!evt) return;
        this.guideliney = 0;
        this._setGuidelines(null, this.guideliney);
        this.set('visibility.hidey', true)
    }

    _visibilityChanged(visibility) {
        if (!visibility) return;
        for (const [key, value] of Object.entries(visibility.base)) {
            if (value === true) {
                this.setAttribute(key, '');
            } else {
                this.removeAttribute(key);
            }
        }
    }

    _init() {
        this._log('Rulers init');
        const _hRuler = this.$.hRuler;
        const _vRuler = this.$.vRuler;
        if (!_hRuler || !_vRuler) {
            this._log('Could not find ruler containers!', 'ERROR');
            return;
        }
        _hRuler.innerHTML = '';
        _vRuler.innerHTML = '';
        this.hidden = (this.displayrulers === true) ? false : true;

        const _rulerWidth = this.offsetWidth;
        const _rulerHeight = this.offsetHeight;


        this._generateRulerTicks(_hRuler, this.vRulerSize, parseInt(_rulerWidth, 10), this.vRulerSize, 'horizontal');
        this._generateRulerTicks(_vRuler, this.hRulerSize, parseInt(_rulerHeight, 10), this.hRulerSize, 'vertical');

        if (this.APP_ELEMENT !== undefined && this.hidden === false) {
            this._setFrameOffset(this.hRulerSize);
        } else if (this.APP_ELEMENT !== undefined && this.hidden === true) {
            this._setFrameOffset(0);
        }
    }

    _generateRulerTicks(container, start, end, offset, orientation = 'horizontal') {
        if (!(container instanceof HTMLElement)) {
            this._log('Invalid container for _generateRulerTicks', 'ERROR');
            return;
        }
        if (typeof start !== 'number' || isNaN(start)) {
            this._log('Invalid start value for _generateRulerTicks', 'ERROR');
            return;
        }
        if (typeof end !== 'number' || isNaN(end)) {
            this._log('Invalid end value for _generateRulerTicks', 'ERROR');
            return;
        }
        if (typeof offset !== 'number' || isNaN(offset)) {
            this._log('Invalid offset value for _generateRulerTicks', 'ERROR');
            return;
        }
        if (!(['horizontal', 'vertical'].includes(orientation))) {
            this._log('Invalid orientation for _generateRulerTicks', 'WARN');
            return;
        }

        const STEP_MINOR = 5;
        const STEP_MAJOR = 10;
        const STEP_LABEL = 50;

        const createTick = (type, pos, label = null) => {
            const el = document.createElement('div');
            el.className = `${type} rulersTick`;
            switch (orientation) {
                case 'vertical':
                    el.style.top = pos + 'px';
                    if (type === 'tickLabel' && label !== null) {
                        const span = document.createElement('span');
                        span.textContent = label;
                        el.appendChild(span);
                    }
                    break;
                case 'horizontal':
                default:
                    el.style.left = pos + 'px';
                    if (type === 'tickLabel' && label !== null) el.textContent = label;
                    break;
            }
            return el;
        };

        for (let tickPos = start; tickPos <= end + offset * 2; tickPos += STEP_MINOR) {
            const tickVal = tickPos - offset;
            if (tickPos < offset) continue;

            let el = null;
            if (tickVal % STEP_LABEL === 0) {
                el = createTick('tickLabel', tickPos, tickVal);
            } else if (tickVal % STEP_MAJOR === 0) {
                el = createTick('tickMajor', tickPos);
            } else if (tickVal % STEP_MINOR === 0) {
                el = createTick('tickMinor', tickPos);
            }
            if (el) container.appendChild(el);
        }
    }
}
customElements.define(SigRulersElement.is, SigRulersElement);
