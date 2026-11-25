import { LasalRuntimeSigElement, SigPolymer } from "../../sigmatek/sig-element/sig-element.js";

export class SigDesignerControlInfo extends LasalRuntimeSigElement {
    static get is() {
        return "sig-designer-control-info";
    }

    static get importMeta() {
        return import.meta;
    }

    static get template() {
        return SigPolymer.html`
            <style>
            :host {
                --height: 20px;
                --width: 100%;
                --color: var(--theme-sig-designer-control-info-color,rgba(180, 180, 180, 1));
                --background-color: var(--theme-sig-designer-control-info-background-color, rgba(0,0,0,.5));
                --font-family: "Roboto", Arial, Verdana;
                --font-size: var(--theme-sig-designer-control-info-font-size, 12px);
                --text-align: var(--theme-sig-designer-control-info-text-align, center);
                --label-color: var(--theme-sig-designer-control-info-label-color, rgba(32, 157, 229, 1));
                --label-font-weight: var(--theme-sig-designer-control-label-font-weight, normal);
                --border-top-color: var(--theme-sig-designer-control-border-top-color, rgba(50,50,50,.8));
                --zoom: var(--theme-sig-designer-handle-zoom, 1);
            }
            :host {
                position: fixed;
                bottom: 0;
                left: 0;
                height:var(--height);
                width: var(--width);
                padding: 0 10px;
                margin: 0;
                overflow: hidden;
                color: var(--color);
                background-color: var(--background-color);
                backdrop-filter: blur(10px) brightness(0.8);
                font-family: var(--font-family);
                font-size: var(--font-size);
                line-height: var(--height);
                text-align: var(--text-align);
                border-top: 1px solid var(--border-top-color);
                display: none;
                pointer-events:none;
                z-index: 100200;
                zoom: var(--zoom);
            }
            :host(:not([hidden])) {
                display: block;
            }
            .sig-designer-control-info {
                position: relative;
                height: 100%;
                width: 100%;
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }
            .label {
                color: var(--label-color);
                font-weight: var(--label-font-weight);  
            }
            </style>
            <div id="info" class="sig-designer-control-info">
                <span class="label">[[instanceName]]</span>&nbsp;([[controlName]])&nbsp;
                <span class="label">Top/Left</span>&nbsp;([[bounds.top]], [[bounds.left]])&nbsp;
                <span class="label">Width:</span>&nbsp;[[bounds.width]]&nbsp; 
                <span class="label">Height:</span>&nbsp;[[bounds.height]]&nbsp;
                <span class="label">Rotation:</span>&nbsp;[[bounds.rotation]]
            </div>
        `;
    }

    static get properties() {
        return {
            hidden: {
                type: Boolean,
                value: true,
                reflectToAttribute: true
            },
            enabled: {
                type: Boolean,
                value: false,
                observer: '_enabledChanged'
            }
        };
    }

    constructor() {
        super();
        this.coreEvent = null;
        this.coreEventHandler = null;
        this.master = null;
        this.bounds = {};
        this.instanceName = '';
        this.controlName = '';
    }

    connectedCallback() {
        super.connectedCallback();
        this._subscribeEvents();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._reset(true);
        this._unsubscribeEvents();
    }

    _subscribeEvents() {
        if (this.coreEventHandler === null) {
            this.coreEventHandler = (evt) => {
                this._handleCoreEvent(evt);
            }
        }
        if (this.coreEvent === null) {
            this.coreEvent = window.sigApi.designer.getCoreEventInstance();
            this.coreEvent.subscribe(this.coreEventHandler);
        }
    }

    _unsubscribeEvents() {
        if (this.coreEvent && this.coreEventHandler) {
            this.coreEvent.unsubscribe(this.coreEventHandler);
            this.coreEvent = null;
            this.coreEventHandler = null;
        }
    }

    _handleCoreEvent(evt) {
        const {
            type,
            target,
            data,
        } = evt?.detail;
        switch (type) {
            case 'setcontrolinfo':
                this._setPreferences(data);
                break;
            case 'setmaster':
                this.master = target;
                this._show();
                break;
            case 'resize':
            case 'move':
                this._update();
                break;
            case 'delete':
            case 'unselect':
                if (this.master === target) {
                    this._hide();
                }
                break;
            case 'unselectall':
                this._hide();
                break;
            case 'setProperties':
                if (this.master === target) {
                    this._update();
                }
                break;
        }
    }

    _show() {
        if (this.enabled === false) return;
        this._update();
        this.hidden = false;
    }

    _hide() {
        this._reset();
        this.hidden = true;
    }

    _setPreferences(preferences) {
        if (!preferences) return;
        if (preferences.enabled !== undefined) this.enabled = preferences.enabled;
    }

    _enabledChanged(enabled) {
        if (enabled && this.master) {
            this._show();
        } else {
            this._hide();
        }
    }

    _reset(clearMaster = false) {
        if (clearMaster) {
            this.master = null;
        } else {
            const currentMaster = window.sigApi.designer.currentMaster();
            if (currentMaster !== this.master) this.master = null;
        }
        this.bounds = {};
        this.instanceName = '';
        this.controlName = '';
    }

    _update() {
        if (this.enabled === false) return;
        if (this.master === null) return;
        const { DESIGNER_CONTROL_PROPERTY_INSTANCE_NAME, DESIGNER_CONTROL_PROPERTY_CONTROL_NAME } = window.sigApi.designer.SIG_CONST;
        const master = this.master;
        const handlesTool = master._getDesignerTool && master._getDesignerTool('handles');
        const ghost = handlesTool ? handlesTool.ghost : null;
        const instanceName = master[DESIGNER_CONTROL_PROPERTY_INSTANCE_NAME];
        const controlName = master[DESIGNER_CONTROL_PROPERTY_CONTROL_NAME];
        this.bounds = (ghost && ghost.hidden === false) ? ghost.getControlBounds() : (master.getControlBounds ? master.getControlBounds() : {});
        this.instanceName = instanceName ? instanceName : DESIGNER_CONTROL_PROPERTY_INSTANCE_NAME;
        this.controlName = controlName ? controlName : DESIGNER_CONTROL_PROPERTY_CONTROL_NAME;
    }

    _getDesignerTool() {
        return null;
    }

}
window.customElements.define(SigDesignerControlInfo.is, SigDesignerControlInfo);
