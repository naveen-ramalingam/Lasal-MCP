import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
/****************************************************************************************************
 * @class
 * @classdesc Implements and exports the sig-control-slider component.
 * @version 03.00.002
 * @extends LasalRuntimeSigElement
 *
 * @property {Boolean} handleismoving True if the handle is moving.
 * @property {Boolean} ispressed True if the handle is pressed.
 * @property {Boolean} valueUpdateOnEnter Serves as a debouncer. If true a new handle position is accepted as a new value.
 * @property {Number} handlePos The handle position.
 * @property {Number} scaleFactor The scale factor of the component.
 * @property {Number} handleWidth The width of the handle.
 * @property {Number} trackWidth The width of the track.
 * @property {Number} ratio Sensitivity of the component: range / (trackwidth - handlewidth).
 * @property {Number} cacheValue A temporary store for a new value.
 * @property {Number} valueLimitLowuc Limit low unconverted.
 * @property {Number} valueLimitHighuc Limit high unconverted.
 * @property {SigApi.ApiProperties} propApi Property Api.
 * @property {SigApi.ApiDatapointManager} dpApi DatapointManager Api.
 * @property {Boolean} isReady Defines if the Element is ready for initialization.
 * @property {Boolean} propsReady Defines if the properties are ready.
 * @property {Boolean} isdragged True when dragged.
 * @property {Number} maxuc Limit high.
 * @property {Number} minuc Limit low.
 * @property {Boolean} initialized True if component was initialized.
****************************************************************************************************/
export class LasalRuntimeSigSlider extends LasalRuntimeSigElement {
    /****************************************************************************************************
     * Returns the component's registered tag name.
     *
     * @readonly
     * @static
     * @returns {String} The component's tag name.
     * @memberof LasalRuntimeSigSlider
     ****************************************************************************************************/
    static get is() {
        return "sig-control-slider";
    }
    /****************************************************************************************************
     * Returns the import path URL used by Polymer.
     *
     * @readonly
     * @static
     * @returns {String} The import path URL.
     * @memberof LasalRuntimeSigSlider
     ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @returns {HTMLLIElement} The template literal of the component.
    * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `    
        <style include="sig-element-css">
            :host {
                /* Basic styling of the component */
                background-color: var(--theme-sig-control-slider-background-color, inherit);
                border-width: var(--theme-sig-control-slider-border-width, 0px);
                border-color: var(--theme-sig-control-slider-border-color, inherit);
                border-style: var(--theme-sig-control-slider-border-style, none);
                border-radius: var(--theme-sig-control-slider-border-radius, 0px);
                /* Basic box model settings */
                display: block;
                position: absolute;
                overflow: hidden;
            }
            :host * {
                @apply --notextselect;
                /* Reset margin and paddings for child elements*/
                margin: 0;
                padding: 0;
            }
            .clearfix:after {
                /* Import the global clearfix css mixin */
                @apply --clearfix 
            }
            .sig-control-slider {
                /* should be relative for use in designer */
                position: relative;
                width: 100%;
                height: 100%;
            }
            .values {
                position: absolute;
                transform: rotate(calc(var(--theme-sig-element-rotation, 0deg) * -1));
                transform-origin: 50%;
                display: none;
                padding: 2px !important;
            }
            .value {
                color: inherit;
                left: 50%;
                top: -3px;
                transform: translateX(-50%) rotate(calc(var(--theme-sig-element-rotation, 0deg) * -1));
                width: auto;
                height: auto;
            }
            .min {
                color: inherit;
                left: 0;
                bottom: -2px;
                width: auto;
                height: auto;
            }
            .max {
                color: inherit;
                right: 0;
                bottom: -2px;
                width: auto;
                height: auto;
            }
            .track {
                background-color: var(--theme-sig-control-slider-track-background-color, inherit);
                position: absolute;
                height: var(--theme-sig-control-slider-track-height, 12px);
                width: 100%;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto !important;
                border-radius: var(--theme-sig-control-slider-track-border-radius, 6px);
                box-shadow: inset 0px 0px 3px rgba(0, 0, 0, 0.3);
                cursor: pointer;
            }
            .tapbar {
                background-color: transparent;
                position: absolute;
                height: var(--theme-sig-control-slider-track-height, 12px);
                width: 100%;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto !important;
                cursor: pointer;
            }
            .bar {
                background-color: var(--theme-sig-control-slider-bar-background-color, inherit);
                position: absolute;
                height: var(--theme-sig-control-slider-bar-height, 12px);
                width: 100%;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto 1px !important;
                border-radius: var(--theme-sig-control-slider-bar-border-radius, 6px);
                cursor: pointer;
                display: block;
                transform-origin: left top;
            }

            .handle {
                background-color: var(--theme-sig-control-slider-handle-background-color, inherit);
                background-image: linear-gradient(var(--theme-sig-control-slider-handle-background-color-direction, to bottom),
                    var(--theme-sig-control-slider-handle-background-color, inherit),
                    var(--theme-sig-control-slider-handle-background-color-stop, var(--theme-sig-control-slider-handle-background-color, inherit)));
                position: absolute;
                height: var(--theme-sig-control-slider-handle-height, 16px);
                width: var(--theme-sig-control-slider-handle-width, 16px);
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto 0 !important;
                border-color: var(--theme-sig-control-slider-handle-border-color, inherit);
                border-width: var(--theme-sig-control-slider-handle-border-width, 0px);
                border-style: var(--theme-sig-control-slider-handle-border-style, solid);
                border-radius: var(--theme-sig-control-slider-handle-border-radius, 10px);
                cursor: pointer;
                display: block;
                box-sizing: border-box;
            }
            .hotspotarea {
                position: relative;
                height: 100%;
                width: 100%;
            }
            .hotspotarea>div {
                position: absolute;
                top: calc(var(--theme-sig-control-slider-hotspotarea-padding, 15px) * -1);
                left: calc(var(--theme-sig-control-slider-hotspotarea-padding, 15px) * -1);
                height: calc(100% + var(--theme-sig-control-slider-hotspotarea-padding, 15px) * 2);
                width: calc(100% + var(--theme-sig-control-slider-hotspotarea-padding, 15px) * 2);
            }
            :host([showhotspotarea][isdesignmode]) .hotspotarea>div {
                background-color: rgba(0, 255, 0, 0.3);
            }
            :host([showvalues]) .values {
                display: block;
            }
            .handleismoving, .ispressed {
                background-color: var(--theme-sig-control-slider-handle-moving-background-color, inherit);
                background-image: linear-gradient(var(--theme-sig-control-slider-handle-background-color-direction, to bottom),
                var(--theme-sig-control-slider-handle-moving-background-color, inherit),
                var(--theme-sig-control-slider-handle-moving-background-color-stop, var(--theme-sig-control-slider-handle-moving-background-color, inherit)));
            }
            :host([isdesignmode]) .handle, :host([isdesignmode]) .track, :host([isdesignmode]) .bar, :host([isdesignmode]) .tapbar {
                cursor: unset;
            }
        </style>
        <div id="slider" class="sig-control-slider clearfix">
            <div class="value values backrotate">[[valueuc]]</div>
            <div class="min values backrotate">[[minuc]]</div>
            <div class="max values backrotate">[[maxuc]]</div>
            <div id="track" class="track"></div>
            <div id="bar" class="bar"></div>
            <div id="tapbar" class="tapbar" on-down="_updateOnTap" on-up="_handleOnTapUp"></div>
            <div id="handle" class="handle" on-track="_handleTrack" on-down="_handleOnDown"
                on-up="_handleOnUp">
                <div class="hotspotarea">
                    <div></div>
                </div>
            </div>
        </div>
        `;
    }
    /****************************************************************************************************
    * Returns the defined Polymer properties of the component.
    * @readonly
    * @static
    * @returns {Object} The defined Polymer properties.
    * @memberof LasalRuntimeSigSlider
    *
    * @property {number} valueuc                             - The value of a data point bound to the component.
    * @property {string | number} limithighlvduc             - LVD unconverted limit high.
    * @property {string | number} limitlowlvduc              - LVD unconverted limit los.
    * @property {string | number} limitLow                   - The lower limit of the value.
    * @property {string | number} limitHigh                  - The upper limit of the value.
    * @property {boolean} showvalues                         - If true, value, limitLow and limitHigh are shown.
    * @property {boolean} showhotspotarea                    - If true the hotpot area is shown. Design mode only.
    * @property {boolean} inversedirection                   - If true, the direction of the slider will be reversed.
    ****************************************************************************************************/
    static get properties() {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            valueuc: {
                type: Number,
                observer: '_ucValueChanged',
                value: 50
            },
            limitlowlvduc: {
                type: Number,
                value: undefined,
                observer: '_updateMinValue'
            },
            limithighlvduc: {
                type: Number,
                value: undefined,
                observer: '_updateMaxValue'
            },
            limitLow: {
                type: String,
                value: '',
                observer: '_updateMinValue'
            },
            limitHigh: {
                type: String,
                value: '',
                observer: '_updateMaxValue'
            },
            showvalues: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            showhotspotarea: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            inversedirection: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            }
        };
        return props;
    }
    /****************************************************************************************************
     * Creates an instance of the sig-control-slider component.
     * @constructor
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    constructor() {
        super();
        this.initialized = false;
        this.handleismoving = false;
        this.ispressed = false;
        this.valueUpdateOnEnter = false;
        // Cache Props
        this.handlePos = 0;
        this.scaleFactor = null;
        this.ratio = null;
        this.handleWidth = null;
        this.trackWidth = null;
        this.cacheValue = 0;
        this.valueLimitLowuc = 0;
        this.valueLimitHighuc = 100;
        this.tapDownIntervalId = null;
        this.stepsizeontapuc = 0;
        this.stepinterval = 100;
        this.propApi = window.sigApi.properties;
        if ((this.propApi === undefined) || (this.propApi === null)) {
            this._log("constructor(): API properties not available", "ERROR");
        }
        this.dpApi = window.sigApi.datapointManager;
        if ((this.dpApi === undefined) || (this.dpApi === null)) {
            this._log("constructor(): API datapointManager not available", "ERROR");
        }
        this.addPredefProps([
            {
                src: 'value',
                dest: 'valueuc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            },
            {
                src: 'value',
                dest: 'limitLow',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_LIMIT_LOW
            },
            {
                src: 'value',
                dest: 'limitHigh',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_LIMIT_HIGH
            },
            {
                src: 'limitlowlvd',
                dest: 'limitlowlvduc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            },
            {
                src: 'limithighlvd',
                dest: 'limithighlvduc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            },
            {
                src: 'stepsizeontap',
                dest: 'stepsizeontapuc',
                type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_UNCONVERTED_VALUE
            }
        ]);
        this.sigAddRequiredProperty('valueuc');
        this.sigAddRequiredProperty('limitLow');
        this.sigAddRequiredProperty('limitHigh');
        this.sigAddRequiredProperty('limitlowlvduc');
        this.sigAddRequiredProperty('limithighlvduc');
    }
    /****************************************************************************************************
    * called after property default values are set and local DOM is initialized
    *
    * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    ready() {
        super.ready();
        this.isReady = true;
        // wait for next render in designer, for getting control bounds
        if (this.isdesignmode) {
            this.propsReady = true;
            SigPolymer.afterNextRender(this, this._init);
            // no designer, get control bounds immediately
        }
        else if (this.propsReady)
            this._init();
    }
    /****************************************************************************************************
     * This method is executed if all the defined required properties are ready.
     * It runs the default implementation, calculates the ratio and calls the resizeHandler.
     *
     * @override
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    sigOnRequiredPropertiesReady() {
        super.sigOnRequiredPropertiesReady();
        this.propsReady = true;
        if (this.isReady)
            this._init();
    }
    /****************************************************************************************************
     * Method is used to initialized the slide.
     *
     * @memberof LasalRuntimeSigSlider
     ****************************************************************************************************/
    _init() {
        //set initialized
        this.initialized = true;
        this._getMinValue();
        this._getMaxValue();
        //initialize by setting handle position
        this._updateHandle(this.valueuc);
    }
    /****************************************************************************************************
     * A function to write the unconverted datapoint selected at value.
     * This doesn't set value or valueuc, but the datapoint which leads to an update of both.
     *
     * @private
     * @param {Number} newvalue The new value for the valueuc property.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _writeDatapoint(newvalue) {
        //we need to fetch property everytime to get datapoint in case of datapoint-scheme configured
        if ((this.propApi !== null) && (this.dpApi !== null)) {
            //check if property configured
            const prop = this.propApi.getProperty(this.id, 'value');
            if (prop !== null) {
                //get datapoint
                const dp = prop.getDatapoint();
                if (dp !== null) {
                    //write value
                    this.dpApi.writeDataPoint(dp.getId(), newvalue).then().catch((error) => {
                        this._log('_writeDatapoint(): failed to write datapoint -> status: ' + error.status, 'ERROR');
                    });
                }
                else {
                    this._log('_writeDatapoint(): failed to get datapoint', 'ERROR');
                }
            }
        }
        else {
            this._log('_writeDatapoint(): invalid apis', 'ERROR');
        }
    }
    /****************************************************************************************************
     * An observer method that is called every time the unconverted value changes
     * It checks, whether the new value is valid and different to the old one and if so it sets the corresponding data point
     *
     * @private
     * @param {Number} newvalue The new value of the valueuc property.
     * @param {Number} oldvalue The old value of the valueuc property.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _ucValueChanged(newvalue, oldvalue) {
        if ((oldvalue !== undefined) && (this.propsReady === true)) {
            this.cacheValue = newvalue;
            if (!this.ispressed || !this.handleismoving || this.valueUpdateOnEnter) {
                this._updateHandle(newvalue);
                this._handleSliderValueUpdate();
                this.valueUpdateOnEnter = false;
            }
        }
    }
    /****************************************************************************************************
     * Event handler of the on-track event. It is executed every time the handle is dragged.
     *
     * @private
     * @param {Event} e JavaScript event.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _handleTrack(e) {
        if (!this.isdesignmode && !this.isdragged) {
            switch (e.detail.state) {
                // touch event on track
                case 'start':
                    this.handleismoving = true;
                    //update scale factor once at start
                    this._getScaleFactor(true);
                    this.$.handle.classList.add('handleismoving');
                    this._dispatchEvent('tracking-start');
                    break;
                // move event on track
                case 'track':
                    let delta = 0;
                    const rotation = this._getRealRotation(this.realrotation);
                    if (this.scaleFactor !== null) {
                        // calculate delta position according to the rotation of the control                    
                        if (rotation < 90) { // 090°
                            delta = e.detail.ddx / this.scaleFactor.x;
                        }
                        else if (rotation >= 90 && rotation < 180) { // 90-180°
                            delta = e.detail.ddy / this.scaleFactor.y;
                        }
                        else if (rotation >= 180 && rotation < 270) { // 180-270°
                            delta = -(e.detail.ddx) / this.scaleFactor.x;
                        }
                        else { // 270-360°
                            delta = -(e.detail.ddy) / this.scaleFactor.y;
                        }
                    }
                    // update the movement for user
                    this._update(delta);
                    break;
                // release event on track
                case 'end':
                    this.handleismoving = false;
                    this.$.handle.classList.remove('handleismoving');
                    this._dispatchEvent('tracking-stop');
                    // this also triggers the value-update event
                    this._ucValueChanged(this.cacheValue, this.valueuc);
                    break;
            }
        }
    }
    /****************************************************************************************************
     * This method calculates the property value according to the new handle position, limitLow and limitHigh.
     *
     * @private
     * @param {Number} delta Current change of the handle position compared to the last saved.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _update(delta) {
        const handlepos = this.handlePos;
        const trackwidth = this._getTrackWidth();
        //calculate how many percentage of total track width we moved
        const movedPerc = (delta / trackwidth) * 100.0;
        let newpos = handlepos + movedPerc;
        let newval;
        //limit percentage pos
        if (newpos < 0) {
            newpos = 0;
        }
        if (newpos > 100) {
            newpos = 100;
        }
        //get value range
        const valueRange = this.maxuc - this.minuc;
        // if direction is inversed, min-limits starts from the other side (e.g. right to left)
        if (this.inversedirection) {
            newval = this.maxuc - ((newpos * valueRange) / 100);
        }
        else {
            newval = this.minuc + ((newpos * valueRange) / 100);
        }
        // check if lower than limitLow
        if (newval < this.minuc) {
            newval = this._checkDataPointLimits(this.minuc);
            let newPos;
            // if inversed, limitLow is on the right (with rotation 0deg)
            if (this.inversedirection) {
                newPos = 100;
            }
            else {
                newPos = 0;
            }
            this._setHandle(newPos);
            // check if higher than limitHigh
        }
        else if (newval > this.maxuc) {
            newval = this._checkDataPointLimits(this.maxuc);
            let newPos;
            // if inversed, limitHigh is on the left (with rotation 0deg)
            if (this.inversedirection) {
                newPos = 0;
            }
            else {
                newPos = 100;
            }
            this._setHandle(newPos);
            // when inside limits, update the position
        }
        else {
            newval = this._checkDataPointLimits(newval);
            this._setHandle(newpos);
        }
        this.valueuc = newval;
        this._writeDatapoint(newval);
    }
    /****************************************************************************************************
     * Shows a new value at the handle
     *
     * @private
     * @param {Number} newvalue  The value that should be recalculated into a handle position
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _updateHandle(newvalue) {
        const value = this._checkDataPointLimits(newvalue);
        //get value range
        const valueRange = this.maxuc - this.minuc;
        let newPos;
        if (this.inversedirection) {
            newPos = (this.maxuc - value) / valueRange;
        }
        else {
            newPos = (value - this.minuc) / valueRange;
        }
        //get percentage
        newPos *= 100;
        this._setHandle(newPos);
    }
    /****************************************************************************************************
     * Applies the CSS left property on the handle as well as width property on the bar part of the track.
     *
     * @private
     * @param {Number} pos  The handle position to be set.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _setHandle(pos) {
        this.handlePos = pos;
        if (this.inversedirection) {
            this.$.handle.style.left = `${pos}%`;
            //transform to liniar scale depending on width of handle
            this.$.handle.style.transform = `translate(${-pos}%)`;
            this.$.bar.style.clipPath = `inset(0% 0% 0% ${pos}%)`;
        }
        else {
            this.$.handle.style.left = `${pos}%`;
            //transform to liniar scale depending on width of handle
            this.$.handle.style.transform = `translate(${-pos}%)`;
            this.$.bar.style.clipPath = `inset(0% ${100 - pos}% 0% 0%)`;
        }
    }
    /****************************************************************************************************
     * Calculates the scale factor of the component.
     *
     * @private
     * @param {Boolean} [forceUpdate=false] If true, calculation is forced independently of non-design mode and the already calculated scale factor.
     * @returns {Number} The ratio of the slider.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getScaleFactor(forceUpdate = false) {
        // We also check if this.scaleFactor isNaN and recalculate it in this case.
        // So we make sure the slider handles never gets stuck in any case.
        if (this.scaleFactor === null || this.isdesignmode || forceUpdate) {
            this.scaleFactor = this.getScaleFactor();
        }
        return this.scaleFactor;
    }
    /****************************************************************************************************
     * Estimates the width of the handle element.
     *
     * @private
     * @param {Boolean} [forceUpdate=false] If true, estimation is forced independently of non-design mode and the already estimated handle width.
     * @returns {Number} The width of the handle.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getHandleWidth(forceUpdate = false) {
        if (this.handleWidth === null || this.isdesignmode || forceUpdate || this.handleWidth === 0) {
            if (this.$.handle instanceof HTMLElement) {
                this.handleWidth = this.$.handle.offsetWidth;
            }
        }
        return this.handleWidth;
    }
    /****************************************************************************************************
     * Estimates the width of the track element.
     *
     * @private
     * @param {Boolean} [forceUpdate=false] If true, estimation is forced independently of non-design mode and the already estimated track width.
     * @returns {Number} The width of the track.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getTrackWidth(forceUpdate = false) {
        if (this.trackWidth === null || this.isdesignmode || forceUpdate || this.trackWidth === 0) {
            this.trackWidth = this.$.track.offsetWidth;
        }
        return this.trackWidth;
    }
    /****************************************************************************************************
     * This method handles tracking of the handle in non-design mode.
     * The 'value-update' event is dispatched.
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _handleSliderValueUpdate() {
        if (!this.isdesignmode) {
            this._dispatchEvent('value-update');
        }
    }
    /****************************************************************************************************
     * Event handler for the on-up event. Clears the tapDownInterval
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _handleOnTapUp() {
        if (this.tapDownIntervalId) {
            this.sigClearInterval(this.tapDownIntervalId);
            this.tapDownIntervalId = null;
        }
    }
    /****************************************************************************************************
     * Creates the tapDownInterval which calls the _updateOnTap method after the defined interval timeout
     *
     * @private
     * @param {Event} evt JavaScript event.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _createTapDownInterval(evt) {
        if (this.tapDownIntervalId)
            return;
        this.tapDownIntervalId = this.sigSetInterval(() => {
            this._updateOnTap(evt);
        }, this.stepinterval);
    }
    /****************************************************************************************************
     * Event handler for the on-down event. It is executed every time the bar is pressed. It updates the value.
     *
     * @private
     * @param {Event} evt JavaScript event.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _updateOnTap(evt) {
        if (!this.isdesignmode) {
            let clickedPos, newval;
            const bounds = this.$.track.getBoundingClientRect();
            const rotation = this._getRealRotation(this.realrotation);
            //force to get new scale factor as the window might be resized in the meantime
            const scaleFactor = this._getScaleFactor(true);
            //calculate clicked pos depending on the orientation
            //only steps in 90 degrees supported
            if (rotation < 90) { // 0-90° || 360°
                clickedPos = (evt.detail.x - bounds.left) / scaleFactor.x;
            }
            else if (rotation >= 90 && rotation < 180) { // 90-180°
                clickedPos = (evt.detail.y - bounds.top) / scaleFactor.y;
            }
            else if (rotation >= 180 && rotation < 270) { // 180-270°
                clickedPos = (bounds.right - evt.detail.x) / scaleFactor.x;
            }
            else { // 270-360°
                clickedPos = (bounds.bottom - evt.detail.y) / scaleFactor.y;
            }
            //get track width
            const trackWidth = this._getTrackWidth();
            //value range
            const valueRange = this.maxuc - this.minuc;
            //calculate delta value
            let deltaValue = (valueRange / trackWidth) * clickedPos;
            // calculate the new position of the handle, and set the mouse in the middle of it
            if (this.inversedirection) {
                newval = this.maxuc - deltaValue;
            }
            else {
                newval = this.minuc + deltaValue;
            }
            //if step size set, the value is increased / decreased continously until the 
            //clicked position is reached
            if (this.stepsizeontapuc) {
                if (this.stepinterval)
                    this._createTapDownInterval(evt);
                if (newval > this.valueuc) {
                    const stepVal = this.valueuc + this.stepsizeontapuc;
                    if (stepVal < newval)
                        newval = stepVal;
                }
                else if (newval < this.valueuc) {
                    const stepVal = this.valueuc - this.stepsizeontapuc;
                    if (stepVal > newval)
                        newval = stepVal;
                }
            }
            if (newval < this.minuc) {
                newval = this._checkDataPointLimits(this.minuc);
            }
            else if (newval > this.maxuc) {
                newval = this._checkDataPointLimits(this.maxuc);
            }
            else {
                newval = this._checkDataPointLimits(newval);
            }
            this.valueuc = newval;
            this._writeDatapoint(newval);
        }
    }
    /****************************************************************************************************
     * Checks a certain value if it's inside the datapoint limits and if not it returns the limit that has been exceeded
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _checkDataPointLimits(newvalue) {
        newvalue = Math.round(newvalue);
        if ((this.valueLimitLowuc !== undefined) && (newvalue < this.valueLimitLowuc)) {
            return this.valueLimitLowuc;
        }
        else if ((this.valueLimitHighuc !== undefined) && (newvalue > this.valueLimitHighuc)) {
            return this.valueLimitHighuc;
        }
        else {
            return newvalue;
        }
    }
    /****************************************************************************************************
     * Gets the currently valid minimum limit for the slider depending on the control settings
     * If no min value has been selected, the lower limit of the value is used in its base unit
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getMinValue() {
        // get the lower limit of the value to limit the calculated value later
        if (this.propApi !== null) {
            const minProp = this.propApi.getProperty(this.id, "limitLow");
            if (minProp !== null) {
                this.valueLimitLowuc = minProp.getUnconvertedValue();
            }
        }
        // if it's valid, use the set min value in its base unit
        if (this.limitlowlvduc !== undefined) {
            //we can use Number normally as it is only a string if a constant is set and in that case only . as a seperator is possible
            this.minuc = Number(this.limitlowlvduc);
        }
        else {
            // otherwise use the lower limit of the value datapoint
            if (this.valueLimitLowuc !== undefined)
                this.minuc = this.valueLimitLowuc;
        }
        if (this.minuc === this.maxuc) {
            this._log("_getMinValue(): Min and Max value must not be equal!", "ERROR");
        }
    }
    /****************************************************************************************************
     * Gets the currently valid maximum limit for the slider depending on the control settings
     * If no max value has been selected, the upper limit of the value is used in its base unit
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getMaxValue() {
        // get the upper limit of the value to limit the calculated value later
        if (this.propApi !== null) {
            const maxProp = this.propApi.getProperty(this.id, "limitHigh");
            if (maxProp !== null) {
                this.valueLimitHighuc = maxProp.getUnconvertedValue();
            }
        }
        // if it's valid, use the set max value in its base unit
        if (this.limithighlvduc !== undefined) {
            //we can use Number normally as it is only a string if a constant is set and in that case only . as a seperator is possible
            this.maxuc = Number(this.limithighlvduc);
        }
        else {
            // otherwise use the upper limit of the value datapoint
            if (this.valueLimitHighuc !== undefined)
                this.maxuc = this.valueLimitHighuc;
        }
        if (this.minuc === this.maxuc) {
            this._log("_getMaxValue(): Min and Max value must not be equal!", "ERROR");
        }
    }
    /****************************************************************************************************
     * An observer method that is called every time the property limitLow changes.
     * It calculates the ratio and calls the observer for the property value as the value would have been changed.
     *
     * @private
     * @param {Number} newvalue The new value of the limitLow property.
     * @param {Number} oldvalue The old value of the limitLow property.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _updateMinValue(newvalue, oldvalue) {
        //avoid observer having an effect before component was initialized
        if (!this.initialized)
            return;
        //update min value and handle position
        this._getMinValue();
        this._updateHandle(this.valueuc);
    }
    /****************************************************************************************************
     * An observer method that is called every time the property limitHigh changes.
     * It calculates the ratio and calls the observer for the property value as the value would have been changed.
     *
     * @private
     * @param {Number} newvalue The new value of the limitHigh property.
     * @param {Number} oldvalue The old value of the limitHigh property.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _updateMaxValue(newvalue, oldvalue) {
        //avoid observer having an effect before component was initialized
        if (!this.initialized)
            return;
        //update max value and handle position
        this._getMaxValue();
        this._updateHandle(this.valueuc);
    }
    /****************************************************************************************************
     * Calculates and returns the real rotation of the component.
     *
     * @private
     * @param {Number} [rotation=0] The rotation given as an integer number.
     * @returns {Number} The real rotation of the component.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _getRealRotation(rotation = 0) {
        return (rotation % 360 + 360) % 360;
    }
    /****************************************************************************************************
     * This callback is called by LVD when the component's bounds changed. Designmode only!
     * Note that newBounds and oldBounds are not always set and may be undefined.
     *
     * @param {Object} newBounds The new bounds of the element.
     * @param {Object} oldBounds The old bounds of the element.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    designerOnBoundsChanged(newBounds, oldBounds) {
        //refresh by setting handle
        this._updateHandle(this.valueuc);
    }
    /****************************************************************************************************
     * Called when a property was changed in the designer.
     *
     * @param {string} id The id of the component.
     * @param {object} properties The object of the changed properties.
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    designerOnControlUpdate(id, properties) {
        // update the designer preview if one of the following properties changed
        const foundProperty = properties.find((property) => property.name === 'inversedirection');
        if (foundProperty !== undefined)
            this._setHandle(this.handlePos);
    }
    /****************************************************************************************************
     * Event handler for the on-down event on the handle element.
     * It adds the style class 'ispressed' on the handle.
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _handleOnDown() {
        this.$.handle.classList.add('ispressed');
        this.ispressed = true;
    }
    /****************************************************************************************************
     * Event handler for the on-up event on the handle element.
     * It removes the style class 'ispressed' from the handle.
     *
     * @private
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    _handleOnUp() {
        this.$.handle.classList.remove('ispressed');
        this.ispressed = false;
    }
    /****************************************************************************************************
     * Overriding the default sigApplyCSSValue function
     * needed because the component needs to be redrawn on some css changes
     *
     * @param {Object} cssObj
     * @param {Boolean} [doBoundsCheck=false]
     * @memberof LasalRuntimeSigSlider
    ****************************************************************************************************/
    sigApplyCSSValue(cssObj, doBoundsCheck = false) {
        super.sigApplyCSSValue(cssObj, doBoundsCheck);
        // value only changes in design mode
        if (this.isdesignmode) {
            // if there are more than one change, it is the inital load, and the component gets drawn correctly anyway
            const cssObjLength = Object.keys(cssObj).length;
            if ((cssObjLength === 1) && cssObj.hasOwnProperty('--theme-sig-control-slider-handle-width')) {
                this._ucValueChanged(50, 0);
            }
        }
    }
}
customElements.define(LasalRuntimeSigSlider.is, LasalRuntimeSigSlider);
//# sourceMappingURL=sig-control-slider.js.map