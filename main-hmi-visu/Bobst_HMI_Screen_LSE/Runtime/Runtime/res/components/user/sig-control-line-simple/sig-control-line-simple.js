import { LasalRuntimeSigElementLight, SigPolymer } from '../../sigmatek/sig-element-light/sig-element-light.js';
/****************************************************************************************************
* @export
* @class LasalRuntimeSigLineSimpleElement
* @classdesc Implements and exports the sig-control-line-simple control.
* @version 02.00.000
* @extends {LasalRuntimeSigElementLight}
*
* @property {Boolean} initialized Indicator for initialization. True after the line got updated.
****************************************************************************************************/
export class LasalRuntimeSigLineSimpleElement extends LasalRuntimeSigElementLight {
    /****************************************************************************************************
    * Returns the component's registered tag name
    *
    * @readonly
    * @static
    * @returns {string} The control's tag name.
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    static get is() {
        return "sig-control-line-simple";
    }
    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @type {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @type {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
        <style include="sig-element-css">
            :host {
                /* Basic styling of the component */
                background-color: var(--theme-sig-control-line-simple-background-color, inherit);

                border: none;
                
                /* Basic box model settings */
                display: block;
                position: absolute;
                overflow: visible;
            }

            :host * {
                /* Reset margin and paddings for child elements and turn of rectangle selection */
                margin: 0;
                padding: 0;
            }

            .clearfix:after {
                @apply --clearfix
            }

            .sig-rectangle {
                width: 100%;
                height: 100%;
            }

            #line {
                background-color: var(--theme-sig-control-line-simple-line-color, inherit);
                position: absolute;
                top: 50%;
                left: 50%;
                border-radius: var(--theme-sig-element-height, 999px);
            }
        </style>
        <div class="sig-rectangle clearfix">
            <div id="line"></div>
        </div>`;
    }
    /****************************************************************************************************
    * @readonly
    * @static
    * @type {object}
    * @memberof LasalRuntimeSigLineSimpleElement
    *
    * @property {string} linewidth  - The width of the line.
    * @property {string} direction  - The direction of the line.
    ****************************************************************************************************/
    static get properties() {
        return {
            linewidth: {
                type: String,
                value: "1px",
                observer: '_lineChanged'
            },
            direction: {
                type: String,
                value: 'horizontal',
                observer: '_lineChanged'
            }
        };
    }
    /****************************************************************************************************
    * This callback is called after property values are set and local DOM is initialized.
    *
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    ready() {
        super.ready();
        //css variables should be set at this point
        this._updateLine();
        this.initialized = true;
    }
    /****************************************************************************************************
    * Boundaries of the line changed
    *
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    designerOnBoundsChanged() {
        SigPolymer.afterNextRender(this, function () {
            this._updateLine();
        });
    }
    /****************************************************************************************************
    * Updates the Line
    *
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    _updateLine() {
        this.$.line.style.height = `${parseFloat(this.linewidth)}px`;
        let bounds = this.getControlBounds();
        let len, len2;
        switch (this.direction) {
            case 'horizontal':
                if (bounds !== null) {
                    this.$.line.style.width = `${bounds.width}px`;
                    this.$.line.style.transform = `translateX(-50%) translateY(calc(-50%))`;
                }
                break;
            case 'vertical':
                if (bounds !== null) {
                    this.$.line.style.width = `${bounds.height}px`;
                    this.$.line.style.transform = `translateX(calc(-50%)) translateY(-50%) rotate(90deg)`;
                }
                break;
            case 'topleftbotright':
                if (bounds !== null) {
                    len = Math.sqrt(Math.pow(bounds.height, 2) + Math.pow(bounds.width, 2));
                    len2 = Math.sqrt(Math.pow(bounds.height, 2) + Math.pow(bounds.width, 2));
                    this.$.line.style.width = `${len}px`;
                    this.$.line.style.transform = `translateY(-50%) translateX(-50%) rotate(${Math.asin(bounds.height / len2)}rad)`;
                }
                break;
            case 'botlefttopright':
                if (bounds !== null) {
                    len = Math.sqrt(Math.pow(bounds.height, 2) + Math.pow(bounds.width, 2));
                    len2 = Math.sqrt(Math.pow(bounds.height, 2) + Math.pow(bounds.width, 2));
                    this.$.line.style.width = `${len}px`;
                    this.$.line.style.transform = `translateY(-50%) translateX(-50%) rotate(-${Math.asin(bounds.height / len2)}rad)`;
                }
                break;
        }
    }
    /****************************************************************************************************
    * The Line changed.
    *
    * @memberof LasalRuntimeSigLineSimpleElement
    ****************************************************************************************************/
    _lineChanged() {
        //only update if already done yet
        if (this.initialized === true) {
            this._updateLine();
        }
    }
}
customElements.define(LasalRuntimeSigLineSimpleElement.is, LasalRuntimeSigLineSimpleElement);
//# sourceMappingURL=sig-control-line-simple.js.map