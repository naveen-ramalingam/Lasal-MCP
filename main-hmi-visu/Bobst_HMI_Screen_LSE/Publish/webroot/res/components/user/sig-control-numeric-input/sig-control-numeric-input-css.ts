/*
 * You can use a style module to share styles between your components
 * Needs to be imported and included in your component
*/
import type { DomModule } from "../../sigmatek/sig-element/sig-element-polymer.js";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
<template>
    <style id="lvddefault">
        :host sig-control-numeric-input {
            --theme-sig-control-numeric-input-background-color: --palette-default-color253;
            --theme-sig-control-numeric-input-value-background-color: rgba(196, 192, 192, 1);
            --theme-sig-control-numeric-input-value-active-color: --palette-default-color254;
            --theme-sig-control-numeric-input-value-active-background-color: --palette-default-color229;
            --theme-sig-control-numeric-input-value-active-background-color-stop: --palette-default-color255;
            --theme-sig-control-numeric-input-font-size: 11px;
            --theme-sig-control-numeric-input-color: --palette-default-color228;
            --theme-sig-control-numeric-input-border-color: --palette-default-color228;
            --theme-sig-control-numeric-input-border-width: 1px;
            --theme-sig-control-numeric-input-border-style: solid;
            --theme-sig-control-numeric-input-margin-leftright: 0px;
            --theme-sig-control-numeric-input-margin-top: 0px;
            --theme-sig-control-numeric-input-led-border-width: 1px;
            --theme-sig-control-numeric-input-led-border-color: --palette-default-color254;
            --theme-sig-control-numeric-input-led-border-style: solid;
            --theme-sig-control-numeric-input-led-background-color: rgba(204, 204, 204, 1);
            --theme-sig-control-numeric-input-led-pressed-background-color: rgba(0, 119, 0, 1);
            --theme-sig-control-numeric-input-background-color-stop: --palette-default-color255;
            --theme-sig-control-numeric-input-border-color-stop: --palette-default-color255;
            --theme-sig-control-numeric-input-activ-border-color: --palette-default-color228;
            --theme-sig-control-numeric-input-activ-border-color-stop: --palette-default-color255;
            --theme-sig-control-numeric-input-pressed-shadow-color: --palette-default-color255;
            --theme-sig-control-numeric-input-unit-color: --palette-default-color228;
            --theme-sig-control-numeric-input-shadow-color: --palette-default-color254;
        }
    </style>
    <style id="lvdtemplate">
        /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
</template>`;
styleElement.register('sig-control-numeric-input-css');