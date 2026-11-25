import { dedupingMixin } from '../../../../rt/node_modules/@polymer/polymer/lib/utils/mixin.js';
export const OverrideChildOpacityMixin = dedupingMixin((superClass) => {
    return class extends superClass {
        static get properties() {
            return {
                overrideinactivechildopacity: {
                    type: Boolean,
                    value: false,
                    reflectToAttribute: true
                }
            }
        }
    };
});
OverrideChildOpacityMixin.mixinName = 'OverrideChildOpacityMixin';

