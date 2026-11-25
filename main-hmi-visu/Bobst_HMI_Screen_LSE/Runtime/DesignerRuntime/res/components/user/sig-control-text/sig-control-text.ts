import { LasalRuntimeSigElementLight, SigPolymer } from '../../sigmatek/sig-element-light/sig-element-light.js';

/****************************************************************************************************
* @class 
* @classdesc Implements and exports sig-control-text component.
* @version 02.01.000
* @extends LasalRuntimeSigElementLight
* 
* @property {String}  sigtext The source text of the component.
* @property {String}  previewtext The preview text of the component in the style class editor.
* @property {Boolean} isReady Defines if the Element is ready for initialization.
* @property {Boolean} propsReady Defines if the properties are ready.
*
****************************************************************************************************/
export class LasalRuntimeSigTextElement extends LasalRuntimeSigElementLight {

    /****************************************************************************************************
    * Returns the component's registered tag name.
    *
    * @readonly
    * @static
    * @returns {string} The controls tag name.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    static get is(): string {
        return "sig-control-text";
    }

    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    static get importMeta(): ImportMeta { return import.meta; }
    
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @returns {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    static get template(): HTMLTemplateElement {
        return SigPolymer.html`
            <style include="sig-element-light-css">
                :host {
                    /* Basic styling of the component */
                    color: var(--theme-sig-control-text-color, inherit);
                    background-color: var(--theme-sig-control-text-background-color, inherit);
                    border-width: var(--theme-sig-control-text-border-width, 0px);
                    border-color: var(--theme-sig-control-text-border-color, inherit);
                    border-style: var(--theme-sig-control-text-border-style, none);
                    border-radius: var(--theme-sig-control-text-border-radius, 0px);

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

                .sig-text {
                    /* The container is rendered as a table so we can set the span to table-cell */
                    display: table;
                    width: 100%;
                    height: 100%;
                    text-decoration: inherit;
                }

                #label {
                    /* The container is rendered as a table-cell so we can position the value via vertical-align */
                    display: table-cell;
                    padding: var(--theme-sig-control-text-value-padding, 3);
                    padding-top: var(--theme-sig-control-text-value-padding-top, var(--theme-sig-control-text-value-padding, 3));
                    padding-right: var(--theme-sig-control-text-value-padding-right, var(--theme-sig-control-text-value-padding, 3));
                    padding-bottom: var(--theme-sig-control-text-value-padding-bottom, var(--theme-sig-control-text-value-padding, 3));
                    padding-left: var(--theme-sig-control-text-value-padding-left, var(--theme-sig-control-text-value-padding, 3));
                    text-align: var(--theme-sig-control-text-value-align, center);
                    vertical-align: var(--theme-sig-control-text-value-vertical-align, middle);
                    white-space: var(--theme-sig-control-text-value-white-space, normal);
                    text-decoration: inherit;
                    text-shadow: var(--theme-sig-control-text-value-text-shadow, none);
                }

                :host([isdesignmode]:hover) {
                    background-color: var(--theme-sig-control-text-background-color, rgba(255, 255, 255, .3));
                }
            </style>
            <div class="sig-text clearfix">
                <div id="label" class="content">[[sigtextc]]</div>
            </div>
            `
    }
    //Polymer properties type definition
    sigtextc: string
    dolinebreak: boolean
    rendermanualbreaks: boolean
    textshadowcolor1: string
    textshadowcolor2: string
    textshadowblur1: string
    textshadowblur2: string
    textshadowintensity1: string
    textshadowintensity2: string

    /****************************************************************************************************
    * Returns the defined Polymer properties of the component.
    *
    * @readonly
    * @static
    * @returns {object} The defined Polymer properties.
    * @memberof LasalRuntimeSigTextElement
    * 
    * @property {String} sigtextc             - The computed text of the component.
    * @property {Boolean} dolinebreak         - De/activate automatic Linebreaks.
    * @property {Boolean} rendermanualbreaks  - Determines if manually defined linebreaks by using <br /> or /n will be rendered.
    * @property {String} textshadowcolor1     - The first text-shadow color.
    * @property {String} textshadowcolor2     - The second text-shadow color.
    * @property {String} textshadowblur1      - The blur of the first text shadow.
    * @property {String} textshadowblur2      - The blur of the second text shadow.
    * @property {String} textshadowintensity1 - Number of overlayed text-shadows for the first layer.
    * @property {String} textshadowintensity2 - Number of overlayed text-shadows for the second layer.
    ****************************************************************************************************/
    static get properties(): object{
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            sigtextc: {
                type: String,
                value: '',
                computed: '_computeText(sigtext, previewtext, rendermanualbreaks)'
            },
            dolinebreak: {
                type: Boolean,
                value: true,
                observer: '_toggleLinebreak'
            },
            rendermanualbreaks: {
                type: Boolean,
                value: false,
                observer: '_toggleLinebreak'
            },
            textshadowcolor1: {
                type: String,
                value: "rgba(255,255,255,1)",
                observer: '_updateTextShadow'
            },
            textshadowcolor2: {
                type: String,
                value: "rgba(255,255,255,1)",
                observer: '_updateTextShadow'
            },
            textshadowblur1: {
                type: String,
                value: "1px",
                observer: '_updateTextShadow'
            },
            textshadowblur2: {
                type: String,
                value: "1px",
                observer: '_updateTextShadow'
            },
            textshadowintensity1: {
                type: String,
                value: "0",
                observer: '_updateTextShadow'
            },
            textshadowintensity2: {
                type: String,
                value: "0",
                observer: '_updateTextShadow'
            }
        }
        return props;
    }
    
    //Member properties type definition
    sigtext: string
    previewtext: string
    isReady: boolean
    propsReady: boolean
    
    /****************************************************************************************************
    * Creates an instance of LasalRuntimeSigTextElement.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    constructor() {
        super();

        this.sigtext = '';
        this.previewtext = '-- Text --';

        this.isReady = false;
        this.propsReady = false;

        this.sigAddRequiredProperty('textshadowcolor1');
        this.sigAddRequiredProperty('textshadowcolor2');
        this.sigAddRequiredProperty('textshadowblur1');
        this.sigAddRequiredProperty('textshadowblur2');
        this.sigAddRequiredProperty('textshadowintensity1');
        this.sigAddRequiredProperty('textshadowintensity2');
    }



    /****************************************************************************************************
    * This callback is called after property values are set and local DOM is initialized.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    ready(): void{
        super.ready();
        this.isReady = true;

        if (this.isdesignmode) {
            SigPolymer.afterNextRender(this, function(this: LasalRuntimeSigTextElement) {
                this.propsReady = true;
                this._updateTextShadow();
            });
        } else {
            if (this.propsReady) {
                this._updateTextShadow();
            }
        }
    }

    /****************************************************************************************************
    * Is called after required properties are ready.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    sigOnRequiredPropertiesReady(): void{
        super.sigOnRequiredPropertiesReady();
        this.propsReady = true;
        if (this.isReady) {
            this._updateTextShadow();
        }
    }

    /****************************************************************************************************
    * Computed property method that returns the text string.
    *
    * @param {string} _sigtext The text source of the component.
    * @param {string} _previewtext The preview text of the component.
    * @return {string}  The computed text.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    _computeText(_sigtext: string, _previewtext: string, rendermanualbreaks: boolean): string {
        let tmpText = (_sigtext === '' && this.isdesignmode) ? _previewtext : _sigtext;
        if (rendermanualbreaks) {
            return tmpText.replace(/(?:\\n|<br\s*\/?>)/gi, '\n');
        }
        return tmpText;
    }

    /****************************************************************************************************
    * This observer runs if the property 'dolinebreak' or 'rendermanualbreaks' changes and
    * toggles the whitespace CSS attribute based ob the value of 'dolinebreak' and 'rendermanualbreaks'.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    _toggleLinebreak(): void{
        const whitespace = this.dolinebreak
            ? (this.rendermanualbreaks ? "pre-wrap" : "normal")  // automatic line break on
            : (this.rendermanualbreaks ? "pre" : "nowrap");     // automatic line break off

        this.updateStyles({ "--theme-sig-control-text-value-white-space": whitespace });        
    }

    /****************************************************************************************************
    * An observer method which is called to update the text shadow.
    *
    * @param {string} newval New value of property.
    * @param {string} oldval Old value of property.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    _updateTextShadow(newval?: string, oldval?: string): void{
        if (this.propsReady && this.isReady) {
            const textShadow = this._getTextShadow();
            this.updateStyles({ '--theme-sig-control-text-value-text-shadow': textShadow || 'none' });
        }
    }

    /****************************************************************************************************
    * Returns the computed text-shadow.
    *
    * @returns {string} Text shadow.
    * @memberof LasalRuntimeSigTextElement
    ****************************************************************************************************/
    _getTextShadow(): string{
        let textShadowLayer1 = '';
        let textShadowLayer2 = '';

        for (let i = 0; i < parseInt(this.textshadowintensity1); i++) {
            textShadowLayer1 += `0px 0px ${parseFloat(this.textshadowblur1)}px ${this.textshadowcolor1}, `;
        }
        for (let i = 0; i < parseInt(this.textshadowintensity2); i++) {
            textShadowLayer2 += `0px 0px ${parseFloat(this.textshadowblur2)}px ${this.textshadowcolor2}, `;
        }
        return (textShadowLayer1 + textShadowLayer2).slice(0, -2);
    }

}
customElements.define(LasalRuntimeSigTextElement.is, LasalRuntimeSigTextElement);
