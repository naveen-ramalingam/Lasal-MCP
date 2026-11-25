// @ts-ignore
/// <reference path="../Runtime/TypeScript/types/sig-api.d.ts" />

/**
 * Demo how to use window.sigApiReadyPromise and window.eventReadyPromises
 *  * window.sigApiReadyPromise {Promise}
 *  * window.eventReadyPromises {Map} key: {string} sigApi.CONST.EVENT_READY_PROMISE_*, value: {Promise}
 *    supported keys:
 *     * sigApi.SIG_CONST.EVENT_READY_PROMISE_API_READY
 *     * sigApi.SIG_CONST.EVENT_READY_PROMISE_WS_READY
 *     * sigApi.SIG_CONST.EVENT_READY_PROMISE_ACCESS_SEQUENCE_READY
 *     * sigApi.SIG_CONST.EVENT_READY_PROMISE_LASALIDS_READY
 *   * window.observeStationsReadyPromise {Promise}
 *   * window.observeStationsLasalIdsReadyPromise {Promise}
 *   * window.requiredStationsReadyPromise {Promise}
 *   * window.requiredStationsLasalIdsReadyPromise {Promise}
 *   * window.staticCheckbitsReadyPromise {Promise}
 *
 * copyright by Sigmatek GmbH & CoKG
 */
class DemoReadyPromises {
    static init() {
        window.sigApiReadyPromise.then(() => {
            const codemodule = new DemoReadyPromises();
        });
        window.observeStationsReadyPromise.then((stationIds) => {
            console.log('[DemoReadyPromises] observeStationsReadyPromise', stationIds);
        });
        window.observeStationsLasalIdsReadyPromise.then(() => {
            console.log('[DemoReadyPromises] observeStationsLasalIdsReadyPromise');
        });
        window.requiredStationsReadyPromise.then((stationIds) => {
            console.log('[DemoReadyPromises] requiredStationsReadyPromise', stationIds);
        });
        window.requiredStationsLasalIdsReadyPromise.then(() => {
            console.log('[DemoReadyPromises] requiredStationsLasalIdsReadyPromise');
        });
        window.staticCheckbitsReadyPromise.then(() => {
            console.log('[DemoReadyPromises] staticCheckbitsReadyPromise');
        });
    }

    constructor() {
        window.eventReadyPromises.get(window.sigApi.SIG_CONST.EVENT_READY_PROMISE_API_READY)?.then(() => {
            console.log('[DemoReadyPromises] EVENT_READY_PROMISE_API_READY');
        });
        window.eventReadyPromises.get(window.sigApi.SIG_CONST.EVENT_READY_PROMISE_WS_READY)?.then(() => {
            console.log('[DemoReadyPromises] EVENT_READY_PROMISE_WS_READY');
        });
        window.eventReadyPromises.get(window.sigApi.SIG_CONST.EVENT_READY_PROMISE_ACCESS_SEQUENCE_READY)?.then(() => {
            console.log('[DemoReadyPromises] EVENT_READY_PROMISE_ACCESS_SEQUENCE_READY');
        });
        window.eventReadyPromises.get(window.sigApi.SIG_CONST.EVENT_READY_PROMISE_STATIONS_READY)?.then(() => {
            console.log('[DemoReadyPromises] EVENT_READY_PROMISE_STATIONS_READY');
        });
        window.eventReadyPromises.get(window.sigApi.SIG_CONST.EVENT_READY_PROMISE_LASALIDS_READY)?.then(() => {
            console.log('[DemoReadyPromises] EVENT_READY_PROMISE_LASALIDS_READY');
        });
    }

}

/**
 * Create the codemodule instance
 */
DemoReadyPromises.init();
