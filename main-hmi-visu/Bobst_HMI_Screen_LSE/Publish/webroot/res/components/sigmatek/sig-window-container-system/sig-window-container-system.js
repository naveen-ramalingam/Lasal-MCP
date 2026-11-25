import { LasalRuntimeSigWindowContainer } from '../sig-window-container/sig-window-container.js';

class LasalRuntimeSigWindowContainerSystem extends LasalRuntimeSigWindowContainer {

    static get is() {
        return 'sig-window-container-system';
    }

    constructor() {
        super();
        this.theme = 'systemWindow';
        this.controlButtons = `<button class="jsPanel-btn jsPanel-btn-close jsPanel-btn-md" aria-label="Close">${this.defaultIcons.close}</button> `;
    }
}
customElements.define(LasalRuntimeSigWindowContainerSystem.is, LasalRuntimeSigWindowContainerSystem);