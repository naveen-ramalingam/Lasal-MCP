const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
            :host sig-window-container-keyboard {
   --theme-sig-window-panel-content-background-color: #082B3E;
   --theme-sig-window-panel-hdr-background-color: #023F5F;
   --theme-sig-window-panel-hdr-color: #FFFFFF;
   --theme-sig-window-panel-icon-size: 30px;
   --theme-sig-window-panel-content-border-top-height: 0px;
   --theme-sig-window-panel-border-color: #93989A;
   --theme-sig-window-panel-content-border-top-color: #93989A;
}
:host sig-window-container-keyboard.__lvdStyle_AlphaKeyboardContainer {
   --theme-sig-element-width: 905px;
   --theme-sig-element-height: 390px;
}
:host sig-window-container-keyboard.__lvdStyle_NumericKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 385px;
}
:host sig-window-container-keyboard.__lvdStyle_DateKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 360px;
}
:host sig-window-container-keyboard.__lvdStyle_HexKeyboardContainer {
   --theme-sig-element-width: 370px;
   --theme-sig-element-height: 360px;
}
:host sig-window-container-keyboard.__lvdStyle_Ipv4KeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 360px;
}
:host sig-window-container-keyboard.__lvdStyle_TimeKeyboardContainer {
   --theme-sig-element-width: 300px;
   --theme-sig-element-height: 365px;
}

        </style>
</template>
`;
styleElement.register('sig-window-container-keyboard-css');