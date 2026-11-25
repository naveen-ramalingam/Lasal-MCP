import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import '../sig-control-scrollbar/sig-control-scrollbar-css.js';
/****************************************************************************************************
*
* @class LasalRuntimeSigControlEnumList
* @classdesc Implements and exports the sig-control-enum-list component.
* @extends {LasalRuntimeSigElement}
*
* @property {HTMLLIElement} list HTML "ul" element.
* @property {HTMLLIElement} selected The selected HTML "li" element.
* @property {Boolean} isVisible If true the component is visible.
* @property {Number} setVisibleDelay Shows the component after the given delay in milliseconds.
* @property {String} windowContainerClass Default window container class.
* @property {Number} oldRotation The old rotation of the component.
* @property {} parent The parent component sig-control-enum.
* @property {Number} offsetX OffsetX of the component.
* @property {Number} offsetY OffsetY of the component.
* @property {String} position Defines the direction in which the enum options list opens relative to the parent sig-control-enum.
* @property {Number} shownelements Number of list items to show.
****************************************************************************************************/
export class LasalRuntimeSigControlEnumList extends LasalRuntimeSigElement {
    /****************************************************************************************************
    * Returns the component's registered tag name.
    *
    * @readonly
    * @static
    * @returns {String} The component's registered tag name.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    static get is() {
        return "sig-control-enum-list";
    }
    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @returns {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
          <style include="sig-element-css sig-control-scrollbar-css">
        :host {
            /* Basic styling of the component */
            color: var(--theme-sig-control-enum-list-color, inherit);
            background-color: var(--theme-sig-control-enum-list-background-color, inherit);
            background-image: var(--theme-sig-control-enum-list-background-image, none);
            background-repeat: var(--theme-sig-control-enum-list-background-repeat, repeat);
            border-radius: var(--theme-sig-control-enum-list-border-radius, 0px);

            /* Basic box model settings */
            display: var(--theme-sig-control-enum-list-display, block);
            position: var(--theme-sig-control-enum-list-position, absolute);
            top: var(--theme-sig-control-enum-list-top, var(--theme-sig-element-top, auto));
            left: var(--theme-sig-control-enum-list-left, var(--theme-sig-element-left, auto));
            width:  var(--theme-sig-element-width, auto);
            height:  var(--theme-sig-element-height, auto);
            margin: var(--theme-sig-control-enum-list-margin, 0);
            padding: var(--theme-sig-control-enum-list-padding, 0);
            overflow: var(--theme-sig-control-enum-list-overflow, visible);
            z-index: 90000;

            font-family: var(--theme-sig-control-enum-list-font-family, inherit);
            font-size: var(--theme-sig-control-enum-list-font-size, inherit);
            font-weight: var(--theme-sig-control-enum-list-font-weight, inherit);
            font-style: var(--theme-sig-control-enum-list-font-style, inherit);

            transform: translateZ(1px);
        }

        :host * {
            /* Reset margin and padding for child elements and turn off text selection */
            @apply --notextselect;
            margin: 0;
            padding: 0;
        }

        :host([hidden]) {
            display: none;
        }

        .clearfix:after {
            /* Import the global clearfix css mixin */
            @apply --clearfix
        }

        #list {
            box-sizing: border-box;
            border-width: var(--theme-sig-control-enum-list-border-width, 1px);
            border-color: var(--theme-sig-control-enum-list-border-color, inherit);
            border-style: var(--theme-sig-control-enum-list-border-style, solid);
            border-radius: var(--theme-sig-control-enum-list-border-radius, 0px);
    
            /* should be relative for use in designer */
            position: relative;
            width: 100%;
            height: 100%;
            text-decoration: inherit;
        }

        #valueoptions {
            list-style-type: none;
            text-decoration: inherit;
            overflow-x: hidden;
            overflow-y: auto;
            height: 100%;
        }

        .option {
            border-color: transparent;
            border-style: solid;
            border-width: var(--theme-sig-control-enum-list-text-indent-top-bottom, 0) var(--theme-sig-control-enum-list-text-indent-left-right, 5px);

            cursor: pointer;
            white-space: nowrap;
            text-decoration: inherit;
        }

        .option:nth-child(even) {
            color: var(--theme-sig-control-enum-list-option-color-even, inherit);
            background-color: var(--theme-sig-control-enum-list-option-background-color-even, inherit);
        }

        .option:nth-child(odd) {
            color: var(--theme-sig-control-enum-list-option-color-odd, inherit);
            background-color: var(--theme-sig-control-enum-list-option-background-color-odd, inherit);
        }

        .selected {
            color: var(--theme-sig-control-enum-list-option-color-selected, inherit) !important;
            background-color: var(--theme-sig-control-enum-list-option-background-color-selected, inherit) !important;
        }

        li.option {
            display: flex;
            align-items: var(--theme-sig-control-enum-list-option-vertical-align, center);
            justify-content: var(--theme-sig-control-enum-list-option-text-align, left);
            height: calc(var(--theme-sig-control-enum-list-option-line-height, 26px) - var(--theme-sig-control-enum-list-text-indent-top-bottom, 0px) * 2);
        }
        </style>
    <div id="list" on-tap='_select'>
    </div>
    `;
    }
    /****************************************************************************************************
    * Returns the defined Polymer properties of the component.
    *
    * @readonly
    * @static
    * @returns {Object} The defined Polymer properties.
    * @memberof LasalRuntimeSigControlEnumList
    *
    * @property {Number}      value        - The current active value of the component.
    * @property {Array}       valueoptions - All value options of the component.
    * @property {Boolean}     hidden       - If true the component is hidden.
    * @property {Object}      css          - CSS properties object to be applied on the component.
    ***************************************************************************************************/
    static get properties() {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            value: {
                type: Number,
                value: undefined,
                observer: '_updateValue'
            },
            valueoptions: {
                type: Array,
                value: () => { return []; },
                observer: '_updateOptions'
            },
            hidden: {
                type: Boolean,
                value: true,
                reflectToAttribute: true,
                observer: '_toggleHidden'
            },
            css: {
                type: Object,
                value: () => { return {}; },
                observer: '_updateCSSProperties'
            }
        };
        return props;
    }
    /****************************************************************************************************
    * Returns an array of complex observers.
    *
    * @readonly
    * @static
    * @returns {String []} An array of complex observers.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    static get observers() {
        return [
            '_updateProps(position, offsetX, offsetY, shownelements)'
        ];
    }
    /****************************************************************************************************
    * Creates an instance of LasalRuntimeSigControlEnumList.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    constructor() {
        super();
        this.list = null;
        this.selected = null;
        this.isVisible = false;
        this.setVisibleDelay = 100;
        this.windowContainerClass = 'jsPanel-content';
        this.oldRotation = 0;
        this.parent = null;
        this.offsetX = 2;
        this.offsetY = 2;
        this.position = 'bottom'; // bottom, top, left, right
        this.shownelements = 0;
    }
    /****************************************************************************************************
    * This callback is called when the component is disconnected from the DOM.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    disconnectedCallback() {
        super.disconnectedCallback();
        this.parent = null;
        this.list = null;
    }
    /****************************************************************************************************
    * An observer method that is called every time the property value changes.
    * It toggles the active selection of the enum-list.
    *
    * @param {Number} newval The new value of the property value.
    * @param {Number} oldval The old value of the property value.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _updateValue(newval, oldval) {
        if (newval !== undefined) {
            this._toggleSelected();
        }
    }
    /****************************************************************************************************
    * An observer method that runs every time the property valueoptions changes.
    * It builds a new list and sets it to the right position.
    *
    * @param {{id: number, name: string}[]} newval The new value of the property value.
    * @param {{id: number, name: string}[]} oldval The old value of the property value.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _updateOptions(newval, oldval) {
        if (oldval !== undefined && newval instanceof Array && newval.length > 0) {
            this._buildList(newval);
            if (!this.hidden) {
                this._setPosition(this.position);
            }
        }
    }
    /****************************************************************************************************
    * Switches the selected enum-list row to the newly selected row.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _toggleSelected() {
        if (this.list instanceof HTMLElement) {
            if (this.selected instanceof HTMLElement) {
                //remove selected class from old selected option
                this.selected.classList.remove('selected');
            }
            this.selected = this.shadowRoot?.querySelector(`#valueoptions > li[data-id="${this.value}"]`);
            if (this.selected instanceof HTMLElement) {
                this.selected.classList.add('selected');
            }
        }
    }
    /****************************************************************************************************
    * Builds the options list from the parameter options.
    *
    * @param {{id: number, name: string}[]} options An array of value options containing name, id and CSS properties.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _buildList(options) {
        if (this.valueoptions.length > 0) {
            if (this.list instanceof HTMLElement) {
                this.list.remove();
            }
            this.list = document.createElement('ul');
            this.list.setAttribute('id', 'valueoptions');
            options.forEach((option) => {
                const li = document.createElement('li');
                li.textContent = option.name;
                li.classList.add('option');
                li.setAttribute('data-id', option.id);
                if (option.id === this.value) {
                    li.classList.add('selected');
                    this.selected = li;
                }
                if (option.css) {
                    this._setCSSProperties(li, option.css);
                }
                this.list?.appendChild(li);
            });
            this.css = this._getListStyles();
            this.$.list.appendChild(this.list);
        }
    }
    /****************************************************************************************************
    * The on-down event handler that selects the clicked option.
    *
    * @param {*} evt On-down event.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _select(evt) {
        const _path = evt.composedPath();
        const option = _path[0];
        if (option.classList.contains('option')) {
            //FRAFAB: Special set value implementation
            //because otherwise the server value isn't changed when the parents function block fires
            const prop = window.sigApi.properties.getProperty(this.parent.id, 'value');
            //if the prop is set
            //otherwise this should be null, which is falsey
            if (prop) {
                // LESMAX: Handle all valid property types (Datapoint or Scheme) that can be handled by the enum control
                let dp = null;
                switch (prop.getSource()) {
                    // For a datapoint property we only need to obtain the datapoint
                    case window.sigApi.SIG_CONST.PROP_SRC_DATAPOINT:
                        // LESMAX: Only call getDatapoint if its valid to avoid exceptions
                        dp = typeof prop.getDatapoint === 'function' ? prop.getDatapoint() : null;
                        break;
                    // For a scheme we need to get the current selected scheme branch, check if its a datapoint and then obtain the datapoint
                    case window.sigApi.SIG_CONST.PROP_SRC_SCHEME:
                        // LESMAX: Obtain the current selected scheme branch, which is expected to be a datapoint property
                        // Only call getSelectedProp if its valid to avoid exceptions
                        const selectedProp = typeof prop.getSelectedProp === 'function' ? prop.getSelectedProp() : null;
                        if (selectedProp && selectedProp.getSource() === window.sigApi.SIG_CONST.PROP_SRC_DATAPOINT) {
                            //LESMAX: Only call getDatapoint if its valid to avoid exceptions
                            dp = typeof selectedProp.getDatapoint === 'function' ? selectedProp.getDatapoint() : null;
                        }
                        break;
                    default:
                        this._log('Unexpected value property for enum list! Should be datapoint or scheme!', 'ERROR');
                        break;
                }
                //check if we have a datapoint
                if (dp) {
                    //If we have a datapoint, write it via the api
                    //That way the valueChanged observer only gets called when the server itself updated
                    window.sigApi.datapointManager.writeDataPoint(dp.getId(), option.dataset.id);
                }
                else {
                    // LESMAX: Call default behaviour if datapoint is null
                    this.parent.value = option.dataset.id;
                }
            }
            else {
                this.parent.value = option.dataset.id;
            }
            //this.parent.value = option.dataset.id;
        }
        //FRAFAB: Also check if the taget was a LI element befor hiding the component
        //Otherwise scrolling would be impossible
        if (!this.isdesignmode && evt.target.tagName === 'LI') {
            this.hidden = true;
        }
    }
    /****************************************************************************************************
    * An observer method that runs every time the property ishidden changes.
    * If the new value of ishidden is false, it opens the enum-list and places it according to the property position.
    *
    * @param {Boolean} newval The new value of the property ishidden.
    * @param {Boolean} oldval The old value of the property ishidden.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _toggleHidden(newval, oldval) {
        if (!newval) {
            this._log(`Opening "${this.id}" to "${this.position}"`);
            switch (this.position) {
                case 'auto':
                    this._setPosition(this._getValidPosition());
                    break;
                case 'bottom':
                    this._setPosition('bottom');
                    break;
                case 'top':
                    this._setPosition('top');
                    break;
                case 'left':
                    this._setPosition('left');
                    break;
                case 'right':
                    this._setPosition('right');
                    break;
                default:
                    this._log('Invalid list position!', 'ERROR');
                    break;
            }
        }
    }
    /****************************************************************************************************
    * Delays the component's visibility for the setVisibleDelay period until the position is determined.
    * This avoids an un-positioned list to pop up for a while.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _makeVisible() {
        if (this.style.visibility === 'hidden' && !this.isVisible) {
            this.sigSetTimeout(() => {
                this.style.removeProperty('visibility');
                this.isVisible = true;
            }, this.setVisibleDelay);
        }
    }
    /****************************************************************************************************
    * It should return the enum-list position relative to the parent component sig-control-enum.
    *
    * @return {String} The enum-list relative position.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getValidPosition() {
        // Dummy for now
        const outerBox = this.parentNode;
        return 'bottom';
    }
    /****************************************************************************************************
    * Calculates and sets the right position of the enum-list relative to the parent component sig-control-enum according to the scaleFactor, rotation, scrolled viewport.
    *
    * @param {string} position The relative position for the enum-list to open.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _setPosition(position) {
        if (this.parent instanceof HTMLElement) {
            SigPolymer.afterNextRender(this, function (params) {
                let jsPanel;
                let rotation = 0;
                let scaleFactorApp = { x: 1, y: 1 };
                let scaleFactorParent = { x: 1, y: 1 };
                let contextBounds = { left: 0, top: 0, width: 0, height: 0 };
                const windowOffset = { x: 0, y: 0 };
                //We need to use getBoundingClientRect(); no other performant way to get position relative to the viewport!
                const parentBounds = this.parent.getBoundingClientRect();
                if (this.isdesignmode) {
                    // In designmode we need to calculate the real rotation 
                    rotation = this._getRealRotation(this._getPathRotation(this.parent, this.parent.rotation));
                    // we need to change the position when we are placed inside a window 
                    // -> in designmode we check differently
                    jsPanel = this.parentNode.closest(`.${this.windowContainerClass}`);
                }
                else {
                    // In the normal runtime we get the precalculated value
                    rotation = this._getRealRotation(parseInt(this.parent.realrotation, 10));
                    scaleFactorApp = this._getScaleFactor(this.parentNode, 0);
                    // in the normal runtime we can check the context to see if we are inside a window
                    if (this.parent.context.type === "window") {
                        jsPanel = document.querySelector(`#${this.parent.context.instanceId} .${this.windowContainerClass}`);
                    }
                }
                // calc offset when placed inside window
                if (jsPanel instanceof HTMLElement) {
                    const windowBounds = jsPanel.getBoundingClientRect();
                    windowOffset.x = (windowBounds.left / scaleFactorApp.x) - jsPanel.scrollLeft;
                    windowOffset.y = (windowBounds.top / scaleFactorApp.y) - jsPanel.scrollTop;
                    contextBounds.left = windowBounds.left / scaleFactorApp.x;
                    contextBounds.top = windowBounds.top / scaleFactorApp.y;
                    contextBounds.width = windowBounds.width / scaleFactorApp.x;
                    contextBounds.height = windowBounds.height / scaleFactorApp.y;
                    // placed inside dashboard
                }
                else {
                    const context = document.getElementsByTagName('sig-app')[0];
                    const bounds = context.getBoundingClientRect();
                    contextBounds.left = bounds.left / scaleFactorApp.x;
                    contextBounds.top = bounds.top / scaleFactorApp.y;
                    contextBounds.width = bounds.width / scaleFactorApp.x;
                    contextBounds.height = bounds.height / scaleFactorApp.y;
                }
                // We need to remove the css vars for height/width while positioning the list, or the
                // container will get caluclated wrong if the options are updated while the list is visible!
                // This may cause some flickering on real slow devices :-(
                if (!this.hidden) {
                    this._removeDimension();
                }
                const computedStyle = getComputedStyle(this.$.list.querySelector('li'));
                let top = 0, left = 0, height = this.offsetHeight * scaleFactorParent.y, width = this.offsetWidth * scaleFactorParent.x;
                // for the designer mode we need to adjust height and width
                if (this.isdesignmode && jsPanel instanceof HTMLElement) {
                    // calculate the correct values for the list in designer mode
                    height = parseFloat(this.$.list.style.height);
                    width = parentBounds.width;
                }
                else if (this.isdesignmode) {
                    height = this.offsetHeight;
                    width = this.offsetWidth;
                }
                const pTop = parentBounds.top / scaleFactorApp.y;
                const pLeft = parentBounds.left / scaleFactorApp.x;
                const pHeight = parentBounds.height / scaleFactorApp.y;
                const pWidth = parentBounds.width / scaleFactorApp.x;
                const pBottom = parentBounds.bottom / scaleFactorApp.y;
                const pRight = parentBounds.right / scaleFactorApp.x;
                const offsetX = this.offsetX;
                const offsetY = this.offsetY;
                let newListBounds;
                const pBounds = { pTop, pLeft, pHeight, pWidth, pBottom, pRight };
                const listBounds = { width, height };
                const offset = { x: offsetX, y: offsetY };
                // when position is top/bottom, try positioning the list at the preferred position first
                if (position === 'top' || position === 'bottom') {
                    newListBounds = this._getListPosition(position, pBounds, listBounds, contextBounds, offset, rotation);
                    if (newListBounds.overflow) {
                        // overflow on the desired position => try the opposite side
                        let alternativeListBounds = this._getListPosition((position === 'top') ? 'bottom' : 'top', pBounds, listBounds, contextBounds, offset, rotation);
                        if (!alternativeListBounds.overflow) {
                            // only if there is no overflow on the alternative bounds, we use those instead of the original
                            newListBounds = alternativeListBounds;
                        }
                    }
                    left = newListBounds.left;
                    top = newListBounds.top;
                    width = newListBounds.width;
                    height = newListBounds.height;
                }
                // when position is left/right, try positioning the list at the preferred position first
                if (position === 'left' || position === 'right') {
                    newListBounds = this._getListPosition(position, pBounds, listBounds, contextBounds, offset, rotation);
                    if (newListBounds.overflow) {
                        // overflow on the desired position => try the opposite side
                        let alternativeListBounds = this._getListPosition((position === 'left') ? 'right' : 'left', pBounds, listBounds, contextBounds, offset, rotation);
                        if (!alternativeListBounds.overflow) {
                            // only if there is no overflow on the alternative bounds, we use those instead of the original
                            newListBounds = alternativeListBounds;
                        }
                    }
                    left = newListBounds.left;
                    top = newListBounds.top;
                    width = newListBounds.width;
                    height = newListBounds.height;
                }
                if (!this.isdesignmode && visualViewport !== null) {
                    // We need to correct the position if the viewport is scrolled and scaled
                    const visualViewportOffsetX = (this.isAppleMobile()) ? visualViewport.offsetLeft / scaleFactorApp.x : 0;
                    const visualViewportOffsetY = (this.isAppleMobile()) ? visualViewport.offsetTop / scaleFactorApp.y : 0;
                    left += visualViewportOffsetX;
                    top += visualViewportOffsetY;
                    // If the context is window, we have a windows offset
                    if (this.parent.context.type === "window") {
                        left += -windowOffset.x - window.scrollX / scaleFactorApp.x;
                        top += -windowOffset.y - window.scrollY / scaleFactorApp.y;
                    }
                }
                else {
                    left += window.scrollX - windowOffset.x;
                    top += window.scrollY - windowOffset.y;
                }
                // We only apply the rotation if it has changed
                // This is needed to make sure the translate gets updated 
                // correctly and avoid double paints
                if (rotation === this.oldRotation) {
                    this._setBounds(top, left, height, width, undefined, undefined, undefined);
                }
                else {
                    this._setBounds(top, left, height, width, rotation, undefined, undefined);
                }
                // if the list is scrollable => scroll to the selected element
                var list = this.shadowRoot?.getElementById("valueoptions");
                if (list) {
                    var selectedElement = list.querySelector(".option.selected");
                    if (selectedElement && list.scrollHeight > list.clientHeight) {
                        list.scrollTop = selectedElement.offsetTop - list.offsetTop;
                    }
                }
                this._log(`Set bounds of "${this.id}" to "T: ${top}, L: ${left}, H: ${height}, W:${width}, R: ${rotation}deg"`);
                this.oldRotation = rotation;
                this._makeVisible();
            });
        }
    }
    /****************************************************************************************************
    * Calculate top/left/width/height of the list and check if overflowing.
    *
    * @param {string} position
    * @param {{pTop: number; pLeft: number; pHeight: number; pWidth: number; pBottom: number; pRight: number;}} parentBounds
    * @param {{width: number; height: number;}} listBounds
    * @param {{left: number; top: number; width: number; height: number;}} contextBounds
    * @param {{x: number; y: number;}} offset
    * @param {number} rotation
    * @return {{left: number, top: number, height: number, width: number, overflow: boolean}}
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getListPosition(position, parentBounds, listBounds, contextBounds, offset, rotation) {
        let overflow;
        const { pTop } = parentBounds;
        const { pLeft } = parentBounds;
        const { pHeight } = parentBounds;
        const { pWidth } = parentBounds;
        const { pBottom } = parentBounds;
        const { pRight } = parentBounds;
        let { width } = listBounds;
        let { height } = listBounds;
        let left, top;
        const offsetX = offset.x;
        const offsetY = offset.y;
        // if the height should be limited => recalculate it
        if (this.shownelements) {
            const computedStyle = getComputedStyle(this.$.list.querySelector('li'));
            const computedStyleList = getComputedStyle(this.$.list);
            height = parseFloat(computedStyleList.borderTopWidth) + parseFloat(computedStyleList.borderBottomWidth) + (parseFloat(computedStyle.height) + parseFloat(computedStyle.borderTopWidth) + parseFloat(computedStyle.borderBottomWidth)) * Math.min(this.shownelements, this.valueoptions.length);
        }
        switch (position) {
            case 'top':
                if (rotation === 90) {
                    // the list opens up towards the right edge
                    if (width < pHeight) {
                        width = pHeight;
                    }
                    left = pRight + offsetY;
                    top = pTop;
                    overflow = (left + height) > (contextBounds.left + contextBounds.width);
                    // if there's not enough space on the right => use what we got and show a scrollable list
                    if (overflow) {
                        height = contextBounds.left + contextBounds.width - left;
                    }
                }
                else if (rotation === 180) {
                    // the list opens up towards the bottom edge
                    if (width < pWidth) {
                        width = pWidth;
                    }
                    left = pLeft - (width - pWidth);
                    top = pBottom + offsetY;
                    overflow = (top + height) > (contextBounds.top + contextBounds.height);
                    // if there's not enough space under => use what we got and show a scrollable list
                    if (overflow) {
                        height = contextBounds.top + contextBounds.height - top;
                    }
                }
                else if (rotation === 270) {
                    // the list opens up towards the left edge
                    if (width < pHeight) {
                        width = pHeight;
                    }
                    left = pLeft - height - offsetY;
                    top = pTop - (width - pHeight);
                    overflow = left < contextBounds.left;
                    // if there's not enough space on the left => use what we got and show a scrollable list
                    if (overflow) {
                        left = contextBounds.left;
                        height = pLeft - left - offsetY;
                    }
                }
                else { // all other angles
                    if (width < pWidth) {
                        width = pWidth;
                    }
                    left = pLeft;
                    top = pTop - height - offsetY;
                    overflow = top < contextBounds.top;
                    // if there's not enough space above => use what we got and show a scrollable list
                    if (overflow) {
                        top = contextBounds.top;
                        height = pTop - top - offsetY;
                    }
                }
                break;
            case 'left':
                if (rotation === 90) {
                    // the list opens up towards the left edge
                    left = pRight - height;
                    top = pTop - width - offsetX;
                    overflow = (top < contextBounds.top);
                    // if there's not enough space on the left => use what we got and show a scrollable list
                    if (left < contextBounds.left) {
                        left = contextBounds.left;
                        height = pRight - left;
                    }
                }
                else if (rotation === 180) {
                    // the list opens up towards the top edge
                    left = pRight + offsetX;
                    top = pBottom - height;
                    overflow = ((left + width) > (contextBounds.left + contextBounds.width));
                    // if there's not enough space above => use what we got and show a scrollable list
                    if (top < contextBounds.top) {
                        top = contextBounds.top;
                        height = pBottom - top;
                    }
                }
                else if (rotation === 270) {
                    // the list opens up towards the right edge
                    left = pLeft;
                    top = pBottom + offsetX;
                    overflow = ((top + width) > (contextBounds.top + contextBounds.height));
                    // if there's not enough space on the right => use what we got and show a scrollable list
                    if ((left + height) > (contextBounds.left + contextBounds.width)) {
                        height = contextBounds.left + contextBounds.width - left;
                    }
                }
                else { // all other angles
                    left = pLeft - width - offsetX;
                    top = pTop;
                    overflow = (left < contextBounds.left);
                    // if there's not enough space => use what we got and show a scrollable list
                    if ((top + height) > (contextBounds.top + contextBounds.height)) {
                        height = contextBounds.height - top;
                    }
                }
                break;
            case 'right':
                if (rotation === 90) {
                    // the list opens up towards the left edge
                    left = pRight - height;
                    top = pBottom + offsetX;
                    overflow = ((top + width) > (contextBounds.top + contextBounds.height));
                    // if there's not enough space on the left => use what we got and show a scrollable list
                    if (left < contextBounds.left) {
                        left = contextBounds.left;
                        height = pRight - left;
                    }
                }
                else if (rotation === 180) {
                    // the list opens up towards the top edge
                    left = pLeft - width - offsetX;
                    top = pBottom - height;
                    overflow = (left < contextBounds.left);
                    // if there's not enough space above => use what we got and show a scrollable list
                    if (top < contextBounds.top) {
                        top = contextBounds.top;
                        height = pBottom - top;
                    }
                }
                else if (rotation === 270) {
                    // the list opens up towards the right edge
                    left = pLeft;
                    top = pTop - width - offsetX;
                    overflow = (top < contextBounds.top);
                    // if there's not enough space on the right => use what we got and show a scrollable list
                    if ((left + height) > (contextBounds.left + contextBounds.width)) {
                        height = contextBounds.left + contextBounds.width - left;
                    }
                }
                else { // all other angles
                    left = pRight + offsetX;
                    top = pTop;
                    overflow = ((left + width) > (contextBounds.left + contextBounds.width));
                    // if there's not enough space => use what we got and show a scrollable list
                    if ((top + height) > (contextBounds.top + contextBounds.height)) {
                        height = contextBounds.height - top;
                    }
                }
                break;
            default: // bottom
                if (rotation === 90) {
                    // the list opens up towards the left edge
                    if (width < pHeight) {
                        width = pHeight;
                    }
                    left = pLeft - height - offsetY;
                    top = pTop;
                    overflow = left < contextBounds.left;
                    // if there's not enough space on the left => use what we got and show a scrollable list
                    if (overflow) {
                        left = contextBounds.left;
                        height = pLeft - left - offsetY;
                    }
                }
                else if (rotation === 180) {
                    // the list opens up towards the top edge
                    if (width < pWidth) {
                        width = pWidth;
                    }
                    left = pLeft - (width - pWidth);
                    top = pTop - height - offsetY;
                    overflow = top < contextBounds.top;
                    // if there's not enough space above => use what we got and show a scrollable list
                    if (overflow) {
                        top = contextBounds.top;
                        height = pTop - top - offsetY;
                    }
                }
                else if (rotation === 270) {
                    // the list opens up towards the right edge
                    if (width < pHeight) {
                        width = pHeight;
                    }
                    left = pRight + offsetY;
                    top = pTop - (width - pHeight);
                    overflow = (left + height) > (contextBounds.left + contextBounds.width);
                    // if there's not enough space on the right => use what we got and show a scrollable list
                    if (overflow) {
                        height = contextBounds.left + contextBounds.width - left;
                    }
                }
                else {
                    if (width < pWidth) {
                        width = pWidth;
                    }
                    left = pLeft;
                    top = pBottom + offsetY;
                    overflow = (top + height) > (contextBounds.top + contextBounds.height);
                    // if there's not enough space under => use what we got and show a scrollable list
                    if (overflow) {
                        height = contextBounds.height - top;
                    }
                }
        }
        return { left, top, height, width, overflow };
    }
    /****************************************************************************************************
    * Returns the scale factor of a component for the given rotation.
    *
    * @param {(ParentNode | null)} [control=this] The component which scale factor is to be calculated.
    * @param {number} [rotation=0] The rotation of the component.
    * @return {{x: number, y: number}} Scale factor of the component.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getScaleFactor(control = this, rotation = 0) {
        let scaleFactor = { x: 1, y: 1 };
        if (control instanceof HTMLElement) {
            if (rotation === 90 || rotation === 270) {
                scaleFactor.y = control.getBoundingClientRect().height / control.offsetWidth;
                scaleFactor.x = control.getBoundingClientRect().width / control.offsetHeight;
            }
            else {
                scaleFactor.y = control.getBoundingClientRect().height / control.offsetHeight;
                scaleFactor.x = control.getBoundingClientRect().width / control.offsetWidth;
            }
        }
        this._log(`Calculated scale factor for rotation ${rotation} is X = "${scaleFactor.x}" Y = "${scaleFactor.y}`);
        return scaleFactor;
    }
    /****************************************************************************************************
    * Applies CSS properties on a HTML element. Used to apply CSS properties on HTML "li" elements of the component.
    *
    * @param {HTMLElement} element A HTML element.
    * @param {*} properties CSS properties object.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _setCSSProperties(element, properties) {
        try {
            for (const property in properties) {
                element.style.setProperty(property, properties[property]);
            }
        }
        catch (error) {
            this._log(error, 'DIR');
        }
    }
    /****************************************************************************************************
    * An observer method that runs every time the property css changes.It re-applies all CSS properties to the component.
    *
    * @param {{}} newval The new property css.
    * @param {{}} oldval The old property css.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _updateCSSProperties(newval, oldval) {
        if (oldval !== undefined && newval instanceof Object) {
            if (Object.keys(newval).length > 0) {
                this.updateStyles(newval);
            }
        }
    }
    /****************************************************************************************************
    * Returns an object with a list of the component's CSS style properties.
    *
    * @return {*} CSS Object with component's style properties.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getListStyles() {
        if (this.parent instanceof HTMLElement) {
            const cssObj = {};
            try { //There is no api to get all set css vars :-/, so we need to parse them
                const properties = this.parent.style.cssText.split(';');
                properties.forEach(property => {
                    if (property.trim().startsWith('--theme-sig-control-enum-list-')) {
                        const cssProp = property.split(':')[0].trim();
                        // We need to get the value via getPropertyValue for use in the designer
                        // because file paths containg a ":" will split incorrect!
                        cssObj[cssProp] = this.parent.style.getPropertyValue(cssProp);
                    }
                });
            }
            catch (error) {
                this._log(error.message, 'ERROR');
            }
            return cssObj;
        }
    }
    /****************************************************************************************************
    * A complex observer method that runs every time any of the properties position, offsetX, offsetY change.
    * It updates the position of the enum-list. Designmode only!
    *
    * @param {string} position Position of the enum-list.
    * @param {number} offsetX OffsetX of the enum-list.
    * @param {number} offsetY OffsetY of the enum-list.
    * @param {number} shownelements Number of elements shown per page.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _updateProps(position, offsetX, offsetY, shownelements) {
        if (this.isdesignmode) {
            this._setPosition(position);
        }
    }
    /****************************************************************************************************
    * Calculates and returns the real rotation of the component.
    *
    * @param {Number} [rotation=0] The rotation given as an integer number.
    * @return {Number} The real rotation of the component.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getRealRotation(rotation = 0) {
        return (rotation % 360 + 360) % 360;
    }
    /****************************************************************************************************
    * Calculates and returns the path rotation of the given component.
    *
    * @param {*} control The component which path rotation is to be calculated.
    * @param {number} pathRotation The rotation of the component.
    * @return {Number} The calculated path rotation.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _getPathRotation(control, pathRotation) {
        let parent = control.parentNode;
        if (parent.tagName.toLowerCase() !== 'sig-composite-control') {
            return pathRotation;
        }
        let isCompositeContainer = true;
        let rotation = pathRotation;
        while (isCompositeContainer) {
            if (parent.tagName.toLowerCase() === 'sig-composite-container') {
                rotation += parseInt(parent.rotation, 10);
                this._log(`Parent: ${parent.id}: ${parent.rotation} / GES: ${rotation}`);
                parent = parent.parentNode;
            }
            else {
                isCompositeContainer = false;
            }
        }
        return rotation;
    }
    /****************************************************************************************************
    * Removes two applied CSS properties: --theme-sig-element-width and --theme-sig-element-height.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _removeDimension() {
        this.style.removeProperty('--theme-sig-element-width');
        this.style.removeProperty('--theme-sig-element-height');
    }
    /****************************************************************************************************
    * An observer method that is called every time the property isstylepreview changes.
    * If newval is true it generates a style preview of the component in the Style Class Editor of LVD. Designmode only.
    *
    * @param {Boolean} newval The new value of the isstylepreview property.
    * @param {Boolean} oldval The old value of the isstylepreview property.
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    designerGenerateStylePreview(newval, oldval) {
        if (!this.isdesignmode)
            return;
        if (newval) {
            this.valueoptions = [{
                    "id": 0,
                    "name": "Option 0 (Alternate)"
                }, {
                    "id": 1,
                    "name": "Option 1 (Normal)"
                }, {
                    "id": 2,
                    "name": "Option 2 (Selected)"
                }, {
                    "id": 3,
                    "name": "Option 3 (Normal)"
                }, {
                    "id": 4,
                    "name": "Option 4 (Alternate)"
                }];
            this.style.zIndex = 'unset';
            this.style.overflow = 'hidden';
            this.value = 2;
            this.hidden = false;
        }
        else {
            this.hidden = true;
        }
    }
    /****************************************************************************************************
    * Overrides the method in the LasalRuntimeSigElement class to avoid adding 'sig-element-not-ready' in the classList of the component,
    * Otherwise the component may stay hidden in the DOM sometimes.
    *
    * @memberof LasalRuntimeSigControlEnumList
    ****************************************************************************************************/
    _setInitialState() {
        this._log('_setInitialState() overwritten by component.');
    }
}
customElements.define(LasalRuntimeSigControlEnumList.is, LasalRuntimeSigControlEnumList);
//# sourceMappingURL=sig-control-enum-list.js.map