import type { DomModule } from "../../sigmatek/sig-element/sig-element-polymer.js";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
        <style id="lvddefault">
            :host sig-control-button {
                --theme-sig-control-slider-background-color: --palette-default-color255;
                --theme-sig-control-slider-border-color: --palette-default-color255;

                --theme-sig-control-slider-handle-background-color: --palette-default-color228;
                --theme-sig-control-slider-handle-moving-background-color: --palette-default-color228;
                --theme-sig-control-slider-handle-border-color: --palette-default-color255;
                --theme-sig-control-slider-handle-border-radius: 10px;
                --theme-sig-control-slider-handle-border-width: 0px;
                --theme-sig-control-slider-handle-border-style: solid;

                --theme-sig-control-slider-bar-background-color: --palette-default-color229;
                --theme-sig-control-slider-bar-border-radius: 6px;

                --theme-sig-control-slider-track-background-color: --palette-default-color233;
                --theme-sig-control-slider-track-border-radius: 6px;
                --theme-sig-control-slider-track-height: 12px;
            }
        </style>
        <style id="lvdtemplate">
            /*! @@lvdstyles */
        </style>
        <style id="development">
        </style>
    </template>
    `;
styleElement.register('sig-control-slider-css');