import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import "../sig-control-image/sig-control-image.js";
import '../sig-control-image/sig-control-image-css.js';
import '../sig-control-scrollbar/sig-control-scrollbar-css.js';
/********************************************************************************************************************************
 * Implements sig-control-listview.
 *
 * @export
 * @class LasalRuntimeSigControlListView
 * @classdesc Implements and exports the sig-control-listview component.
 * @extends {LasalRuntimeSigElement}
 *
 * @property {Number} downstart Time stamp.
 * @property {Number} touchstartX Touchstart X.
 * @property {Number} touchstartY Touchstart Y.
 * @property {Boolean} isKeySelect True - after clicking.
 * @property {Boolean} longpress Indicator for longpress.
 * @property {} sort Sort object.
 * @property {} filter Filter object.
 * @property {Boolean} isFiltering True, in filter process.
 * @property {Boolean} isSorting True, in sorting process.
 * @property {null} sortEventListener
 * @property {null} filterEventListener
 * @property {null} keydownEventListener
 * @property {null} scrollEventListener
 * @property {Function} cancelpresstimer Function to reset presstimer.
 * @property {Number} presstimer Timeout id.
 * @property {Function} thTapHandler Click handler on table header.
 * @property {Function} thDownHandler Touchstart handler on table header.
 * @property {Function} thUpHandler Touchend handler on table header.
 * @property {Number} fakescrollcontentheight Height of fakescrollcontent div.
 * @property {Number} fakescrollheighttop Height of fakescroll top div.
 * @property {Number} fakescrollheightbot Height of fakescroll bottom.
 * @property {Number} recordcount Number of records.
 * @property {Number} offset Offset of scrolling.
 * @property {Number} itemscount
 * @property {Number} overflow Overflow of listview.
 * @property {Number} underflow Underflow of listview.
 * @property {Number} bufferpage Buffer page of the list view.
 * @property {Number} scrollTopOld Old scroll position.
 * @property {Boolean} keepPosition
 * @property {SigApi.ApiTextManager} tmApi Sig TextManager Api
 * @property {String} controlTextList The unique name of the controls text list used.
 * @property {Boolean} selectRowAfterfirstClick
 * @property {Function} _onOutsideTap Handling tap outside of the component.
 * @property {String} _instanceId Instance id of parent element.
 * @property {Number} scrolldirection Direction of the scrolling.
 * @property {} activeLang Active langugage.
 * @property {String} type Type of keyboard.
 * @property {Number} maxlength Maximum length of the keyboard.
 * @property {String} dateformat Format of date.
 * @property {String} timeformat Format of time.
 * @property {} texts Default / found texts.
 * @property {Number} limitLow Lower limit of property.
 * @property {Number} limitHigh Upper limit of property.
 * @property {Boolean} ispassword Show as password.
 * @property {Boolean} ignoremin Ignore minimum limit.
 * @property {Boolean} ignoremax Ignore maximum limit.
 * @property {String} unittext Unittext of the property.
 * @property {Boolean} writeonincrement Writes on increment to datapoint.
 * @property {Number} keyboardid Id of the keyboard.
 * @property {Boolean} alreadyclicked True, after first 'click event'.
 * @property {} _clickDebouncer Debouncer
 ********************************************************************************************************************************/
export class LasalRuntimeSigControlListView extends LasalRuntimeSigElement {
    /****************************************************************************************************
    * Returns the components registered tag name.
    *
    * @readonly
    * @static
    * @returns {String} The component's registered tag name.
    * @memberof LasalRuntimeSigControlListView
    ****************************************************************************************************/
    static get is() {
        return "sig-control-listview";
    }
    /****************************************************************************************************
    * Returns the the import path url used by Polymer.
    *
    * @readonly
    * @static
    * @returns {ImportMeta} The import path URL.
    * @memberof LasalRuntimeSigControlListView
    ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
    * Returns the HTML literal of the component.
    *
    * @readonly
    * @static
    * @returns {HTMLTemplateElement} The template literal of the component.
    * @memberof LasalRuntimeSigControlListView
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
        
            <style include="sig-element-css sig-control-image-css sig-control-scrollbar-css">
                :host {
                    
                    color: var(--theme-sig-control-listview-color, inherit); 
                    background-color: var(--theme-sig-control-listview-background-color, inherit);
                    background-image: var(--theme-sig-control-listview-background-image, none);
                    background-repeat: var(--theme-sig-control-listview-background-repeat, repeat);

                    border-width: var(--theme-sig-control-listview-border-width, 0px);
                    border-color: var(--theme-sig-control-listview-border-color, inherit);
                    border-style: var(--theme-sig-control-listview-border-style, none);
                    border-radius: var(--theme-sig-control-listview-border-radius, 0px);

                    
                    display: var(--theme-sig-control-listview-display, block);
                    position: var(--theme-sig-control-listview-position, absolute);
                    margin: var(--theme-sig-control-listview-margin, 0px);
                    padding: var(--theme-sig-control-listview-padding, 0px);

                    top: var(--theme-sig-control-listview-top, var(--theme-sig-element-top, auto));
                    left: var(--theme-sig-control-listview-left, var(--theme-sig-element-left, auto));
                    width: var(--theme-sig-control-listview-width, var(--theme-sig-element-width, auto));
                    height: var(--theme-sig-control-listview-height, var(--theme-sig-element-height, auto));
            }

            :host * {
                
                @apply --notextselect;
                margin: 0;
                padding: 0;
                text-decoration: inherit;
            }

            :host *:focus {
                outline: none;
            }

            .clearfix:after {
                
                @apply --clearfix
            }
            .hidden {
                display:none;
            }
            .sig-control-listview {
                
                position: relative;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;

                overflow-x: var(--theme-sig-control-listview-overflow-x, auto); 
                overflow-y: var(--theme-sig-control-listview-overflow-y, auto);
            }

            #gridcontent {
                background-color: var(--theme-sig-control-listview-background-color, rgba(255, 255, 255, 1));
            } 
            #data {
                width: 100%;
                height: auto;
                border-spacing: 0px;
            }

            :host([tableisfixed]) #data {
                table-layout: fixed;
            }

            #data thead {
             
                z-index: 10;       
                color: var(--theme-sig-control-listview-header-color, rgba(255, 255, 255, 1));         
               
            }

            #data thead tr {
                height: var(--theme-sig-control-listview-header-height, 26px);
            }

            #data td,
            #data th {
                white-space: nowrap;
                text-align: var(--theme-sig-control-listview-text-align, left);

                cursor: pointer;

                border-top: var(--theme-sig-control-listview-lineseparator-height, 1px) solid var(--theme-sig-control-listview-lineseparator-color, rgba(112, 112, 112, 1));
                border-right: var(--theme-sig-control-listview-cellseparator-height, 1px) solid var(--theme-sig-control-listview-cellseparator-color, rgba(112, 112, 112, 1));

                display: table-cell;
                vertical-align: middle;
            }

            #data th {
                
                background-color: var(--theme-sig-control-listview-header-background-color, rgba(0, 0, 0, 1));
                text-align: var(--theme-sig-control-listview-header-text-align, left);
                vertical-align: var(--theme-sig-control-listview-header-vertical-align, middle);
                padding: var(--theme-sig-control-listview-header-padding, 0px 5px);
                
                position: sticky;
                position: -webkit-sticky;
                top: 0;
            }

            #data th[sortable]:before {
                @apply --symbol;
                content: "\\f0dc";
                color: var(--theme-sig-listview-header-symbol-color, rgba(153, 153, 153, 1));
                font-size: var(--theme-sig-listview-header-symbol-fontsize, 20px);

                margin-left: var(--theme-sig-listview-header-symbol-spacing, 3px);
                padding-right: var(--theme-sig-listview-header-symbol-spacing, 3px);
                vertical-align: middle;
                float: var(--theme-sig-listview-header-symbol-align, left);
            }

            #data th[sortable][sorttype="desc"]:before {
                content: "\\f0dd";
                color: var(--theme-sig-listview-header-symbol-active-color, rgba(255, 255, 255, 1));
            }

            #data th[sortable][sorttype="asc"]:before {
                content: "\\f0de";
                color: var(--theme-sig-listview-header-symbol-active-color, rgba(255, 255, 255, 1));
            }

            #data th[filterable]:after {
                @apply --symbol;
                content: "\\f0b0";
                color: var(--theme-sig-listview-header-symbol-color, rgba(153, 153, 153, 1));
                font-size: var(--theme-sig-listview-header-symbol-fontsize, 20px);

                margin-left: var(--theme-sig-listview-header-symbol-spacing, 3px);
                padding-right: var(--theme-sig-listview-header-symbol-spacing, 3px);
                vertical-align: middle;
                float: var(--theme-sig-listview-header-filter-symbol-align, right);
            }

            #data th[filterable][filtervalue]:after {
                color: var(--theme-sig-listview-header-symbol-active-color, rgba(255, 255, 255, 1));
                text-decoration: line-through;
            }

            #data td {
                width: auto;
                vertical-align: var(--theme-sig-control-listview-row-vertical-align, middle);
                padding: var(--theme-sig-control-listview-row-padding, 0px 5px);
            }

            #data td:first-child,
            #data th:first-child {
                border-left: var(--theme-sig-control-listview-cellseparator-height, 1px) solid var(--theme-sig-control-listview-cellseparator-color, rgba(112, 112, 112, 1));
            }

            #data {
                border-bottom: var(--theme-sig-control-listview-lineseparator-height, 1px) solid var(--theme-sig-control-listview-lineseparator-color, rgba(112, 112, 112, 1));
            }

            #data td.size {
                width: 100%;
            }

            #data td.image {
                text-align: center;
            }

            #data td img {
                vertical-align: middle;
                max-height: var(--theme-sig-control-listview-row-height, 20px);
            }

            #data tbody tr {
                height: var(--theme-sig-control-listview-row-height, 26px);
                max-height: var(--theme-sig-control-listview-row-height, 26px);
                
                display: table-row;
            }

            #data tbody tr:nth-child(even) {
                background-color: var(--theme-sig-control-listview-row-even-background-color, rgba(255, 255, 255, 1));
                color: var(--theme-sig-control-listview-row-even-color, rgba(42, 42, 42, 1));
            }

            #data tbody tr:nth-child(odd) {
                background-color: var(--theme-sig-control-listview-row-odd-background-color, rgba(215, 215, 215, 1));
                color: var(--theme-sig-control-listview-row-odd-color, rgba(42, 42, 42, 1));
            }

            :host([isactive]) #data>tbody>tr.marked {
                background-color: var(--theme-sig-control-listview-row-marked-background-color, rgba(160, 160, 160, 1));
                color: var(--theme-sig-control-listview-row-marked-color, rgba(42, 42, 42, 1));
            }

            :host([isactive]) #data>tbody>tr.active {
                background-color: var(--theme-sig-control-listview-row-active-background-color, rgba(120, 120, 120, 1)) !important;
                color: var(--theme-sig-control-listview-row-active-color, rgba(42, 42, 42, 1)) !important;
            }

            :host([isactive]) #data>tbody>tr.active.marked {
                color: var(--theme-sig-control-listview-row-active-marked-color, rgba(255, 255, 255, 1)) !important;
            }            

            :host([isactive][activemarked]) #data>tbody>tr.active.marked td.marked .symbolfont::before {
                content: "\\f00c";
                color: var(--theme-sig-control-listview-row-active-marked-color, rgba(255, 255, 255, 1)) !important;
            }

            :host([isactive][activemarked]) #data>tbody>tr.marked td.marked .symbolfont::before {
                content: "\\f00c";
            }

            :host([hideheader]) #data thead {
                display: none !important;
            }

            #data td div.symbolfont {
                font-family: FontAwesomeSolid;
                font-style: normal;
                font-weight: normal;
                font-size: inherit;
                text-decoration: inherit;
                font-size: inherit;
                color: var(--theme-sig-control-listview-icon-color, rgba(0, 0, 0, 1));
                text-align: center;
                padding-right: 0px;
            }

            :host(:not([isdesignmode])) #grid.wait .loading-spinner {
                width:100%;
                height:100%;
                text-align:center;
                position:absolute;
                
            }

            .loading-spinner svg {
                width:var(--theme-sig-control-listview-spinner-size,100px);
                height:var(--theme-sig-control-listview-spinner-size, 100px);
                position:absolute;
                top:50%;
                left:50%;
                transform:translate(-50%, -50%);
            }
            .loading-spinner svg circle {
                stroke: var(--theme-sig-control-listview-spinner-color, rgba(255,255,255,1));
            }

            :host sig-control-image {
                position: unset;
                top: 0px;
                left: 0px;
                width: var(--theme-sig-element-width, 40px);
                height: var(--theme-sig-element-height, 20px);
                max-height: var(--theme-sig-control-listview-row-height, 20px) !important;
                margin: auto !important;
                vertical-align: middle;
            }
        </style>
        <div id="grid" class="sig-control-listview clearfix wait" tabIndex="0">
        <div class="loading-spinner" id="spinner">
            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-rolling" style="animation-play-state: running; animation-delay: 0s; background: none;"><circle cx="50" cy="50" fill="none" ng-attr-stroke="{{config.color}}" ng-attr-stroke-width="{{config.width}}" ng-attr-r="{{config.radius}}" ng-attr-stroke-dasharray="{{config.dasharray}}" stroke="#aec81a" stroke-width="10" r="20" stroke-dasharray="94.24777960769379 33.41592653589793" transform="rotate(126 50 50)" style="animation-play-state: running; animation-delay: 0s;"><animateTransform attributeName="transform" type="rotate" calcMode="linear" values="0 50 50;360 50 50" keyTimes="0;1" dur="1s" begin="0s" repeatCount="indefinite" style="animation-play-state: running; animation-delay: 0s;"></animateTransform></circle></svg>
        </div>
            <div id="innergrid">
                <div id="fakescrolltop" class="scrollfaketop"></div>
                <div id="gridcontent" class="scrollgridcontent"></div>
                <div id="fakescrollbot" class="scrollfakebot"></div>
            </div>
        </div>`;
    }
    /****************************************************************************************************
    * Returns the defined polymer properties of the component.
    *
    * @readonly
    * @static
    * @returns {Object} The defined Polymer properties.
    * @memberof LasalRuntimeSigControlListView
    *
    * @property {Object} configdata                             - Config and data from extern.
    * @property {Object} config                                 - Config of the listview.
    * @property {Boolean} isactive                              - Activation / Deactivation of control.
    * @property {Boolean} activemarked                          - Marks row as active.
    * @property {Object} selection
    * @property {Number} activerow                              - Active row of listview.
    * @property {Boolean} setactiverow                          - Sets active row.
    * @property {Boolean} ignoresetactiverow                    - Ignore settin the row to active.
    * @property {Boolean} restorerow                            - True - old row gets restored.
    * @property {Object} activerowdata                          - Data of the active row.
    * @property {Number} rowscount                              - Number of rows.
    * @property {Number} rowsperpage                            - Number of rows on one page.
    * @property {Number} rowheight                              - Height of a row.
    * @property {Number} toprow                                 - Row on the beginning of the list.
    * @property {Number} bottomrow                              - Row on the end of the list.
    * @property {Number} headerheight                           - Height of the list header.
    * @property {Number} scrolldeltax                           - Delta of scroll on x axis.
    * @property {Number} scrolldeltay                           - Delta of scroll on y axis.
    * @property {Number} longpressdelay                         - Sets the delay for the longpress detection.
    * @property {Number} clickdelay                             - Sets the delay for the doubleclick detection.
    * @property {Boolean} readonly                              - Set control to readonly mode - no actions will be dispatched.
    * @property {Boolean} disableautodeactivate                 - If true, the control will stay active if clicked outside (a selected row will stay selected).
    * @property {Boolean} autoactivateonclick                   - Automatic activation of row when clicking.
    * @property {Boolean} disablemultiselect                    - Disable multiselection for rows.
    * @property {Boolean} addactiverowtomultiselect             - Multiselect of rows.
    * @property {Boolean} hideheader                            - Show or hide the header.
    * @property {Boolean} tableisfixed                          - Css table layout fixed.
    * @property {Object} fontobjectheader                       - Header of font object.
    * @property {Object} fontobjectbody                         - Body of font object.
    * @property {Boolean} lazyloading
    * @property {Number} lazyloadingbuffersize
    * @property {Number} lazyloadingtop
    * @property {Number} lazyloadingmargin
    * @property {Number} lazyloadingmaxitems
    * @property {Number} maxrowscount                           - Maximum number of rows.
    * @property {Boolean} lazyloadinguseexternalprovider        - True - uses lazyloading external provider
    * @property {Number} lazyloadingexternalmaxitems            - = maxrowscount
    * @property {} oldrow                                       - The previous row.
    ****************************************************************************************************/
    static get properties() {
        let props = {
            configdata: {
                type: Object,
                value: () => null,
                observer: '_updateDataExtern'
            },
            config: {
                type: Object,
                value: () => null,
                observer: '_updateConfig'
            },
            isactive: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: '_toggleIsActive'
            },
            activemarked: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            selection: {
                type: Object,
                value: () => null
            },
            activerow: {
                type: Number,
                value: 0,
                observer: '_setActiveRowById'
            },
            setactiverow: {
                type: Boolean,
                value: false
            },
            ignoresetactiverow: {
                type: Boolean,
                value: false
            },
            restorerow: {
                type: Boolean,
                value: false
            },
            activerowdata: {
                type: Object,
                value: {}
            },
            rowscount: {
                type: Number,
                value: 0
            },
            rowsperpage: {
                type: Number,
                value: 0
            },
            rowheight: {
                type: Number,
                value: 0
            },
            toprow: {
                type: Number,
                value: 0
            },
            bottomrow: {
                type: Number,
                value: 0
            },
            headerheight: {
                type: Number,
                value: 0
            },
            scrolldeltax: {
                type: Number,
                value: 10
            },
            scrolldeltay: {
                type: Number,
                value: 10
            },
            longpressdelay: {
                type: Number,
                value: 250
            },
            clickdelay: {
                type: Number,
                value: 250
            },
            oldrow: {
                type: Object,
                value: () => {
                    return {};
                }
            },
            readonly: {
                type: Boolean,
                value: false
            },
            disableautodeactivate: {
                type: Boolean,
                value: true,
                observer: '_init'
            },
            autoactivateonclick: {
                type: Boolean,
                value: true
            },
            disablemultiselect: {
                type: Boolean,
                value: false
            },
            addactiverowtomultiselect: {
                type: Boolean,
                value: false
            },
            hideheader: {
                type: Boolean,
                value: false,
                reflectToAttribute: true,
                observer: 'refreshGrid'
            },
            tableisfixed: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            fontobjectheader: {
                type: Object,
                value: () => { return "{}"; },
                observer: '_applFontObjects'
            },
            fontobjectbody: {
                type: Object,
                value: () => { return "{}"; },
                observer: '_applFontObjects'
            },
            lazyloading: {
                type: Boolean,
                value: false
            },
            lazyloadingbuffersize: {
                type: Number,
                value: 50
            },
            lazyloadingtop: {
                type: Number,
                value: 0
            },
            lazyloadingmargin: {
                type: Number,
                value: 10
            },
            lazyloadingmaxitems: {
                type: Number,
                value: null
            },
            maxrowscount: {
                type: Number,
                value: null,
                observer: '_maxrowchanged'
            },
            lazyloadinguseexternalprovider: {
                type: Boolean,
                value: false
            },
            lazyloadingexternalmaxitems: {
                type: Number,
                value: null
            }
        };
        return props;
    }
    /********************************************************************************************************************************
    * Creates an instance of LasalRuntimeSigControlListView.
    *
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    constructor() {
        super();
        this.downstart = 0;
        this.touchstartX = 0;
        this.touchstartY = 0;
        this.isKeySelect = true;
        this.readonly = false;
        this.longpress = false;
        this.sort = null;
        this.filter = null;
        this.isFiltering = false;
        this.isSorting = false;
        this.sortEventListener = null;
        this.filterEventListener = null;
        this.keydownEventListener = null;
        this.scrollEventListener = null;
        // Event Listeners (Filtering & Sorting)
        this.cancelpresstimer = () => {
            if (this.presstimer !== null) {
                this.sigClearTimeout(this.presstimer);
                this.presstimer = null;
            }
        };
        this.thTapHandler = (e) => {
            //if longpress was triggered there is nothing to do for us
            if (this.longpress)
                return;
            this.cancelpresstimer();
            const evtpath = e.composedPath()[0];
            this._setSort(evtpath);
        };
        this.thDownHandler = (e) => {
            this.downstart = performance.now();
            this.longpress = false;
            const evtpath = e.composedPath()[0];
            if (!this.presstimer)
                this.presstimer = this.sigSetTimeout(() => {
                    this.longpress = true;
                    if (this.presstimer)
                        this.sigClearTimeout(this.presstimer);
                    this.presstimer = null;
                    this._setFilter(evtpath);
                }, this.longpressdelay);
        };
        this.thUpHandler = (e) => {
            this.cancelpresstimer();
        };
        this.fakescrollcontentheight = 0;
        this.fakescrollheighttop = 0;
        this.fakescrollheightbot = 0;
        this.recordcount = 0;
        this.offset = 0;
        this.itemscount = 0;
        this.overflow = 0;
        this.underflow = 0;
        this.bufferpage = 0;
        this.scrollTopOld = 0;
        this.keepPosition = true;
        this.activerowdata = null;
        if (window.sigApi) {
            this.tmApi = window.sigApi.textManager;
            this.controlTextList = this.getControlTextListName();
        }
        else {
            this._log('API not ready!', 'ERROR');
        }
        this.selectRowAfterfirstClick = true;
        // define the event handler here, so we can add/remove it, when the component is activated/deactivated 
        this._onOutsideTap = (evt) => {
            const deactivate = this.shouldDeactivateOnTap(evt);
            if (deactivate)
                this._deactivateOnTap();
        };
    }
    /********************************************************************************************************************************
    * Called when the component has been connected to the DOM.
    *
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    connectedCallback() {
        super.connectedCallback();
        const parent = this.getParentHostElement();
        this._instanceId = (parent instanceof HTMLElement) ? parent.id : this.id;
        SigPolymer.beforeNextRender(this, function (params) {
            this._init();
            if (!this.isdesignmode) {
                this.sigAddEventListener('keydown', (e) => {
                    if (this.isactive) {
                        this._keydown(e);
                    }
                }, 'jsEvent', this.$.grid);
                this.sigAddEventListener('scroll', (e) => {
                    if (this.isactive) {
                        this._scrolled(e);
                    }
                }, 'jsEvent', this.$.grid, { passive: true });
                // Bind the event mediator for route change
                this.sigAddEventListener('APPROUTE_CHG', (maID, miID, message) => {
                    this.onRouteChange();
                }, 'runtimeEvent');
            }
        });
    }
    /********************************************************************************************************************************
    * Add event listeners to the body.
    *
    * @param {HTMLTableSectionElement} tbody Table body.
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _initEventHandlers(tbody) {
        if (!this.isdesignmode) {
            const cancelpresstimer = () => {
                if (this.presstimer !== null) {
                    this.sigClearTimeout(this.presstimer);
                    this.presstimer = null;
                }
            };
            this.sigAddEventListener('down', (e) => {
                this.downstart = performance.now();
                this.longpress = false;
                const evtpath = e.composedPath();
                if (!this.presstimer)
                    this.presstimer = this.sigSetTimeout(() => {
                        this.longpress = true;
                        if (this.presstimer) {
                            this.sigClearTimeout(this.presstimer);
                        }
                        this.presstimer = null;
                        this._longPress(evtpath);
                    }, this.longpressdelay);
            }, 'polymerEvent', tbody, { passive: true });
            this.sigAddEventListener('up', (e) => {
                cancelpresstimer();
            }, 'polymerEvent', tbody, { passive: true });
            this.sigAddEventListener('tap', (e) => {
                if ((this.isactive || this.autoactivateonclick) && !this.longpress) {
                    this._debounceClick(e);
                }
            }, 'polymerEvent', tbody, { passive: true });
        }
    }
    /********************************************************************************************************************************
    * Adds event listeners.
    *
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _addEventListeners() {
        this.sigAddEventListener('LANGUAGE_CHG', (majorId, minorId, msg) => {
            this._onLangChg(majorId, minorId, msg);
        }, 'runtimeEvent');
    }
    /********************************************************************************************************************************
    * Initializes the component.
    *
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _init() {
        this._getSystemTexts();
        if (this.disableautodeactivate) {
            this.isactive = true;
        }
        else {
            this.isactive = false;
        }
        let _data = {};
        if (this.isdesignmode) {
            this.isactive = true;
            _data = {
                "cols": [{
                        "id": "column1",
                        "name": "Image",
                        "type": "image",
                        "default": "Image",
                        "visible": true,
                        "sortable": false,
                        "sorttype": "asc",
                        "filterable": false,
                        "filtervalue": null,
                        "css": {
                            "text-align": "center",
                            "head-text-align": "center"
                        }
                    }, {
                        "id": "column2",
                        "name": "Column2",
                        "type": "text",
                        "default": "Column2",
                        "visible": true,
                        "sortable": true
                    }, {
                        "id": "column3",
                        "name": "Column3",
                        "type": "text",
                        "default": "Column3",
                        "visible": true,
                        "sortable": true,
                        "filterable": true,
                        "filtervalue": null
                    }],
                "data": {
                    nodes: [{
                            "active": true,
                            "marked": true,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Row selected and marked color",
                            "column3": "Column3 Data1",
                            "index": 0
                        },
                        {
                            "active": false,
                            "marked": true,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Row marked color",
                            "column3": "Column3 Data2",
                            "index": 1
                        }, {
                            "active": true,
                            "marked": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Row selected color",
                            "column3": "Column3 Data3",
                            "index": 2
                        },
                        {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Row standard color",
                            "column3": "Column3 Data4",
                            "index": 3
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Row alternate color",
                            "column3": "Column3 Data5",
                            "index": 4
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data6",
                            "column3": "Column3 Data6",
                            "index": 5
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data7",
                            "column3": "Column3 Data7",
                            "index": 6
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data8",
                            "column3": "Column3 Data8",
                            "index": 7
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data9",
                            "column3": "Column3 Data9",
                            "index": 8
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data10",
                            "column3": "Column3 Data10",
                            "index": 9
                        }, {
                            "active": false,
                            "column1": "<sig-control-image id='demo'></sig-control-image>",
                            "column2": "Column2 Data11",
                            "column3": "Column3 Data11",
                            "index": 10
                        }
                    ]
                }
            };
        }
        else {
            _data = {
                "cols": [{}],
                "data": {
                    nodes: [{}]
                }
            };
            this._addEventListeners();
        }
        ;
        if (!this.config) {
            this.config = {
                updateSelectionCallback: (data, pane) => {
                    this._log('updateSelectionCallback');
                },
                updateActiveRowCallback: (data, pane) => {
                    this._log('updateActiveRowCallback');
                },
                clickCallback: (data, pane, col) => {
                    this._log('clickCallback');
                },
                doubleClickCallback: (data, pane, col) => {
                    this._log('doubleClickCallback');
                },
                longPressCallback: (data, pane, col) => {
                    this._log('longPressCallback');
                },
                onEnterCallback: (data, pane) => {
                    this._log('onEnterCallback');
                },
                onSortingCallback: (data, pane, col) => {
                    this._log('onSorting');
                },
                onRenderReadyCallback: (data, pane) => {
                    this._log('Render ready');
                },
                onFilteringCallback: (data, pane, col) => {
                    this._log('onFiltering');
                },
                onLazyloadingCallback: (data, pane) => {
                    this._log('onLazyloading');
                },
                data: _data,
                name: "defaultlist",
                self: this
            };
        }
    }
    /********************************************************************************************************************************
    * Observer which is called when the active-state of the listview changed.
    *
    * @param {Boolean} newval New value.
    * @param {Boolean} oldval Old value.
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _toggleIsActive(newval, oldval) {
        if (this.isactive === true) {
            this._log('Activate control');
            if (this.activerow !== null)
                this._setActiveRowById(this.activerow);
            if (!this.isdesignmode)
                this.$.grid.focus();
        }
        else {
            this._log('Deactivate control');
        }
    }
    /********************************************************************************************************************************
    * Called when the route changed.
    * Can be overwritten to implement custom handling.
    *
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    onRouteChange() {
        this._deactivateOnTap();
    }
    /********************************************************************************************************************************
    * Called to decide if the listview should be deactivated by tap, when the event was registered on the window object.
    * Can be overwritten to implement custom handling.
    *
    * @param {*} evt Event.
    * @returns {Boolean} True - deactivated on tap.
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    shouldDeactivateOnTap(evt) {
        if (evt && evt.target && evt.target.id !== this._instanceId)
            return true;
        return false;
    }
    /********************************************************************************************************************************
     * Activates the listview.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _setActive() {
        if (!this.isactive && !this.readonly) {
            this.isactive = true;
        }
    }
    /********************************************************************************************************************************
    * Deactivates the listview.
    *
    * @param {*} e Event
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _deactivateOnTap(e) {
        if (this.isactive && !this.disableautodeactivate) {
            this.isactive = false;
        }
    }
    /********************************************************************************************************************************
    * Observer which is called when the property configdata has changed.
    * Is called from extern to set the config and data of the listview.
    *
    * @param {*} data New config data.
    * @param {*} oldval Old config data.
    * @memberof LasalRuntimeSigControlListView
    ********************************************************************************************************************************/
    _updateDataExtern(data, oldval) {
        if (oldval !== undefined && data && data.data && data.data.nodes) {
            this.config.data.cols = Object.assign([], data.cols);
            this.config.data.data.nodes = Object.assign([], data.data.nodes);
            this.config.data.params = Object.assign([], data.params);
            if (data.data.datanodes)
                this.config.data.data.datanodes = Object.assign([], data.data.datanodes);
            else
                this.config.data.data.datanodes = Object.assign([], data.data.nodes);
            // FreJon: set maxitems for lazyloading so it is not needed to give all data to the listview
            if ((this.config.data.params) &&
                (this.lazyloadinguseexternalprovider === true) &&
                (this.config.data.params.lazyloading === true) &&
                (this.lazyloadingexternalmaxitems !== null) &&
                (this.lazyloadingexternalmaxitems !== 0)) {
                this.maxrowscount = this.lazyloadingexternalmaxitems;
            }
            else {
                this.maxrowscount = this.config.data.data.datanodes.length;
            }
            this.scrollTopOld = this.$.grid.scrollTop;
            const _isKeySelect = this.isKeySelect;
            this._renderPipeline();
            this.rowscount = this.config.data.data.nodes.length;
            this._setTopBottomRow();
            if (this.config.data.params && this.config.data.params.lazyloading && this.config.onLazyloadingCallback) {
                let _scroll = this.offset > 0 ? (this.offset - this.underflow) : 0;
                if (this.scrolldirection < 0 && this.recordcount > (this.rowsperpage * 2 - 1) && _isKeySelect)
                    _scroll += this.rowsperpage - 1;
                _scroll = _scroll * this.rowheight;
                this._updateScroller(Math.max(this.underflow, 0), _scroll);
            }
        }
    }
    /********************************************************************************************************************************
     * Hides the listview while loading the data.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _hideLoadingListview() {
        this.$.spinner.classList.remove('hidden');
    }
    /********************************************************************************************************************************
     * Shows the listview when data has been loaded.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _showLoadedListview() {
        this.$.spinner.classList.add('hidden');
        this.$.gridcontent.classList.remove('hidden');
    }
    /********************************************************************************************************************************
     * Updates the displayed data.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async _updateDataLocal() {
        this._setTopBottomRow();
        this._hideLoadingListview();
        this._renderPipeline();
        this.rowscount = this.config.data.data.nodes.length;
        this._showLoadedListview();
    }
    /********************************************************************************************************************************
     * Updates the config of the listview.
     *
     * @param {*} newval New config.
     * @param {*} oldval Old config.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _updateConfig(newval, oldval) {
        if (oldval !== undefined && newval !== null) {
            if (newval.data && newval.data.data && newval.data.data.nodes) {
                this.config.data = Object.assign({}, newval.data);
                if (this.config.data.params && this.config.data.params.lazyloading) {
                    this.overflow = this.config.data.params.lazyloadingbuffersize - this.config.data.params.lazyloadingmargin;
                    this._hideLoadingListview();
                    let _scroll = this.offset > 0 ? (this.offset - this.underflow) : 0;
                    _scroll = _scroll * this.rowheight;
                    this._renderPipeline(true).then(() => {
                        if (this.config.onLazyloadingCallback && this.lazyloadinguseexternalprovider === true) {
                            this._updateGridParam();
                            if (this.scrolldirection < 0 && this.isKeySelect)
                                _scroll += this.rowsperpage - 1;
                            this._updateScroller(this.underflow, _scroll);
                        }
                        else {
                            this._updateScroller(0, 0);
                        }
                    });
                }
                else {
                    this._hideLoadingListview();
                    this._renderPipeline(true);
                }
                this._showLoadedListview();
            }
        }
    }
    /********************************************************************************************************************************
     * Updates the parameters used by the control.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _updateGridParam() {
        this.headerheight = this._getHeaderHeight();
        this.rowheight = this._getRowHeight();
        this.rowsperpage = this._getRowsPerPage();
        this.rowscount = this.config.data.data.nodes.length;
    }
    /********************************************************************************************************************************
     * Updates the data displayed by the listview.
     *
     * @param {Boolean} [_init=false]
     * @returns {*}
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async _renderPipeline(_init = false) {
        if (!_init && !this.lazyloadinguseexternalprovider) {
            this._doFilter();
            this._doSort();
            this.config.data.data.nodes.map((_node, _index) => _node._id = _index);
        }
        else {
            if (!this.config.data.data.datanodes)
                this.config.data.data.datanodes = Object.assign([], this.config.data.data.nodes);
            // FreJon: set maxitems for lazyloading so it is not needed to give all data to the listview
            if ((this.config.data.params) &&
                (this.lazyloadinguseexternalprovider === true) &&
                (this.config.data.params.lazyloading === true) &&
                (this.lazyloadingexternalmaxitems !== null) &&
                (this.lazyloadingexternalmaxitems !== 0)) {
                this.maxrowscount = this.lazyloadingexternalmaxitems;
            }
            else {
                this.maxrowscount = this.config.data.data.datanodes.length;
            }
        }
        if (this.config.data.params && this.config.data.params.lazyloading && !this.lazyloadinguseexternalprovider) {
            this.config.data.data.nodes = this.config.data.data.nodes.slice(this.underflow, this.underflow + this.config.data.params.lazyloadingbuffersize + Math.max(this.rowsperpage, 0));
        }
        if (_init)
            this._renderGrid(this.config.data);
        else
            this._renderGrid(this.config.data);
        if (this.isactive && _init && !this.lazyloadinguseexternalprovider)
            this.sigSetTimeout(() => { this.scrollToRowActivate(this.activerow, this.scrollTopOld); }, 0);
        this.isKeySelect = false;
        if (this.config.onRenderReadyCallback)
            this.config.onRenderReadyCallback(true, this.config.name);
        return true;
    }
    /********************************************************************************************************************************
     * Renders the complete table with its contents.
     *
     * @param {*} data The config data.
     * @param {*} [_activerow=null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderGrid(data, _activerow = null) {
        if (this.activerow !== null)
            this._backupRow(this.activerow);
        if (_activerow && this.setactiverow && !this.ignoresetactiverow) {
            if (this.oldrow.id <= this.rowscount && this.restorerow)
                this.activerow = this.oldrow.id;
            else
                this.activerow = _activerow;
        }
        const _table = this.$.gridcontent ? this.$.gridcontent.getElementsByTagName('table') : null;
        const table = _table && _table[0] ? _table[0] : this._renderTable();
        if (table) {
            const thead = table.getElementsByTagName('thead');
            const head = this._renderHead(data.cols, thead[0]);
            if (head)
                table.appendChild(head);
            const tbody = table.getElementsByTagName('tbody');
            const body = this._renderBody(data.data, data.cols, tbody[0]);
            if (body)
                table.appendChild(body);
            this.$.gridcontent.appendChild(table);
        }
        if (this.isactive)
            this.sigSetTimeout(() => {
                this._updateGridParam();
                this.scrollToRowActivate(this.activerow, this.scrollTopOld);
            }, 0);
    }
    /********************************************************************************************************************************
     * Applies the fonts to the defiend elements (header, body...)
     *
     * @param {*} oldvalue Old value.
     * @param {*} newvalue New value.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _applFontObjects(oldvalue, newvalue) {
        const _head = this.$.grid.querySelector('table thead');
        const _body = this.$.grid.querySelector('table tbody');
        if (this.fontobjectheader && _head) {
            this._applyFontObjectToNode(_head, this.fontobjectheader);
            const thElements = _head.querySelectorAll('th');
            for (let el of thElements) {
                if (this.fontobjectheader.bold) {
                    el.style.removeProperty('font-weight');
                }
                else {
                    el.style.setProperty('font-weight', 'normal');
                }
            }
        }
        if (this.fontobjectbody && _body)
            this._applyFontObjectToNode(_body, this.fontobjectbody);
    }
    /********************************************************************************************************************************
     * Resets all sorted columns.
     *
     * @param {*} [_element=null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _clearAllSort(_element = null) {
        let _elems = _element;
        if (!_elems)
            _elems = this.$.gridcontent.querySelector('#thead-data')?.firstChild;
        if (_elems.cells)
            [..._elems.cells].map((_elem) => { if (_elem.getAttribute('sortable'))
                _elem.setAttribute('sorttype', 'none'); });
        if (this.config.data.cols)
            this.config.data.cols.map((_column) => { if (_column.sortable)
                _column.sorttype = 'none'; });
        this.sort = null;
    }
    /********************************************************************************************************************************
     * Resets all filtered columns.
     *
     * @param {*} [_element=null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _clearAllFilter(_element = null) {
        let _elems = _element;
        if (!_elems)
            _elems = this.$.gridcontent.querySelector('#thead-data')?.firstChild;
        if (_elems.cells)
            [..._elems.cells].map((_elem) => { if (_elem.getAttribute('filterable'))
                _elem.setAttribute('filtervalue', null); });
        if (this.config.data.cols)
            this.config.data.cols.map((_column) => { if (_column.filterable)
                _column.filtervalue = null; });
        this.filter = null;
    }
    /********************************************************************************************************************************
     * Sorts a given column.
     *
     * @param {*} _elem
     * @param {*} [_setsorttype=null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _setSort(_elem, _setsorttype = null) {
        const _attr = _elem.getAttribute('sorttype');
        const _elemId = _elem.getAttribute('id');
        const _dataObjId = _elemId.replace(/thead-/i, "");
        let _sorttype = 'none';
        this._clearAllSort(_elem.parentElement);
        if (!_setsorttype) {
            switch (_attr) {
                case 'asc':
                    _sorttype = 'desc';
                    break;
                case 'desc':
                    _sorttype = 'none';
                    break;
                default:
                    _sorttype = 'asc';
                    break;
            }
        }
        else {
            _sorttype = _setsorttype;
        }
        _elem.setAttribute('sorttype', _sorttype);
        this.sort = {
            "key": _dataObjId,
            "sorttype": _sorttype
        };
        if (this.config.data.cols)
            this.config.data.cols.map((_column) => { if (_column.sortable && _column.id === _dataObjId)
                _column.sorttype = _sorttype; });
        this.scrollTopOld = this.$.grid.scrollTop;
        this.isSorting = true;
        this._hideLoadingListview();
        this.sigSetTimeout(() => {
            if (this.config.onSortingCallback)
                this.config.onSortingCallback(this.sort, this.config.name, _dataObjId);
            else
                this._renderPipeline();
        }, 0);
        this.sigSetTimeout(() => { this._showLoadedListview(); }, 25);
    }
    /********************************************************************************************************************************
     * Sorts the rows by the data defined in the sort object.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _doSort() {
        if (this.sort) {
            if (this.sort.sorttype !== 'none') {
                this.config.data.data.nodes.sort((a, b) => {
                    const aKey = a[this.sort.key] ? a[this.sort.key] : '';
                    const bKey = b[this.sort.key] ? b[this.sort.key] : '';
                    if (a.nosort || b.nosort)
                        return 0;
                    if (a.firstsort && this.sort.sorttype === 'asc')
                        return -1;
                    if (b.firstsort && this.sort.sorttype === 'asc')
                        return 1;
                    if (a.firstsort && this.sort.sorttype === 'desc')
                        return 1;
                    if (b.firstsort && this.sort.sorttype === 'desc')
                        return -1;
                    let _val = 0;
                    if (this.sort && this.sort.key)
                        _val = (aKey.toString().toLowerCase() < bKey.toString().toLowerCase() && this.sort.sorttype === 'asc'
                            || aKey.toString().toLowerCase() > bKey.toString().toLowerCase() && this.sort.sorttype === 'desc'
                            || a['id'] > b['id'] && this.sort.sorttype === 'none') ? 1 : -1;
                    return _val;
                });
            }
            else if (this.sort.sorttype === 'none') {
                this.config.data.data.nodes.sort((a, b) => (a.rowid > b.rowid) ? 1 : -1);
            }
        }
    }
    /********************************************************************************************************************************
     * Sets the filter for a given column.
     *
     * @param {*} _elem
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _setFilter(_elem) {
        const _filtervalue = _elem.getAttribute('filtervalue');
        let _isCallback = false;
        if (_filtervalue)
            this._resetFilter(_elem);
        else {
            if (this.config.onFilterInputCallback)
                _isCallback = this.config.onFilterInputCallback(_elem, this.config.name);
            if (_isCallback === false)
                this._showKeyboard(_elem);
        }
    }
    /********************************************************************************************************************************
     * Resets the filter for the given column.
     *
     * @param {*} elem
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _resetFilter(elem) {
        this.updateFilterValue(elem, null);
        if (this.presstimer !== null) {
            this.sigClearTimeout(this.presstimer);
            this.presstimer = null;
        }
    }
    /********************************************************************************************************************************
     * Resets all columns which were filtered.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    resetAllFilter() {
        const _elems = this.$.gridcontent.querySelector('#thead-data')?.firstChild;
        const _reset = [..._elems.children].forEach(_elem => {
            this._resetFilter(_elem);
        });
    }
    /********************************************************************************************************************************
     * Resets all columns which were sorted.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    resetAllSort() {
        this._clearAllSort();
        const _elems = this.$.gridcontent.querySelector('#thead-data')?.firstChild;
        const _reset = [..._elems.children].forEach(_elem => {
            this._setSort(_elem, 'none');
        });
    }
    /********************************************************************************************************************************
     * Filters the rows with the data defined in the filter object.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _doFilter() {
        if (this.filter && this.filter.filtervalue) {
            this.config.data.data.nodes = Object.assign([], this.config.data.data.datanodes.filter((_column) => (_column[this.filter.key].match(this.filter.filtervalue) || _column.nofilter)));
        }
        else
            this.config.data.data.nodes = Object.assign([], this.config.data.data.datanodes);
        // FreJon: set maxitems for lazyloading so it is not needed to give all data to the listview
        if ((this.config.data.params) &&
            (this.lazyloadinguseexternalprovider === true) &&
            (this.config.data.params.lazyloading === true) &&
            (this.lazyloadingexternalmaxitems !== null) &&
            (this.lazyloadingexternalmaxitems !== 0)) {
            this.maxrowscount = this.lazyloadingexternalmaxitems;
        }
        else {
            this.maxrowscount = this.config.data.data.nodes.length;
        }
        if (this.isFiltering) {
            this._clearActiveRow();
            this.activerowdata = {};
            this.activerow = 1;
        }
    }
    /********************************************************************************************************************************
     * Updates the filter value.
     *
     * @param {*} elem Element on which filter gets applied.
     * @param {Number} value The filter value.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    updateFilterValue(elem, value) {
        this.isFiltering = true;
        this._clearAllFilter(elem.parentElement);
        if (value)
            elem.setAttribute('filtervalue', value);
        else
            elem.removeAttribute('filtervalue');
        const _elemId = elem.getAttribute('id');
        const _dataObjId = _elemId.replace(/thead-/i, "");
        this.filter = {
            "key": _dataObjId,
            "filtervalue": value
        };
        if (this.config.data.cols)
            this.config.data.cols.map((_column) => { if (_column.filterable && _column.id === _dataObjId)
                _column.filtervalue = value; });
        this.scrollTopOld = this.$.grid.scrollTop;
        this.sigSetTimeout(() => { this._hideLoadingListview(); }, 0);
        this.sigSetTimeout(() => {
            if (this.config.onFilteringCallback)
                this.config.onFilteringCallback(this.filter, this.config.name, _dataObjId);
            else
                this._renderPipeline();
            this._updateScroller(0, 0);
        }, 10);
        this.sigSetTimeout(() => { this._showLoadedListview(); }, 25);
    }
    /********************************************************************************************************************************
     * Observer which is called when the maximum number of rows has changed.
     *
     * @param {Number} newval New maxrowcount.
     * @param {Number} oldval Old maxrowcount.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _maxrowchanged(newval, oldval) {
        if (this.config.onCounterCallback && newval !== undefined)
            this.config.onCounterCallback({ activerow: this.activerow, maxrowscount: this.maxrowscount }, this.config.name);
    }
    /********************************************************************************************************************************
     * Opens the keyboard.
     *
     * @param {*} elem
     * @param {String} [type='text'] Keyboard type
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _showKeyboard(elem, type = 'text') {
        if (!this.isdesignmode) {
            const keyboard = document.getElementsByTagName('sig-keyboard')[0];
            if (keyboard !== null) {
                let rule = '';
                let mask = '';
                let placeholder = '';
                let maxlength = 0;
                const lang = this.activeLang;
                switch (this.type) {
                    case 'text':
                        type = 'alpha';
                        if (this.maxlength > 0) {
                            maxlength = this.maxlength;
                        }
                        break;
                    case 'numeric':
                        type = 'numeric';
                        rule = 'numeric';
                        break;
                    case 'ipv4':
                        type = 'ipv4';
                        rule = 'ipv4';
                        mask = '099.099.099.099';
                        placeholder = '0.0.0.0';
                        maxlength = 15;
                        break;
                    case 'hex':
                        type = 'hex';
                        rule = 'hex';
                        placeholder = '0x00000000';
                        mask = 'FFFFFFFF';
                        maxlength = 8;
                        break;
                    case 'date':
                        type = 'date';
                        switch (this.dateformat) {
                            case 'MM-DD':
                                rule = 'date-en';
                                mask = '00-00';
                                placeholder = 'MM-DD';
                                break;
                            case 'YY-MM-DD':
                                rule = 'date-en';
                                mask = '00-00-00';
                                placeholder = 'YY-MM-DD';
                                break;
                            case 'YYYY-MM-DD':
                                rule = 'date-en';
                                mask = '0000-00-00';
                                placeholder = 'YYYY-MM-DD';
                                break;
                            case 'YY-MM':
                                rule = 'date-en';
                                mask = '00-00';
                                placeholder = 'YY-MM';
                                break;
                            case 'MM.YY':
                                rule = 'date';
                                mask = '00.00';
                                placeholder = 'MM.YY';
                                break;
                            case 'DD.MM':
                                rule = 'date';
                                mask = '00.00';
                                placeholder = 'DD.MM';
                                break;
                            case 'DD.MM.YY':
                                rule = 'date';
                                mask = '00.00.00';
                                placeholder = 'DD.MM.YY';
                                break;
                            default:
                                rule = 'date';
                                mask = '00.00.0000';
                                placeholder = 'DD.MM.YYYY';
                                break;
                        }
                        maxlength = placeholder.length;
                        break;
                    case 'time':
                        type = 'time';
                        rule = 'time';
                        switch (this.timeformat) {
                            case 'HH:MM':
                                mask = '00:00';
                                placeholder = 'HH:MM';
                                break;
                            case 'MM:SS':
                                rule = 'time-short';
                                mask = '00:00';
                                placeholder = 'MM:SS';
                                break;
                            default:
                                mask = '00:00:00';
                                placeholder = 'HH:MM:SS';
                                break;
                        }
                        maxlength = placeholder.length;
                        break;
                    case 'time-rt':
                        type = 'time';
                        rule = 'time-rt';
                    case 'date-rt':
                        type = 'date';
                        rule = 'date-rt';
                        break;
                    default:
                        type = 'alpha';
                        break;
                }
                window.sigApi.keyboard.open(type, this.texts.keyboardcaption, {
                    keyboardrule: rule,
                    keyboardmask: mask,
                    keyboardplaceholder: placeholder,
                    keyboardmin: this.limitLow,
                    keyboardmax: this.limitHigh,
                    keyboardmaxlength: maxlength,
                    keyboardlang: lang,
                    ispassword: this.ispassword,
                    ignoremin: this.ignoremin,
                    ignoremax: this.ignoremax,
                    keyboardunittext: this.unittext,
                    writeonincrement: this.writeonincrement,
                    keyboardvalue: ((this.filter) && (this.filter.filtervalue)) ? this.filter.filtervalue : ''
                }, this, 'value').then((value) => {
                    this.updateFilterValue(elem, value);
                }, () => { });
            }
            else {
                this._log(`Keyboard with id "${this.keyboardid}" not found!`, "ERROR");
            }
        }
    }
    /********************************************************************************************************************************
     * Called when the language has changed.
     * Fetches the texts again.
     *
     * @param {Number} majorId Major Id.
     * @param {Number} minorId Minor Id.
     * @param {String} msg Message.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _onLangChg(majorId, minorId, msg) {
        this._log('Language changed');
        this._getSystemTexts();
    }
    /********************************************************************************************************************************
     * Called by the Designer Runtime when the project language changes.
     * @param {Object} language The definition object of the current language.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    designerOnLanguageChanged() {
        this._onLangChg();
    }
    /********************************************************************************************************************************
     * Called by the Designer Runtime if the ObjectStore has been updated.
     * @async
     * @param {*} data The payload of the ObjectStore command which triggered the update.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async designerOnObjectStoreUpdate(data) {
        try {
            const textListChanged = await this.tmApi.isTextListUpdate(data, this.controlTextList);
            if (textListChanged)
                this._onLangChg();
        }
        catch (error) {
            this._log('designerOnObjectStoreUpdate(): failed to check for text list update -> ' + error, 'ERROR');
        }
    }
    /********************************************************************************************************************************
     * Returns texts of the listview.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async _getSystemTexts() {
        if (this.tmApi) {
            try {
                const texts = await this.tmApi.getTextsAsync(this._getTextsObject());
                this.texts = texts[this.controlTextList];
            }
            catch (error) {
                this._log('_getSystemTexts(): failed to get texts -> ' + error, 'ERROR');
            }
        }
    }
    /********************************************************************************************************************************
     * Returns the components text list.
     *
     * @returns {Object} Text list as an object.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getTextsObject() {
        return {
            [this.controlTextList]: {
                keyboardcaption: 'Please enter a regular expression to filter rows'
            }
        };
    }
    /********************************************************************************************************************************
     * Called when scrolled.
     *
     * @param {(Number | Event)} obj Row number or event.
     * @param {Number} _scrolldirection Scroll direction number.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _scrolled(obj, _scrolldirection) {
        let _scrollTop = 0;
        if (obj instanceof Event) {
            _scrollTop = Math.round(obj.composedPath()[0].scrollTop);
        }
        else {
            //let _pos = parseInt(obj);
            let _pos = obj;
            if (_pos < this._getRowsPerPage() * 2) {
                _pos -= 1;
            }
            else {
                _pos = _pos - this._getRowsPerPage();
            }
            _scrollTop = Math.max(Math.round(_pos * this.rowheight), 0);
        }
        if (this.config.data.params && this.config.data.params.lazyloading) {
            const _oldRecordcount = this.recordcount;
            this.recordcount = Math.min(_scrollTop / this.rowheight, this.maxrowscount);
            if (!_scrolldirection)
                this.scrolldirection = Math.sign(this.recordcount - _oldRecordcount);
            else
                this.scrolldirection = _scrolldirection;
            if (this.config.data.params && this.config.data.params.lazyloading)
                this._lazyLoadData(_scrollTop);
        }
    }
    /********************************************************************************************************************************
     * Loads the next block of data.
     *
     * @param {Number} _scrollTop
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _lazyLoadData(_scrollTop) {
        const _lazyloadingbuffersize = this.config.data.params.lazyloadingbuffersize - this.config.data.params.lazyloadingmargin;
        this.offset = Math.min(this.recordcount, this.maxrowscount);
        this.bufferpage = Math.floor(this.offset / _lazyloadingbuffersize);
        if (this.scrolldirection && (this.offset < this.underflow || this.offset > this.overflow)) {
            this.underflow = Math.max(Math.min((this.bufferpage) * _lazyloadingbuffersize, this.maxrowscount - _lazyloadingbuffersize), 0);
            this.overflow = Math.min(this.underflow + _lazyloadingbuffersize + this.rowsperpage, this.maxrowscount);
            let _scroll = this.offset > 0 ? (this.offset - this.underflow) : 0;
            if (this.scrolldirection < 0 && this.isKeySelect)
                _scroll += this.rowsperpage - 1;
            _scroll = _scroll * this.rowheight;
            if (this.config.onLazyloadingCallback) {
                const _cbObj = { position: this.offset, scrolldirection: this.scrolldirection, underflow: this.underflow, overflow: this.overflow };
                this.config.onLazyloadingCallback(_cbObj, this.config.name);
            }
            else {
                this._updateDataLocal();
                this._updateScroller(Math.max(this.underflow, 0), _scroll);
            }
        }
    }
    /********************************************************************************************************************************
     * Updates the scrollbar.
     *
     * @param {number} [_scrolloffset=0]
     * @param {number} [_offset=0]
     * @returns {*}
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _updateScroller(_scrolloffset = 0, _offset = 0) {
        if (this.config.data.params && !this.config.data.params.lazyloading)
            return;
        this.fakescrollheighttop = _scrolloffset * this.rowheight;
        this.fakescrollheightbot = Math.max((this.maxrowscount - _scrolloffset - this.config.data.params.lazyloadingbuffersize - this.rowsperpage) * this.rowheight, 0);
        this.$.fakescrolltop.style.setProperty('height', this.fakescrollheighttop + "px");
        this.$.fakescrollbot.style.setProperty('height', this.fakescrollheightbot + "px");
        this.$.grid.scrollTop = this.fakescrollheighttop + _offset;
    }
    /********************************************************************************************************************************
     * Creates and displays the listview content (columns, rows...).
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderTable() {
        const table = document.createElement('table');
        table.setAttribute('id', 'data');
        const thead = document.createElement('thead');
        thead.setAttribute('id', 'thead-data');
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        tbody.setAttribute('id', 'tbody-data');
        this._initEventHandlers(tbody);
        table.appendChild(tbody);
        return table;
    }
    /********************************************************************************************************************************
     * Renders the head of the columns.
     *
     * @param {*} [cols=null]
     * @param {*} thead
     * @returns {*} Table head.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderHead(cols = null, thead) {
        //Remove existing events before rendering the thead again.
        const ths = thead.querySelectorAll('th');
        if (ths instanceof NodeList) {
            ths.forEach(th => {
                this.sigRemoveEventListener('down', this.thDownHandler, 'polymerEvent', th, { passive: true });
                this.sigRemoveEventListener('up', this.thUpHandler, 'polymerEvent', th, { passive: true });
                this.sigRemoveEventListener('tap', this.thTapHandler, 'polymerEvent', th, { passive: true });
            });
        }
        thead.innerHTML = '';
        const tr = document.createElement('tr');
        if (cols !== null) {
            for (const col of cols) {
                if (col.visible === true) {
                    const th = document.createElement('th');
                    th.id = 'thead-' + col.id;
                    th.textContent = col.name;
                    let _styleObj = '';
                    for (const cellcss in col.css) {
                        if (cellcss === 'head-text-align') {
                            _styleObj += `text-align:${col.css[cellcss]}; `;
                        }
                        if (this.tableisfixed === true && cellcss === 'width') {
                            _styleObj += `width:${col.css[cellcss]}; `;
                        }
                        if (cellcss === 'overflow') {
                            _styleObj += `overflow:${col.css[cellcss]};`;
                        }
                    }
                    th.style = _styleObj;
                    if (this.fontobjectheader) {
                        if (this.fontobjectheader.bold) {
                            th.style.removeProperty('font-weight');
                        }
                        else {
                            th.style.fontWeight = 'normal';
                        }
                    }
                    else {
                        th.style.removeProperty('font-weight');
                    }
                    if (col.sortable === true) {
                        th.setAttribute('sortable', 'true');
                        if (col.sorttype)
                            th.setAttribute('sorttype', col.sorttype);
                    }
                    if (col.filterable === true) {
                        th.setAttribute('filterable', 'true');
                        if (col.filtervalue)
                            th.setAttribute('filtervalue', col.filtervalue);
                    }
                    if (!this.isdesignmode) {
                        if (col.filterable === true) {
                            this.sigAddEventListener('down', this.thDownHandler, 'polymerEvent', th, { passive: true });
                            this.sigAddEventListener('up', this.thUpHandler, 'polymerEvent', th, { passive: true });
                        }
                        if (col.sortable === true) {
                            this.sigAddEventListener('tap', this.thTapHandler, 'polymerEvent', th, { passive: true });
                        }
                    }
                    tr.appendChild(th);
                }
            }
        }
        thead.appendChild(tr);
        return thead;
    }
    /********************************************************************************************************************************
     * Creates and displays the rows.
     *
     * @param {*} root Root.
     * @param {*} cols Columns.
     * @param {*} tbody Table body.
     * @returns {*} Table body.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderBody(root, cols, tbody) {
        tbody.innerHTML = '';
        let rows = document.createDocumentFragment();
        if (root.nodes !== undefined) {
            rows = this._renderRows(root.nodes, cols);
            tbody.appendChild(rows);
            return tbody;
        }
    }
    /********************************************************************************************************************************
     * Creates the html of the rows.
     *
     * @param {*} rows
     * @param {*} cols
     * @returns {DocumentFragment} The html rows.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderRows(rows, cols) {
        const fragment = document.createDocumentFragment();
        let index = 1;
        if (rows[0]) {
            for (const row of rows) {
                let tr = document.createElement('tr');
                if (row._id)
                    tr.setAttribute('id', 'r' + (row._id + 1));
                else
                    tr.setAttribute('id', 'r' + index);
                tr.setAttribute('data-data', JSON.stringify(row));
                this._handleRowCallbacks(row, tr).then(_handledRow => {
                    if (typeof row.rowRenderCallback === 'function')
                        tr = _handledRow;
                });
                if (row.active === true && (this.alreadyclicked || !this.selectRowAfterfirstClick)) {
                    if (this.setactiverow)
                        this.activerow = index;
                    tr.classList.add('active');
                }
                if (row.marked)
                    tr.classList.add('marked');
                let td = document.createDocumentFragment();
                td = this._renderCols(row, cols, index);
                tr.appendChild(td);
                fragment.appendChild(tr);
                index++;
            }
        }
        return fragment;
    }
    /********************************************************************************************************************************
     * Creates the html of the columns.
     *
     * @param {*} row
     * @param {*} cols
     * @param {Number} rowindex
     * @returns {DocumentFragment} The html columns.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderCols(row, cols, rowindex) {
        const fragment = document.createDocumentFragment();
        if (cols) {
            for (const col of cols) {
                if (col.visible === true) {
                    let _colValue = null;
                    const td = document.createElement('td');
                    td.classList.add(col.id);
                    if (row.hasOwnProperty(col.id) && row[col.id] !== undefined)
                        _colValue = row[col.id];
                    else
                        _colValue = col.default;
                    if (col.css && (typeof col.css === 'object')) {
                        let _colObj = '';
                        for (const colcss in col.css) {
                            _colObj += `${colcss}:${col.css[colcss]}; `;
                        }
                        td.style = _colObj;
                    }
                    let _styleObj = '';
                    if (typeof _colValue === 'object' && _colValue && _colValue.css) {
                        for (const cellcss in _colValue.css) {
                            _styleObj += `${cellcss}:${_colValue.css[cellcss]}; `;
                        }
                        _colValue = _colValue.value;
                    }
                    this._handleColCallbacks(_colValue, row, col, td).then(_colValue => {
                        if (typeof col.renderCallback === 'function')
                            td.innerHTML = _colValue;
                        else {
                            const _renderObj = this._renderColContentObj(col, _styleObj, _colValue);
                            td.append(_renderObj);
                        }
                    });
                    fragment.appendChild(td);
                }
            }
        }
        return fragment;
    }
    /********************************************************************************************************************************
     * Calls the callbacks of the row and awaits their result.
     *
     * @param {*} rowData
     * @param {HTMLTableRowElement} rowToHandle
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async _handleRowCallbacks(rowData, rowToHandle) {
        let _handledRow;
        try {
            if (typeof rowData.rowRenderCallback === 'function')
                _handledRow = await rowData.rowRenderCallback(rowToHandle);
        }
        catch (err) {
            console.log(err);
        }
        return (_handledRow);
    }
    /********************************************************************************************************************************
     * Calls the callbacks of the column and awaits their result.
     *
     * @param {*} _colValue Column value
     * @param {*} row
     * @param {*} col
     * @param {HTMLTableCellElement} td Table data
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    async _handleColCallbacks(_colValue, row, col, td) {
        let _formatCallbackValue = _colValue, _renderCallbackValue = _colValue;
        try {
            if (typeof col.formatDataCallback === 'function')
                _formatCallbackValue = await col.formatDataCallback(_colValue, row, col, this.config.self);
            if (typeof col.renderCallback === 'function')
                _renderCallbackValue = await col.renderCallback(_formatCallbackValue, row, col, this.config.self, td);
            else
                _renderCallbackValue = _formatCallbackValue;
        }
        catch (err) {
            console.error(err);
        }
        return (_renderCallbackValue);
    }
    /********************************************************************************************************************************
     * Creates and displays the content of a column header.
     *
     * @param {*} col
     * @param {String} style
     * @param {*} value
     * @returns {HTMLSpanElement}
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _renderColContentObj(col, style, value) {
        let _elem = document.createElement('span');
        if (col.type === 'img') {
            _elem = document.createElement('img');
            _elem.style = style;
            if (value)
                _elem.src = col.prefix + value;
            else
                _elem.src = col.prefix + col.default;
        }
        else if (col.type === 'backgroundimg') {
            _elem = document.createElement('sig-control-image');
            if (value) {
                const _src = 'url(' + (col.prefix + value).replace(/\\/g, "/") + ')';
                _elem.style = style;
                _elem.style.setProperty('--theme-sig-control-image-background-image', _src);
            }
        }
        else if (col.type === 'symbol') {
            _elem = document.createElement('div');
            _elem.style = style;
            _elem.innerHTML = value;
            _elem.classList.add('symbolfont');
        }
        else {
            _elem.style = style;
            _elem.innerHTML = value;
        }
        return _elem;
    }
    /****************************************************************************************************
     * Returns the row that was selected, from the path of the event.
     *
     * @param {*} path - path of the event to check for row
     * @return {*}  {(null | object)} - row in path or null if not found
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _getRowFromPath(path) {
        if (path) {
            const rowArray = path.filter((item) => item.tagName === "TR");
            return rowArray[0] ? rowArray[0] : null;
        }
        return null;
    }
    /********************************************************************************************************************************
     * Marks a row with the given id.
     *
     * @param {Number} [id=this.activerow]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _markRowById(id = this.activerow) {
        const row = this.shadowRoot?.getElementById('r' + id);
        if (row && !this.disablemultiselect) {
            if (!row.classList.contains('parent') && !row.classList.contains('volume')) {
                row.classList.toggle('marked');
            }
            this._updateSelectionData();
        }
        if (this.activerow !== id)
            this.activerow = id;
    }
    /********************************************************************************************************************************
     * Calls the selectionCallback to update the marked rows.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _updateSelectionData() {
        let data = null;
        const rows = this.getMarkedRows();
        if (rows?.length > 0)
            data = rows;
        else
            data = null;
        if (this.config.updateSelectionCallback)
            this.config.updateSelectionCallback(data, this.config.name);
    }
    /****************************************************************************************************
     * Sets the active row from an event.
     *
     * @param {*} path - path of the event
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _setActiveRowByEvent(path) {
        this.isKeySelect = true;
        const row = this._getRowFromPath(path);
        if (row !== null) {
            const id = this._getIdFromRow(row);
            this.activerowdata = this.config.data.data.nodes[id - 1];
            this.scrollTopOld = this.$.grid.scrollTop;
            if (id === this.activerow) {
                this._setActiveRowById(this.activerow);
            }
            if (id > 0)
                this.activerow = id;
        }
        this.isKeySelect = false;
    }
    /********************************************************************************************************************************
     * Returns the id of a given row.
     *
     * @param {*} [row=null]
     * @returns {*}
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getIdFromRow(row = null) {
        let id = 0;
        if (row !== null) {
            if (row.getAttribute('id'))
                id = parseInt(row.getAttribute('id').substr(1), 10);
            else if (row.parentElement.getAttribute('id'))
                id = parseInt(row.parentElement.getAttribute('id').substr(1), 10);
        }
        return id;
    }
    /********************************************************************************************************************************
     * Returns the row with the given id.
     *
     * @param {Number} [id=0]
     * @returns {HTMLElement} Row.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getRowById(id = 0) {
        if (id > 0) {
            const row = this.shadowRoot?.getElementById('r' + id);
            if (row !== null) {
                return row;
            }
        }
        return null;
    }
    /********************************************************************************************************************************
     * Deselects the active row.
     *
     * @param {Boolean} [resetrow=false]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _clearActiveRow(resetrow = false) {
        const active = this.shadowRoot?.querySelector('tbody>tr.active');
        if (active) {
            active.classList.remove('active');
            if (resetrow)
                this.activerow = null;
        }
    }
    /********************************************************************************************************************************
     * Interface for _setActiveRowById.
     *
     * @param {Number} rowid
     * @param {Number} [_scrollTopOld = null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    scrollToRowActivate(rowid, _scrollTopOld = null) {
        if (rowid && this.activerow !== null) {
            if (rowid > 0) {
                if (this.config.data.params && this.config.data.params.scrolltoactiverow === true)
                    this._setActiveRowById(rowid, this.activerow, true, _scrollTopOld);
                else
                    this._setActiveRowById(rowid, this.activerow, false, _scrollTopOld);
            }
        }
    }
    /********************************************************************************************************************************
     * Scrolls to a row with the given id and selects it.
     *
     * @param {Number} _newid
     * @param {Number} _oldid
     * @param {Boolean} [_scroll=false]
     * @param {Number} [_scrollTopOld=null]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _setActiveRowById(_newid, _oldid, _scroll = false, _scrollTopOld = null) {
        const newid = Math.max(Math.min(_newid, this.maxrowscount), 1);
        if (this.config) {
            const row = this._getRowById(newid);
            this.activerow = newid;
            this._updateGridParam();
            if (row) {
                this._clearActiveRow();
                if (this.alreadyclicked || !this.selectRowAfterfirstClick) {
                    row.classList.add('active');
                }
                if (this.config.updateActiveRowCallback && row.dataset.data) {
                    this.config.updateActiveRowCallback(JSON.parse(row.dataset.data), this.config.name);
                }
                if (this.addactiverowtomultiselect === true)
                    this._updateSelectionData();
                let scroll = _scroll;
                let _scrollRow = newid - 1;
                this._setTopBottomRow();
                if (this.isKeySelect) {
                    if (this.activerow > this.bottomrow) {
                        _scrollRow = this.activerow - this.rowsperpage;
                        scroll = true;
                    }
                    else if (this.activerow <= this.toprow) {
                        _scrollRow = this.activerow - 1;
                        scroll = true;
                    }
                }
                SigPolymer.afterNextRender(this, function () {
                    this.sigSetTimeout(() => {
                        if (scroll) {
                            this.$.grid.scrollTop = Math.max(this.rowheight * _scrollRow, 0);
                        }
                        else if (this.config.data.params && this.config.data.params.keepposition === true || this.isSorting) {
                            if (!this.config.data.params.lazyloading && _scrollTopOld)
                                this.$.grid.scrollTop = _scrollTopOld;
                            this.config.data.params.keepposition = false;
                        }
                    }, 0);
                });
                this.activerowdata = this.config.data.data.nodes.filter((node) => node._id === _scrollRow)[0];
                if (this.isFiltering)
                    this.$.grid.scrollTop = Math.max(this.rowheight * (this.activerowdata ? this.activerowdata._id : 0), 0);
                this.isFiltering = false;
                this.isSorting = false;
                this.scrollTopOld = this.$.grid.scrollTop;
                this._setTopBottomRow();
            }
        }
    }
    /********************************************************************************************************************************
     * Refreshes the grid.
     *
     * @param {Boolean} newvalue
     * @param {Boolean} oldvalue
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    refreshGrid(newvalue, oldvalue) {
        this._updateGridParam();
    }
    /********************************************************************************************************************************
     * Returns the height of all rows added together.
     *
     * @param {Number} [id = 1]
     * @returns {Number} Height of all rows summed up.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    getAllRowsHeight(id = 1) {
        let _scrollHeight = 0;
        for (let ind = 0; ind < id; ind++)
            _scrollHeight += this._getRowHeightById(ind);
        return _scrollHeight;
    }
    /********************************************************************************************************************************
     * Returns all rows.
     *
     * @returns {NodeListOf<Element>} All rows.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    getAllRows() {
        if (this.shadowRoot) {
            const rows = this.shadowRoot.querySelectorAll('tbody tr');
            if (rows !== null)
                return rows;
        }
        return null;
    }
    /********************************************************************************************************************************
     * Returns the marked rows.
     *
     * @returns {*} Marked rows
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    getMarkedRows() {
        let _selectorActive = '';
        if (this.addactiverowtomultiselect === true)
            _selectorActive = ', tbody tr.active';
        const markedrows = this.shadowRoot?.querySelectorAll('tbody tr.marked' + _selectorActive);
        let rows = [];
        if (markedrows !== undefined) {
            for (const row of markedrows) {
                if (!row.classList.contains('parent') && !row.classList.contains('volume')) {
                    const data = JSON.parse(row.dataset.data);
                    rows.push(data);
                }
            }
            return rows;
        }
        return null;
    }
    /********************************************************************************************************************************
     * Returns the selected row.
     *
     * @returns {Element} Selected row.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    getActiveRow() {
        const row = this.shadowRoot?.querySelector('tbody tr.active');
        if (row) {
            if (!row.classList.contains('parent') && !row.classList.contains('volume')) {
                return row;
            }
        }
        return null;
    }
    /********************************************************************************************************************************
     * Marks all rows.
     *
     * @returns {Boolean} True - rows got marked.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    markAllRows() {
        const rows = this.shadowRoot?.querySelectorAll('tbody tr');
        if (rows && !this.disablemultiselect) {
            for (const row of rows) {
                if (!row.classList.contains('parent') && !row.classList.contains('volume')) {
                    row.classList.add('marked');
                }
            }
            this._updateSelectionData();
            return true;
        }
        return false;
    }
    /********************************************************************************************************************************
     * Clears the marked rows.
     *
     * @returns {Boolean} True - marked rows got cleared.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    clearMarkedRows() {
        const rows = this.shadowRoot?.querySelectorAll('tbody tr.marked');
        if (rows && !this.disablemultiselect) {
            for (const row of rows) {
                row.classList.remove('marked');
            }
            this._updateSelectionData();
            return true;
        }
        return false;
    }
    /********************************************************************************************************************************
     * Returns the number of rows that are visible at the same time.
     *
     * @returns {Number} Number of visible rows
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getRowsPerPage() {
        return Math.max(Math.floor((this.$.grid.clientHeight - this.headerheight) / this.rowheight), 0);
    }
    /********************************************************************************************************************************
     * Returns the height of a row with the given id.
     *
     * @param {number} [id=1]
     * @returns {Number} Height of one row.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getRowHeightById(id = 1) {
        const row = this._getRowById(id);
        if (row instanceof HTMLElement) {
            return getComputedStyle(row).height ? parseFloat(getComputedStyle(row).height) : -1;
        }
        else {
            return -1;
        }
    }
    /********************************************************************************************************************************
     * Returns the height of the first row.
     *
     * @returns {Number} Height of first row.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getFirstRowHeight() {
        const row = this.shadowRoot?.querySelector('tbody tr');
        if (row instanceof HTMLElement) {
            return getComputedStyle(row).height ? parseFloat(getComputedStyle(row).height) : -1;
        }
        else {
            return -1;
        }
    }
    /********************************************************************************************************************************
     * Returns the height of the rows.
     *
     * @returns {Number} Height of the rows.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getRowHeight() {
        let _rowheight = this._getRowHeightById(1);
        if (_rowheight === -1)
            _rowheight = this._getRowHeightById(this.offset + 1);
        if (_rowheight === -1)
            _rowheight = this._getFirstRowHeight();
        return _rowheight;
    }
    /********************************************************************************************************************************
     * Returns the number of rows.
     *
     * @returns {Number} Number of rows.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getRowsCount() {
        const rows = this.shadowRoot?.querySelectorAll('tbody tr');
        if (rows) {
            return rows.length;
        }
        return 0;
    }
    /****************************************************************************************************
     * Scrolls to the previous column.
     *
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    moveCursorLeft() {
        //get columns
        const columns = this.shadowRoot?.querySelectorAll("#thead-data th");
        if ((columns) && (columns.length > 0)) {
            //check which column has to be aligned to the left
            for (let i = 0; i < columns.length; i++) {
                if ((this.$.grid.scrollLeft > (columns[i].offsetLeft)) &&
                    (this.$.grid.scrollLeft <= (columns[i].offsetLeft + columns[i].offsetWidth))) {
                    this.$.grid.scrollLeft = columns[i].offsetLeft;
                    break;
                }
            }
        }
    }
    /****************************************************************************************************
     * Scrolls to the next column.
     *
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    moveCursorRight() {
        //get columns
        const columns = this.shadowRoot?.querySelectorAll("#thead-data th");
        if ((columns) && (columns.length > 0)) {
            //check which column has to be aligned to the left
            for (let i = 0; i < columns.length; i++) {
                if ((this.$.grid.scrollLeft >= (columns[i].offsetLeft)) &&
                    (this.$.grid.scrollLeft < (columns[i].offsetLeft + columns[i].offsetWidth))) {
                    this.$.grid.scrollLeft = columns[i].offsetLeft + columns[i].offsetWidth;
                    break;
                }
            }
        }
    }
    /****************************************************************************************************
     * Scrolls to the first column.
     *
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    columnToStart() {
        //simply set scrollLeft to most left
        this.$.grid.scrollLeft = 0;
    }
    /****************************************************************************************************
     * Scrolls to the last column.
     *
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    columnToEnd() {
        //simply set scrollLeft to most right
        this.$.grid.scrollLeft = this.$.grid.scrollWidth - this.$.grid.clientWidth;
    }
    /********************************************************************************************************************************
     * Scrolls to the next row.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorDown() {
        if (this.activerow !== null) {
            const newRow = this.activerow + 1;
            this.isKeySelect = true;
            if (newRow > 0 && newRow <= this.maxrowscount) {
                this.activerow = newRow;
                this.activerowdata = this.config.data.data.nodes[this.activerow - 1];
                this._scrolled(newRow, 1);
            }
        }
    }
    /********************************************************************************************************************************
     * Scrolls to the previous row.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorUp() {
        if (this.activerow !== null) {
            const newRow = this.activerow - 1;
            this.isKeySelect = true;
            if (newRow > 0 && newRow <= this.maxrowscount) {
                this.activerow = newRow;
                this.activerowdata = this.config.data.data.nodes[this.activerow - 1];
                this._scrolled(newRow, -1);
            }
        }
    }
    /********************************************************************************************************************************
     * Scrolls to the first row.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorTop() {
        this.isKeySelect = true;
        this.activerow = 1;
        this.activerowdata = this.config.data.data.nodes[this.activerow - 1];
        this._scrolled(0, 1);
    }
    /********************************************************************************************************************************
     * Scrolls to the last row.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorBottom() {
        this.isKeySelect = true;
        this.activerow = this.maxrowscount;
        this.activerowdata = this.config.data.data.nodes[this.activerow - 1];
        this._scrolled(this.activerow, 1);
    }
    /********************************************************************************************************************************
     * Scrolls to the defined row.
     *
     * @param {Number} [row = 0] Row number
     * @param {Number} [_scrolldirection = 0] Scroll direction
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorToRow(row = 0, _scrolldirection = 0) {
        let _row = row;
        this.isKeySelect = true;
        if (Array.isArray(_row))
            _row = _row[0];
        if (_row > 0 && _row <= this.maxrowscount) {
            this.activerow = _row;
            this.activerowdata = this.config.data.data.nodes[this.activerow - 1];
            this._scrolled(_row, _scrolldirection);
        }
    }
    /********************************************************************************************************************************
     * Srolls one page (visible rows) down.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorPageDown() {
        if (this.activerow !== null) {
            const newrow = Math.min(this.activerow + this.rowsperpage - 1, this.maxrowscount);
            this.moveCursorToRow(newrow, 1);
        }
    }
    /********************************************************************************************************************************
     * Scrolls one page (visible rows) up.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    moveCursorPageUp() {
        if (this.activerow !== null) {
            const newrow = Math.max(this.activerow - this.rowsperpage + 1, 1);
            this.moveCursorToRow(newrow, -1);
        }
    }
    /********************************************************************************************************************************
     * Scrolls to the left.
     *
     * @param {number} [delta=1]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _scrollLeft(delta = 1) {
        this.$.grid.scrollLeft -= delta;
    }
    /********************************************************************************************************************************
     * Scrolls to the right.
     *
     * @param {number} [delta=1]
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _scrollRight(delta = 1) {
        this.$.grid.scrollLeft += delta;
    }
    /********************************************************************************************************************************
     * Called when the key 'enter' was pressed.
     *
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _handleActionOnEnter() {
        if (this.readonly === false) {
            if (this.activerow !== null) {
                const row = this._getRowById(this.activerow);
                if (row?.dataset.data) {
                    if (this.config.onEnterCallback)
                        this.config.onEnterCallback(JSON.parse(row.dataset.data), this.config.name);
                }
            }
        }
    }
    /********************************************************************************************************************************
     * Debounces a click on the listview body.
     *
     * @param {*} evt Event
     * @memberof LasalRuntimeSigControlListView
     **********************************************************************************************************************************/
    _debounceClick(evt) {
        const path = evt.path || evt.composedPath();
        //get row and column of event
        const row = this._getRowFromPath(path);
        const column = this._getColumnFromPath(path);
        //check if debounce timeout active
        if (this._clickDebouncer !== undefined) {
            this.sigClearTimeout(this._clickDebouncer);
            this._clickDebouncer = undefined;
            //check if same cell
            if ((row === this.clickInfo.row) && (column === this.clickInfo.column)) {
                //!!! input parameters can be changed as row and column already known !!!
                this._doubleClick(path);
                return;
            }
            else {
                //call click with previous data
                this._click(this.clickInfo.path);
            }
        }
        //get row and column to check for double click
        this.clickInfo = {
            path: path,
            row: row,
            column: column
        };
        //set timeout to check for double click
        this._clickDebouncer = this.sigSetTimeout(() => {
            //!!! input parameters can be changed as row and column already known !!!
            this._click(path);
            this._clickDebouncer = undefined;
        }, this.clickdelay);
    }
    /****************************************************************************************************
     * Returns the className of the column on which was clicked.
     *
     * @param {*} path Path of event targets
     * @return {*}  Class name of clicked column.
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _getColumnFromPath(path) {
        if (path) {
            const tmpArray = path.filter((item) => item.tagName === "TD");
            return tmpArray[0] ? tmpArray[0].className : null;
        }
        return null;
    }
    /****************************************************************************************************
     * Is called when a click on the listview body was made.
     *
     * @param {*} path - path of the event
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _click(path) {
        if (this.readonly === false && !this.isdesignmode) {
            this.alreadyclicked = true;
            this._setActive();
            this._setActiveRowByEvent(path);
            if (this.activerow !== null) {
                const row = this._getRowById(this.activerow);
                const column = this._getColumnFromPath(path);
                if (row?.dataset.data) {
                    if (this.config.clickCallback)
                        this.config.clickCallback(JSON.parse(row.dataset.data), this.config.name, column);
                }
            }
        }
    }
    /****************************************************************************************************
     * Called when a double click on the listview body was made.
     *
     * @param {*} path - path of the event
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _doubleClick(path) {
        if (this.readonly === false) {
            this.alreadyclicked = true;
            this._setActive();
            this._setActiveRowByEvent(path);
            if (this.activerow !== null) {
                const row = this._getRowById(this.activerow);
                const column = this._getColumnFromPath(path);
                if (row?.dataset.data) {
                    if (this.config.doubleClickCallback)
                        this.config.doubleClickCallback({ row: JSON.parse(row.dataset.data), lazyloading: { underflow: this.underflow, overflow: this.overflow } }, this.config.name, column);
                }
            }
        }
    }
    /****************************************************************************************************
     * Called when a longpress on the listview body was made.
     *
     * @param {*} path - path of the event
     * @memberof LasalRuntimeSigControlListView
     ****************************************************************************************************/
    _longPress(path) {
        if (this.readonly === false) {
            //get row and column
            const row = this._getRowFromPath(path);
            if ((row === null) || (!row.dataset.data)) {
                this._log('_longPress(): invalid row', 'ERROR');
                return;
            }
            const column = this._getColumnFromPath(path);
            if (column === null) {
                this._log('_longPress(): invalid column', 'ERROR');
                return;
            }
            this.alreadyclicked = true;
            this._setActive();
            //check if multiselection is disabled -> row is set active in that case
            if (this.disablemultiselect) {
                this._setActiveRowByEvent(path);
            }
            else {
                this._markRowById(this._getIdFromRow(row));
            }
            if (this.config.longPressCallback)
                this.config.longPressCallback(JSON.parse(row.dataset.data), this.config.name, column);
        }
    }
    /********************************************************************************************************************************
     * Called when a key was pressed.
     *
     * @param {*} evt Event
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _keydown(evt) {
        const key = evt.keyCode;
        const ctrlKey = evt.ctrlKey;
        const shiftKey = evt.shiftKey;
        const altKey = evt.altKey;
        if (this.readonly === false) {
            switch (key) {
                case 13:
                    this._handleActionOnEnter();
                    break;
                case 65:
                    if (ctrlKey && !shiftKey && !altKey) {
                        this.markAllRows();
                    }
                    else if (ctrlKey && shiftKey && !altKey) {
                        this.clearMarkedRows();
                    }
                    break;
                case 32:
                    evt.preventDefault();
                    this._markRowById(this.activerow);
                    break;
                case 33:
                    evt.preventDefault();
                    this.moveCursorPageUp();
                    break;
                case 34:
                    evt.preventDefault();
                    this.moveCursorPageDown();
                    break;
                case 35:
                    evt.preventDefault();
                    this.moveCursorBottom();
                    break;
                case 36:
                    evt.preventDefault();
                    this.moveCursorTop();
                    break;
                case 37:
                    this._scrollLeft(this.scrolldeltax);
                    break;
                case 38:
                    evt.preventDefault();
                    this.moveCursorUp();
                    break;
                case 39:
                    this._scrollRight(this.scrolldeltax);
                    break;
                case 40:
                    evt.preventDefault();
                    this.moveCursorDown();
                    break;
                default:
                    this._log(key);
                    break;
            }
        }
    }
    /********************************************************************************************************************************
     * Saves the number of the first and last visible row at the current page (starts with 1).
     *
     * @param {*} evt Event
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _setTopBottomRow(evt) {
        const _toprow = (this.$.grid.scrollTop + this.rowheight + 1) / this.rowheight;
        if (!isNaN(_toprow)) {
            this.toprow = _toprow;
            if (this.toprow + this.rowsperpage <= this.maxrowscount)
                this.bottomrow = this.toprow + this.rowsperpage - 1;
            else
                this.bottomrow = this.maxrowscount;
        }
    }
    /********************************************************************************************************************************
     * Returns the height of the header.
     *
     * @returns {Number} Header hight.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _getHeaderHeight() {
        if (this.hideheader)
            return 0;
        const _headerheight = parseInt(getComputedStyle(this).getPropertyValue('--theme-sig-control-listview-header-height'), 10);
        if (!isNaN(_headerheight))
            return _headerheight;
        const header = this.shadowRoot?.querySelector('#data>thead');
        if (header)
            return header.offsetHeight;
        else
            return 0;
    }
    /********************************************************************************************************************************
     * Saves the data of the active row.
     *
     * @param {Number} id Active row id
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    _backupRow(id) {
        const row = this._getRowById(id);
        if (row !== null) {
            this.oldrow.id = id;
            if (row?.dataset.data) {
                this.oldrow.data = JSON.parse(row.dataset.data);
            }
        }
    }
    /********************************************************************************************************************************
     * Will be called when the runtime activates/deactivates the viewmodel of the component (usually when it is shown or hidden).
     *
     * @param {Boolean} active True if component is active, false if component is inactive.
     * @memberof LasalRuntimeSigControlListView
     ********************************************************************************************************************************/
    sigOnActiveStateChange(active) {
        super.sigOnActiveStateChange(active);
        // add and remove the outside tap event listener here, so it is only called when the component is active  
        if (active) {
            this.sigAddEventListener('down', this._onOutsideTap, 'polymerEvent', window);
        }
        else {
            this.sigRemoveEventListener('down', this._onOutsideTap, 'polymerEvent', window);
        }
    }
}
customElements.define(LasalRuntimeSigControlListView.is, LasalRuntimeSigControlListView);
//# sourceMappingURL=sig-control-listview.js.map