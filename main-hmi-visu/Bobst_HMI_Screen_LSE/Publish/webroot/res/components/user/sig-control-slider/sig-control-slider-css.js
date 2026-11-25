const styleElement = document.createElement('dom-module');
styleElement.innerHTML = `
    <template>
<style id="lvdtemplate">
            :host sig-control-slider {
   --theme-sig-control-slider-background-color: rgba(255,255,255,0);
   --theme-sig-control-slider-border-color: rgba(255,255,255,0);
   --theme-sig-control-slider-handle-background-color: #28322D;
   --theme-sig-control-slider-handle-moving-background-color: #28322D;
   --theme-sig-control-slider-handle-border-color: rgba(255,255,255,0);
   --theme-sig-control-slider-handle-border-radius: 10px;
   --theme-sig-control-slider-handle-border-width: 0px;
   --theme-sig-control-slider-handle-border-style: solid;
   --theme-sig-control-slider-bar-background-color: #AFC81A;
   --theme-sig-control-slider-bar-border-radius: 6px;
   --theme-sig-control-slider-track-background-color: #D2D7D7;
   --theme-sig-control-slider-track-border-radius: 6px;
   --theme-sig-control-slider-track-height: 12px;
}

        </style>
</template>
`;
styleElement.register('sig-control-slider-css');