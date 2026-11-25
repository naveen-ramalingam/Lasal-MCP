import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';


/****************************************************************************************************
* @export
* @class LasalRuntimeSigHmControlSvgContainer
* @classdesc Implements and exports the sig-control-svg-container component.
* @version 02.00.000
* @extends {LasalRuntimeSigElement}
*
* @property {HTMLObjectElement} svgObject SVG object.
* @property {undefined} svgElement SVG element.
* @property {HTMLElement} svgContentElement SVG content element used to set attributes.
* @property {boolean} firstRenderDone Indicator for the first run.
* @property {Map<string, string>} svgCache Previously loaded svg used if in the svgCache.
****************************************************************************************************/
export class LasalRuntimeSigHmControlSvgContainer extends LasalRuntimeSigElement {
    
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @returns {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigHmControlSvgContainer
    ****************************************************************************************************/
    static get template(): HTMLTemplateElement {
        return SigPolymer.html`
        <style include="sig-element-css">
            :host {
                /* Basic styling of the component */
                color: var(--theme-sig-control-svg-container-color, inherit);
                background-color: var(--theme-sig-control-svg-container-background-color, transparent);
                border-width: var(--theme-sig-control-svg-container-border-width, inherit);
                border-color: var(--theme-sig-control-svg-container-border-color, inherit);
                border-style: var(--theme-sig-control-svg-container-border-style, none);
                border-radius: var(--theme-sig-control-svg-container-border-radius, none);

                /* Basic box model settings */
                display: block;
                position: absolute;
                overflow: hidden;
            }

            :host * {
                /* Reset margin and paddings for child elements and turn of text selection */
                @apply --notextselect;
                margin: 0;
                padding: 0;
            }

            .clearfix:after {
                @apply --clearfix
            }

            .sig-control-svg-container {
                position: relative;
                width: 100%;
                height: 100%;
            }

            :host([isdesignmode][svgsource='']) .sig-control-svg-container,
            :host([isdesignmode][svgsource='none']) .sig-control-svg-container {
                background: url(preview.svg) no-repeat center center;
                background-size: 50px 50px;
            }

            #svgcontainer>svg {
                width: 100%;
                height: 100%;
            }
        </style>
        <div class="sig-control-svg-container clearfix" id="svgcontainer" on-tap="_handleOnTap" on-down="_handleOnDown"
            on-up="_handleOnUp">
        </div>

        `;
    }
    
    /****************************************************************************************************
    * Returns the component's registered tag name.
    *
    * @readonly
    * @static
    * @returns {String} The component's tag name.
    * @memberof LasalRuntimeSigHmControlSvgContainer
    ****************************************************************************************************/
    static get is(): string {
        return "sig-control-svg-container";
    }

    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigHmControlSvgContainer
    ****************************************************************************************************/
    static get importMeta(): ImportMeta { return import.meta; }

    //Polymer properties type definition
    svgsource: string
    svgid: string
    svgattributename: string
    svgattributevalue: string
   
    /****************************************************************************************************
    * Returns the defined Polymer properties of the component.
    *
    * @readonly
    * @static
    * @returns {Object} The defined Polymer properties.
    * @memberof LasalRuntimeSigHmControlSvgContainer
    * 
    * @property {String}    svgsource           - the svg that is shown
    * @property {String}    svgid               - the id of the element that will be colored
    * @property {String}    svgattributename    - the svg attribute that will be changed
    * @property {String}    svgattributevalue   - the value of the changed svg attribute
    ****************************************************************************************************/
    static get properties(): object {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            //! Remove for Update without polymer data binding
            svgsource: {
                type: String,
                value: '',
                reflectToAttribute: true,
                observer: "_sourceChanged"
            },
            svgid: {
                type: String,
                value: '',
                observer: "_propertyChanged"
            },
            svgattributename: {
                type: String,
                value: '',
                observer: "_propertyChanged"
            },
            svgattributevalue: {
                type: String,
                value: '',
                observer: "_propertyChanged"
            }
        };
        return props;
    }
    //Member properties type definition
    svgObject: undefined | HTMLObjectElement
    svgElement: undefined
    svgContentElement: undefined | HTMLElement | null
    firstRenderDone: boolean
    svgCache: Map<string, string>

    /****************************************************************************************************
     *Creates an instance of LasalRuntimeSigHmControlSvgContainer.
     * @constructor
     * @memberof LasalRuntimeSigHmControlSvgContainer
     ****************************************************************************************************/
    constructor() {
        super();
        this.svgObject = undefined;
        this.svgElement = undefined;
        this.svgContentElement = undefined;
        this.firstRenderDone = false;
        this.svgCache = new Map;
    }

    /****************************************************************************************************
     * 
     * @memberof LasalRuntimeSigHmControlSvgContainer
     ****************************************************************************************************/
    _render(): void {
        if (!this.firstRenderDone) this.firstRenderDone = true;
        this._setSvgAttribute(this.svgattributename, this.svgattributevalue);
    }

    /****************************************************************************************************
     *  sets an svg attribute to a value
     * 
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {string} attributeName     the name of the attribute that will be changed
     * @param {string} attributeValue    the value that the attribute should be set to
     * 
     ****************************************************************************************************/
    _setSvgAttribute(attributeName: string, attributeValue: string): void {
        if (attributeName !== undefined && attributeValue !== undefined) {
            this.svgContentElement?.style.setProperty(attributeName, attributeValue);
        }
    }

    /****************************************************************************************************
     * Called when the component is tapped
     * dispatches a tap event
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {*} evt   the tap event
     ****************************************************************************************************/
    _handleOnTap(evt: Event): void {
        this._dispatchEvent('tap');
    }

    /****************************************************************************************************
     * Called when the compnent receives a down event
     * dispatches a mousedown event
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {*} evt   the down event
     ****************************************************************************************************/
    _handleOnDown(evt: Event): void {
        this._dispatchEvent('mousedown');
    }

    /****************************************************************************************************
     * Called when the component receives an up event
     * dispatches a moueup event
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {*} evt   the up event
     ****************************************************************************************************/
    _handleOnUp(evt: Event): void {
        this._dispatchEvent('mouseup');
    }

    /****************************************************************************************************
     * Called when an observed property changes
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {*} newValue  the new value of the property
     * @param {*} oldValue  the old value of the property
     ****************************************************************************************************/
    _propertyChanged(newValue: string, oldValue: string): void {
        if (this.firstRenderDone) {
            this._render();
        }
    }

    /****************************************************************************************************
     * Called if the source svg changes
     * either loads a new svg, or removes the currently loaded
     * 
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {string} newSrc    the new source path of the svg
     * @param {string} oldSrc    the old source path of the svg
     ****************************************************************************************************/
    _sourceChanged(newSrc: string, oldSrc: string): void {
        if (newSrc !== undefined && newSrc !== '' && newSrc !== 'none') {
            this._loadSvgContent(newSrc);
        } else {
            this._removeChildNodes(this.$.svgcontainer as HTMLElement);
        }
    }

    /****************************************************************************************************
     * removes all child nodes from the parent element
     * 
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {HTMLElement} parent    the element which child nodes need to be removed
     ****************************************************************************************************/
    _removeChildNodes(parent: HTMLElement): void {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    }

    /****************************************************************************************************
     * Loads the svg by fetching the source code
     * 
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {string} src   path to the svg that should be loaded
     ****************************************************************************************************/
    async _loadSvgContent(src: string){
        this.firstRenderDone = false;
        //If the svg has already been loaded previously, we can use the stored svg data
        if (this.svgCache.has(src)) {
            this._insertSvg(this.svgCache.get(src), true);
        } else {
            //Fetch the svg code
            const svg = await fetch(src)
                .then(response => {
                    return response.text();
                })
                .catch(error => {
                    this._log(`Faild to fetch ${src}`, 'ERROR');
                });
            this._insertSvg(svg);
        }
    }

    /****************************************************************************************************
     * Inserts the svg source code
     * @memberof LasalRuntimeSigHmControlSvgContainer
     * @param {any} svg
     * @param {boolean} [fromCache=false]
     ****************************************************************************************************/
    _insertSvg(svg: any, fromCache: boolean = false): void {
        if (svg) { // loaded by fetch or cache
            this.$.svgcontainer.innerHTML = svg;
        } else { // loaded by object
            const svg = (this.svgObject as HTMLObjectElement)?.contentDocument?.querySelector('svg') || (this.svgObject as HTMLObjectElement)?.contentDocument?.firstChild;
            this.$.svgcontainer.appendChild(svg as Node);
            this.svgObject?.remove();
            
        }
        if (!fromCache) {
            this.svgCache.set(this.svgsource, this.$.svgcontainer.innerHTML);
        }

        // Do the first render after loading the svg
        this.svgContentElement = this.shadowRoot?.getElementById(this.svgid);
        if (this.svgContentElement !== null && this.svgContentElement !== undefined) {
            this._render();
        }
    }
}
customElements.define(LasalRuntimeSigHmControlSvgContainer.is, LasalRuntimeSigHmControlSvgContainer);
