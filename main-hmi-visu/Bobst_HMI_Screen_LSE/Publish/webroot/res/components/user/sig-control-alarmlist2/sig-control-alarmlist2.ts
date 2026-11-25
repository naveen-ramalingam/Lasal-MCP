import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import type {LasalRuntimeSigControlListView} from '../sig-control-listview/sig-control-listview.js'
import type {LasalRuntimeSigTitlebarElement} from '../sig-control-titlebar/sig-control-titlebar.js'
import { fontObject } from '../../sigmatek/sig-element-mixins/base-mixin.js';

import "../sig-control-listview/sig-control-listview.js";
import "../sig-control-listview/sig-control-listview-css.js";
import "../sig-control-titlebar/sig-control-titlebar.js"
import '../sig-control-titlebar/sig-control-titlebar-css.js'

import './moment-with-locales/moment-with-locales.js';

declare global {
    interface Window {
        moment: any
    }
    type alarmDataType = { state: number, quit: boolean, dateHiLast: number,timeHiLast: number, dateLo: number, timeLo:number, dateQuit: number, timeQuit: number }
    type sortDataType = { key: string, sorttype: string  }
    
}

/****************************************************************************************************
* @class LasalRuntimeSigControlAlarmlist2
* @classdesc Implements sig-control-alarmlist2
* @version 02.03.000
* @extends {LasalRuntimeSigElement}
*
* @property {SigApi.ApiAlarm} alarmApi The reference to the Alarm API object.
* @property {SigApi .ApiAlarmConfig} alarmConfigApi The reference to the AlarmConfig API object.
* @property {SigApi.ApiSigUtils} utilsApi The reference to the SigUtils API object.
* @property {SigApi.ApiTextManager} textApi The reference to the TextManager API object.
* @property {SigApi.ApiWindowManager} windowApi The reference to the WindowManager API object.
* @property {SigApi.ApiSigConst} constApi The reference to the SIG_CONST API object.
* @property {String} deletemode Defines which alarms can be deleted.
* @property {Boolean} acknactiveondelete Active alarms get acknowledge on delete.
* @property {String} opendetailviewevent Defines the event on the row, which opens the detail view of the alarm.
* @property {Number} lazyloadingbuffersize buffer size for lazy loading
* @property {Number} lazyloadingmargin  maring size for lazy loading
* @property {Boolean} sortChanged merker to check if sorting was already done or not
* @property {sortDataType} sortdata sort data options
* @property {String} sigDateTimeFormat date time format
* @property {Boolean} reqPropsReady required properties are ready
* @property {Boolean} isReady ready function was called
* @property {Function} listviewSetSortMethod original function of sig-control-listview (_setSort)
* @property {HTMLStyleElement} rowFontStyle font style element for row
* @property {Function} _titlebarComputeTextFunct original function of sig-control-listview  _computeText
* @property {Boolean} initialized _init function was called
* @property {SigPolymer.debouncer} debouncer polymer debouncer
* @property {HTMLStyleElement} alarmConfigStyle font style element for alarm
* @property {Map<SigApi.Property,string>} alarmConfigFontObservers Map of font obersers
* @property {String} detailwindow A window showing the details of the selected Alarm.
* @property {*} fontMap unknown
* @property {String} alarmgroupfiltermode - Mode for alarm group filtering
****************************************************************************************************/
class LasalRuntimeSigControlAlarmlist2 extends LasalRuntimeSigElement {
    
    /****************************************************************************************************
    * Define the custom tag name
    *
    * @readonly
    * @static
    * @type {string}
    * @memberof LasalRuntimeSigControlAlarmlist2
    ****************************************************************************************************/
    static get is(): string {
        return "sig-control-alarmlist2";
    }

    
    /****************************************************************************************************
    * When the element is loaded, importMeta() assigns reference to the path from 
    * which an element was imported to its importPath property. 
    * Relative URLs in styles are automatically re-written to be relative to the importPath property. 
    * You can use [[importPath]] in your component to load url resources
    *
    * @readonly
    * @static
    * @type {ImportMeta}
    * @memberof LasalRuntimeSigControlAlarmlist2
    ****************************************************************************************************/
    static get importMeta(): ImportMeta { return import.meta; }

    
    /****************************************************************************************************
    * Return the component style and template as a template literal
    *
    * @readonly
    * @static
    * @type {HTMLTemplateElement}
    * @memberof LasalRuntimeSigControlAlarmlist2
    ****************************************************************************************************/
    static get template(): HTMLTemplateElement {
        return SigPolymer.html`
        <style include="sig-element-css sig-control-listview-css sig-control-titlebar-css sig-control-scrollbar-css">
            :host {
                /* Basic styling of the component */
                color: var(--theme-sig-control-alarmlist2-color, inherit);
                background-color: var(--theme-sig-control-alarmlist2-background-color, transparent);

                border-width: var(--theme-sig-control-alarmlist2-border-width, 0px);
                border-color: var(--theme-sig-control-alarmlist2-border-color, inherit);
                border-style: var(--theme-sig-control-alarmlist2-border-style, none);
                border-radius: var(--theme-sig-control-alarmlist2-border-radius, 0px);

                /* Basic box model settings */
                display: block;
                position: absolute;
                overflow: hidden;
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

            .sig-control-alarmlist2 {
                /* should be relative for use in designer */
                position: relative;
                width: 100%;
                height: 100%;     
                /* use flexbox to automatically fill up left space for list container */
                display: flex;
                flex-flow: column;                    
            }

            :host([hidetitle]) #titlebar {
                display: none !important;
            }

            #titlebar {
                position: unset;
                width:100%;
                height: var(--theme-sig-element-height, 26px); 
                flex: 1 0 100%;
            }

            #gridContainer {
                position: relative;
                flex: auto;
                height: 0;
            }

            #alarmlistgrid {
                /* overwrite the background color of the listview with that from the alarmlist */
                --theme-sig-control-listview-background-color: var(--theme-sig-control-alarmlist2-background-color, transparent) !important;   
                position: relative;
                top:0;
                left:0;
                height:100%;
                width:100%;
            }
            
        </style>
        <div id="alarmlist" class="sig-control-alarmlist2 clearfix">
            <sig-control-titlebar id="titlebar" value="[[alarmlisttitletext]]"></sig-control-titlebar>
            <div id="gridContainer" >
                <sig-control-listview id="alarmlistgrid"></sig-control-listview>
            </div>
        </div>`
    }

    
    //Polymer properties type definition
    hideheader: boolean
    hidetitle: boolean
    alarmlisttitletext: string
    readonly: boolean
    datetimeformat: string
    showalarmnr: boolean
    shownum: boolean
    showshorttext: boolean
    showtimehigh: boolean
    showtimelow: string
    showsymbol: boolean
    showgroup: boolean
    orderalarmnr: number
    ordernum: number
    ordershorttext: number
    ordertimehigh: number
    ordertimelow: number
    ordersymbol: number
    ordergroup: number
    widthalarmnr: string
    widthnum: string
    widthshorttext: string
    widthtimehigh: string
    widthtimelow: string
    widthsymbol: string
    widthgroup: string
    alarmnrheadertext: string
    countheadertext: string
    shorttextheadertext: string
    timehighheadertext: string
    timelowheadertext: string
    symbolheadertext: string
    groupheadertext: string
    sortoptionsactivetop: boolean
    alarmstatefilter: string
    filter_alarmgroup: number
    excludefilteralarmgroup: number
    headertextalignalarmnr: string
    headertextalignnum: string
    headertextalignshorttext: string
    headertextaligntimehigh: string
    headertextaligntimelow: string
    headertextalignsymbol: string
    headertextaligngroup: string
    textalignalarmnr: string
    textalignnum: string
    textalignshorttext: string
    textaligntimehigh: string
    textaligntimelow: string
    textalignsymbol: string
    textaligngroup: string
    selectedalarmid: number
    selectedalarmnr: number
    selectedalarmdescription: string
    activeinactivegap: string
    groupspace: string
    activeinactiveheadergap: string
    descmultiline: boolean
    hideinactivetime: boolean
    alarmtext: string
    alarmdescription: string
    defaultsorting: string
    defaultsortingdir: string
    $: {alarmlistgrid: LasalRuntimeSigControlListView , titlebar:LasalRuntimeSigTitlebarElement}
    
    /****************************************************************************************************
     * Method gets called by runtime to fetch polymer properties
     *
     * @readonly
     * @static
     * @memberof LasalRuntimeSigControlAlarmlist2
     * 
     * @property {String} defaultsortingdir             - Sorting direction for the initial sorting of the list.
     * @property {String} defaultsorting                - Sorting criteria which is used for initial sorting of the list.
     * @property {String} alarmdescription              - Defines which text of the alarm datapoint configuration is used for the alarm description.
     * @property {String} alarmtext                     - Defines which text of the alarm datapoint configuration is displayed as the alarm text.
     * @property {Boolean} hideinactivetime             - Hide inactive time if alarm is active again.
     * @property {Boolean} descmultiline                - If true, the description can be multiple lines.
     * @property {String} activeinactiveheadergap       - The gap between the active and inactive alarm time header text.
     * @property {String} groupspace                    - Space between the image and the text if configured in alarmconfig.
     * @property {String} activeinactivegap             - The gap between the active and inactive alarm time.
     * @property {String} selectedalarmdescription      - Description of the selected alarm is written to this datapoint.
     * @property {Number} selectedalarmnr               - Alarm number of the selected alarm is written to this datapoint.     
     * @property {Number} selectedalarmid               - Variable number of the selected alarm.
     * @property {String} textaligngroup                - The alignment of the column text.
     * @property {String} textalignsymbol               - The alignment of the column text.
     * @property {String} textaligntimelow              - The alignment of the column text.
     * @property {String} textaligntimehigh             - The alignment of the column text.
     * @property {String} textalignshorttext            - The alignment of the column text.
     * @property {String} textalignnum                  - The alignment of the column text.
     * @property {String} textalignalarmnr              - The alignment of the column text. 
     * @property {String} headertextaligngroup          - The alignment of the header text.
     * @property {String} headertextalignsymbol         - The alignment of the header text.
     * @property {String} headertextaligntimelow        - The alignment of the header text. 
     * @property {String} headertextaligntimehigh       - The alignment of the header text.
     * @property {String} headertextalignnum            - The alignment of the header text.
     * @property {String} headertextalignalarmnr        - The alignment of the header text. 
     * @property {Number} filter_alarmgroup             - A datapoint to filter specific alarm groups.
     * @property {Number} excludefilteralarmgroup       - A datapoint to filter out specific alarm groups.
     * @property {String} alarmstatefilter              - Select the state of the alarms which should be filtered out. The Alarms with those states will no longer be visible in the list
     * @property {Boolean} sortoptionsactivetop         - Active alarms will be displayed at the top.
     * @property {String} groupheadertext               - Sets the name of the column.
     * @property {String} symbolheadertext              - Sets the name of the column.
     * @property {String} timelowheadertext             - Column settings: alarm inactive
     * @property {String} timehighheadertext            - Column settings: alarm active
     * @property {String} shorttextheadertext           - Sets the name of the column.
     * @property {String} countheadertext               - Sets the name of the column.
     * @property {String} alarmnrheadertext             - Sets the name of the column.
     * @property {String} widthgroup                    - The width of the column.
     * @property {String} widthsymbol                   - The width of the column.
     * @property {String} widthtimelow                  - The width of the column
     * @property {String} widthtimehigh                 - The width of the column
     * @property {String} widthshorttext                - The width of the column  
     * @property {String} widthnum                      - The width of the column
     * @property {String} widthalarmnr                  - The width of the column
     * @property {Number} ordergroup                    - The Position where the column should be shown
     * @property {Number} ordersymbol                   - The Position where the column should be shown
     * @property {Number} ordertimelow                  - The Position where the column should be shown
     * @property {Boolean} hideheader                   - Show or hide the header.
     * @property {Boolean} hidetitle                    - Show or hide the title.
     * @property {String} alarmlisttitletext            - Sets the text of the titlebar.
     * @property {Boolean} readonly                     - Sets component to readonly mode - no actions will be dispatched.
     * @property {String} datetimeformat                - The format for the date/time.
     * @property {Boolean} showalarmnr                  - If true, the column is shown
     * @property {Boolean} shownum                      - If true, the column is shown
     * @property {Boolean} showshorttext                - If true, the column is shown
     * @property {Boolean} showtimehigh                 - If true, the column is shown
     * @property {String} showtimelow                   - Defines if and where the inactive time of the alarm should be shown.
     * @property {Boolean} showsymbol                   - If true, the column is shown
     * @property {Boolean} showgroup                    - If true, the column is shown
     * @property {Number} orderalarmnr                  - The Position where the column should be shown
     * @property {Number} ordernum                      - The Position where the column should be shown
     * @property {Number} ordershorttext                - The Position where the column should be shown
     * @property {Number} ordertimehigh                 - The Position where the column should be shown
     *              
     ****************************************************************************************************/
    static get properties(): object {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            hideheader: {
                type: Boolean,
                value: false,
                observer: '_updateHeaderState'
            },
            hidetitle: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            alarmlisttitletext: {
                type: String,
                value: 'Alarmlist'
            },
            readonly: {
                type: Boolean,
                value: false,
                observer: '_updateReadOnly'
            },
            datetimeformat: {
                type: String,
                value: "DD.MM.YYYY HH:mm:ss",
                observer: '_updateData'
            },
            /* Column Visibility */
            showalarmnr: {
                type: Boolean,
                value: true,
                observer: '_updateColumns'
            },
            shownum: {
                type: Boolean,
                value: false,
                observer: '_updateColumns'
            },
            showshorttext: {
                type: Boolean,
                value: true,
                observer: '_updateColumns'
            },
            showtimehigh: {
                type: Boolean,
                value: true,
                observer: '_updateColumns'
            },
            showtimelow: {
                type: String,
                value: "own",
                observer: '_updateColumns'
            },
            showsymbol: {
                type: Boolean,
                value: false,
                observer: '_updateColumns'
            },
            showgroup: {
                type: Boolean,
                value: false,
                observer: '_updateColumns'
            },
            /* Column Order */
            orderalarmnr:{
                type: Number,
                value: 10,
                observer: '_updateColumns'
            },
            ordernum:{
                type: Number,
                value: 50,
                observer: '_updateColumns'
            },
            ordershorttext:{
                type: Number,
                value: 40,
                observer: '_updateColumns'
            },
            ordertimehigh:{
                type: Number,
                value: 20,
                observer: '_updateColumns'
            },
            ordertimelow:{
                type: Number,
                value: 30,
                observer: '_updateColumns'
            },
            ordersymbol:{
                type: Number,
                value: 70,
                observer: '_updateColumns'
            },
            ordergroup:{
                type: Number,
                value: 60,
                observer: '_updateColumns'
            },
            /* /Column Order */

            /* Column Width */
            widthalarmnr: {
                type: String,
                value: '50px',
                observer: '_updateColumns'
            },
            widthnum: {
                type: String,
                value: '60px',
                observer: '_updateColumns'
            },
            widthshorttext: {
                type: String,
                value: '532px',
                observer: '_updateColumns'
            },
            widthtimehigh: {
                type: String,
                value: '160px',
                observer: '_updateColumns'
            },
            widthtimelow: {
                type: String,
                value: '160px',
                observer: '_updateColumns'
            },
            widthsymbol: {
                type: String,
                value: '70px',
                observer: '_updateColumns'
            },
            widthgroup: {
                type: String,
                value: '60px',
                observer: '_updateColumns'
            },
            /* /Column Width */

            /* Column Titles */
            alarmnrheadertext: {
                type: String,
                value: 'No',
                observer: '_updateColumns'
            },
            countheadertext: {
                type: String,
                value: 'Cnt',
                observer: '_updateColumns'
            },
            shorttextheadertext: {
                type: String,
                value: 'Alarm Text',
                observer: '_updateColumns'
            },
            timehighheadertext: {
                type: String,
                value: 'Alarm Active',
                observer: '_updateColumns'
            },
            timelowheadertext: {
                type: String,
                value: 'Alarm Inactive',
                observer: '_updateColumns'
            },
            symbolheadertext: {
                type: String,
                value: 'Symbol',
                observer: '_updateColumns'
            },
            groupheadertext: {
                type: String,
                value: 'Group',
                observer: '_updateColumns'
            },
            /* /ColumnSettings */

            /* sort options*/
            sortoptionsactivetop: {
                type: Boolean,
                value: false,
                observer: '_updateData'
            },
            /* /sort options*/

            /* filter options*/
            alarmstatefilter: {
                type: String,
                value: 'none',
                observer: '_updateData'
            },
            /* /filter options*/

            filter_alarmgroup: {
                type: Number,
                value: undefined,
                observer: '_updateData'
            },
            excludefilteralarmgroup: {
                type: Number,
                value: undefined,
                observer: '_updateData'
            },

            /*Header text align*/
            headertextalignalarmnr: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextalignnum: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextalignshorttext: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextaligntimehigh: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextaligntimelow: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextalignsymbol: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            headertextaligngroup: {
                type: String,
                value: 'left',
                observer: '_updateColumns'
            },
            /*/Header text align*/

            /*Column text align*/
            textalignalarmnr: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textalignnum: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textalignshorttext: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textaligntimehigh: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textaligntimelow: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textalignsymbol: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            textaligngroup: {
                type: String,
                value: undefined,
                observer: '_updateColumns'
            },
            /*/Column text align*/
            selectedalarmid: {
                type: Number,
                value: -1,
                notify: true
            },            
            selectedalarmnr: {
                type: Number,
                value: -1,
                notify: true
            },
            selectedalarmdescription: {
                type: String,
                value: "",
                notify: true
            },
            activeinactivegap: {
                type: String,
                value: "5px",
                observer: '_updateData'
            },
            groupspace: {
                type: String,
                value: "10px",
                observer: '_updateData'
            },
            activeinactiveheadergap: {
                type: String,
                value: "2px",
                observer: "_updateMultiLineHeader"
            },
            descmultiline: {
                type: Boolean,
                value: false,
                observer: "_updateColumns"
            },
            hideinactivetime: {
                type: Boolean,
                value: true,
                observer: "_updateData"
            },
            alarmtext: {
                type: String,
                value: 'text1',
                observer: '_updateData'
            },
            alarmdescription: {
                type: String,
                value: 'text2',
                observer: '_updateData'
            },
            defaultsorting: {
                type: String,
                value: 'none',
                observer: '_updateDefaultSorting'
            },
            defaultsortingdir: {
                type: String,
                value: 'asc',
                observer: '_updateDefaultSorting'
            }              
        }
        return props;
    }


    //Member properties type definition
    alarmApi: SigApi.ApiAlarm
    alarmConfigApi: SigApi .ApiAlarmConfig
    utilsApi: SigApi.ApiSigUtils
    textApi: SigApi.ApiTextManager
    windowApi: SigApi.ApiWindowManager
    constApi: SigApi.ApiSigConst
    deletemode: string
    acknactiveondelete: boolean
    opendetailviewevent: string
    lazyloadingbuffersize: number
    lazyloadingmargin: number
    sortChanged: boolean
    sortdata: sortDataType
    sigDateTimeFormat: string
    reqPropsReady: boolean
    isReady: boolean
    listviewMarkRowByEventMethod: Function
    listviewSetSortMethod: Function
    rowFontStyle: HTMLStyleElement
    _titlebarComputeTextFunct: Function
    initialized: boolean
    debouncer: SigPolymer.debouncer
    alarmConfigStyle: HTMLStyleElement
    alarmConfigFontObservers: Map<SigApi.Property,string>
    detailwindow: string
    fontMap: any
    alarmgroupfiltermode: string
    
    /****************************************************************************************************
     * Gets called whren control is created
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    constructor() {
        super();
        
        //get api references
        this.alarmApi = window.sigApi.alarm;
        this.alarmConfigApi = window.sigApi.alarmConfig;
        this.utilsApi = window.sigApi.sigUtils
        this.textApi = window.sigApi.textManager;
        this.windowApi = window.sigApi.windowManager;
        this.constApi = window.sigApi.SIG_CONST;

        //init default values
        this.deletemode = 'inactive';
        this.acknactiveondelete = true;
        this.opendetailviewevent = 'dontopen';
        this.lazyloadingbuffersize = 50;
        this.lazyloadingmargin = 10;
        this.alarmgroupfiltermode = 'Exact match';

        //merker to check if sorting was already done or not
        this.sortChanged = false;

        //initialize sort data
        this.sortdata = {
            sorttype: 'none',
            key : 'asc'
        };

        //add required properties before initializing grid to avoid change of layout if properties
        //get initialized after grid init
        this._addRequiredProps();

        //default date time format if nothing else configured
        this.sigDateTimeFormat = 'DD.MM.YYYY HH:mm:ss';
    }

    /****************************************************************************************************
     * Add required properties to avoid layout change if properties get initialized after grid was 
     * initialized
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _addRequiredProps(): void {
        //discuss if best option to iterate through polymerprops
        let props = (this.constructor as any).properties;
        for (let name in props) {
            this.sigAddRequiredProperty(name);
        }         
    }


    /****************************************************************************************************
     * Is called if required properties are ready
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    sigOnRequiredPropertiesReady(): void {
        super.sigOnRequiredPropertiesReady();
        this.reqPropsReady = true;
        if (this.isReady) {
            this._init();
        }
    }


    /****************************************************************************************************
     * Gets called if component is attached to dom and default values of properties are loaded
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    ready(): void {
        super.ready();

        //overwrite sort mehtod cause if the header cell of active inactive time is clicked
        //the composed path references to the divs for displaying both header texts
        //in this case the sorting method fails cause it works only with the th tag
        this.listviewSetSortMethod = this.$.alarmlistgrid._setSort.bind(this.$.alarmlistgrid);
        this.$.alarmlistgrid._setSort = (_elem, _setsorttype = null) => {
            //check if it isn't the header cell
            if (_elem.nodeName !== "TH") {
                //get header cell to move on with sort
                _elem = _elem.closest("th");
            }
            //call original function
            this.listviewSetSortMethod(_elem, _setsorttype);
        }

        //set ready flag
        this.isReady = true;

        //add font-style if available
        if ((this.rowFontStyle) && (this.rowFontStyle.isConnected === false)) {
            this.$.alarmlistgrid.shadowRoot!.appendChild(this.rowFontStyle);
        }     
        
        this._titlebarComputeTextFunct = this.$.titlebar._computeText;
        this.$.titlebar._computeText = (_value, _previewtext, _isstylepreview) => this._updateTitleText(_value, _previewtext, _isstylepreview);        

        if (!this.isdesignmode) {
            //add eventlisteners
            this._addEventListeners();
            //get alarm configs and build style tag of it
            //alarmconfig only available during runtime
            this._setAlarmConfigStyles();   
            //check if properties ready
            if (this.reqPropsReady) {
                //initialize list
                this._init();            
            }
        }
        else {
            //in designmode required properties don't work
            this._init();
        }
    }


     /****************************************************************************************************
      * Gets called if row was selected
      *
      * @param {*} data - row data
      * @param {*} pane - pane data
      * @memberof LasalRuntimeSigControlAlarmlist2
      ****************************************************************************************************/
     _updateActiveRow(data: any, pane: any): void {
        //check if cell was focused or defocused
        if (data) {
            //write alarm variable number on datapoint
            this.selectedalarmid = data.varno;
            //write alarmnumber on datapoint
            this.selectedalarmnr = data.alarmNr;
            //write long text on datapoint
            this.selectedalarmdescription = data.text2;
        }   
        else {
            //cell got defocused so reset values of selected alarm
            this.selectedalarmid = -1;
            this.selectedalarmnr = -1;
            this.selectedalarmdescription = "";
        }            
    }


    /****************************************************************************************************
     * Gets called if row was clicked
     *
     * @param {*} data - data of the row
     * @param {*} pane - pane data
     * @param {*} col - column data
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _clickCallback(data: any, pane: any, col: any): void {
        //check if detail window should be opened by this event
        if (this.opendetailviewevent === "click") {
            this._openDetailWindow();
        }
    }


    /****************************************************************************************************
     * Gets called if row was double clicked
     *
     * @param {*} data - data of clicked row
     * @param {*} pane - pane data
     * @param {*} col - column data
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _doubleClickCallback(data: any, pane: any, col: any): void {
        //check if detail window should be opened by this event
        if (this.opendetailviewevent === "double-click") {
            this._openDetailWindow();
        }
    }    


    /****************************************************************************************************
     * Gets called if row was long pressed
     *
     * @param {*} data - data of clicked row
     * @param {*} pane - pane data
     * @param {*} col - column data
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _longPressCallback(data: any, pane: any, col: any): void {
        //check if detail window should be opened by this event
        if (this.opendetailviewevent === "long-press") {
            this._openDetailWindow();
        }
    } 


    /****************************************************************************************************
     * Gets called if grid was rendered
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _onRenderReadyCallback(data:any, pane:any): void {
        //check if active and inactive time should be displayed in one column
        if (this.showtimelow === 'active') {
            //get active column header cell
            const timeHiHead = this.$.alarmlistgrid.shadowRoot!.querySelector("#thead-timeHiStr");
            if (timeHiHead) {
                //delete textcontent
                timeHiHead.textContent = '';
                //create container div
                let containerDiv = document.createElement("div");
                containerDiv.id = "containerHeadActiveInactive";
                //set properties for displaying multiline
                containerDiv.style.setProperty("display", "flex");
                containerDiv.style.setProperty("flex-direction", "column");
                containerDiv.style.setProperty("gap", `${parseInt(this.activeinactiveheadergap)}px`);
                //reset line-height to avoid inheriting of table header
                containerDiv.style.setProperty("line-height", "normal");
                containerDiv.style.setProperty("height", "var(--theme-sig-control-listview-header-height, 26px)");
                containerDiv.style.setProperty("justify-content", "center");
                //create div for active time entry
                let activeDiv = document.createElement("div");
                activeDiv.innerText = this.timehighheadertext;
                //append active text
                containerDiv.appendChild(activeDiv);
                //create div for inactive time entry
                let inactiveDiv = document.createElement("div");
                inactiveDiv.innerText = this.timelowheadertext;
                //append active text
                containerDiv.appendChild(inactiveDiv); 
                //append container to header cell
                timeHiHead.appendChild(containerDiv);               
            }
        }

    }

    /****************************************************************************************************
     * Method is used to initialize the list
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _init(): void {

        //set default sort data
        this.sortdata = {
            key: this.defaultsorting,
            sorttype: this.defaultsortingdir,
        };

        //initialize listview properties
        this._initProps();

        //calculate lazyloading sizes
        const listControlBounds = this.getControlBounds(this.$.alarmlistgrid);
        if (listControlBounds !== null) {
            const numberOfVisibleRows = (listControlBounds.height - parseInt(this.$.alarmlistgrid.headerheight as any)) / parseInt(this.$.alarmlistgrid.rowheight as any); 
            //lazy loading margin should be at least the amount of visible rows and a multiple of 10
            this.lazyloadingmargin = Math.ceil(numberOfVisibleRows / 10) * 10;
            //lazy loading should be at least twice the amount of visible rows and a multiple of lazyloadingmargin
            this.lazyloadingbuffersize = 2 * this.lazyloadingmargin;
        }
        
        //set listview config
        this.$.alarmlistgrid.config = Object.assign({}, this.$.alarmlistgrid.config, this._getListviewConfig());
        
        //set initialized -> needs to avoid update of columns or data in case of not initialized yet
        this.initialized = true;
    }


    /****************************************************************************************************
     * Method is used to add eventlisteners and register for alarms
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
     _addEventListeners(): void {
        //register for alarm updates only possible if connection to dataservice established and default client logged in (access sequence ready)
        Promise.all([
            window.eventReadyPromises.get(this.constApi.EVENT_READY_PROMISE_WS_READY),
            window.eventReadyPromises.get(this.constApi.EVENT_READY_PROMISE_ACCESS_SEQUENCE_READY)
        ]).then(() => {
            this.alarmApi.registerAlarmUpdate().catch((error) => {
                this._log("_addEventListeners(): failed to register for alarms -> " + error, 'ERROR');
            });             
        }).catch((error) => {
            this._log('_addEventListeners(): error at event ready promises -> ' + error, 'ERROR');
        });         

        //listen to alarm state change to get updated
        this.sigAddEventListener('TEMP_ALARM_MGR_ALARM_STATE_CHG', () => {
            //debounce cause it might be called several times for each alarm if we acknowledge or delete all
            this.debouncer = SigPolymer.debouncer.debounce(
                this.debouncer,
                SigPolymer.timeOut.after(50),
                () => {
                    //check if already initialized
                    if (this.initialized) {
                        this._updateData();
                    }
                    //do auto delete if neccessary
                    this._autoDeleteAlarms();                    
                }
            );                
        }, 'runtimeEvent');
    }


    /****************************************************************************************************
     * Method checks if there are alarms which should be deleted automatically
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _autoDeleteAlarms(): void {
        //check if autodeletion should be done
        if (this.deletemode.includes('auto')) {
            //get alarms depending on the deletion mode to check if there is something to delete
            //needs to be done like this cause triggering delete of alarms triggers always a update -> endless loop
            const autoDelAlarms = this.alarmApi.getAlarmEntries(0, Number.MAX_SAFE_INTEGER, (alarm) => {
                //get needed states
                const alarmData = {
                    state: alarm.getState(),
                    quit: alarm.isQuit(),
                    dateHiLast: alarm.getDateHiLast(),
                    timeHiLast: alarm.getTimeHiLast(),
                    dateLo: alarm.getDateLo(),
                    timeLo: alarm.getTimeLo(),
                    dateQuit: alarm.getDateQuit(),
                    timeQuit: alarm.getTimeQuit()
                }
                //get alarmstates
                const isActive = this._isActive(alarmData);
                const isAcknowledged = this._isAcknowledged(alarmData);
                //we are not deleting any active alarms
                if (!isActive) {
                    if ((this.deletemode == "autodelinactive") || (isAcknowledged)) {
                        return true;
                    }
                }
               return false; 
            });
            //check if entries found
            if ((autoDelAlarms) && (autoDelAlarms.length > 0)) {
                this.alarmApi.deleteAllAlarms(this._getDeleteStates());
            }
        }
    }


    /****************************************************************************************************
     * Method is used to get alarm configurations and build style tag out of it
     * setting colors and fonts via getRowStyle was not successfull as refreshing if row is selected
     * can only be done after the class for selected was removed -> therefore
     * the refresh process was visible
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _setAlarmConfigStyles(): void {
        const alarmConfigList = this.alarmConfigApi.getAlarmConfigList();
        if (alarmConfigList) {
            //check if style tag already exists
            if (this.alarmConfigStyle === undefined) {
                //create style tag
                this.alarmConfigStyle = document.createElement('style');
                //append style tag to listview ag
                this.$.alarmlistgrid.shadowRoot!.appendChild(this.alarmConfigStyle);
            }
            //create innerHTML with local variable to save time
            let tempInnerHTML = '';
            //set id so it is easier to analyze in dom
            this.alarmConfigStyle.id = 'alarmConfigStyle';     
            let className;             
            //go through alarm configurations and build css out of it
            for (let i=0;i<alarmConfigList.length;i++) {
                //get classname
                className = alarmConfigList[i].getName();
                //---------------------------------------------------------------------------
                //-- active state class
                //---------------------------------------------------------------------------
                //first of all set name of alarmconfig class + state -> will be checked at rowClassRules
                tempInnerHTML += `.${className}-active:not(.active):not(.marked),
                :host(:not([isactive])) .${className}-active:not(.marked) {
                    background-color: ${alarmConfigList[i].getProperty('activeBgColor')?.getValue()}!important;
                    color: ${alarmConfigList[i].getProperty('activeTextColor')?.getValue()}!important;
                    `;       
                
                //add font properties
                let temp = alarmConfigList[i].getProperty('activeFont');
                if (temp) tempInnerHTML += this._addAlarmFontProps(temp, className, 'active');  

                //add end of definition
                tempInnerHTML += '}\n';
                //---------------------------------------------------------------------------
                //-- inactive state class
                //---------------------------------------------------------------------------           
                //first of all set name of alarmconfig class + state -> will be checked at rowClassRules
                tempInnerHTML += `.${className}-inactive:not(.active):not(.marked),
                :host(:not([isactive])) .${className}-inactive:not(.marked) {
                    background-color: ${alarmConfigList[i].getProperty('inactiveBgColor')?.getValue()}!important;
                    color: ${alarmConfigList[i].getProperty('inactiveTextColor')?.getValue()}!important;
                    `;            

                //add font properties
                temp = alarmConfigList[i].getProperty('inactiveFont');
                if (temp) tempInnerHTML += this._addAlarmFontProps(temp, className, 'inactive');  

                //add end of definition
                tempInnerHTML += '}\n';    
                //---------------------------------------------------------------------------
                //-- acknowledged and active state class
                //---------------------------------------------------------------------------              
                //first of all set name of alarmconfig class + state -> will be checked at rowClassRules
                tempInnerHTML += `.${className}-acknactive:not(.active):not(.marked),
                :host(:not([isactive])) .${className}-acknactive:not(.marked) {
                    background-color: ${alarmConfigList[i].getProperty('acknActiveBgColor')?.getValue()}!important;
                    color: ${alarmConfigList[i].getProperty('acknActiveTextColor')?.getValue()}!important;
                    `;         

                //add font properties
                temp = alarmConfigList[i].getProperty('acknActiveFont');
                if (temp) tempInnerHTML += this._addAlarmFontProps(temp, className, 'acknActive');

                //add end of definition
                tempInnerHTML += '}\n';
                //---------------------------------------------------------------------------
                //-- acknowledged and inactive state class
                //---------------------------------------------------------------------------              
                //first of all set name of alarmconfig class + state -> will be checked at rowClassRules
                tempInnerHTML += `.${className}-ackninactive:not(.active):not(.marked),
                :host(:not([isactive])) .${className}-ackninactive:not(.marked) {
                    background-color: ${alarmConfigList[i].getProperty('acknInactiveBgColor')?.getValue()}!important;
                    color: ${alarmConfigList[i].getProperty('acknInactiveTextColor')?.getValue()}!important;
                    `;

                //add font properties
                temp = alarmConfigList[i].getProperty('acknInactiveFont');
                if (temp) tempInnerHTML += this._addAlarmFontProps(temp, className, 'acknInactive');

                //add end of definition
                tempInnerHTML += '}\n';                                        
            }
            //use the inner html created via local variable
            this.alarmConfigStyle.innerHTML = tempInnerHTML;  
        }
        else {
            this._log('_setAlarmConfigStyles(): failed to get alarmconfig list', 'ERROR');
        }
    }


    /****************************************************************************************************
     * Method is used to add the font properties of the alarm state
     * 
     * @param {SigApi.Property} fontProp - font property
     * @param {String} className - name of the style class
     * @param {String} alarmState - state of the alarm
     * @return {String} - css text
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _addAlarmFontProps(fontProp: SigApi.Property, className: string, alarmState: string): string | void {
        //we add comment anyway so check only for valid classname and state
        if ((className) && (alarmState)) {
            //add a comment for begin of font properties so if font changes we are able to find this area to replace
            //the font properties easily
            let cssText = `/*${className}-${alarmState} font start*/\n`;
            //only add font properties if set
            if (fontProp) {
                const alarmFontProp = fontProp.getValue();
                if (alarmFontProp) {
                    cssText += this._getFontCSS(alarmFontProp, true);
                    //check if map for observers already exists
                    if (this.alarmConfigFontObservers === undefined) {
                        this.alarmConfigFontObservers = new Map();
                    }
                    //add observer 
                    this.alarmConfigFontObservers.set(fontProp, fontProp.addObserver((newFont) => {
                        //handle update of font properties
                        this._handleAlarmFontUpdate(newFont, className, alarmState);
                    }));
                }
            }
            //add a comment for end of font properties so if font changes we are able to find this area to replace
            //the font properties easily                
            cssText += `/*${className}-${alarmState} font end*/\n`;
            return cssText;            
        }
        else {
            this._log('_addAlarmFontProps(): invalid inputs','ERROR');
        }
    }


    /****************************************************************************************************
     * Method is used to handle an update of the alarmfont (called by font-prop observer)
     * 
     * @param {SigApi.Font} fontProp - updated font properties
     * @param {String} className - name of the style class for the alarm
     * @param {String} alarmState - state of the alarm as string for comment selecting
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _handleAlarmFontUpdate(fontProp: SigApi.Font, className: string, alarmState: string): void {
        if ((fontProp) && (className) && (alarmState)) {
            if (this.alarmConfigStyle) {
                //make regex to find area where fonts are defined
                const regex = new RegExp(`(\/[*]${className}-${alarmState} font start[*]\/\n)([\\s\\S]*)(\/[*]${className}-${alarmState} font end[*]\/\n)`);
                this.alarmConfigStyle.innerHTML = this.alarmConfigStyle.innerHTML.replace(regex, "$1" + this._getFontCSS(fontProp, true) + "$3");
            }
        }
        else {
            this._log('_handleAlarmFontUpdate(): invalid input parameters', 'ERROR');
        }
    }


    /****************************************************************************************************
     * Is used to get the css text of font
     * 
     * @param {SigApi.Font} fontProp - font property
     * @param {Boolean} addImportant - if true !important is added
     * @return {String} - css text of font
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getFontCSS(fontProp: SigApi.Font, addImportant: boolean): string |undefined {
        if (fontProp) {
            //use methods to get properties so we are independant of the name
            const fontObj = {
                name: fontProp.getName(),
                fontFamily: fontProp.getFontFamily(),
                size: fontProp.getSize(),
                bold: fontProp.isBold(),
                italic: fontProp.isItalic(),
                underline: fontProp.isUnderline()
            }            
            return `font-family: ${fontObj.fontFamily ? fontObj.fontFamily : 'inherit'}${addImportant ? '!important' : ''};
            font-size: ${fontObj.size ? fontObj.size + 'px' : 'inherit'}${addImportant ? '!important' : ''};
            font-style: ${fontObj.italic ? 'italic' : 'inherit'}${addImportant ? '!important' : ''};
            font-weight: ${fontObj.bold ? 'bold' : 'inherit'}${addImportant ? '!important' : ''};
            `;                                                                         
        }      
    }


    /****************************************************************************************************
     * Returns all defined configurations.
     * 
     * @returns {Object} An settings object for listview.
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getListviewConfig(): object {
        return {
            updateActiveRowCallback: (data, pane) => this._updateActiveRow(data, pane),
            doubleClickCallback: (data, pane, col) => this._doubleClickCallback(data, pane, col),
            clickCallback: (data, pane, col) => this._clickCallback(data, pane, col),
            longPressCallback: (data, pane, col) => this._longPressCallback(data, pane, col),
            onRenderReadyCallback: (data, pane) => this._onRenderReadyCallback(data, pane),
            onSortingCallback: (sortdata, pane, col) => {
                //set merker that sorting was already changed
                this.sortChanged = true;
                this.sortdata = sortdata;
                this._updateData();
            },    
            data: {
                cols: this._getColumnConfig(),
                params: this._getParams(),
                data: this._getData()
            },
            onLazyloadingCallback: false
        };
    }


    /****************************************************************************************************
     * Builds the column configuration
     *
     * @returns {object[]} An array of columns
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getColumnConfig(): object[] {
        return [
            {
                id: "alarmNr",
                name: this.alarmnrheadertext,
                visible: this.showalarmnr,
                sortable: true,
                sorttype: this.defaultsorting === "alarmNr" ? this.defaultsortingdir : undefined,
                css: {
                    width: parseFloat(this.widthalarmnr) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textalignalarmnr,
                    'head-text-align': this.headertextalignalarmnr 
                },
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.orderalarmnr
            },
            {
                id: "num",
                name: this.countheadertext,
                visible: this.shownum,
                sortable: true,
                css: {
                    width: parseFloat(this.widthnum) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textalignnum,
                    'head-text-align': this.headertextalignnum
                },                            
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordernum
            },
            {
                id: "dataAsStringFormatted",
                name: this.shorttextheadertext,
                visible: this.showshorttext,
                sortable: false,
                css: {
                    width: parseFloat(this.widthshorttext) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textalignshorttext,
                    'head-text-align': this.headertextalignshorttext,
                    'white-space': this.descmultiline ? 'initial' : 'no-wrap'
                },               
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordershorttext
            },
            {
                id: "timeHiStr",
                name: this.timehighheadertext,
                visible: this.showtimehigh,
                sortable: true,
                sorttype: this.defaultsorting === 'timeHiStr' ? this.defaultsortingdir : undefined,
                css: {
                    width: parseFloat(this.widthtimehigh) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textaligntimehigh,
                    'head-text-align': this.headertextaligntimehigh
                },                      
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordertimehigh,
                formatDataCallback: (dateTimeString, row, col) => this._formatDateTimeString(dateTimeString),
                renderCallback: (value, rowData, col) => this._renderTimeHigh(value, rowData)
            },
            {
                id: "timeLoStr",
                name: this.timelowheadertext,
                visible: this.showtimelow === "own",
                sortable: true,
                sorttype: this.defaultsorting === 'timeLoStr' ? this.defaultsortingdir : undefined,
                css: {
                    width: parseFloat(this.widthtimelow) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textaligntimelow,
                    'head-text-align': this.headertextaligntimelow
                },
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordertimelow,
                formatDataCallback: (dateTimeString, row, col) => this._formatDateTimeString(dateTimeString),
                renderCallback: (value, rowData, col) => this._renderTimeLow(value, rowData)
            },
            {
                id: "symbol",
                name: this.symbolheadertext,
                visible: this.showsymbol,
                sortable: false,
                css: {
                    width: parseFloat(this.widthsymbol) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textalignsymbol,
                    'head-text-align': this.headertextalignsymbol
                },
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordersymbol,
                formatDataCallback: (value, rowData, col) => this._formatSymbol(rowData)
            },
            {
                id: "group",
                name: this.groupheadertext,
                visible: this.showgroup,
                sortable: true,
                sorttype: this.defaultsorting === 'group' ? this.defaultsortingdir : undefined,
                css: {
                    width: parseFloat(this.widthgroup) + 'px',
                    'overflow': 'hidden',
                    'text-align': this.textaligngroup,
                    'head-text-align': this.headertextaligngroup
                },                
                //actually not a property for listview but we use it for ordering columns before setting to grid
                order: this.ordergroup,
                formatDataCallback: (value, rowData, col) => this._formatGroup(rowData)
            }
        ].sort((c1, c2) => {
            return c1.order - c2.order;
        });          
    }


    /****************************************************************************************************
     * Method is used to set parameter of listview
     *
     * @return {Object} 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getParams(): object {
        return {
            lazyloading: true,
            lazyloadingbuffersize: this.lazyloadingbuffersize,
            lazyloadingmargin: this.lazyloadingmargin,
            lazyloadingmaxitems: 500,
            lazyloadinginit: true,
            keepposition: true,
            scrolltoactiverow: true
        };        
    }


    /****************************************************************************************************
     * Method is used to set properties of listview
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _initProps(): void {
        //disable multiselection
        this.$.alarmlistgrid.disablemultiselect = true;
        this.$.alarmlistgrid.tableisfixed = true;
        this.$.alarmlistgrid.selectRowAfterfirstClick = true;
        this.$.alarmlistgrid.disableautodeactivate = false;
        //update the hideheader info
        this._updateHeaderState();
        //update the readonly state
        this._updateReadOnly();
    }


    /****************************************************************************************************
     * Method is used to refresh data
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateData(): void {
        //check if already initialized
        if (this.initialized) {
            //update config
            this.$.alarmlistgrid.config = Object.assign({}, this.$.alarmlistgrid.config, {
                data: {
                    data: this._getData(),
                    cols: Object.assign([], this.$.alarmlistgrid.config.data.cols),
                    params: Object.assign([], this.$.alarmlistgrid.config.data.params)
                }
            });
        }
    }


    /****************************************************************************************************
     * Method is used to update the header state if it should be shown or hid
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateHeaderState(): void {
        this.$.alarmlistgrid.hideheader = this.hideheader;
    }


    /****************************************************************************************************
     * Method is used to update column definitions (e.g. if columns should be shown or hide)
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateColumns(): void {
        //check if already initialized
        if (this.initialized) {
            //update config
            this.$.alarmlistgrid.config = Object.assign({}, this.$.alarmlistgrid.config, {
                data: {
                    data: Object.assign({}, this.$.alarmlistgrid.config.data.data),
                    cols: this._getColumnConfig(),
                    params: Object.assign([], this.$.alarmlistgrid.config.data.params)
                }
            });
        }
    }


    /****************************************************************************************************
     * Method gets used to update the readonly mode
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateReadOnly(): void {
        this.$.alarmlistgrid.readonly = this.readonly;
    }

    /****************************************************************************************************
     * Method is used to update the style class for multiline header
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateMultiLineHeader(): void {
        //get container of multiline header
        const multiLineHeader = this.$.alarmlistgrid.shadowRoot!.getElementById('containerHeadActiveInactive');
        if (multiLineHeader) {
            //set gap
            multiLineHeader.style.setProperty('gap', `${parseInt(this.activeinactiveheadergap)}px`);
        }
    }


    /****************************************************************************************************
     * Called if title text should change
     * 
     * @param {String} _value - value of title text
     * @param {String} _previewtext - preview title text
     * @param {Boolean} _isstylepreview - info if in style preview
     * @return {String} - titlebar text
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateTitleText(_value: string, _previewtext: string, _isstylepreview: boolean): string {
        if (this.alarmlisttitletext !== '' && this.alarmlisttitletext !== 'undefined') {
            return this.alarmlisttitletext;
        } else {
            return this._titlebarComputeTextFunct(_value, _previewtext, _isstylepreview);
        }
    }


    /****************************************************************************************************
     * Observer method for default sorting properties
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _updateDefaultSorting(): void {
        //only change sorting if no dynamic sorting was done
        if (this.sortChanged === false) {
            //update sort data
            this.sortdata = {
                key: this.defaultsorting,
                sorttype: this.defaultsortingdir,
            };
            //update column config and data
            //check if already initialized
            if (this.initialized) {
                //update config
                this.$.alarmlistgrid.config = Object.assign({}, this.$.alarmlistgrid.config, {
                    data: {
                        data: this._getData(),
                        cols: this._getColumnConfig(),
                        params: Object.assign([], this.$.alarmlistgrid.config.data.params)
                    }
                });
            }
        }
    }

    /****************************************************************************************************
     * Method is used to get alarm entries
     *
     * @return {Object} - alarm row data
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getData(): object {
        let _alarmEntries;
        // get the alarms either dummy data or the data from the API
        if(this.isdesignmode) {
            _alarmEntries = this._getAlarms_Dummy();
        } else {
            _alarmEntries = this._getAlarms_API();
        }

        //filter and sort alarm entries
        _alarmEntries = this._sortData(this._filterData(_alarmEntries));
        
        // return the processed data
        return {
            nodes: Object.assign([], _alarmEntries),
            datanodes: Object.assign([], _alarmEntries)
        }
    }


    
    /****************************************************************************************************
     * Method gets called if row should be rendered - we use it to style the rows depending on their state
     *
     * @param {*} row - row which should be rendered
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _renderRow(row: any): void {
        //as it is only possible to get the alarmconfiguration during runtime
        if (!this.isdesignmode) {
            //as dataset gets saved stringifyd we need to parse it to get an object again
            const rowData = JSON.parse(row.dataset.data);
            //get state of alarm
            const isActive = this._isActive(rowData);
            const isAcknowledged = this._isAcknowledged(rowData);

            //get the name of the alarmconfiguration as it is the first part of the classname
            const className = this.alarmConfigApi.getAlarmConfig(rowData.alarmConfigId)!.getName();

            //alarm is active and not acknowledged
            if ((isActive) && (!isAcknowledged)) {
                row.classList.add(className + '-active');
            }
            //alarm active and acknowledged
            else if ((isActive) && (isAcknowledged)) {
                row.classList.add(className + '-acknactive');
            }
            //alarm inactive and not acknowledged
            else if ((!isActive) && (!isAcknowledged)) {
                row.classList.add(className + '-inactive');
            }   
            //alarm inactive and acknowledged
            else if ((!isActive) && (isAcknowledged)) {
                row.classList.add(className + '-ackninactive');
            }                         
        }
    }


    /****************************************************************************************************
     * Sorts the row data.
     * 
     * @param {Array} data An array of data rows.
     * @returns {Array} An array with the sorted data rows.
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
     _sortData(data: any): number | [] {
        //check if sorting should be done
        if ((!this.sortoptionsactivetop) && (this.sortdata.sorttype === 'none')) return data; 
        // do an in memory sort of the data, across all the fields
        const resultOfSort = data.slice();
        resultOfSort.sort((a, b) => {
            //first of all sort by properties
            let sortState = this._sortByProperties(a, b);
            //if sort was already done, we are not allowed to sort after further condition
            if ((sortState === 0) && (this.sortdata.sorttype !== 'none')) {
                //value variables
                let valueA, valueB;
                valueA = a[this.sortdata.key];
                valueB = b[this.sortdata.key];
                //in case of sorting date / time we need to get unix timestamp for comparision
                if ((this.sortdata.key === 'timeHiStr') || (this.sortdata.key === 'timeLoStr')) {
                    const dateA = window.moment(valueA, this.sigDateTimeFormat).toDate();
                    //get unix timestamp
                    valueA = !isNaN(dateA.getTime()) ? dateA.getTime() : 0;
                    const dateB = window.moment(valueB, this.sigDateTimeFormat).toDate();
                    //get unix timestamp
                    valueB = !isNaN(dateB.getTime()) ? dateB.getTime() : 0;                                     
                }
                //no difference, move onto the next one
                if (valueA == valueB) return;
                let sortDirection = this.sortdata.sorttype === 'asc' ? 1 : -1;
                if (valueA > valueB) {
                    sortState = sortDirection;
                }
                else {
                    //reverse sorting
                    sortState = sortDirection * -1;
                }              
            }
            //return sortstate
            return sortState;   
        });
        return resultOfSort;
    }


    /****************************************************************************************************
     * Filters a given set of data rows.
     * 
     * @param {Array} data The data rows to filter.
     * @returns {Array} The filtered data rows.
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _filterData(data: any): [] {
        //use filter function of array as all data should be within the row data
        return data.filter((rowData) => {
            //----------------------------------------------------------------------------------------------
            //-- filter by alarmstate
            //----------------------------------------------------------------------------------------------
            const isGone = !this._isActive(rowData);
            const isAcknowledged = this._isAcknowledged(rowData);
    
            if ((this.alarmstatefilter === 'gone' && isGone === true) ||
                (this.alarmstatefilter === 'acknowledged' && isAcknowledged === true) ||
                (this.alarmstatefilter === 'acknowledgedandgone' && isGone === true && isAcknowledged === true)) {
                return false;
            }

            //----------------------------------------------------------------------------------------------
            //-- filter by group
            //----------------------------------------------------------------------------------------------
            // work with local variables for improved performance and readability
            const filterAlarmGroup = this.filter_alarmgroup; 
            const excludeFilterAlarmGroup = this.excludefilteralarmgroup; 
            const actAlarmGroup = rowData.group;
            switch (this.alarmgroupfiltermode) {
                case 'Exact match': // filter must be 0 or higher here to be active
                    // show the event if the group matches exactly the include filter
                    if ((filterAlarmGroup >= 0) && !(actAlarmGroup === filterAlarmGroup)) {
                        return false;
                    }
                    // hide the event if the group matches exactly the exclude filter
                    else if ((excludeFilterAlarmGroup >= 0) && (actAlarmGroup === excludeFilterAlarmGroup)) {
                        return false;
                    }
                    break;

                case 'All bits match': // filter must be 1 or higher here to be active, since otherwise there would not be any bit for filtering
                    // show the event if all bits of the include filter are also set in the group
                    if ((filterAlarmGroup > 0) && !((actAlarmGroup & filterAlarmGroup) === filterAlarmGroup)) {
                        return false;
                    }
                    // hide the event if all bits of the exclude filter are also set in the group
                    else if ((excludeFilterAlarmGroup > 0) && ((actAlarmGroup & excludeFilterAlarmGroup) === excludeFilterAlarmGroup)) {
                        return false;
                    }
                    break;

                case 'Any bit matches': // filter must be 1 or higher here to be active, since otherwise there would not be any bit for filtering
                    // show the event if any of the bits of the include filter are also set in the group
                    if ((filterAlarmGroup > 0) && !((actAlarmGroup & filterAlarmGroup) !== 0)) {
                        return false;
                    }
                    // hide the event if any of the bits of the include filter are also set in the group
                    else if ((excludeFilterAlarmGroup > 0) && ((actAlarmGroup & excludeFilterAlarmGroup) !== 0)) {
                        return false;
                    }
                    break;
            }                            

            return true;
        });
    }


    /****************************************************************************************************
     * Formats the date time string
     *
     * @param {String} dateTimeString - date time string which should be formatted
     * @return {String} - formatted date time string
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _formatDateTimeString(dateTimeString: string): string {
        const datetime = window.moment(dateTimeString, this.sigDateTimeFormat);
        //handle default of datetimeformat -> in designmode a referenced string is resolved as "SSSSSSS"
        //depending on the size of the string -> so in this case we also used default format to show at least anything sensefull
        const designRexExp = new RegExp("^[S\S]+$");
        let dateTimeFormat = this.datetimeformat;
        if ((this.datetimeformat === '') || (designRexExp.test(this.datetimeformat))) {
            //use default date time format as nothing configured
            dateTimeFormat = this.sigDateTimeFormat;
        }
        return datetime.isValid() ? datetime.format(dateTimeFormat) : '';
    }

    
    /****************************************************************************************************
     * Method is used to check if time low should be displayed or not
     * 
     * @param {*} value - date time value
     * @param {*} rowData - row data for specific alarm
     * @return {String} 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _renderTimeLow(value: any, rowData: any): string {
        const alarmActive = this._isActive(rowData);
        //check if alarm is active and if time should be hidden if it is active
        if ((!alarmActive) || (!this.hideinactivetime)) {
            return value;
        } else {
            return "";
        }
    }

    /****************************************************************************************************
     * Method is used to display time high and if configured time low
     * 
     * @param {*} value - date time value
     * @param {*} rowData - row data for specific alarm
     * @return {String} 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _renderTimeHigh(value: any, rowData: any): string {
        //active is always displayed so create at least one div
        let activeInnerHTML = '<div>\n';
        activeInnerHTML += value + '\n';
        activeInnerHTML += '</div>';
        //check if inactive time should also be displayed within the active column
        if (this.showtimelow === "active") {   
            //check if alarm active
            if ((!this._isActive(rowData)) || (!this.hideinactivetime)) {
                //get inactive time and check if available -> otherwise only display active time
                const inactiveTime = this._formatDateTimeString(rowData.timeLoStr); 
                if (inactiveTime !== '') {
                    let inactiveInnerHTML = '<div>\n';
                    inactiveInnerHTML += inactiveTime + '\n';
                    inactiveInnerHTML += '</div>';
                    //create container div
                    let containerInnerHTML = '<div style="\n';
                    //handle as flex box so distance between can be set
                    containerInnerHTML += 'display: flex;\n';
                    containerInnerHTML += 'flex-direction: column;\n';
                    containerInnerHTML += `gap: ${parseInt(this.activeinactivegap)}px;\n`;
                    containerInnerHTML += '">\n';
                    //append active div to container
                    containerInnerHTML += activeInnerHTML + '\n';
                    //append inactive div to container
                    containerInnerHTML += inactiveInnerHTML + '\n';
                    //close div
                    containerInnerHTML += '</div>';
                    return containerInnerHTML;                                   
                }                                 
            }     
        }
        return activeInnerHTML;
    }    

    /****************************************************************************************************
     * Method is used to format symbol column cells
     * 
     * @param {*} rowData - row data which is used to get image from
     * @return {String}
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _formatSymbol(rowData: any): string {
        if (rowData) {
            //get alarmconfig
            const alarmConfig = this.alarmConfigApi.getAlarmConfig(rowData.alarmConfigId);
            if (alarmConfig) {
                //get property depending on state
                const isActive = this._isActive(rowData);
                const isAcknowledged = this._isAcknowledged(rowData);
                let imgProp;
                if ((isActive) && (!isAcknowledged)) {
                    imgProp = alarmConfig.getProperty('activeimg');
                }
                else if ((!isActive) && (!isAcknowledged)) {
                    imgProp = alarmConfig.getProperty('inactiveimg');
                }
                else if ((isActive) && (isAcknowledged)) {
                    imgProp = alarmConfig.getProperty('acknactiveimg');
                }
                else {
                    imgProp = alarmConfig.getProperty('ackninactiveimg');
                }
                //check if property available
                if (imgProp) {
                    //get image url
                    const imgSrc = imgProp.getValue(); 
                    if (imgSrc) {
                        return `<img src="${imgSrc}">`;                                    
                    }
                }
            }
        }
        return '';
    }

    /****************************************************************************************************
     * Method is used to format group column cells
     * 
     * @param {*} rowData - row data which is used to get image from
     * @return {String}
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
     _formatGroup(rowData: any): string | void {
        if (rowData) {
            //create container div
            let innerHTML = '<div ';
            //get alarmconfig
            const alarmConfig = this.alarmConfigApi.getAlarmConfig(rowData.alarmConfigId);
            if (alarmConfig) {
                //get group image
                const imgProp = alarmConfig.getProperty('groupimg');
                //get group text
                const textProp = alarmConfig.getProperty('grouptext');
                if ((imgProp) || (textProp)) {
                    //get values to make sure property is set
                    const imgSrc = imgProp ? imgProp.getValue() : null;
                    const text = textProp ? textProp.getValue() : null;
                    if ((imgSrc) || (text)) {
                        //add styles
                        innerHTML += 'style="\n'
                        //make flexbox so it can be displayed in row
                        innerHTML += 'display: flex;\n';
                        innerHTML += 'flex-direction: row;\n';
                        innerHTML += 'align-items: center;\n';
                        innerHTML += `justify-content: ${this.textaligngroup ? this.textaligngroup : "var(--theme-sig-control-listview-text-align, left)"};\n`;
                        //space between image and text
                        innerHTML += `gap: ${parseFloat(this.groupspace)}px;\n">`;                                
                        if (imgSrc) {
                            //add image tag
                            innerHTML += `<img src="${imgSrc}">\n`;                                   
                        }
                        if (text) {
                            //add p tag for text
                            innerHTML += `<p>${text}</p>\n`;
                        }
                        innerHTML += '</div>';
                        return innerHTML;
                    }
                }
            }
            //if reaching this point no image or text can be displayed in cell so display group number
            innerHTML += `>\n${rowData.group}\n`;                 
            innerHTML += '</div>';
            return innerHTML;
        }
    }    

    /****************************************************************************************************
     * Method is used to sort alarms by properties (active on top)
     * 
     * @param {*} a - alarm row a for sorting
     * @param {*} b - alamr row b for sorting
     * @returns {Number} - sorting direction
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _sortByProperties(a: alarmDataType, b: alarmDataType): number {
        const holdAonTop = this._holdAlarmOnTop(a);
        const holdBonTop = this._holdAlarmOnTop(b);
        if ( holdAonTop && !holdBonTop ) {
            return -1;
        } else if ( !holdAonTop && holdBonTop ) {
            return 1;
        }
        return 0;
    }


    /****************************************************************************************************
     * Method is used to check if alarm should be on top depending on properties
     * 
     * @param {alarmDataType} alarm - alarm which should be checked
     * @returns {Boolean} - bool info if alarm should be on top or not
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _holdAlarmOnTop (alarm: alarmDataType): boolean {
        return (this.sortoptionsactivetop === true ? this._isActive(alarm) : true);
    }

    /****************************************************************************************************
     * Checks if the alarm is acknowledged
     * 
     * @param {Object} alarmData - the alarm data
     * @returns {Boolean} true if the alarm is acknowledged, false otherwise
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _isAcknowledged(alarmData:alarmDataType): boolean {
        // Acknowledged
        if((alarmData.state === 255) || (alarmData.quit)) {
            return true;
        }
        // acknowledged after high, and then gone
        if ((alarmData.dateQuit > alarmData.dateHiLast) ||
            (alarmData.dateQuit >= alarmData.dateHiLast && alarmData.timeQuit > alarmData.timeHiLast)) {
            return true;
        }
        //not acknowledged
        return false;
    }

    /****************************************************************************************************
     * Checks if the alarm is active
     * 
     * @param {Object} alarmData - the data of the alarm
     * @returns {Boolean} true if the alarm is active, false if it isn't
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _isActive(alarmData: alarmDataType): boolean {
        //alarm gone
        if(alarmData.state === 0) {
            return false;
        }        
        //active state
        if(alarmData.state !== 0 && alarmData.state !== 255) {
            return true;
        }
        // Hi date after lo date -> still active
        if ((alarmData.dateHiLast > alarmData.dateLo) ||
            (alarmData.dateHiLast === alarmData.dateLo && alarmData.timeHiLast > alarmData.timeLo) ||
            (alarmData.timeLo === 0 )) {
                return true
        }
        //otherwise alarm isnt active
        return false;
    }
    

	/****************************************************************************************************
     * Gets called if configured event for acknowledging selected alarms is received
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _acknowledgeselectedalarm(): void {
        //do nothing if list is readonly
        if (this.readonly === true) return;
        //get active row
        const activeRow = this.$.alarmlistgrid.getActiveRow();
        // Check if there is a selection 
        if ((activeRow) && ((activeRow as any).dataset)) {
            //get row data
            const activeRowData = JSON.parse((activeRow as any).dataset.data);
            this.alarmApi.quitAlarms([{ varNo: activeRowData.varno, alarmNr: activeRowData.alarmNr}]).then(
                (response) => {
                    //remove focus
                    this._clearFocus();  
                },
                (err)  => {
                    this._log('_acknowledgeselectedalarm(): failed to acknowledge selected alarms -> ' + err, 'ERROR');
                }
            );            
        }        
    }

 
    /****************************************************************************************************
     * Gets called if configured event for acknowledging all alarms is received
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _acknowledgeallalarms(): void {
        //do nothing if list is readonly
        if (this.readonly === true) return;
        this.alarmApi.quitAllAlarms().then(
            (response) => {     
                //remove focus
                this._clearFocus();                              
            }, 
            (err)  => {
                this._log('_acknowledgeallalarms(): failed to acknowledge all alarms -> ' + err, 'ERROR');
            }
        );
    }

       
    /****************************************************************************************************
     * Gets called if configured event for deleting selected alarms is received
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _delselectedalarm(): void {
        //do nothing if list is readonly
        if (this.readonly === true) return;
        //get active row
        const activeRow = this.$.alarmlistgrid.getActiveRow();
        // Check if there is a selection 
        if ((activeRow) && ((activeRow as any).dataset)) {
            //get row data
            const activeRowData = JSON.parse((activeRow as any).dataset.data);
            //check if active alarm should be acknowledged
            if ((this.acknactiveondelete) && (this._isActive(activeRowData))) {
                this.alarmApi.quitAlarms([{ varNo: activeRowData.varno, alarmNr: activeRowData.alarmNr}]).then(
                    (response) => {   
                        //remove focus
                        this._clearFocus();                                             
                    },
                    (err)  => {
                        this._log('_delselectedalarm(): failed to acknowledge selected alarms -> ' + err, 'ERROR');
                    }
                );                   
            } 
            this.alarmApi.deleteAlarms([{ varNo: activeRowData.varno, alarmNr: activeRowData.alarmNr}], this._getDeleteStates()).then(
                (response) => {    
                    //remove focus
                    this._clearFocus();                                   
                },
                (err)  => {
                    this._log('_delselectedalarm(): failed to delete selected alarms -> ' + err, 'ERROR');
                }
            );            
        }
    }

    
    /****************************************************************************************************
     * Gets called if configured event for deleting all alarms is received
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _delallalarms(): void {
        //do nothing if list is readonly
        if (this.readonly === true) return;
        //check if active alarms should be acknowledged
        if (this.acknactiveondelete) {
            //get active alarms
            const alarms = this.alarmApi.getAlarmEntries(0, Number.MAX_SAFE_INTEGER);
            if ((alarms) && (alarms.length > 0)) {
                let alarmEntryArr:object[] = [];
                for (let i=0;i<alarms.length;i++) {
                    //check if alarm active 
                    if ((alarms[i].getState() !== 0) && (alarms[i].getState() !== 255)) alarmEntryArr.push({varNo: alarms[i].getVarNo(), alarmNr: alarms[i].getAlarmNr()});
                }
                this.alarmApi.quitAlarms(alarmEntryArr).then(
                    (response) => {    
                        //remove focus
                        this._clearFocus();                                          
                    },    
                    (err)  => {
                        this._log('_delallalarms(): failed to acknowledge all alarms -> ' + err, 'ERROR');
                    }
                );                 
            }
        }         
        this.alarmApi.deleteAllAlarms(this._getDeleteStates()).then(
            (response) => {
                //remove focus
                this._clearFocus();              
            },
            (err)  => {
                this._log('_delallalarms(): failed to delete all alarms -> ' + err, 'ERROR');
            }
        );
    }

      
    /****************************************************************************************************
     * Method is used to get the states of the alarms we are allowed to delete
     * 
     * @return {Number} - state of alarms which should get deleted
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getDeleteStates(): number {
        // Check the state of the configuration
        if (!this.deletemode.includes('ackn')) {
            return 2; // Delete the alarm only if the state is gone
        } else {
            return 3; // Delete only alarms which are acknowledged and gone
        }
    }


    /****************************************************************************************************
     * Method is used to clear the focus on the active line
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _clearFocus(): void {
        //has to be done to avoid selecting the row again
        this.$.alarmlistgrid.alreadyclicked = false;
        this.$.alarmlistgrid._clearActiveRow(true);
    }

    /****************************************************************************************************
     * Get alarm entries
     * 
     * @return {Object} - row data of alarms
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getAlarms_API(): object {
        return this.alarmApi.getAlarmEntries(0, Number.MAX_SAFE_INTEGER).map(
            (alarm) => {
                return {
                    alarmNr: alarm.getAlarmNr(),
                    alarmConfigId: alarm.getAlarmConfigId(),
                    dataAsStringFormatted: alarm.getAlarmText(this.alarmtext),
                    text2: alarm.getAlarmText(this.alarmdescription),
                    varno: alarm.getVarNo(),
                    group: alarm.getGroup(),
                    state: alarm.getState(),
                    nopara: alarm.getNumPara(),
                    para: alarm.getParam(),
                    quit: alarm.isQuit(),
                    timeHiFirst: alarm.getTimeHiFirst(),
                    dateHiFirst: alarm.getDateHiFirst(),
                    timeHiLast: alarm.getTimeHiLast(),
                    dateHiLast: alarm.getDateHiLast(),
                    timeLo: alarm.getTimeLo(),
                    dateLo: alarm.getDateLo(),
                    timeQuit: alarm.getTimeQuit(),
                    dateQuit: alarm.getDateQuit(),
                    num: alarm.getNum(),
                    timeHiStr: this.utilsApi.getSigDateTimeAsString(alarm.getDateHiLast(), alarm.getTimeHiLast()),
                    timeLoStr: this.utilsApi.getSigDateTimeAsString(alarm.getDateLo(), alarm.getTimeLo()),
                    rowRenderCallback: (row) => this._renderRow(row)
                };
            }
        );
    }


    /****************************************************************************************************
     * Gets the dummy row data for designmode.
     * 
     * @return {Object} - dummy alarms row data
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getAlarms_Dummy(): object[]  {
        let retContent: object[] = [];
        
        //initialize the counters
        let group = 1;
        let count = 1;
        
        const data = [
            //inactive / not acknowledged
            {
                "state": 0, //state 
                "dataAsStringFormatted": "EM Stop (inact/not Acknowledged)", //Short Text
                "timeHiStr": "19.06.2018 21:36:05",
                "timeLoStr": "19.06.2018 21:40:05",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //active / not acknowledged
            {
                "state": 1, //state 
                "dataAsStringFormatted": "Connection Failed (act/not Acknowledged)", //Short Text
                "timeHiStr": "19.06.2018 19:44:38",
                "timeLoStr": "00.00.0000 00:00:00",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //inactive before/ acknowledged
            {
                "state": 255, //state 
                "dataAsStringFormatted": "Access (inact before/Acknowledged)", //Short Text
                "timeHiStr": "09.10.2018 09:44:03",
                "timeLoStr": "09.10.2019 00:44:00",
                "timeQuitStr": "09.10.2019 00:55:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //active / acknowledged
            {
                "state": 255, //state 
                "dataAsStringFormatted": "Power OFF (act/Acknowledged)", //Short Text
                "timeHiStr": "11.08.2018 15:19:09",
                "timeLoStr": "00.00.0000 00:00:00",
                "timeQuitStr": "11.08.2018 16:19:09" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //active / acknowledged
            {
                "state": 255, //state 
                "dataAsStringFormatted": "Power ON (act/Acknowledged)", //Short Text
                "timeHiStr": "06.11.2019 14:50:42",
                "timeLoStr": "00.00.0000 00:00:00",
                "timeQuitStr": "07.11.2019 14:50:42" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //active / not acknowledged
            {
                "state": 1, //state 
                "dataAsStringFormatted": "Axis Error (act/not Acknowledged)", //Short Text
                "timeHiStr": "23.02.2019 19:35:21",
                "timeLoStr": "00.00.0000 00:00:00",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //active / not acknowledged
            {
                "state": 1, //state 
                "dataAsStringFormatted": "Random (act/not Acknowledged)", //Short Text
                "timeHiStr": "17.07.2019 12:36:42",
                "timeLoStr": "00.00.0000 00:00:00",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //inactive after / acknowledged
            {
                "state": 0, //state 
                "dataAsStringFormatted": "Over Speed (inact after/Acknowledged)", //Short Text
                "timeHiStr": "10.01.2018 22:36:13",
                "timeLoStr": "10.02.2018 22:00:13",
                "timeQuitStr": "10.02.2018 20:00:13" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //inactive / not acknowledged
            {
                "state": 0, //state 
                "dataAsStringFormatted": "Stand Still Error (inact/not Acknowledged)", //Short Text
                "timeHiStr": "07.05.2019 17:39:25",
                "timeLoStr": "08.05.2019 00:39:25",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            },
            //inactive / not acknowledged
            {
                "state": 0, //state 
                "dataAsStringFormatted": "Channel (inact/not Acknowledged)", //Short Text
                "timeHiStr": "03.07.2018 06:58:40",
                "timeLoStr": "08.05.2019 04:39:25",
                "timeQuitStr": "00.00.0000 00:00:00" // its a string so it is easier to config because timeQuit & dateQuit are decimal Numbers (sigmatek format) processed later
            }
        ];

        for (let i = 0; i < 1; i++) {
            data.forEach((element, i) => {
                // process the elements data to valid alarm data
                retContent.push({
                    alarmNr: (i * 3) + 1,
                    alarmConfigId: 0,
                    dataAsStringFormatted: element.dataAsStringFormatted,
                    text2: "Dummy Alarm Description",
                    group: group,
                    state: element.state,
                    quit: false,
                    timeHiLast: this._getSigTimeAsNumber(element.timeHiStr.slice(11)),
                    dateHiLast: this._getSigDateAsNumber(element.timeHiStr.slice(0,10)),
                    timeLo: this._getSigTimeAsNumber(element.timeLoStr.slice(11)),
                    dateLo: this._getSigDateAsNumber(element.timeLoStr.slice(0,10)),
                    timeQuit: this._getSigTimeAsNumber(element.timeQuitStr.slice(11)),
                    dateQuit: this._getSigDateAsNumber(element.timeQuitStr.slice(0,10)),
                    num: count,
                    timeHiStr: element.timeHiStr,
                    timeLoStr: element.timeLoStr,
                    rowRenderCallback: (row) => this._renderRow(row)
                });

                // increase the counters for varius alarm stuff
                group = group + 3;
                if (group === 13) group = 1;

                count = count + 2;
                if (count === 23) count = 1;
            });
        }
        return retContent;
    }


    /****************************************************************************************************
     * Used to convert string formatted time to a numeric format
     * 
     * @param {String} string - time string which should be converted
     * @param {String} [delimiter=':'] - delimiter
     * @return {Number} - numeric time
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getSigTimeAsNumber(string: string, delimiter: string = ':'): null | number {
        if ((string === undefined) || (string === null) || (string === '')) {
            return null;
        }
        const HMS = { hh: 0, mm: 0, ss: 0 };
        const timeArr = string.split(delimiter, 3);

        const _hh = parseInt(timeArr[0], 10);
        if (!isNaN(_hh)) HMS.hh = _hh;

        const _mm = parseInt(timeArr[1], 10);
        if (!isNaN(_mm)) HMS.mm = _mm;

        const _ss = parseInt(timeArr[2], 10);
        if (!isNaN(_ss)) HMS.ss = _ss;

        return this._getSigTimeFromHMS(HMS);
    }

    /****************************************************************************************************
     * Used to convert string formatted date to a numeric format
     * 
     * @param {String} string - date string which should be converted
     * @param {String} [delimiter=':'] - delimiter
     * @return {Number} - numeric date
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/    
    _getSigDateAsNumber(string: string, delimiter: string = '.'): number | null {
        if ((string === undefined) || (string === null) || (string === '')) {
            return null;
        }
        const YMDoW = { YY: 0, MM: 0, DD: 0, DoW: 0 };
        const dateArr = string.split(delimiter, 3);
        const _DD = parseInt(dateArr[0], 10);
        if (!isNaN(_DD)) YMDoW.DD = _DD;

        const _MM = parseInt(dateArr[1], 10);
        if (!isNaN(_MM)) YMDoW.MM = _MM;

        const _YY = parseInt(dateArr[2], 10);
        if (!isNaN(_YY)) YMDoW.YY = _YY;

        return this._getSigDateFromYMDoW(YMDoW);
    }


    /****************************************************************************************************
     * Used to format hours, minutes and seconds into one numeric variable
     * 
     * @param {Object} HMS - object which contains hours, minutes and seconds to convert
     * @return {Number} - formatted time value
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _getSigTimeFromHMS(HMS: { hh: number, mm: number, ss: number }): number {
        let time = 0;
        time = time | (HMS.ss << 8);
        time = time | (HMS.mm << 16);
        time = time | (HMS.hh << 24);
        return time;
    }

    /****************************************************************************************************
     * used to format year, months and days into one numeric variable
     * 
     * @param {Obejt} YMDoW - object which contains year, months and days to convert
     * @return {Number} - formatted date value
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/    
    _getSigDateFromYMDoW(YMDoW: { YY: number, MM: number, DD: number, DoW: number }): number {
        let date = 0;
        date = date | (YMDoW.YY << 16);
        date = date | (YMDoW.MM << 12);
        date = date | (YMDoW.DD << 4);
        date = date | (YMDoW.DoW);
        return date;
    }

    /****************************************************************************************************
     * Method is used to move the cursor one line down
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _cursordown(): void {
        this.$.alarmlistgrid.moveCursorDown();
    }

    /****************************************************************************************************
     * Method is used to move the cursor one line up
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _cursorup(): void {
        this.$.alarmlistgrid.moveCursorUp();
    }

    /****************************************************************************************************
     * Method is used to move the cursor one page down
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _pagedown(): void {
        this.$.alarmlistgrid.moveCursorPageDown();
    }

    /****************************************************************************************************
     * Method is used to move the cursor one page up
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/    
    _pageup(): void {
        this.$.alarmlistgrid.moveCursorPageUp();
    }

    /****************************************************************************************************
     * Method is used to move the cursor to the top of the page
     *
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _pagetop(): void {
        this.$.alarmlistgrid.moveCursorTop();
    }

    /****************************************************************************************************
     * Method is used to move the cursor to the end of the page
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _pageend(): void {
        this.$.alarmlistgrid.moveCursorBottom();
    }

    /****************************************************************************************************
     * Method is used to move the viewport one column to the left
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _columnToLeft(): void {
        this.$.alarmlistgrid.moveCursorLeft();
    }

    /****************************************************************************************************
     * Method is used to move the viewport one column to the right
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _columnToRight(): void {
        this.$.alarmlistgrid.moveCursorRight();
    }

    /****************************************************************************************************
     * Method is used to move the viewport to the most left column
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _columnToStart(): void {
        this.$.alarmlistgrid.columnToStart();
    }

    /****************************************************************************************************
     * Method is used to move the viewport to the most right column
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _columnToEnd(): void {
        this.$.alarmlistgrid.columnToEnd();
    }    

    /****************************************************************************************************
     * Method is used to open the detail window to view the alarm details
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    _openDetailWindow(): void {
        //get window
        const detailWindow = this.windowApi.getWindow(this.detailwindow);
        if (detailWindow) {
            //open detail window
            detailWindow.open().then((response) => {},
            (reason) => {
                this._log('_openDetailWindow(): failed to open detail window -> ' + reason, 'ERROR');
            });
        }
        else {
            this._log('_openDetailWindow(): detail window not found', 'ERROR');
        }
    }

    /****************************************************************************************************
     * Overriding the default sigApplyFontObject function
     * 
     * @param {string} propName - name of the font property which should be applied
     * @param {fontObject} fontObj - font object
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    sigApplyFontObject(propName: string, fontObj: fontObject): void {
        super.sigApplyFontObject(propName, fontObj); 
        //fonts for selected have to be set via style tag, cause they depend on classes appended to rows
        if (this.rowFontStyle === undefined) {
            this.rowFontStyle = document.createElement('style');
            //set id to analyze it in dom tree
            this.rowFontStyle.id = 'rowFontStyle';
        }
        //init css text
        this.rowFontStyle.innerHTML = '';
        //fonts which cannot be applied automatically are stored in the fontMap
        this.fontMap.forEach((fontObj, propName) => {
            if (propName === 'fontalarmselected') {
                //select row to style it if selected
                this.rowFontStyle.innerHTML += '#grid tr.active {\n';
                this.rowFontStyle.innerHTML += this._getFontCSS(fontObj, true);
                this.rowFontStyle.innerHTML += '}\n';
            }
        }); 
        //check if already appended to dom
        if (this.rowFontStyle.isConnected === false) {
            //check if shadowdom initialized
            if ((this.$) && (this.$.alarmlistgrid) && (this.$.alarmlistgrid.shadowRoot)) {
                this.$.alarmlistgrid.shadowRoot.appendChild(this.rowFontStyle);
            }            
        }

    }


    /****************************************************************************************************
     * Gets called if control gets disconnected from the DOM
     * 
     * @memberof LasalRuntimeSigControlAlarmlist2
     ****************************************************************************************************/
    disconnectedCallback(): void {
        super.disconnectedCallback();
        //remove font observers of alarmconfig
        if (this.alarmConfigFontObservers) {
            this.alarmConfigFontObservers.forEach((observerId:string, fontProp:SigApi.Property) => {
                fontProp.removeObserver(observerId);
            });
        }
    }

}

customElements.define(LasalRuntimeSigControlAlarmlist2.is, LasalRuntimeSigControlAlarmlist2);