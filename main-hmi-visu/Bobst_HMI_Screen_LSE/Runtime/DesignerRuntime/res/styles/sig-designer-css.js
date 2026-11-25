const $_documentContainer = document.createElement('template');
$_documentContainer.innerHTML =  `<custom-style>
    <style>
        html {
            --theme-sig-designer-handle-zoom: 1;
            --designer-scrollbar-thumb-color: rgba(246, 246, 246, 1);
            --designer-scrollbar-track-color: rgba(220, 220, 220, 1);
            --designer-scrollbar-width: auto;
            overflow: auto !important;
            position: unset !important;
            scrollbar-color: var(--designer-scrollbar-thumb-color) var(--designer-scrollbar-track-color);
            scrollbar-width: var(--designer-scrollbar-width);
        }

        
        body:not(.toolbox) *,
        body:not(.preview) * {
            scrollbar-color: initial;
            scrollbar-width: initial;
        }

        
        html:has(body.preview),
        html:has(body.toolbox) {
            --designer-scrollbar-width: thin;
        } 

        
        body {
            {
                user-select: none;  
                overflow: auto !important;   
                background-color: rgb(255, 255, 255);
                color: rgba(51, 51, 51, 1);        
            }   
            sig-app {
                --theme-sig-app-gridsize: 10px;
                --theme-sig-app-gridsizex: 0px;
                --theme-sig-app-gridsizey: 0px;
            }
            sig-designer-rulers {
                --theme-sig-designer-rulers-background-color: rgba(245, 245, 245, .6);
                --theme-sig-designer-rulers-carret-color: rgba(32, 157, 229, 1);
               
            }
            sig-designer-lasso {
                --theme-sig-designer-lasso-background-color: rgba(32, 160, 229, 0.3);
                --theme-sig-designer-lasso-border-color: rgba(32, 157, 229, 1);
            }
            sig-designer-control-info {
                --theme-sig-designer-control-info-color: rgba(61, 61, 61, 1);
                --theme-sig-designer-control-info-label-color: rgba(51, 51, 51, 1);
                --theme-sig-designer-control-info-background-color: rgba(240, 240, 240, .7);
                --theme-sig-designer-control-border-top-color: rgba(200, 200, 200, .8);
            }
        }
       
        
        html:has(body.theme-dark) {
            --designer-scrollbar-thumb-color: rgba(60, 60, 60, 1);
            --designer-scrollbar-track-color: rgba(30, 30, 30, 1);
        }
        body.theme-dark {
            {
                background-color: rgba(27, 27, 31, 1);
                color: rgba(212, 212, 212, 1);
            }
            sig-designer-toolbox {
                --theme-sig-designer-toolbox-icon-brightness: 90%;
            }
            sig-designer-rulers {
                --theme-sig-designer-rulers-background-color: rgba(0, 0, 0, .7);
                --theme-sig-designer-rulers-border-color: rgba(160, 160, 160,1);
                --theme-sig-designer-rulers-tick-label-color: rgba(160, 160, 160,1);
                --theme-sig-designer-rulers-tick-major-color:rgba(120, 120, 120, 1);
                --theme-sig-designer-rulers-tick-minor-color: rgba(100, 100, 100, 1);
                --theme-sig-designer-rulers-carret-color: rgba(32, 157, 229, 1);
            }
            sig-designer-resource-preview {
                --theme-sig-designer-resource-preview-background-color:rgba(27,27,31,1);
                --theme-sig-designer-resource-preview-color: rgba(255, 255, 255, 1);
                 --theme-sig-designer-resource-detail-color: rgba(255, 255, 255, 1);
                --theme-sig-designer-resource-detail-background-url: url('res/components/sigmatek/sig-designer-resource-detail/backgroundDark.png');
                --theme-sig-designer-resource-detail-background-color: rgba(27, 27, 31, 1);
                --theme-sig-designer-resource-detail-border-color: rgba(136, 195, 255, 1);
            }
            sig-designer-control-info {
               --theme-sig-designer-control-info-color: rgba(170, 170, 170, 1);
                --theme-sig-designer-control-info-label-color: rgba(190, 190, 190, 1);
                --theme-sig-designer-control-info-background-color: rgba(0, 0, 0, .6);
                --theme-sig-designer-control-border-top-color: rgba(80, 80, 80, .8);
            }
        }    

        
        .cursor-none * {
            cursor: none !important;
        }
        .cursor-context-menu * {
            cursor: context-menu !important;
        }
        .cursor-help * {
            cursor: help !important;
        }
        .cursor-pointer * {
            cursor: pointer !important;
        }
        .cursor-wait * {
            cursor: wait !important;
        }
        .cursor-progress * {
            cursor: progress !important;
        }
        .cursor-cell * {
            cursor: cell !important;
        }
        .cursor-text * {
            cursor: text !important;
        }
        .cursor-alias * {
            cursor: alias !important;
        }
        .cursor-vertical-text * {
            cursor: vertical-text !important;
        }
        .cursor-copy * {
            cursor: copy !important;
        }
        .cursor-move * {
            cursor: move !important;
        }
        .cursor-no-drop * {
            cursor: no-drop !important;
        }
        .cursor-not-allowed * {
            cursor: not-allowed !important;
        }
        .cursor-col-resize * {
            cursor: col-resize !important;
        }
        .cursor-all-scroll * {
            cursor: all-scroll !important;
        }
        .cursor-row-resize * {
            cursor: row-resize !important;
        }
        .cursor-n-resize * {
            cursor: n-resize !important;
        }
        .cursor-e-resize * {
            cursor: e-resize !important;
        }
        .cursor-s-resize * {
            cursor: s-resize !important;
        }
        .cursor-w-resize * {
            cursor: w-resize !important;
        }
        .cursor-ne-resize * {
            cursor: ne-resize !important;
        }
        .cursor-nw-resize * {
            cursor: nw-resize !important;
        }
        .cursor-se-resize * {
            cursor: se-resize !important;
        }
        .cursor-sw-resize * {
            cursor: sw-resize !important;
        }
        .cursor-ew-resize * {
            cursor: ew-resize !important;
        }
        .cursor-ns-resize * {
            cursor: ns-resize !important;
        }
        .cursor-nesw-resize * {
            cursor: nesw-resize !important;
        }
        .cursor-nwse-resize * {
            cursor: nwse-resize !important;
        }
        .cursor-zoom-in * {
            cursor: zoom-in !important;
        }
        .cursor-zoom-out * {
            cursor: zoom-out !important;
        }
        .cursor-grab * {
            cursor: grab !important;
            cursor: -webkit-grab !important;
        }
        .cursor-grabbing * {
            cursor: grabbing !important;
            cursor: -webkit-grabbing !important;
        }
        .cursor-crosshair * {
            cursor: crosshair !important;
        }
        .cursor-rotate * {
            cursor: url(res/images/rotate.png), crosshair !important;
        }
    </style>
</custom-style>`;
document.head.appendChild($_documentContainer.content);
