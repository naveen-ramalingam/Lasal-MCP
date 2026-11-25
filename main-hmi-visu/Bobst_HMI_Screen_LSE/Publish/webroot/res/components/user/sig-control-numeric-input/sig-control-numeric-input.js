// Import the Lasal Runtime base element into your component
// Import SigPolymer to use Polymer methods: html, afterNextRender, beforeNextRender, debouncer, timeOut
// or if your component's getter template() returns a HTML literal
import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import { UnitConversionMixin } from '../../sigmatek/sig-element-mixins/unit-conversion-mixin.js';
/****************************************************************************************************
* @export
* @class LasalRuntimeSigNumericInputElement
* @version 04.00.000
* @extends {UnitConversionMixin(LasalRuntimeSigElement)}
*
* @property {Number} repeatInterval Holds interval id.
* @property {Promise<string|null>} activeLang The active language marker.
* @property {SigApi.ApiViewModel} vmApi The reference to the ViewModel Api.
* @property {SigApi.ApiKeyboardManager} keyboardApi The reference to the Keyboard Api.
* @property {SigApi.ApiEventMediator} eventMediatorApi The reference to the eventMediator Api.
* @property {SigApi.ApiEvents} eventsApi The reference to the events Api.
* @property {Number} incamount_unconverted The amount by which the value is increased or decreased.
* @property {Number} limitLow Defines the lower limit property.
* @property {Boolean} ignoremin Defines whether the limitLow should be ignored.
* @property {String} type Defines the type of the input (text, numeric, hex, ipv4, date-rt, time-rt).
* @property {Number} limitHigh Defines the upper limit property.
* @property {Boolean} ignoremax Defines whether the limitHigh should be ignored.
* @property {Number} maxlength The max length of the input value.
* @property {String} placeholder Placeholder folr input.
* @property {String} keyboardid Defines the keyboard ID that is supposed to be opened on click.
* @property {String} titletext Defines the title text of the keyboard window.
* @property {Boolean} writeonincrement Defines whether the increment and decrement buttons directly write the value.
* @property {String} increasebgimageactive The image used for the increase button, when the input is active.
* @property {String} decreasebgimageactive The image used for the decrease button when the input is active.
* @property {String} cinputwidth Input width.
* @property {String} cunitwidth Unid width.
* @property {String} intervaltype Defines if the buttons fire once or continue until they are released.
* @property {Number} intervaltime If the interval type is repeat, this value determines the time between repeats
* @property {HTMLElement} dashboardKeyboard
* @property {boolean} openkeyboardbeside If true, the keyboard window is positioned in a way it does not cover the active input.
* @property {string} keyboardwindow Keyboard window, which should be opened, when the user clicks on the input.
* @property {string} format Defines the date/time format of the value property.
* @property {string} unittext The text of the unit.
* @property {string} cincreasebgimage Increase background image.
* @property {string} cdecreasebgimage Decrease background image.
* @property {boolean} rendered
* @property {boolean} updateonsamevalue If activated the data point, configured at value, is also written if the value doesn't change.
* @property {number} errorInfo Error Information.
* @property {string} limitHigh_converted Limit high converted handled by the unit conversion mixin.
* @property {string} limitLow_converted Limit low converted handled by the unit conversion mixin.
* @property {SigApi.ApiSigConst} constApi The reference to the Const Api.
* @property {string} value_converted value converted handled by the unit conversion mixin.
* @property {number} value_unconverted The unconverted value.
****************************************************************************************************/
export class LasalRuntimeSigNumericInputElement extends UnitConversionMixin(LasalRuntimeSigElement) {
    /****************************************************************************************************
    * When the element is loaded, importMeta() assigns reference to the path from
    * which an element was imported to its importPath property.
    * Relative URLs in styles are automatically re-written to be relative to the importPath property.
    * You can use [[importPath]] in your component to load url resources
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    static get importMeta() {
        return import.meta;
    }
    /****************************************************************************************************
    * Return the component style and template as a template literal
    *
    * @readonly
    * @static
    * @type {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
        <style include="sig-element-css">
            :host {
                /* Basic styling of the component */
                color: var(--theme-sig-control-numeric-input-color, inherit);
                background-color: var(--theme-sig-control-numeric-input-background-color, inherit);
                border-width: var(--theme-sig-control-numeric-input-border-width, 0px);
                border-color: var(--theme-sig-control-numeric-input-border-color, inherit);
                border-style: var(--theme-sig-control-numeric-input-border-style, solid);
                border-radius: var(--theme-sig-control-numeric-input-border-radius, 3px);
                border-top-left-radius: var(--theme-sig-control-numeric-input-border-radius-tl, var(--theme-sig-control-numeric-input-border-radius, 3px));
                border-top-right-radius: var(--theme-sig-control-numeric-input-border-radius-tr, var(--theme-sig-control-numeric-input-border-radius, 3px));
                border-bottom-right-radius: var(--theme-sig-control-numeric-input-border-radius-br, var(--theme-sig-control-numeric-input-border-radius, 3px));
                border-bottom-left-radius: var(--theme-sig-control-numeric-input-border-radius-bl, var(--theme-sig-control-numeric-input-border-radius, 3px));

                /* Basic box model settings */
                position: absolute;
                overflow: hidden;
                padding: 0px 0px;
                display: block;
            }

            :host * {
                /* Reset margins and paddings for child elements and turn of text selection */
                @apply --notextselect;
                margin: 0;
                padding: 0;
            }

            .clearfix:after {
                /* Import the global clearfix css mixin */
                @apply --clearfix
            }

            /* set border color of active state */
            :host([isdesignmode][preview]),
            :host([iskeyboardopen]) {
                border-color: var(--theme-sig-control-numeric-input-activ-border-color, inherit);
            }

            /* border has to be deactivated cause bordergradient should be shown */
            :host([bordergradient]:not([iskeyboardopen])),
            :host([bordergradientactiv][isdesignmode][preview]),
            :host([bordergradientactiv][iskeyboardopen]) {
                border-width: 0px;            
            }

            /* basic definition for container */
            .sig-input {
                width: 100%;
                height: 100%;
                text-decoration: inherit;
                position: relative;
                box-sizing: border-box;
            }

            /* set bordergradient in inactive style */
            :host([bordergradient]:not([iskeyboardopen])) .sig-input {
                border-width: 0px;
                padding: var(--theme-sig-control-numeric-input-border-width, 0px);
                background-image: linear-gradient(var(--theme-sig-control-numeric-input-border-color-direction, to bottom), var(--theme-sig-control-numeric-input-border-color, inherit), var(--theme-sig-control-numeric-input-border-color-stop, var(--theme-sig-control-numeric-input-border-color)));
            }
            
            /* set bordergradient of active style */
            :host([bordergradientactiv][isdesignmode][preview]) .sig-input,
            :host([bordergradientactiv][iskeyboardopen]) .sig-input {
                border-width: 0px;
                padding: var(--theme-sig-control-numeric-input-border-width, 0px);
                background-image: linear-gradient(var(--theme-sig-control-numeric-input-activ-border-color-direction, to bottom), var(--theme-sig-control-numeric-input-activ-border-color, inherit), var(--theme-sig-control-numeric-input-activ-border-color-stop, var(--theme-sig-control-numeric-input-activ-border-color)));
                
            }

            /* basic definition of background style class -> needed for box shadow otherwise border would be overlayed */
            .sig-input-background {
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                justify-content: space-evenly;

                cursor: pointer;
                color: inherit;

                /* default set box shadow inactive */
                box-shadow: inset 0 0 0px rgba(255, 0, 0, 0);

                background-color: var(--theme-sig-control-numeric-input-background-color, inherit);
                background-image: var(--theme-sig-control-numeric-input-background-image, none),
                    linear-gradient(var(--theme-sig-control-numeric-input-background-color-direction, to bottom),
                    var(--theme-sig-control-numeric-input-background-color, inherit),
                    var(--theme-sig-control-numeric-input-background-color-stop, var(--theme-sig-control-numeric-input-background-color)));

                border: none;
                outline: none;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                text-decoration: inherit;
            }

            /* set active colors */
            :host([isdesignmode][preview]) .sig-input-background,
            :host([iskeyboardopen]) .sig-input-background {
                background-color: var(--theme-sig-control-numeric-input-value-active-background-color, inherit);
                background-image: var(--theme-sig-control-numeric-input-background-image, none),
                    linear-gradient(var(--theme-sig-control-numeric-input-active-background-color-direction, to bottom),
                    var(--theme-sig-control-numeric-input-value-active-background-color, inherit),
                    var(--theme-sig-control-numeric-input-value-active-background-color-stop, var(--theme-sig-control-numeric-input-value-active-background-color)));

                color: var(--theme-sig-control-numeric-input-value-active-color, inherit);
            }

            /* avoid cursor in design mode */
            :host([isdesignmode]) .sig-input-field,
            :host([isdesignmode]) .sig-input-field:active,
            :host([isdesignmode]) .sig-input-field:hover,
            :host([isdesignmode]) .sig-input-background,
            :host([isdesignmode]) .sig-input-background:active,
            :host([isdesignmode]) .sig-input-background:hover {
                cursor: unset;
            }

            /* set box shadow of normal state */
            :host([shadowactive]:not([iskeyboardopen])) .sig-input-background {
                box-shadow: inset 0 0 var(--theme-sig-control-numeric-input-shadow-size, 5px) var(--theme-sig-control-numeric-input-shadow-color, inherit);
            }

            /* set box shadow of active state */
            :host([shadowactivactive][isdesignmode][preview]) .sig-input-background,
            :host([shadowactivactive][iskeyboardopen]) .sig-input-background {
                box-shadow: inset 0 0 var(--theme-sig-control-numeric-input-pressed-shadow-size, 5px) var(--theme-sig-control-numeric-input-pressed-shadow-color, inherit);
            }

            ::placeholder {
                color: var(--theme-sig-control-numeric-input-placeholder-color, #8e8e8e);
                opacity: 1;
                font-family: inherit;
                font-size: inherit;
                text-decoration: inherit;
            }

            /* basic style definition of buttons */
            .sig-input-decrease,
            .sig-input-increase {
                height: 100%;
                width: var(--theme-sig-control-numeric-input-button-width, 30px);
                /* set height of background to display the button image properly */
                background-size: var(--theme-sig-control-numeric-input-button-width, 30px) var(--theme-sig-control-numeric-input-button-height, 20px);
                background-repeat: no-repeat;
                background-position: center;

                position: relative;
            }

            /* style class definition of decrease button */
            .sig-input-decrease {
                top: var(--theme-sig-control-numeric-input-decrease-offset-top, 0px);
                order: 3;
            }

            /* style class definition of increase button */
            .sig-input-increase {
                top: var(--theme-sig-control-numeric-input-increase-offset-top, 0px);
                order: 2;
            }

            /*****************************************************************************************
            ** handle positions in flex -> default is handled in general style class definition
            ******************************************************************************************/

            /* selector for column 3 */
            :host([buttonposition="row-reverse"][buttonalignment="row"]) .sig-input-increase,
            :host([buttonposition="row"][buttonalignment="row"][buttononeachside]) .sig-input-increase,
            :host([buttonposition="row"]:not([buttononeachside])) .sig-input-background-flex {
                order: 3;
            }

            /* selector for column 2*/
            :host([buttonposition="row-reverse"][buttonalignment="row"]:not([buttononeachside])) .sig-input-decrease,
            :host([buttonposition="row"]:not([buttonalignment="row"]):not([buttononeachside])) .sig-input-decrease,
            :host([buttononeachside]) .sig-input-background-flex {
                order: 2;
            }            

            /* selector for column 1*/
            :host(:not([buttonalignment="row"])[buttononeachside]) .sig-input-increase,
            :host([buttonalignment="row"][buttononeachside]) .sig-input-decrease,
            :host([buttonposition="row"]:not([buttonalignment="row"]):not([buttononeachside])) .sig-input-increase,
            :host([buttonposition="row"][buttonalignment="row"]:not([buttononeachside])) .sig-input-decrease {
                order: 1;
            }    

            /* special definition for displaying buttons in one column */
            :host([buttonalignment="column-reverse"]:not([buttononeachside])) .sig-input-decrease,
            :host([buttonalignment="column-reverse"]:not([buttononeachside])) .sig-input-increase {
                height: calc(50% - (var(--theme-sig-control-numeric-input-increase-margin-between, -10px) / 2));
            }

            /* value and unit can be bigger */
            :host([buttonalignment="column-reverse"]:not([buttononeachside])) .sig-input-background-flex {
                width: calc(100% - var(--theme-sig-control-numeric-input-button-width, 30px) - var(--theme-sig-control-numeric-input-increase-margin-right, 0px));
            }            

            /* no spacing between buttons in width */
            :host([buttononeachside]) .sig-input-background-flex {
                width: calc(100% - (2 * var(--theme-sig-control-numeric-input-button-width, 30px)) - (2 * var(--theme-sig-control-numeric-input-increase-margin-right, 0px)));
            }                   

            /* handle margin between buttons -> increase is shown on right side */
            :host([buttonalignment="row"]:not([buttononeachside])) .sig-input-increase {
                margin-left: var(--theme-sig-control-numeric-input-increase-margin-between, -10px);
            }

            /* handle margin between buttons -> decrease is shown on right side */
            :host([buttonalignment="row-reverse"]:not([buttononeachside])) .sig-input-decrease {               
                margin-left: var(--theme-sig-control-numeric-input-increase-margin-between, -10px);
            }

            /* handle margin between buttons -> increase is shown on top */
            :host([buttonalignment="column-reverse"]:not([buttononeachside])) .sig-input-increase {             
                margin-bottom: var(--theme-sig-control-numeric-input-increase-margin-between, -10px);
            }

            /* handle margin to border if buttons are displayed on each side */
            :host([buttonalignment="row"][buttononeachside]) .sig-input-increase,
            :host(:not([buttonalignment="row"])[buttononeachside]) .sig-input-decrease {
                margin-right: var(--theme-sig-control-numeric-input-increase-margin-right, 0px);
            }            

            /* handle margin to border if buttons are displayed on each side */
            :host([buttonalignment="row"][buttononeachside]) .sig-input-decrease,
            :host(:not([buttonalignment="row"])[buttononeachside]) .sig-input-increase {
                margin-left: var(--theme-sig-control-numeric-input-increase-margin-right, 0px);
            }  

            /* handle margin to border if buttons are displayed on one side */
            :host(:not([buttononeachside])[buttonposition="row-reverse"]:not([buttonalignment="row-reverse"])) .sig-input-increase,
            :host(:not([buttononeachside])[buttonposition="row-reverse"]:not([buttonalignment="row"])) .sig-input-decrease {
                margin-right: var(--theme-sig-control-numeric-input-increase-margin-right, 0px);
            }

            /* handle margin to border if buttons are displayed on one side */
            :host(:not([buttononeachside])[buttonposition="row"]:not([buttonalignment="row"])) .sig-input-increase,
            :host(:not([buttononeachside])[buttonposition="row"]:not([buttonalignment="row-reverse"])) .sig-input-decrease {
                margin-left: var(--theme-sig-control-numeric-input-increase-margin-right, 0px);
            } 

            /* basic definition of the background flex container -> used as container for value and unit */
            .sig-input-background-flex {
                width: calc(100% - (2 * var(--theme-sig-control-numeric-input-button-width, 30px)) - var(--theme-sig-control-numeric-input-increase-margin-between, -10px) - var(--theme-sig-control-numeric-input-increase-margin-right, 0px));
                height: 100%;
                display: flex;  
                justify-content: space-between;
                order: 1;
            }

            /* unit should be displayed on top */
            :host([unitactiv][unitposition="uppertop"]) .sig-input-background-flex {
                flex-direction: column-reverse;
            }

             /* unit should be displayed on bottom */
            :host([unitactiv][unitposition="lowerbottom"]) .sig-input-background-flex {
                flex-direction: column;
            }           

             /* unit should be displayed on the left*/
             :host([unitactiv][unitposition="leftside"]) .sig-input-background-flex {
                flex-direction: row-reverse;
            } 

            /* only align items if unit not on top or bottom of value otherwise horizontal alignment won't work */
            :host([unitactiv][unitposition="leftside"]) .sig-input-background-flex,
            :host([unitactiv][unitposition="rightside"]) .sig-input-background-flex {
                align-items: center;
            }
            
            /* basic definition of value container */
            .sig-input-field {
                cursor: pointer;
                color: inherit;
                white-space: nowrap;
                text-overflow: ellipsis;
                background-color: transparent;
                border: none;
                outline: none;

                width: 100%;

                /*avoid text select on longpress */
                pointer-events: none;

                align-self: var(--theme-sig-control-numeric-input-value-vertical-align, center);
                text-align: var(--theme-sig-control-numeric-input-value-text-align, center);
                text-indent: 0px;

                box-sizing: border-box;
                padding-right: var(--theme-sig-control-numeric-input-margin-leftright, 0px);
                padding-left: var(--theme-sig-control-numeric-input-margin-leftright, 0px);
                padding-top: var(--theme-sig-control-numeric-input-margin-top, 0px);
                padding-bottom: var(--theme-sig-control-numeric-input-margin-top, 0px);    
                text-decoration: inherit;
                font-family: inherit;
                font-size: inherit;
                font-weight: inherit;
                font-style: inherit;                        
            }

            input {
                font-size: inherit;
            }

            /* unit displaying style class */
            .content {
                cursor: pointer;
                background-color: transparent;
                text-align: var(--theme-sig-control-numeric-input-unit-text-align, center);
                color: var(--theme-sig-control-numeric-input-unit-color, inherit);
                overflow: hidden;
                /* only min-width works */
                min-width: fit-content;
                box-sizing: border-box;
            }

            :host([unitactiv][unitposition="uppertop"]) .content {
                padding-left: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                padding-right: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                padding-top: var(--theme-sig-control-numeric-input-unit-margin-bottom, 5px);
            }

            :host([unitactiv][unitposition="lowerbottom"]) .content {
                padding-left: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                padding-right: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                padding-bottom: var(--theme-sig-control-numeric-input-unit-margin-bottom, 5px);
            }

            :host([unitactiv][unitposition="leftside"]) .content {
                padding-left: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                align-self: var(--theme-sig-control-numeric-input-unit-vertical-align, center);
            }

            :host([unitactiv][unitposition="rightside"]) .content {
                padding-right: var(--theme-sig-control-numeric-input-unit-margin-leftright, 0px);
                align-self: var(--theme-sig-control-numeric-input-unit-vertical-align, center);
            }

            /* handle text color of the unit if the input is opened */
            :host([isdesignmode][preview]) .content,
            :host([iskeyboardopen]) .content {
                color: var(--theme-sig-control-numeric-input-unit-active-color, inherit);
            }

            /* symbol displaying if no image selected */
            .symbInc {
                text-align: center;
                top: 50%;
                position: relative;
                transform: translateY(-50%);
            }
            .symbInc:after {
                @apply --symbol;
                content: '\\f106';
            }
            .symbDec {
                text-align: center;
                top: 50%;
                position: relative;
                transform: translateY(-50%);
            }
            .symbDec:after {
                @apply --symbol;
                content: '\\f107';
            }
            /***************************************** */

        </style>
        <div class="sig-input clearfix">
            <div class="sig-input-background" id="container">
                <div id="decBtn" class="sig-input-decrease" on-down="_handleDownDec" on-up="_handleUp">
                </div>
                <div id="incBtn" class="sig-input-increase" on-down="_handleDownInc" on-up="_handleUp">
                </div>                                  
                <div class="sig-input-background-flex" on-tap="_showKeyboard" on-input="_showKeyboard">
                    <input type="text" id="siginput" size="10" class="sig-input-field" placeholder="[[placeholder]]"
                        value="{{valuec}}" on-tap="_showKeyboard" on-input="_showKeyboard" autocomplete="off"
                        spellcheck="false" readonly="readonly" />

                    <template is="dom-if" if="[[unitactiv]]">
                        <div id="label" class="content"><span>[[unittext]]</span></div>
                    </template>
                </div>                       
            </div>
        </div>
        `;
    }
    /****************************************************************************************************
    * Returns the component's registered tag name.
    *
    * @readonly
    * @static
    * @returns {string} The component's registered tag name.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    static get is() {
        return "sig-control-numeric-input";
    }
    /****************************************************************************************************
    * Define the main porperties of the component
    * reflected property names should always be lower case so it can be used directly on the element as an attribute.
    *
    * @readonly
    * @static
    * @returns {object} The defined Polymer properties.
    * @memberof LasalRuntimeSigNumericInputElement
    *
    * @property {string} value                  - The input value of the component.
    * @property {string} valuec                 - Computed value.
    * @property {boolean} ispassword            - True - only password dots visible.
    * @property {boolean} iskeyboardopen        - Keyboard opened, closed.
    * @property {boolean} bordergradient        - Activates the border gradient of the component.
    * @property {boolean} bordergradientactiv   - Activates the border gradient of the component in pressed state.
    * @property {boolean} shadowactive          - Activates the border shadow of the component.
    * @property {boolean} shadowactivactive     - Activates the border shadow in pressed state.
    * @property {boolean} unitactiv             - If true the unit text is shown in the input.
    * @property {string} unitposition           - Defines the position of the unit in the input.
    * @property {string} increasebgimage        - The image used for the increase button.
    * @property {string} decreasebgimage        - The image used for the decrease button.
    * @property {boolean} buttononeachside      - If this is set to true, the buttons are split and one button is shown on each side.
    * @property {string} buttonalignment        - If the buttons are shown together, it can be adjustet here how they are aligned in relation to each other.
    * @property {string} buttonposition         - Defines if the buttons are on the left or right side.
    * @property {Boolean} preview               - Preview setting for designer
    ****************************************************************************************************/
    static get properties() {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            value: {
                type: String,
                value: '',
                observer: "_stateChanged",
                notify: true
            },
            valuec: {
                type: String,
                value: '',
                computed: '_computeText(value,previewtext,isstylepreview,value_converted)'
            },
            ispassword: {
                type: Boolean,
                value: false,
                observer: '_makePassword'
            },
            iskeyboardopen: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: '_keyboardopenChanged'
            },
            bordergradient: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            bordergradientactiv: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            shadowactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            shadowactivactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            unitactiv: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
            },
            unitposition: {
                type: String,
                value: 'rightside',
                reflectToAttribute: true
            },
            increasebgimage: {
                type: String,
                value: 'none',
                observer: '_increaseBgImageHandler'
            },
            decreasebgimage: {
                type: String,
                value: 'none',
                observer: '_decreaseBgImageHandler'
            },
            buttononeachside: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            buttonalignment: {
                type: String,
                value: 'row-reverse',
                reflectToAttribute: true
            },
            buttonposition: {
                type: String,
                value: 'row-reverse',
                reflectToAttribute: true
            },
            preview: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            }
        };
        return props;
    }
    /****************************************************************************************************
    * Creates an instance of LasalRuntimeSigNumericInputElement.
    * Called when the element has been created, but before property values are set and local DOM is initialized
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    constructor() {
        super();
        this.repeatInterval = null;
        this.activeLang = '';
        this.vmApi = window.sigApi.vm;
        this.keyboardApi = window.sigApi.keyboard;
        this.eventMediatorApi = window.sigApi.eventMediator;
        this.eventsApi = window.sigApi.events;
        this.incamount_unconverted = 1;
        this.limitLow = Number.MIN_SAFE_INTEGER;
        this.ignoremin = false;
        this.type = 'numeric';
        this.limitHigh = Number.MAX_SAFE_INTEGER;
        this.ignoremax = false;
        this.maxlength = 0;
        this.placeholder = '';
        this.keyboardid = '';
        this.titletext = '';
        this.writeonincrement = false;
        this.increasebgimageactive = 'none';
        this.decreasebgimageactive = 'none';
        this.cinputwidth = '0px';
        this.cunitwidth = '0px';
        this.intervaltype = 'repeat';
        this.intervaltime = 500;
        this.dashboardKeyboard = null;
        this.openkeyboardbeside = false;
        this.keyboardwindow = null;
        this.format = '';
        this.unittext = "[Unit]";
        this.cincreasebgimage = '';
        this.cdecreasebgimage = '';
        this.rendered = false;
        this.updateonsamevalue = false;
        this.errorInfo = 0;
        this.addPredefProps([{
                src: 'value',
                dest: 'value_unconverted',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }, {
                src: 'value',
                dest: 'limitLow',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_LIMIT_LOW
            }, {
                src: 'value',
                dest: 'limitHigh',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_LIMIT_HIGH
            }, {
                src: 'value',
                dest: 'type',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_KEYBOARD_TYPE
            }, {
                src: 'value',
                dest: 'unittext',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNIT_TEXT
            }, {
                src: 'value',
                dest: 'titletext',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_TEXT1
            }, {
                src: 'value',
                dest: 'type',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_KEYBOARD_TYPE
            }, {
                src: 'value',
                dest: 'state',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_STATE
            }, {
                src: 'incamount',
                dest: 'incamount_unconverted',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }]);
    }
    /****************************************************************************************************
    * This callback is called after property values are set and local DOM is initialized.
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    ready() {
        super.ready();
        //this.activeLang = this._getActiveLangAsync();
        this._switchLang();
        if (!this.isdesignmode) {
            this.sigAddEventListener('LANGUAGE_CHG', () => {
                this._switchLang();
            }, 'runtimeEvent');
        }
    }
    /****************************************************************************************************
    * Observer for the increasebgimage property.
    * Sets the background-image for the increase button.
    *
    * @param {string} [increasebgimage=this.increasebgimage]
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _increaseBgImageHandler(increasebgimage = this.increasebgimage) {
        //calculate the increase background image
        this.cincreasebgimage = this._cgetImage(increasebgimage);
        //set the background to the calculated image
        if (!this.cincreasebgimage) {
            this.$.incBtn.style.removeProperty('background-image');
            this.$.incBtn.innerHTML = `
                <div class="symbInc"></div>
            `;
        }
        else {
            this.$.incBtn.style.backgroundImage = this.cincreasebgimage;
            this.$.incBtn.innerHTML = '';
        }
    }
    /****************************************************************************************************
    * Observer for the decreasebgimage property.
    * Sets the background-image for the decrease button.
    *
    * @param {string} [decreasebgimage=this.decreasebgimage]
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _decreaseBgImageHandler(decreasebgimage = this.decreasebgimage) {
        //calculate the decrease background image
        this.cdecreasebgimage = this._cgetImage(decreasebgimage);
        //set the background to the calculated image
        if (!this.cdecreasebgimage) {
            this.$.decBtn.style.removeProperty('background-image');
            this.$.decBtn.innerHTML = `
                <div class="symbDec"></div>
            `;
        }
        else {
            this.$.decBtn.style.backgroundImage = this.cdecreasebgimage;
            this.$.decBtn.innerHTML = '';
        }
    }
    /****************************************************************************************************
    * Handles language switches
    *
    * @return {Promise<undefined>} Returns a promise which resolves with undefined.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    async _switchLang() {
        this.activeLang = await this._getActiveLangAsync();
    }
    /****************************************************************************************************
    * Returns either the specified image, or a default one
    *
    * @param {string} image The image that should be used.
    * @return {string} url of the picture
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _cgetImage(image) {
        if (!image || image === 'none') {
            //Return here because in this case we use icons
            return "";
        }
        if (this.isdesignmode) {
            //In the designmode for some reason there are \ in the url
            //So they need to be replaced with / because otherwise they just escape characters in the string
            return `url(${image})`.replace(/\\/g, '/');
        }
        return `url(${image})`;
    }
    /****************************************************************************************************
    * Handles touchdown or similar events for increase button
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _handleDownInc() {
        this._incValue();
        // If autorepeat is on
        // do repeat the action in an interval
        if (this.intervaltype === 'repeat') {
            this.repeatInterval = this.sigSetInterval(() => {
                this._incValue();
            }, this.intervaltime);
        }
    }
    /****************************************************************************************************
    * Handles touchdown or similar events for decrease button
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _handleDownDec() {
        this._decValue();
        // If autorepeat is on
        // do repeat the action in an interval
        if (this.intervaltype === 'repeat') {
            this.repeatInterval = this.sigSetInterval(() => {
                this._decValue();
            }, this.intervaltime);
        }
    }
    /****************************************************************************************************
    * Handles touchup or similar events
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _handleUp() {
        if (this.repeatInterval !== null) {
            //The interval should only run when the button is pressed 
            //-> clear the interval when the button is not pressed anymore
            this.sigClearInterval(this.repeatInterval);
            this.repeatInterval = null;
        }
    }
    /****************************************************************************************************
    * Decreases the value
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _decValue() {
        // Sub the increase ammount to the value
        let decVal = this.value_unconverted - this.incamount_unconverted;
        // Make sure the value is within the limits
        decVal = this._ensureValueWithinLimits(decVal);
        this._writeDatapoint(decVal);
    }
    /****************************************************************************************************
    * Increases the value
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _incValue() {
        // Add the increase ammount to the value
        let incVal = this.value_unconverted + this.incamount_unconverted;
        // Make sure the value is within the limits
        incVal = this._ensureValueWithinLimits(incVal);
        this._writeDatapoint(incVal);
    }
    /****************************************************************************************************
    * Makes sure the value isn't above or below a servers limits
    *
    * @param {number} value
    * @return {number} limitLow | limitHigh | value according to the value of variable "value"
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _ensureValueWithinLimits(value) {
        let limitHigh;
        let limitLow;
        const limitHighProp = window.sigApi.properties.getProperty(this.id, "limitHigh");
        if (limitHighProp !== null) {
            limitHigh = limitHighProp.getUnconvertedValue();
        }
        const limitLowProp = window.sigApi.properties.getProperty(this.id, "limitLow");
        if (limitLowProp !== null) {
            limitLow = limitLowProp.getUnconvertedValue();
        }
        if ((limitLow !== undefined) && (value < limitLow)) {
            return limitLow;
        }
        if ((limitHigh !== undefined) && (value > limitHigh)) {
            return limitHigh;
        }
        return value;
    }
    /****************************************************************************************************
    * Method gets called to check if property should be updated or not
    *
    * @param {string} property Property which should be checked.
    * @param {boolean} originalResult Result of the original property update info.
    * @param {string} value New value
    * @param {string} old Old value
    * @return {boolean}
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    sigShouldPropertyUpdate(property, originalResult, value, old) {
        if ((this.updateonsamevalue) && (property === 'value')) {
            return true;
        }
        return originalResult;
    }
    /****************************************************************************************************
    * Updates the value of the component
    *
    * @param {(string | number)} newValue New value of property value
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _updateValue(newValue) {
        this.value = newValue;
    }
    /****************************************************************************************************
    * observer for the ispassword property
    * adopted from sig-control-input
    * hides the value of the input
    *
    * @param {boolean} newval New value
    * @param {boolean} oldval Old value
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _makePassword(newval, oldval) {
        let type = '';
        if (newval !== undefined) {
            if (newval) {
                type = 'password';
            }
            else {
                type = 'text';
            }
        }
        this.$.siginput.setAttribute('type', type);
    }
    /****************************************************************************************************
    * Observer for this.value
    *
    * @param {string} newstate New state of property value.
    * @param {string} oldstate Old state of property value.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _stateChanged(newstate, oldstate) {
        if (oldstate !== undefined && oldstate !== '') {
            this._dispatchEvent('value-changed');
        }
    }
    /****************************************************************************************************
    * Shows the correct type of keyboard and updates the value once the keyboard value is submitted (Keyboard promise resolved).
    *
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _showKeyboard() {
        if (!this.isdesignmode) {
            //Determine what standalone keyboard is linked to the input by the keyboardid property.
            //The standalone keyboard must be in DOM, visible and with state:active otherwise it is null.
            if (this.keyboardid && this.keyboardid !== '' && this.context && !this.isdesignmode) {
                //Check whether keyboard is in DOM and visible. (Keyboard in CC is not found, because its ID is dynamic)
                const keyboardVM = (this.vmApi) ? this.vmApi.getVmById(this.keyboardid) : null;
                const keyboard = (keyboardVM) ? keyboardVM.getDomRef() : null;
                const stateIntacive = (this.constApi) ? this.constApi.CONTROL_STATE_INACTIVE : 2;
                const stateInvisibile = (this.constApi) ? this.constApi.CONTROL_STATE_INVISIBLE : 3;
                const isKeyboardHidden = (keyboard) ? keyboard.state === stateInvisibile || keyboard.state === stateIntacive : false;
                //Check whether parent is in DOM and visible (dashboard/window)
                const parentVM = (keyboardVM) ? keyboardVM.getParent() : null;
                const parent = (keyboardVM) ? parentVM?.getDomRef() : null;
                const isParentHidden = (parent) ? parent.hidden : true;
                //Save the dashboard keyboard only if it is visible.
                this.dashboardKeyboard = (keyboard && !isParentHidden && !isKeyboardHidden) ? keyboard : null;
            }
            //Only send the keyboard ID if the dashboard keyboard is in DOM and visible.
            const keyboardid = (this.dashboardKeyboard instanceof HTMLElement) ? this.keyboardid : undefined;
            if (this.value_converted !== undefined) {
                this.openKeyboardWithUnit('value');
                return;
            }
            if (this.keyboardApi) {
                if (this.keyboardwindow === null)
                    this.keyboardwindow = undefined;
                this.keyboardApi.open(this.type, this.titletext, {
                    keyboardplaceholder: this.placeholder,
                    keyboardmin: this.limitLow,
                    keyboardmax: this.limitHigh,
                    keyboardmaxlength: this.maxlength,
                    keyboardlang: this.activeLang,
                    ispassword: this.ispassword,
                    ignoremin: this.ignoremin,
                    ignoremax: this.ignoremax,
                    keyboardunittext: this.unittext,
                    writeonincrement: this.writeonincrement,
                    datapointtype: this.type
                }, this, 'value', this.keyboardwindow, this.openkeyboardbeside, keyboardid).then((value) => {
                    this._updateValue(value);
                }, () => {
                    //input cancelled -> we don't need this info
                }).catch((error) => {
                    this._log('Error: ' + error.message, 'ERROR');
                });
            }
        }
    }
    /****************************************************************************************************
    * Changes the background images for the button when the keyboard is open.
    *
    * @param {boolean} newstate New state of keyboard open.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _keyboardopenChanged(newstate) {
        if (newstate) {
            if ((this.increasebgimage && this.increasebgimage !== 'none') &&
                (this.increasebgimageactive && this.increasebgimageactive !== 'none')) {
                this._increaseBgImageHandler(this.increasebgimageactive);
            }
            if ((this.decreasebgimage && this.decreasebgimage !== 'none') &&
                (this.decreasebgimageactive && this.decreasebgimageactive !== 'none')) {
                this._decreaseBgImageHandler(this.decreasebgimageactive);
            }
        }
        else {
            this._increaseBgImageHandler();
            this._decreaseBgImageHandler();
        }
    }
    /****************************************************************************************************
    * An observer method which returns the computed input text.
    *
    * @param {string} _value Text from the text list.
    * @param {string} _previewtext Preview text.
    * @param {boolean} _isstylepreview Preview active.
    * @param {string} value_converted Converted value.
    * @return {string} The computed text.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _computeText(_value, _previewtext, _isstylepreview, value_converted) {
        const finalvalue = (value_converted !== undefined) ? value_converted : _value;
        return (finalvalue === '' && _isstylepreview && this.isdesignmode) ? _previewtext : finalvalue;
    }
    /****************************************************************************************************
    * Writes to Datapoint.
    *
    * @param {number} newValue - value to write on datapoint.
    * @memberof LasalRuntimeSigNumericInputElement
    ****************************************************************************************************/
    _writeDatapoint(newValue) {
        //check if property configured
        const prop = window.sigApi.properties.getProperty(this.id, 'value');
        if (prop !== null) {
            //get datapoint
            const dp = prop.getDatapoint();
            if (dp !== null) {
                //write value
                window.sigApi.datapointManager.writeDataPoint(dp.getId(), newValue);
            }
            else {
                this._log('_writeDatapoint(): failed to get datapoint', 'ERROR');
            }
        }
    }
}
customElements.define(LasalRuntimeSigNumericInputElement.is, LasalRuntimeSigNumericInputElement);
//# sourceMappingURL=sig-control-numeric-input.js.map