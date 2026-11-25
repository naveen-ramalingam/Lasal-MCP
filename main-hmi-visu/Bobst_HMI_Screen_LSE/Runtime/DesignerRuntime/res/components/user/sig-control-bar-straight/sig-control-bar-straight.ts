// Import the Lasal Runtime base element into your component
import { LasalRuntimeSigElementLight, SigPolymer } from '../../sigmatek/sig-element-light/sig-element-light.js';
import { cssObject } from '../../sigmatek/sig-element-mixins/designer-support-mixin.js';

/****************************************************************************************************
 * @class LasalRuntimeSigControlBarStraight
 * @classdesc Implements and exports the sig-control-bar-straight component.
 * @version 04.00.000
 * @extends LasalRuntimeSigElementLight
 * 
 * @property {Boolean} connected connectedCallback function was excecuted
 * @property {Boolean} valuesInitialized required properties are ready
 * @property {Number} totalBarWidth the width of the whole bar
 * @property {Number} borderLeftWidth the width of the left border
 * @property {Number} borderRightWidth the width of the right border
 * @property {Number} borderTopWidth the width of the top border
 * @property {Number} borderBottomWidth the width of the bottom border
****************************************************************************************************/
class LasalRuntimeSigControlBarStraight extends LasalRuntimeSigElementLight {

    /****************************************************************************************************
     * Returns the import path URL used by Polymer.
     * @readonly
     * @static
     * @returns {String} The import path URL.
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    static get importMeta(): ImportMeta { return import.meta; }

    /****************************************************************************************************
     * Returns the HTML literal of the component.
     * @readonly
     * @static
     * @returns {HTMLTemplateElement} The template literal of the component.
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    static get template(): HTMLTemplateElement {
        return SigPolymer.html`
        <style include="sig-element-css">
            :host {
                display: block;
                position: absolute;
                /*To position Text outside of the container */
                overflow: visible;

                border-style: var(--theme-sig-control-bar-straight-border-style, none);
                border-width: var(--theme-sig-control-bar-straight-border-width, 0px);
                border-color: var(--theme-sig-control-bar-straight-border-color, inherit);
                border-radius: var(--theme-sig-control-bar-straight-border-radius, 3px);

                overflow: hidden;
            }

            #baron {
                overflow: hidden;
                height: 100%;
                width: 100%;
                background-image: linear-gradient(to right, var(--theme-sig-control-bar-straight-baron-background-color, rgba(174, 200, 26, 1)), 
                                                  var(--theme-sig-control-bar-straight-baron-background-color-stop, rgba(174, 200, 26, 1)));
            }

            #barmin {
                width: 0%;
                height: 100%;
                background-color: var(--theme-sig-control-bar-straight-barmin-background-color, rgba(11,104,182,1));
            }

            #barmax {
                width: 0%;
                height: 100%;
                background-color: var(--theme-sig-control-bar-straight-barmax-background-color, rgba(222,69,59,1));
            }

            .sig-control-bar-straight {
                position: relative;
                height: 100%;
                width: 100%;
 
                background-color: var(--theme-sig-control-bar-straight-baroff-background-color, rgba(165,171,176, 1));

                overflow: hidden;
            }

            .baronimage {
                background-image: var(--theme-sig-control-bar-straight-baron-background-image, none) !important;
                background-size: var(--theme-sig-control-bar-straight-baron-background-width, 100%) var(--theme-sig-control-bar-straight-baron-background-height, 100%);
                background-repeat: no-repeat;
            }

            .baroffimage {
                background-image: var(--theme-sig-control-bar-straight-baroff-background-image, none);
                background-size: var(--theme-sig-control-bar-straight-baron-background-width, 100%) var(--theme-sig-control-bar-straight-baron-background-height, 100%);
                background-repeat: no-repeat;

                background-color: var(--theme-sig-control-bar-straight-baroff-background-color, rgba(165,171,176, 1));
            }

            #barContainer {
                height: 100%;
                width: 100%;
                display: flex;
            }

            #barimage {
                width: 100%;
                height: 100%;
                position: absolute;
            }
        </style>
        <div class="sig-control-bar-straight clearfix" id="container">
            <div id="barContainer">
                <div id="barmin"></div>
                <div id="baron"></div>
                <div id="barmax"></div>
                <div id="barimage"></div>
            </div>    
        </div>
        `;
    }

    /****************************************************************************************************
     * Returns the component's registered tag name.
     * @readonly
     * @static
     * @returns {String} The control's tag name.
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    static get is(): string {
        return "sig-control-bar-straight";
    }

    //Polymer properties type definition
    valueuc: number
    minvalueuc: number
    maxvalueuc: number
    mincolorlimituc: number
    maxcolorlimituc: number
    bgcolorvalue: string
    bgcolorvaluestop: string
    bgcolorrangeminvalue: string
    bgcolorrangemaxvalue: string
    bgcolorhide: string
    imgvalue: string
    imghide: string
    cbackgroundvalue: string
    cbackgroundhide: string
    previewvalue: number
    previewmin: number
    previewmax: number
    previewminlimit: number
    previewmaxlimit: number
    
    /****************************************************************************************************
     * Returns the defined Polymer properties of the component.
     * @readonly
     * @static
     * @returns {Object} The defined Polymer properties.
     * @memberof LasalRuntimeSigControlBarStraight
     * 
     * @property {Number}   valueuc                     - unconverted value
     * @property {Number}   minvalueuc                  - min value unconverted
     * @property {Number}   maxvalueuc                  - max value unconverted
     * @property {Number}   mincolorlimituc             - min color value unconverted
     * @property {Number}   maxcolorlimituc             - max color value unconverted
     * @property {String}   bgcolorvalue                - Fill color
     * @property {String}   bgcolorvaluestop            - Fill color stop
     * @property {String}   bgcolorrangeminvalue        - Color lower limit
     * @property {String}   bgcolorrangemaxvalue        - Color upper limit
     * @property {String}   bgcolorhide                 - Background color
     * @property {String}   imgvalue                    - Bar image
     * @property {String}   imghide                     - Background image
     * @property {String}   cbackgroundvalue            - computed bar image
     * @property {String}   cbackgroundhide             - computed background image
     * @property {Number}   previewvalue                - Preview value
     * @property {Number}   previewmin                  - Preview lower limit
     * @property {Number}   previewmax                  - Preview max. value
     * @property {Number}   previewminlimit             - Preview lower limit
     * @property {Number}   previewmaxlimit             - Preview upper limit
    ****************************************************************************************************/
    static get properties(): object {
        return {
            valueuc: {
                type: Number,
                value: '',
                observer: '_valueChanged'
            },
            minvalueuc: {
                type: Number,
                value: 0,
                observer: '_minChanged'
            },
            maxvalueuc: {
                type: Number,
                value: 100,
                observer: "_maxChanged"
            },
            mincolorlimituc: {
                type: Number,
                value: '',
                observer: "_colorMinLimitChanged"
            },
            maxcolorlimituc: {
                type: Number,
                value: '',
                observer: "_colorMaxLimitChanged"
            },
            bgcolorvalue: {
                type: String,
                value: 'rgba(175,200,26,1)'
            },
            bgcolorvaluestop: {
                type: String,
                value: 'inherit'
            },
            bgcolorrangeminvalue: {
                type: String,
                value: 'rgba(11,104,182,1)'
            },
            bgcolorrangemaxvalue: {
                type: String,
                value: 'rgba(222,69,59,1)'
            },
            bgcolorhide: {
                type: String,
                value: 'rgba(165,171,176,1)'
            },
            imgvalue: {
                type: String,
                value: 'none'
            },
            imghide: {
                type: String,
                value: 'none'
            },
            cbackgroundvalue: {
                type: String,
                computed: '_cBackground(bgcolorvalue, bgcolorvaluestop, imgvalue, "value", bgcolorrangeminvalue, bgcolorrangemaxvalue)'
            },
            cbackgroundhide: {
                type: String,
                computed: '_cBackground(bgcolorhide, null, imghide, "hide", bgcolorrangeminvalue, bgcolorrangemaxvalue)'
            },
            previewvalue: {
                type: Number,
                value: 50,
                observer: '_updateBar'
            },
            previewmin: {
                type: Number,
                value: 0,
                observer: '_updateBar'
            },
            previewmax: {
                type: Number,
                value: 100,
                observer: '_updateBar'
            },
            previewminlimit: {
                type: Number,
                value: '',
                observer: "_colorMinLimitChanged"
            },            
            previewmaxlimit: {
                type: Number,
                value: '',
                observer: "_colorMaxLimitChanged"
            }
        }
    }

    //Member properties type definition
    valuesInitialized: boolean
    connected: boolean
    totalBarWidth:number
    borderLeftWidth: number
    borderRightWidth: number
    borderTopWidth: number
    borderBottomWidth: number
    
    /****************************************************************************************************
     * Creates an instance of LasalRuntimeSigControlBarStraight.
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    constructor() {
        super();

        this.valuesInitialized = false;
        this.connected = false;
        this.totalBarWidth = 0;

        // add predef properties to avoid recalculations during drawing
        this.addPredefProps([
            {
                src: 'value',
                dest: 'valueuc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }, 
            {
                src: 'minvalue',
                dest: 'minvalueuc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }, 
            {
                src: 'maxvalue',
                dest: 'maxvalueuc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }, 
            {
                src: 'mincolorlimit',
                dest: 'mincolorlimituc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }, 
            {
                src: 'maxcolorlimit',
                dest: 'maxcolorlimituc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }
        ]);  
        
        // add required properties
        this.sigAddRequiredProperty('valueuc');
        this.sigAddRequiredProperty('minvalueuc');
        this.sigAddRequiredProperty('maxvalueuc');
        this.sigAddRequiredProperty('mincolorlimituc');
        this.sigAddRequiredProperty('maxcolorlimituc');
    }

    /****************************************************************************************************
     * Gets called if required properties are ready
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    sigOnRequiredPropertiesReady(): void {
        super.sigOnRequiredPropertiesReady();      
        this.valuesInitialized = true;
        
        this._setBarBackgroundSize();
        this._updateBar();            
    }

    /****************************************************************************************************
    * called after the element is attached to the document
    * can be called multiple times during the lifetime of an element
    * the first attached callback is guaranteed not to fire until after ready
    * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    connectedCallback(): void {
        super.connectedCallback();
        this.connected = true;

        this._setBarBackgroundSize();
        this._updateBar();            
    }

    /****************************************************************************************************
     * sets the background sizes for the bars
     * if the background size isn't set, the background image isn't revealed as the bar gets bigger,
     * but it stretches
     * @memberof LasalRuntimeSigControlBarStraight
     ****************************************************************************************************/
     _setBarBackgroundSize(): void {
        const barOffBounds = this.getControlBounds();
        if (barOffBounds != null) {
            this._getBorderWidth();

            this.totalBarWidth = barOffBounds.width - this.borderLeftWidth - this.borderRightWidth;

            this.updateStyles({
                '--theme-sig-control-bar-straight-baron-background-height': String(barOffBounds.height - this.borderTopWidth - this.borderBottomWidth) + 'px',
                '--theme-sig-control-bar-straight-baron-background-width': String(this.totalBarWidth) + 'px'
            });
        }   
    }

    /****************************************************************************************************
     * Calculates how far the bar is currently filled
     * @param {Number} value the value of the component
     * @return {Number} a value between 0 and 1 indicating the fill level of the bar
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _getPercent(value:number): number {

        // in designmode make sure bar is always half filled
        if (this.isdesignmode) {
            return (value - this.previewmin) / (this.previewmax - this.previewmin);
        }

        // The whole value range
        const length = this.maxvalueuc - this.minvalueuc;

        // The Position of this.value within that range
        const val = value - this.minvalueuc;

        let percent = (val / length);

        // Make sure the var is at least 0% filled
        if (percent < 0) {
            percent = 0;
        } else if (percent > 1) {
            // Make sure the bar is at most 100% filled
            percent = 1;
        }
        //avoid calculating with NaN
        if(isNaN(percent)) {
            percent = 0;
        }
        return percent;
    }


    /****************************************************************************************************
     * Calculates the background
     * @param {String} color the background-color
     * @param {String | null} stopcolor the stop background-color
     * @param {String} img the path to the background image
     * @param {String} target determines if it is the forground or the background for which the background is calculated
     * @param {String} mincolor minimum range limit
     * @param {String} maxcolor maximum range limit
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _cBackground(color:string, stopcolor:string | null, img:string, target:string, mincolor:string, maxcolor:string): void {
        if (!img || img === 'none') {
            //If there is no image, set the color
            if (target === 'hide') {
                this.updateStyles({ '--theme-sig-control-bar-straight-baroff-background-color': color })
                this.$.container.classList.remove('baroffimage');
            } else {
                this.updateStyles({ '--theme-sig-control-bar-straight-baron-background-color': color });
                //as stopcolor is not a css and can not be inherited we do it on our own and use the normal bg color to avoid the gradient
                this.updateStyles({ '--theme-sig-control-bar-straight-baron-background-color-stop': stopcolor === 'inherit' ? color : stopcolor });
                this.$.barimage.classList.remove('baronimage');
                this.updateStyles({ '--theme-sig-control-bar-straight-barmin-background-color': mincolor });
                this.updateStyles({ '--theme-sig-control-bar-straight-barmax-background-color': maxcolor });
            }
        } else {
            // set the color first
            if (target === 'hide') {
                this.updateStyles({ '--theme-sig-control-bar-straight-baroff-background-color': color });
            } else {
                this.updateStyles({ '--theme-sig-control-bar-straight-baron-background-color': color });
                this.updateStyles({ '--theme-sig-control-bar-straight-baron-background-color-stop': stopcolor === 'inherit' ? color : stopcolor });
            }


            //If there is an image, set the image

            //there needs to be an extra case for the design mode, because in the design mode 
            //urls contain \ for some reason, which are escape characters.
            //So they need to be replaced.
            let imgurl = '';
            if (this.isdesignmode) {
                imgurl = `url('${img.replace(/\\/g, '/')}')`
            } else {
                imgurl = `url('${img}')`
            }

            if (target === 'hide') {
                this.$.container.classList.add('baroffimage');
                this.updateStyles({ '--theme-sig-control-bar-straight-baroff-background-image': imgurl })
            } else {
                this.$.barimage.classList.add('baronimage');
                this.updateStyles({ '--theme-sig-control-bar-straight-baron-background-image': imgurl })
            }
        }
    }

    /****************************************************************************************************
     * Handles value changes
     * @param {Number} newValue the new value of the component
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _valueChanged(newValue:number): void {
        //check for designmode
        if (!this.isdesignmode) {
            this._updateBar();              
        }     
    }    

    /****************************************************************************************************
     * Handles changes to the minvalue
     * @param {Number} newValue the new value
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _minChanged(newValue:number): void {
        //check for designmode
        if (!this.isdesignmode) {        
            this._updateBar();
        }     
    }

    /****************************************************************************************************
     * Handles changes to the maxvalue
     * @param {Number} newValue the new value 
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _maxChanged(newValue:number): void {
        //check for designmode
        if (!this.isdesignmode) {
            this._updateBar();
        }    
    }

     /****************************************************************************************************
      * Handles changes to the min limit of the color range
      * @param {Number} newValue the new value 
      * @memberof LasalRuntimeSigControlBarStraight
     ****************************************************************************************************/
     _colorMinLimitChanged(newValue:number): void {
        this._updateBar();
    }

     /****************************************************************************************************
      * Handles changes to the max limit of the color range
      * @param {Number} newValue the new value 
      * @memberof LasalRuntimeSigControlBarStraight
     ****************************************************************************************************/
     _colorMaxLimitChanged(newValue:number): void {
        this._updateBar();
    }

    /****************************************************************************************************
     * calulate bar values
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _updateBar(): void {
        //check if already in dom so children can be accessed and if values are initialized
        if ((this.connected) && ((this.valuesInitialized) || (this.isdesignmode))) {

            let percent;
            if (this.isdesignmode) {
                // workaround: update background color, otherwise it would be displayed wrong after reload
                this._cBackground(this.bgcolorhide, null, this.imghide, "hide", this.bgcolorrangeminvalue, this.bgcolorrangemaxvalue);
                
                percent = this._getPercent(this.previewvalue);
            } else {
                percent = this._getPercent(this.valueuc);
            }

            //only do if no image set
            let minPercent:number;
            let maxPercent:number;
            if (this.isdesignmode) {
                // if a limit is not set, change set the percentage to min/max so the bar doesn't show
                if (typeof this.previewminlimit === "number") {
                    minPercent = this._getPercent(this.previewminlimit);
                } else {
                    minPercent = 0;
                }
                if (typeof this.previewmaxlimit === "number") {
                    maxPercent = this._getPercent(this.previewmaxlimit);    
                } else {
                    maxPercent = 1;
                }
            } else {
                // if a limit is not set, change set the percentage to min/max so the bar doesn't show
                if (typeof this.mincolorlimituc === "number") {
                    minPercent = this._getPercent(this.mincolorlimituc);
                } else {
                    minPercent = 0;
                }
                if (typeof this.maxcolorlimituc === "number") {
                    maxPercent = this._getPercent(this.maxcolorlimituc);
                } else {
                    maxPercent = 1;
                }
            }                

            (this.$.barmin as HTMLElement).style.width = `${minPercent * 100}%`;
            (this.$.baron as HTMLElement).style.width = `${(maxPercent - minPercent) * 100}%`;
            (this.$.barmax as HTMLElement).style.width = `${(1 - maxPercent) * 100}%`;                 
            
            //clip everything which should not be shown
            (this.$.barContainer as HTMLElement).style.clipPath = `inset(0px ${(1 - percent) * 100}% 0px 0px)`;
        }     
    }

    /****************************************************************************************************
    * Method to get all the border width elements independent of the used shorthand style
    * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    _getBorderWidth(): void {
        const borderStyle = this.style.getPropertyValue('--theme-' + this.tagName.toLowerCase() + '-border-style');

        if ((borderStyle === "none") || (borderStyle === "")) {
            this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = 0;
            return;
        }

        let borderWidth = this.style.getPropertyValue('--theme-' + this.tagName.toLowerCase() + '-border-width');

        if (borderWidth === "") {
            this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = 0;            
        } else {
            let values = borderWidth.split(' ');
        
            switch (values.length) {
                case 1: // "5px"
                    this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = parseInt(values[0]);
                    break;
                case 2: // "1px 5px"
                    this.borderTopWidth = this.borderBottomWidth = parseInt(values[0]);
                    this.borderRightWidth = this.borderLeftWidth = parseInt(values[1]);
                    break;
                case 3: // "1px 5px 10px"
                    this.borderTopWidth = parseInt(values[0]);
                    this.borderRightWidth = this.borderLeftWidth = parseInt(values[1]);
                    this.borderBottomWidth = parseInt(values[2]);
                    break;
                case 4: // "1px 5px 10px 15px"
                    this.borderTopWidth = parseInt(values[0]);
                    this.borderRightWidth = parseInt(values[1]);
                    this.borderBottomWidth = parseInt(values[2]);
                    this.borderLeftWidth = parseInt(values[3]);
                    break;
                default: // invalid format => use no border
                    this.borderTopWidth = this.borderRightWidth = this.borderBottomWidth = this.borderLeftWidth = 0;
                    break;
            }
        }
    }              

    /****************************************************************************************************
    * Redraw the component after a designer resize
    *so that the size of the bar is correct again
    @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    designerOnBoundsChanged(): void {
        if (this.isdesignmode) {
            // Use the renderCallback because the control doesn't have the correct bounds yet
            SigPolymer.afterNextRender(this, function (this:LasalRuntimeSigControlBarStraight) {
                this._setBarBackgroundSize();
                this._updateBar();
            })
        }
    }        

    /****************************************************************************************************
     * Overriding the default sigApplyCSSValue function
     * needed because the component needs to be redrawn on some css changes
     * @param {cssObject} cssObj The CSS object  that should be applied
     * @param {boolean | undefined} [doBoundsCheck=false] doBoundsCheck
     * @memberof LasalRuntimeSigControlBarStraight
    ****************************************************************************************************/
    sigApplyCSSValue(cssObj:cssObject, doBoundsCheck:boolean | undefined = false): void {
        super.sigApplyCSSValue(cssObj, doBoundsCheck);

        //value only changes in design mode
        if (this.isdesignmode) {
            //If there is more than one change, it is the inital load, and the component gets drawn correctly anyway
            const cssObjLength = Object.keys(cssObj).length;
            if ((cssObjLength === 1)
                && ((cssObj.hasOwnProperty('--theme-sig-control-bar-straight-border-width')) 
                 || (cssObj.hasOwnProperty('--theme-sig-control-bar-straight-border-style')))) {
                    this._setBarBackgroundSize();
                    this._updateBar();            
            }
        }
    }    
}
customElements.define(LasalRuntimeSigControlBarStraight.is, LasalRuntimeSigControlBarStraight);
