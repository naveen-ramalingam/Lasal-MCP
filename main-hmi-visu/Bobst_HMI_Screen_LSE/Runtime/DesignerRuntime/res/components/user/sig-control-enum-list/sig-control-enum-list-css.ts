import { DomModule } from "../../sigmatek/sig-element/sig-element-polymer";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
    <style id="lvddefault">
            :host sig-control-enum-list {
                --theme-sig-control-enum-list-background-color: --palette-default-color253;
                --theme-sig-control-enum-list-option-background-color-even: --palette-default-color255;
                --theme-sig-control-enum-list-option-color-even: --palette-default-color228;
                --theme-sig-control-enum-list-option-background-color-odd: --palette-default-color255;
                --theme-sig-control-enum-list-option-color-odd: --palette-default-color228;
                --theme-sig-control-enum-list-font-size: 11px;
                --theme-sig-control-enum-list-option-color-selected: --palette-default-color254;
                --theme-sig-control-enum-list-option-background-color-selected:--palette-default-color229;
                --theme-sig-control-enum-list-border-color: --palette-default-color228;
            }
        </style>
    <style id="lvdtemplate">
    /*! @@lvdstyles */
    </style>
    <style id="development">
    </style>
    </template>`;
styleElement.register('sig-control-enum-list-css');