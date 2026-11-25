import { fontObject } from '../../sigmatek/sig-element-mixins/base-mixin.js';
import { cssObject } from '../../sigmatek/sig-element-mixins/designer-support-mixin.js';
import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';

import '../sig-control-enum-list/sig-control-enum-list-css.js';
import '../sig-control-enum-list/sig-control-enum-list.js';

import type {LasalRuntimeSigControlEnumList} from '../sig-control-enum-list/sig-control-enum-list.js';

/****************************************************************************************************
* @class 
* @classdesc Implements and exports sig-control-enum component.
* @extends LasalRuntimeSigElement
*  
* @property {LasalRuntimeSigControlEnumList} list The sig-control-enum-list Light DOM Element.
* @property {Function} tapHandler The tap handler function.
* @property {String} windowContainerClass Default window container class.
* @property {fontObject} fontObj The saved font object.
* @property {SigApi.ApiDefaultStyleManager} dsApi  The reference to the defaultStyleManager API.
* @property {String} position Defines the the direction in which the enum options list opens.
* @property {Number} offsetX OffsetX of the enum-list.
* @property {Number} offsetY OffsetY of the enum-list.
* @property {Number} shownelements Number of items to be shown in the enum-list.
* @property {String} activeoption The active option of the enum component.
* @property {Boolean} showlistpreview Set true to show a preview of the enum options list.
* @property {String} caretimage The image which is used to display the caret.
* @property {String} caretimageactive The image which is used to display the caret in active state.
* @property {String} controlTextList The full name of the controls textlist, or an empty string if the given tagname is invalid.
****************************************************************************************************/
export class LasalRuntimeSigControlEnum extends LasalRuntimeSigElement {

    /****************************************************************************************************
    * Returns the component's registered tag name.
    * @readonly
    * @static
    * @returns {String} The component's registered tag name.
    * @memberof LasalRuntimeSigControlEnum
    *
    ****************************************************************************************************/
    static get is(): string {
        return "sig-control-enum";
    }
    
    /****************************************************************************************************
    * Returns the import path URL used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    static get importMeta(): ImportMeta { return import.meta; }

    /****************************************************************************************************
    * Returns the HTML literal of the component
    *
    * @readonly
    * @static
    * @type {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    static get template(): HTMLTemplateElement {
        return SigPolymer.html`
        <style include="sig-element-css sig-control-enum-list-css">
        :host {
            /* Basic styling of the component */
            color: var(--theme-sig-control-enum-color, inherit);
            background-color: var(--theme-sig-control-enum-background-color, inherit);

            border-width: var(--theme-sig-control-enum-border-width, 1px);
            border-color: var(--theme-sig-control-enum-border-color, inherit);
            border-style: var(--theme-sig-control-enum-border-style, solid);

            border-top-left-radius: var(--theme-sig-control-enum-border-radius-tl, var(--theme-sig-control-enum-border-radius, 3px));
            border-top-right-radius: var(--theme-sig-control-enum-border-radius-tr, var(--theme-sig-control-enum-border-radius, 3px));
            border-bottom-right-radius: var(--theme-sig-control-enum-border-radius-br, var(--theme-sig-control-enum-border-radius, 3px));
            border-bottom-left-radius: var(--theme-sig-control-enum-border-radius-bl, var(--theme-sig-control-enum-border-radius, 3px));

            /* Basic box model settings */
            display: var(--theme-sig-control-enum-display, block);
            position: var(--theme-sig-control-enum-position, absolute);

            padding: var(--theme-sig-control-enum-padding, 0);
            overflow: var(--theme-sig-control-enum-overflow, hidden);
            margin: 0;
            text-overflow: ellipsis;
        }

        :host * {
            /* Reset margin and padding for child elements and turn off text selection */
            @apply --notextselect;
            margin: 0;
            padding: 0;
        }

        .clearfix:after {
            /* Import the global clearfix css mixin */
            @apply --clearfix
        }

        .sig-control-enum-container {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            text-decoration: inherit;
        }

        .sig-control-enum-element {
            /* should be relative for use in designer */
            display: flex;
            justify-content: center;
            align-items: center;

            position: relative;
            width: 100%;
            height: 100%;
            cursor: pointer;
            overflow: hidden;
            text-decoration: inherit;

            border: none;
            border-top-left-radius: calc((var(--theme-sig-control-enum-border-radius-tl, var(--theme-sig-control-enum-border-radius, 3px)) - var(--theme-sig-control-enum-border-width, 1px)));
            border-top-right-radius: calc((var(--theme-sig-control-enum-border-radius-tr, var(--theme-sig-control-enum-border-radius, 3px)) - var(--theme-sig-control-enum-border-width, 1px)));
            border-bottom-right-radius: calc((var(--theme-sig-control-enum-border-radius-br, var(--theme-sig-control-enum-border-radius, 3px)) - var(--theme-sig-control-enum-border-width, 1px)));
            border-bottom-left-radius: calc((var(--theme-sig-control-enum-border-radius-bl, var(--theme-sig-control-enum-border-radius, 3px)) - var(--theme-sig-control-enum-border-width, 1px)));

            background-color: var(--theme-sig-control-enum-background-color, inherit);
            background-image: none,
                linear-gradient(var(--theme-sig-control-enum-background-color-direction, to bottom),
                var(--theme-sig-control-enum-background-color, inherit),
                var(--theme-sig-control-enum-background-color-stop, var(--theme-sig-control-enum-background-color)));
        }

        #activeoption {
            width: 100%;
            /* padding: var(--theme-sig-control-enum-list-option-padding, 5px); */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            background-color: var(--theme-sig-control-enum-activeoption-background-color, transparent);
            color: var(--theme-sig-control-enum-activeoption-color, inherit);

            text-align: var(--theme-sig-control-enum-activeoption-text-align, center);
            align-self: var(--theme-sig-control-enum-activeoption-text-align-vertical, center);

            margin-left: var(--theme-sig-control-enum-activeoption-text-indent, 5px);
            margin-right: var(--theme-sig-control-enum-activeoption-text-indent, 5px);

            margin-top: var(--theme-sig-control-enum-activeoption-text-indent-top-bottom, 0);
            margin-bottom: var(--theme-sig-control-enum-activeoption-text-indent-top-bottom, 0);

            text-decoration: inherit;
            position: relative;
            box-sizing: border-box;
        }

        /* caret container styling */
        #caretcontainer {
            position: relative;
            flex: 0 0 var(--theme-sig-control-enum-caretdown-width, 30px);
            height: 100%;
            overflow: hidden;
            background-color: var(--theme-sig-control-enum-caretdown-background-color, inherit);
            box-sizing: border-box;
        }

        /* caret container active styling */
        :host([listvisible]) #caretcontainer {
            background-color: var(--theme-sig-control-enum-caretdown-pressed-background-color, var(--theme-sig-control-enum-caretdown-background-color, inherit));
        }

        /* caret images styling (inactive/active) */
        #caretimage, #caretimageactive {
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            position: absolute;
            box-sizing: border-box;
            width: var(--theme-sig-control-enum-caret-width, 16px);
            height: 100%;
            object-fit: contain;
            visibility: hidden;
            margin: auto !important;
        }

        :host([listvisible]) #caretimageactive {
            visibility: visible;
        }

        :host(:not([listvisible])) #caretimage {
            visibility: visible;
        }

        /* enum border color applied in active state, when bordergradient is inactive  */
        :host([listvisible]) {
            border-color: var(--theme-sig-control-enum-pressed-border-color, var(--theme-sig-control-enum-border-color));
        }

        /* remove border when bordergradient is active */
        :host([bordergradient]:not([listvisible])),
        :host([bordergradientpressed][listvisible]) {
            border-width: 0px;
        }

        /* border gradient when in inactive state and bordergradient is active */
        :host([bordergradient]:not([listvisible])) .sig-control-enum-container {
            width: 100%;
            background-image: linear-gradient(var(--theme-sig-control-enum-border-color-direction, to bottom), var(--theme-sig-control-enum-border-color), var(--theme-sig-control-enum-border-color-stop, var(--theme-sig-control-enum-border-color)));
            padding: var(--theme-sig-control-enum-border-width, 1px);
        }

        /* border gradient when in active state and bordergradientpressed is active */
        :host([bordergradientpressed][listvisible]) .sig-control-enum-container {
            width: 100%;
            background-image: linear-gradient(var(--theme-sig-control-enum-pressed-border-color-direction, to bottom), var(--theme-sig-control-enum-pressed-border-color, var(--theme-sig-control-enum-border-color)), var(--theme-sig-control-enum-pressed-border-color-stop, var(--theme-sig-control-enum-border-color-stop)));
            padding: var(--theme-sig-control-enum-border-width, 1px);
        }

        /* background gradient when in active state */
        :host([listvisible]) .sig-control-enum-element {
            color: var(--theme-sig-control-enum-pressed-color, var(--theme-sig-control-enum-color, inherit));
            background-color: var(--theme-sig-control-enum-pressed-background-color, var(--theme-sig-control-enum-background-color, inherit));
            background-image: none,
                linear-gradient(var(--theme-sig-control-enum-pressed-background-color-direction, to bottom),
                var(--theme-sig-control-enum-pressed-background-color, inherit),
                var(--theme-sig-control-enum-pressed-background-color-stop, var(--theme-sig-control-enum-pressed-background-color)));
        }

        /* box shadow */
        #boxshadowcontainer {
            position: absolute;
            display: none;
            background-color: transparent;
            width: 100%;
            height: 100%;
        }

        :host([shadowactive]:not([listvisible])) #boxshadowcontainer {
            display: block;
            box-shadow: inset 0 0 var(--theme-sig-control-enum-shadow-size, 5px) var(--theme-sig-control-enum-shadow-color, inherit);
        }

        :host([shadowpressedactive][listvisible]) #boxshadowcontainer {
            display: block;
            box-shadow: inset 0 0 var(--theme-sig-control-enum-pressed-shadow-size, 5px) var(--theme-sig-control-enum-pressed-shadow-color, inherit);
        }
        </style>
        <div class="sig-control-enum-container clearfix" on-tap="_toggleList">
            <div class="sig-control-enum-element">
                <div id="activeoption">[[activeoption]]</div>
                <div id="caretcontainer">
                    <!-- we create img for for both images to increase first rendering performance when list is opened -->
                    <img id="caretimage" src=[[caretimage]]>
                    <img id="caretimageactive" src=[[caretimageactive]]>
                </div>
                <div id="boxshadowcontainer"></div>
            </div>
        </div>
        `;
    }

    //Polymer properties type definition
    value: number | string | undefined //string as default value in json is ""
    valueoptions: { id: number; name: string}[]
    listvisible: boolean
    shadowactive: boolean
    shadowpressedactive: boolean
    bordergradient: boolean
    bordergradientpressed: boolean

    /****************************************************************************************************
    * Returns the defined Polymer properties of the component.
    *
    * @readonly
    * @static
    * @returns {Object} The defined Polymer properties.
    * @memberof LasalRuntimeSigControlEnum
    * 
    * @property {Number}   value                 - The value of the enum component.
    * @property {Array}    valueoptions          - All value options of the enum-list.
    * @property {Boolean}  listvisible           - Defines whether the list is visible.
    * @property {Boolean}  shadowactive          - Activates the border shadow of the component.
    * @property {Boolean}  shadowpressedactive   - Activates the border shadow in active state.
    * @property {Boolean}  bordergradient        - Activates the border gradient.
    * @property {Boolean}  bordergradientpressed - Activates the border gradient of the component in active state.
    ****************************************************************************************************/
    static get properties(): object {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute

        let props = {
            value: {
                type: Number,
                value: undefined,
                observer: '_updateValue',
                notify: true
            },
            valueoptions: {
                type: Array,
                value: () => { return [] },
                observer: '_updateOptions',
            },
            listvisible: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            shadowactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            shadowpressedactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            bordergradient: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            bordergradientpressed: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            }    
        }
        return props;
    }

    /****************************************************************************************************
    * Returns the defined complex observers used by Polymer.
    *
    * @readonly
    * @static
    * @returns {Array}  An array containing the defined complex observers.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    static get observers(): string [] {
        return [
            '_updateProps(position, offsetX, offsetY, shownelements)'
        ]
    }

    //Member properties type definition
    tapHandler: Function
    windowContainerClass: string
    fontObj: fontObject | null
    dsApi: SigApi.ApiDefaultStyleManager | null
    position: string
    offsetX: number
    offsetY: number
    shownelements: number
    activeoption: string | undefined
    showlistpreview: boolean
    caretimage: string
    caretimageactive: string
    controlTextList: string
    list: LasalRuntimeSigControlEnumList | null
    
    /****************************************************************************************************
    * Creates an instance of LasalRuntimeSigControlEnum.
    * 
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    constructor() {
        super();
        this.list = null;
        this.windowContainerClass = 'jsPanel-content';
        this.fontObj = null;
        this.dsApi = (window.sigApi.defaultStyleManager) ? window.sigApi.defaultStyleManager : null;
        this.sigAddRequiredProperty('value');
        this.position = 'bottom'; // bottom, top, left, right
        this.offsetX = 1;
        this.offsetY = 1;
        this.shownelements = 0;
        this.activeoption = '--no-Selection--';
        this.showlistpreview = false;
        this.caretimage = `${this.importPath}caret_down.svg`;
        this.caretimageactive = `${this.importPath}caret_up.svg`;

        this.controlTextList = this.getControlTextListName();

        //configure dispatch options
        this.dispatchAllInternalEvents = true;

        if (window.sigApi.textManager) {
            this.sigAddEventListener('LANGUAGE_CHG', () => {
                this._setNoSelectionText();
            }, 'runtimeEvent');
            this._setNoSelectionText();
        }

        this.addPredefProps([{
            src: 'value',
            dest: 'state',
            type: window.sigApi.SIG_CONST.PROP_PREDEF_PROPS_TYPE_STATE
        }]);

        // add observers which are only used in designmode
        if (this.isdesignmode) {
            // in designer, set the default images to the correct path
            this._createMethodObserver('_designerOnCaretImageChanged(caretimage, caretimageactive)', true);

            // add observer for list preview
            this._createPropertyObserver('showlistpreview', '_toggleListPreview', true);
        }
    }

    /********************************************************************************************************************************
     * Called in the designer when a caret image is set.
     *
     * @memberof LasalRuntimeSigControlEnum
     ********************************************************************************************************************************/
    _designerOnCaretImageChanged(): void {
        if (this.caretimage === 'default') this.caretimage = `${this.importPath}caret_down.svg`;
        if (this.caretimageactive === 'default') this.caretimageactive = `${this.importPath}caret_up.svg`;
    }

    /****************************************************************************************************
     * Method is used to set the default text if no selection is done
     *
     * @memberof LasalRuntimeSigControlEnum
     ****************************************************************************************************/
    async _setNoSelectionText(): Promise<void> {
        try {
            const noSelectionText = await window.sigApi.textManager.getTextAsync(this.controlTextList, 'noSelection');
            //only set no selection if value is not defined
            if((this.value === undefined) || (this.value === '')) {
                this.activeoption = noSelectionText;
            }
        }
        catch(error) {
            this._log('_setNoSelectionText(): failed to get text -> ' + error, 'ERROR');
        }
    }

    /****************************************************************************************************
     * Called by the Designer Runtime when the project language changes.
     * 
     * @param {Object} language The definition object of the current language.
     * @return {Undefined} Undefined 
     * @memberof LasalRuntimeSigControlEnum
     ****************************************************************************************************/
    designerOnLanguageChanged(): void {
        this._setNoSelectionText();
    }

    /****************************************************************************************************
     * Called by the Designer Runtime if the ObjectStore has been updated.
     * 
     * @async
     * @param {*} data The payload of the ObjectStore command which triggered the update.
     * @memberof LasalRuntimeSigControlEnum
     ****************************************************************************************************/
    async designerOnObjectStoreUpdate(data: any): Promise<void> {
        const textListChanged = await window.sigApi.textManager.isTextListUpdate(data, this.controlTextList);
        if (textListChanged) this._setNoSelectionText();
    }

    /****************************************************************************************************
    * This callback runs when the component is connected in the DOM.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    connectedCallback(): void {
        super.connectedCallback();
        this._addEventListeners();
    }

    /****************************************************************************************************
    * This callback is called when the component is disconnected from the DOM.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this._removeList();
        this.dsApi = null;
    }

    /****************************************************************************************************
    * Adds event listeners to the component; called by the callback connectedCallback().
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _addEventListeners(): void {
        if (!this.isdesignmode) {
            this.tapHandler = (evt: any) => {
                const _evtPath = evt.composedPath();
                const _enum = _evtPath.filter(_path => {
                    return (_path.id === this.id || _path.id === this.id + '-list');
                });
                if (!_enum[0])
                    this._closeList();
            };
            this.sigAddEventListener('tap', this.tapHandler, 'polymerEvent', window);
        }
    }
    
    /****************************************************************************************************
    * Creates an sig-control-enum-list in the parent sig-control-enum component if it does not exist and valueoptions are defined. 
    * The sig-control-enum-list position is defined by the properties position, offsetX and offsetY.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _addList(): void {
        if (this.list === null && this.valueoptions.length > 0) {
            let container: any;
            if (!this.isdesignmode) {
                if (this.context) {
                    switch (this.context.type) {
                        case 'window':
                            container = document.querySelector(`#${this.context.instanceId} .${this.windowContainerClass}`);
                            break;
                        case 'dashboard':
                            container = document.getElementsByTagName('sig-app')[0];
                            break;
                        default:
                            this._log(`Unspported context type "${this.context.type}"`, 'ERROR');
                            break;
                    }
                }
            } else { // In designmode we never run inside a window
                container = document.getElementsByTagName('sig-app')[0];
            }
            if (container !== undefined) {
                this.list = document.createElement('sig-control-enum-list') as LasalRuntimeSigControlEnumList ;
                // If we are inside the shadowdom we need to make the list id unique in the light dom for each parent node instance
                let id = this.id;
                const parentElm = (this.isInShadowDom()) ? this.getParentHostElement() : this;
                if ((parentElm as any).id !== this.id) {
                    id = (parentElm as any).id + '-' + this.id;
                }
                this.list.setAttribute('id', id + '-list');
                // We make the list invisible, but it still gets positioned in the dom!
                // This is needed to avoid flickering when the list is positioned the first time
                this.list.style.visibility = 'hidden';
                container.appendChild(this.list);
                this._log(`Added enum option list with id "${this.list.id}"`);
                this.list.shownelements = this.shownelements;
                this.list.parent = this;
                this.list.valueoptions = this.valueoptions;
                this.list.position = this.position;
                this.list.offsetX = this.offsetX;
                this.list.offsetY = this.offsetY;
               
                // Apply the styling to the list
                this._applyStylingToList();
                
                if(this.fontObj !== null){
                    // Apply font to the list element
                    this._applyFontObjectToNode(this.list, this.fontObj);
                }
                
            } else {
                this._log(`Could not find container to add list for "${this.id}"`, 'ERROR');
            }
        }
    }

    /****************************************************************************************************
    * Removes the instance of the sig-control-enum-list from the DOM.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _removeList(): void {
        if (this.list instanceof HTMLElement) {
            this._log(`Removed emum option list with id "${this.list.id}"`);
            this.list.remove();
        }
    }
   
    /****************************************************************************************************
    * Adds the sig-control-enum-list and alters its visibility .
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _toggleList(): void {
        this._addList();
        if (this.list instanceof HTMLElement) {
            if(this.value !== undefined) {
                this.list.value = this.value as number;
            }
            this.list.hidden = !this.list.hidden;
            this.listvisible = !this.listvisible;
        }
    }

    /****************************************************************************************************
    * Closes the sig-control-enum-list making it invisible.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _closeList(): void {
        if (this.list instanceof HTMLElement) {
            this.list.hidden = true;
            this.listvisible = false;
        }
    }

    /****************************************************************************************************
    * An observer method which updates the active enum option and dispatches value-changed event.
    *
    * @param {Number} newval The new value of the property value.
    * @param {Number} oldval The old value of the property value.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _updateValue(newval: number | string | undefined, oldval?: number | string | undefined): void {
        if((newval !== undefined) && (newval !== '')){
            const option = this._getActiveOption();
            if (option instanceof Object) {
                this.activeoption = option.name;
            } else {
                this.activeoption = this.value?.toString();
            }
            if (this.list instanceof HTMLElement) {
                this.list.value = newval as number;
            }
            if (oldval !== undefined) {
                this._dispatchEvent('value-changed');
                this._log(`Updated active option of "${this.id}" to "${this.activeoption}" with value "${newval}"`);
            }

            // don't close the list in designer mode. the show list property is responsible for that
            if (!this.isdesignmode) {
                this.listvisible = false;
            }
        }
        else {
            //set no selection text
            this._setNoSelectionText();
        }
    }
   
    /****************************************************************************************************
    * Gets the active option from the sig-control-enum-list.
    *
    * @return {({id: number, name: string} | null)}
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _getActiveOption(): {id: number, name: string} | undefined {
        if (this.valueoptions.length > 0) {
            //find option
            const activeOption = this.valueoptions.find((option) => {
                return (option.id === parseFloat(this.value as any));
            })
            return activeOption;
        }
    }
   
    /****************************************************************************************************
    * An observer method that runs every time the property valueoptions changes. It updates the sig-control-enum-list options. 
    *
    * @param {{ id: number; name: string; }[]} newval The new array of sig-control-enum-list options.
    * @param {{ id: number; name: string; }[]} oldval The old array of sig-control-enum-list options.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _updateOptions(newval: { id: number; name: string; }[], oldval: { id: number; name: string; }[]): void {
        if (oldval !== undefined) {
            this._updateValue(this.value);
            if (this.list instanceof HTMLElement) {
                this.list.shownelements = this.shownelements;
                this.list.valueoptions = this.valueoptions;
            }
        }
    }

    /****************************************************************************************************
    * An observer method that shows the sig-control-enum-list preview with demo data. Designmode only!
    *
    * @param {Boolean} newval The new value of the property showlistpreview.
    * @param {Boolean} oldval The old value of the property showlistpreview.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _toggleListPreview(newval: boolean, oldval: boolean): void {
        // Only show the preview if the enum is not rendered within a composite control gets rendered
        
        if (this.isdesignmode && (this.parentNode as any).tagName && (this.parentNode as any).tagName.toLowerCase() !== 'sig-composite-control') {
            if (newval) {
                this._log('Show list preview');
                if (this.valueoptions.length === 0) {
                    for (let i = 0; i <= 3; i++) {
                        this.valueoptions.push({
                            "id": i,
                            "name": "Preview " + i
                        });
                    }
                }
                
                // if we call it here directly _applyStylingToList fails
                SigPolymer.afterNextRender(this, function (this: LasalRuntimeSigControlEnum) {
                    this._addList();
                    if(this.list){
                        this.list.hidden = false;
                    }
                    this.listvisible = true;
                });
            } else {
                if (this.list instanceof HTMLElement) {
                    this._log('Hide list preview');
                    this.list.hidden = true;
                    this.listvisible = false;
                }
            }
        }
    }

    /****************************************************************************************************
    * Updates the position of the sig-control-enum-list; called by callbacks designerOnBoundsChanged().
    *
    * @param {String} [position=this.position] The new position of the sig-control-enum-list.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _repositionList(position: string = this.position): void {
        if (this.list instanceof HTMLElement) {
            this.list._setPosition(position);
        }
    }
   
    /****************************************************************************************************
    * A complex observer method that runs every time any of the properties position, offsetX, offsetY changes. 
    * It updates the position of the sig-control-enum-list.
    * @private
    * @param {String} position Position of the enum-list
    * @param {Number} offsetX  OffsetX of the enum-list
    * @param {Number} offsetY OffsetY of the enum-list
    * @param {Number} shownelements Number of elements shown per page. 
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _updateProps(position: string, offsetX: number, offsetY: number, shownelements: number): void {
        if (this.list instanceof HTMLElement) {
            this._log(`Updating props of ${this.list.id}`);
            if (position !== undefined) this.list.position = this.position;
            if (offsetX !== undefined) this.list.offsetX = this.offsetX;
            if (offsetY !== undefined) this.list.offsetY = this.offsetY;
            if (shownelements !== undefined) this.list.shownelements = this.shownelements;
        }
    }

    /****************************************************************************************************
    * This callback is called by LVD after a CSS styling object has been applied to the component. Designmode only!
    *
    * @param {cssObject} cssObj The CSS object that has been applied on the component.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    designerOnAppliedCSSValue(cssObj: cssObject): void {
        if (this.isdesignmode && cssObj !== undefined && this.list instanceof HTMLElement) {
            if (!this.list.hidden) {
                this._log(`Updating styles of ${this.list.id}`);
                this.list.css = this.list._getListStyles();

            }
        }
    }
   
    /****************************************************************************************************
    * This callback is called by LVD when the component has been resized. It updates the position of the enum-list. Designmode only!
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    designerOnBoundsChanged(): void {
        if (this.isdesignmode && this.list instanceof HTMLElement) {
            this._repositionList();
        }
    }
   
    /****************************************************************************************************
    * Saves the fontObj, calls the overridden function in the parent class and applies the font on the sig-control-enum-list if propName denotes it.
    *
    * @param {String} propName The attribute selector where to apply the font.
    * @param {fontObject} fontObj The font object.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    sigApplyFontObject(propName: string, fontObj: fontObject): void {
        super.sigApplyFontObject(propName, fontObj);
        this.fontObj = fontObj;
        if (this.list && propName === "sig-control-enum-list") this._applyFontObjectToNode(this.list, fontObj);
    }
   
    /****************************************************************************************************
    * Applies the active style class to the sig-control-enum-list using the setStylingByClassName() API function. 
    * If no className is specified the default style class will be applied.
    *
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    _applyStylingToList(): void {
        // We need to decide if we run in shadow or light dom and choose the right parent node to query the correct vm
        const parentElm = (this.isInShadowDom()) ? this.getParentHostElement() : this;
        if (this.shadowDomElementsMap.size > 0) {
            this.shadowDomElementsMap.forEach((classObj, selector) => {
                if (selector === 'sig-control-enum-list' && this.list !== null && classObj !== undefined && classObj.parameters !== undefined) { // We can query for this fixed selector, cause this never changes
                    const applied = window.sigApi.defaultStyleManager.setStylingByClassName(parentElm?.id, this.list, classObj.className, classObj.parameters.include, classObj.parameters.exclude, classObj.parameters.disableRuntimeUpdates);
                    if (!applied) {
                        this._log(`The class "${classObj.className}" was not applied to ${this.list?.id}`, 'WARN');
                    }
                }
            });
        }
    }

    /****************************************************************************************************
    * This callback runs when the Drag & Drop mode is enabled.
    * @memberof LasalRuntimeSigControlEnum
    ****************************************************************************************************/
    onComponentDragDropEnabled(maID: number, miID: number, message: object): void{
        super.onComponentDragDropEnabled(maID, miID, message);
        if (this.listvisible) this._closeList();
    }
}
customElements.define(LasalRuntimeSigControlEnum.is, LasalRuntimeSigControlEnum);
