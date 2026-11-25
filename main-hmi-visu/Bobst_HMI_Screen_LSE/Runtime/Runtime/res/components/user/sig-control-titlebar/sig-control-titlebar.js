import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';

export class LasalRuntimeSigTitlebarElement extends LasalRuntimeSigElement {

    static get is() {
        return "sig-control-titlebar";
    }

    static get importMeta() {
        return import.meta;
    }

    static get template() {
        return SigPolymer.html`
            <style include="sig-element-css">
        :host {
            
            color: var(--theme-sig-control-titlebar-color, rgba(255, 255, 255, 1));
            background-color: var(--theme-sig-control-titlebar-background-color, rgba(102, 102, 102, 1));

            border-width: var(--theme-sig-control-titlebar-border-width, 1px);
            border-color: var(--theme-sig-control-titlebar-border-color, transparent);
            border-style: var(--theme-sig-control-titlebar-border-style, solid);
            border-radius: var(--theme-sig-control-titlebar-border-radius, 0px);

            width: var(--theme-sig-element-width, 100%);
            height: var(--theme-sig-control-titlebar-height, var(--theme-sig-element-height, 26px));
            max-height: var(--theme-sig-control-titlebar-height, var(--theme-sig-element-height, 26px));

            
            display: block;
            overflow: hidden;
            position: absolute;
            }

            :host * {
            
            @apply --notextselect;
            margin: 0;
            padding: 0;
                }

        .clearfix:after {
            @apply --clearfix
            }

            .sig-titlebar {
                        
            display: table;
            width: 100%;
            height: 100%;
            text-decoration: inherit;
            }

            .sig-titlebar div.content {
            
            display: table-cell;
            padding: var(--theme-sig-control-titlebar-value-padding-vertical, 2px) var(--theme-sig-control-titlebar-value-padding-horizontal, 5px);
            text-align: var(--theme-sig-control-titlebar-value-align, center);
            vertical-align: var(--theme-sig-control-titlebar-value-vertical-align, middle);
            white-space: var(--theme-sig-control-titlebar-value-white-space, nowrap);
            height: calc(100% - 2*var(--theme-sig-control-titlebar-value-padding-vertical, 2px));
            width: calc(100% - 2*var(--theme-sig-control-titlebar-value-padding-horizontal, 5px));
}

            :host([applybordereffect]) {
            border: none;
            box-shadow: inset 1px 1px 0px 0px rgba(255, 255, 255, .4), inset -1px -1px 0px 0px rgba(0, 0, 0, 1);
            outline: 1px solid transparent;
            }

            :host([shadowactive]:not([applybordereffect])) {
            box-shadow: inset 0 0 var(--theme-sig-control-titlebar-border-shadow-size, 0px) var(--theme-sig-control-titlebar-border-shadow-color, rgba(0, 0, 0, 1));
            }
            </style>
    <div id="titlebar" class="sig-titlebar clearfix">
        <div id="label" class="content">[[valuec]]</div>
    </div>
    `;
    }

    static get properties() {
        let props = {
            value: {
                type: String,
                value: '',
                reflectToAttribute: false
            },
            valuec: {
                type: String,
                value: '',
                computed: '_computeText(value,previewtext,isstylepreview)'
            },
            shadowactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            applybordereffect: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            fontobjecttitle: {
                type: Object,
                value: () => { return {} },
                observer: '_applFontObjects'
            },
            previewtext: {
                type: String,
                value: 'text',
            }
        }
        return props;
    }

    _applFontObjects() {
        const _titlebar = this.$.titlebar;
        if (this.fontobjecttitle && _titlebar) this._applyFontObjectToNode(_titlebar, this.fontobjecttitle);
    }

    _computeText(_value, _previewtext, _isstylepreview) {
        return (_value === '' && _isstylepreview && this.isdesignmode) ? _previewtext : _value;
    }

}
customElements.define(LasalRuntimeSigTitlebarElement.is, LasalRuntimeSigTitlebarElement);
