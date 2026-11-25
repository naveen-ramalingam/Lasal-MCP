import { LasalRuntimeSigElement, SigPolymer } from '../../sigmatek/sig-element/sig-element.js';
import "../sig-control-scrollbar/sig-control-scrollbar-css.js";
/****************************************************************************************************
 * @class
 * @classdesc Implements and exports sig-control-mediacontainer component.
 * @version 02.01.000
 *
 * @property {boolean} isReady Signals if the ready callback was already executed.
 * @extends {LasalRuntimeSigElement}
****************************************************************************************************/
export class LasalRuntimeSigMediaContainerElement extends LasalRuntimeSigElement {
    constructor() {
        super(...arguments);
        //type definitions for member properties
        this.isReady = false;
    }
    /****************************************************************************************************
     * Returns the component's registered tag name.
     * @readonly
     * @static
     * @returns {String} The component's tag name.
     * @memberof LasalRuntimeSigMediaContainerElement
    ****************************************************************************************************/
    static get is() {
        return "sig-control-mediacontainer";
    }
    /****************************************************************************************************
     * Returns the import path URL used by Polymer.
     * @readonly
     * @static
     * @returns {ImportMeta} The import path URL.
     * @memberof LasalRuntimeSigMediaContainerElement
    ****************************************************************************************************/
    static get importMeta() { return import.meta; }
    /****************************************************************************************************
     * Returns the HTML literal of the component.
     * @readonly
     * @static
     * @returns {HTMLTemplateElement} The template literal of the component.
     * @memberof LasalRuntimeSigMediaContainerElement
    ****************************************************************************************************/
    static get template() {
        return SigPolymer.html `
        <style include="sig-element-css sig-control-scrollbar-css">
            :host {
            /* Basic styling of the component */
            background-color: var(--theme-sig-control-mediacontainer-background-color, inherit);

            border-width: var(--theme-sig-control-mediacontainer-border-width, 0px);
            border-color: var(--theme-sig-control-mediacontainer-border-color, inherit);
            border-style: var(--theme-sig-control-mediacontainer-border-style, none);
            border-radius: var(--theme-sig-control-mediacontainer-border-radius, 0px);

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

        .sig-control-mediacontainer {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .sig-control-mediacontainer object {
            display: block;
            position: absolute;
            border: none;
            top: 0px;
            left: 0px;
            width: 100%;
            height: 100%;
        }

        #objectcontainer {
            width: 100%;
            height: 100%;
        }

        /* if a img is displayed center it */
        img#objid {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        :host([isdesignmode]) .sig-control-mediacontainer {
            cursor: unset;
            background: url(preview.svg) no-repeat center center;
            background-size: 100% 100%;
        }

        /* If dragmode is enabled or the component is dragged
         * This div is palaced over the loaded pdf so drag & drop works correctly;
         * IMPORTANT: The div needs at least a opacity of 0.1!
         */
        #draghandle {
            position:absolute;
            width:100%;
            height:100%;
            display: none;
            background-color:white;
            opacity: 0.1;
        } 
        :host([isdragmode]) #draghandle,
        :host([isdragged]) #draghandle
         {
            display:block;
         }
    </style>
    <div class="sig-control-mediacontainer clearfix">
        <div id="objectcontainer"></div>
        <div id="draghandle"><div>
    </div>`;
    }
    /****************************************************************************************************
     * Returns the defined Polymer properties of the component.
     * @readonly
     * @static
     * @returns {Object} The defined Polymer properties.
     * @memberof LasalRuntimeSigMediaContainerElement
     *
     * @property {String}   computedsrc     - The content source of the media container.
     * @property {String}   contentType     - The type of the content which should be displayed.
    ****************************************************************************************************/
    static get properties() {
        // property names should always be lower case so we
        // can use them directly on the element as an attribute
        let props = {
            computedsrc: {
                type: String,
                value: '',
                computed: '_computeSource(src, externalsrc)'
            },
            contentType: {
                type: String,
                value: undefined,
                observer: '_scalePDF'
            }
        };
        return props;
    }
    /****************************************************************************************************
     * Method gets called if properties are initialized and the component is connected to the dom.
     *
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    ready() {
        super.ready();
        //react to manipulation of size as the pdf needs to rerender
        this.sigAddEventListener('resize', () => {
            if (this.isdesignmode)
                return;
            //only scale and reload if content is a pdf
            //using a debounce as the event might be triggered several times
            this.debouncer = SigPolymer.debouncer.debounce(this.debouncer, SigPolymer.timeOut.after(100), () => {
                if (!this._checkIfPDF(this.contentType))
                    return;
                this._scalePDF(this.contentType);
                //reload content via setting the data again
                const object = this.$.objectcontainer.querySelector("#objid");
                if (object)
                    object.data = this.computedsrc;
            });
        }, 'jsEvent', window);
        //set ready info so updating the dom is allowed in computed observer.
        this.isReady = true;
        //display the source initially
        this._displayContent(this.computedsrc);
    }
    /****************************************************************************************************
     * Called when src or external src changed. It is used to compute the final source which should
     * be used.
     *
     * @param {string} source - normal source
     * @param {string} externalSource - external source
     * @return {*}  {string} - computed source
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    _computeSource(source, externalSource) {
        //get final source
        const finalSrc = externalSource ?? source;
        //only update nodes if the shadow dom already exists
        if ((!this.isReady) || (finalSrc === this.computedsrc))
            return finalSrc;
        this._displayContent(finalSrc);
        return finalSrc;
    }
    /****************************************************************************************************
     * This method is used to create a corresponding tag and set it's source.
     *
     * @param {string} source - Source to be set.
     * @return {*}  {Promise<void>}
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    async _displayContent(source) {
        //do not display the content in designmode
        if (this.isdesignmode)
            return;
        //check for old object tag and remove it
        const oldObj = this.$.objectcontainer.querySelector("#objid");
        oldObj?.remove();
        //if no source set we can return immediatly
        if (!source) {
            this.contentType = '';
            return;
        }
        //get the content type
        try {
            this.contentType = await this._getContentType(source);
        }
        catch (error) {
            this._log('_displayContent(): error getting the content type occured', 'ERROR');
            return;
        }
        //create object or img tag depending on the content type
        let newObj;
        switch (this.contentType) {
            //content type returned by fetch
            case "image/jpeg":
            case "image/png":
            //for fallback evaluation parsing the extension
            case ".jpg":
            case "jpeg":
            case ".png":
                newObj = document.createElement("img");
                newObj.src = source;
                break;
            default:
                newObj = document.createElement("object");
                newObj.data = source;
                //set the mime type
                if (this.contentType)
                    newObj.type = this.contentType;
                break;
        }
        newObj.id = "objid";
        this.$.objectcontainer.append(newObj);
    }
    /****************************************************************************************************
     * Method is used to get the content type evaluating the header of the fetch request.
     *
     * @async
     * @param {string} source - The source url of the media.
     * @return {string} - The contentType.
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    async _getContentType(source) {
        if (source === "" || source === undefined)
            return "";
        let contentType = "";
        try {
            // fetch the data of the source
            const response = await fetch(source, { method: 'HEAD' });
            if (response.ok) {
                contentType = response.headers.get('Content-Type');
            }
        }
        catch (error) {
            this._log("_getContentType(): fetching the URL failed", 'ERROR');
        }
        // fetch failed get the extension instead
        if (!contentType) {
            // get the extension of the source (last 4 characters)
            contentType = source.substring(source.length - 4);
        }
        return contentType;
    }
    /****************************************************************************************************
     * Checks if a PDF is shown. In case the view is scaled, applies an inverse scale, so the PDF is
     * rendered correctly
     *
     * @param {string} contentType - what kind of content is rendered
     * @return {*}
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    _scalePDF(contentType) {
        // Check the two result options from fetch or the URL string
        if (this._checkIfPDF(contentType)) {
            // for PDFs apply an inverse scale
            this._applyInversScale();
        }
        else {
            // for everything else set no scale
            this._resetScale();
        }
    }
    /****************************************************************************************************
     * Method is used to check if the given content type is a pdf or not.
     *
     * @param {string} contentType - Content type to be checked.
     * @return {*}  {boolean} - true if the content is a pdf.
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    _checkIfPDF(contentType) {
        if (contentType === ".pdf" || contentType === "application/pdf")
            return true;
        return false;
    }
    /****************************************************************************************************
     * Gets the scale factor and applys and invers of it to the objectcontainer. As well as a new height
     * and width to offset the scale.
     *
     * @return {*}
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    _applyInversScale() {
        // get the scale factor of the view
        const { x, y } = this.getScaleFactor();
        // if the view is scaled adjust the scale to avoid problems with the pdf viewer
        if ((x !== undefined && y !== undefined) && (x !== 1 || y !== 1)) {
            // revert the scale3d of the sig app and adjust the width to get the same look as if it were scaled
            Object.assign(this.$.objectcontainer.style, {
                transform: `scale3d(${1 / x}, ${1 / y}, 1)`,
                transformOrigin: "top left",
                width: `${x * 100}%`,
                height: `${y * 100}%`,
            });
        }
    }
    /****************************************************************************************************
     * Removes the scale and height / width properties of the objectcontainer.
     *
     * @return {*}
     * @memberof LasalRuntimeSigMediaContainerElement
     ****************************************************************************************************/
    _resetScale() {
        // remove the style in case it is not needed
        this.$.objectcontainer.style.removeProperty("transform");
        this.$.objectcontainer.style.removeProperty("transform-origin");
        this.$.objectcontainer.style.removeProperty("width");
        this.$.objectcontainer.style.removeProperty("height");
    }
}
customElements.define(LasalRuntimeSigMediaContainerElement.is, LasalRuntimeSigMediaContainerElement);
//# sourceMappingURL=sig-control-mediacontainer.js.map