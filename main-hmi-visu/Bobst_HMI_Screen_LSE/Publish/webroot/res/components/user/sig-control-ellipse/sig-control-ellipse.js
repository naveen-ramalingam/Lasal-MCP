import { LasalRuntimeSigElementLight, SigPolymer } from '../../sigmatek/sig-element-light/sig-element-light.js';
/****************************************************************************************************
*
* @export
* @class LasalRuntimeSigellipseElement
* @classdesc Implements and exports the sig-control-ellipse component.
* @version 03.00.000
* @extends {LasalRuntimeSigElementLight}
****************************************************************************************************/
export class LasalRuntimeSigellipseElement extends LasalRuntimeSigElementLight {
    /****************************************************************************************************
    * Returns the component's registered tag name.
    *
    * @readonly
    * @static
    * @returns {string} The control's tag name.
    * @memberof LasalRuntimeSigellipseElement
    ****************************************************************************************************/
    static get is() {
        return "sig-control-ellipse";
    }
    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigellipseElement
    ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @type {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigellipseElement
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
        <style include="sig-element-css">
            :host {
                /* Basic styling of the component */
                background-color: var(--theme-sig-control-ellipse-background-color, inherit);
                border-width: var(--theme-sig-control-ellipse-border-width, 1px);
                border-color: var(--theme-sig-control-ellipse-border-color, inherit);
                border-style: var(--theme-sig-control-ellipse-border-style, solid);
                border-radius: 100%;
                /* Basic box model settings */
                display: block;
                position: absolute;
                overflow: hidden;
            }
            :host * {
                /* Reset margin and paddings for child elements and turn of ellipse selection */
                margin: 0;
                padding: 0;
            }
            .clearfix:after {
            @apply --clearfix 
            }
            .sig-ellipse {
                width: 100%;
                height: 100%;
            }
        </style>
        <div class="sig-ellipse clearfix">
        </div>
        `;
    }
}
customElements.define(LasalRuntimeSigellipseElement.is, LasalRuntimeSigellipseElement);
//# sourceMappingURL=sig-control-ellipse.js.map