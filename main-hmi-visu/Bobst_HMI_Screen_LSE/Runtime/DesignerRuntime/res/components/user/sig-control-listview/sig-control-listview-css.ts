import { DomModule } from "../../sigmatek/sig-element/sig-element-polymer";

const styleElement: DomModule = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
    <style id="lvddefault">
            :host sig-control-listview {
                --theme-sig-control-listview-background-color: --palette-default-color227;
                --theme-sig-control-listview-border-color: --palette-default-color255;
            
                --theme-sig-control-listview-header-background-color: --palette-default-color254;
                --theme-sig-control-listview-header-color: --palette-default-color253;
               
                --theme-sig-listview-header-symbol-color: --palette-default-color248; 
                --theme-sig-listview-header-symbol-active-color: --palette-default-color253;
               
                --theme-sig-control-listview-row-marked-background-color:--palette-default-color230;
                --theme-sig-control-listview-row-marked-color: --palette-default-color252;
                --theme-sig-control-listview-row-even-background-color: --palette-default-color227;
                --theme-sig-control-listview-row-even-color: --palette-default-color252;
                --theme-sig-control-listview-row-odd-background-color: --palette-default-color227;
                --theme-sig-control-listview-row-odd-color: --palette-default-color252;
                --theme-sig-control-listview-row-active-background-color:--palette-default-color229;
                --theme-sig-control-listview-row-active-color: --palette-default-color252;
                --theme-sig-control-listview-row-active-marked-color: --palette-default-color253;

                --theme-sig-control-listview-spinner-color: --palette-default-color229;

                --theme-sig-control-listview-cellseparator-color: --palette-default-color253;
                --theme-sig-control-listview-lineseparator-color: --palette-default-color253;
            }
        </style>
        <style id="lvdtemplate">
        /*! @@lvdstyles */
        </style>
        <style id="development">    
        </style>
    </template>
`;
styleElement.register('sig-control-listview-css');