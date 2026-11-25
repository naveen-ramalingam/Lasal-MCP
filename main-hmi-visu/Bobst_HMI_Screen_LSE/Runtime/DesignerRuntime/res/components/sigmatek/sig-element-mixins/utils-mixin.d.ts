/// <reference path="../../../../rt/node_modules/@types/sig-api/index.d.ts" />

declare type eventTypes = 'jsEvent' | 'runtimeEvent' | 'runtimeUserEvent' | 'polymerEvent'
declare type runtimeEventObject = { maId: number, miId: number }

/**
 * Declares mixin properties and functions for various utility functions.
 * @mixin
 * @version 01.00.002
 */
declare function UtilsMixin<T extends new (...args: any[]) => {}>(base: T): T & UtilsMixinConstructor

interface UtilsMixinConstructor {
    new(...args: any[]): UtilsMixin
}

interface UtilsMixin {

    /** A reference to the sigUtils API. */
    readonly utilsApi: SigApi.ApiSigUtils | undefined

    /**
     * Adds event listener and registers the event into registered events array.
     * @param {string|object} event A case-sensitive string representing the event type to listen for ('mouseout', 'APPROUTE_CHG', 'LANGUAGE_CHG', etc.). 
     * or an object containing major and minor ID for the runtime event.
     * @param {Function} handler The event handler that is executed when the event is fired.
     * 
     * The function signature of the handler callback depends on the type:
     *
     * |type|function signature|
     * |---|---|
     * |'jsEvent'|(event: Event) => void|
     * |'runtimeEvent'|(maId: number, miId: number, message: any) => void|
     * |'runtimeUserEvent'|(maId: number, miId: number, message: any) => void|
     * |'polymerEvent'|(event: Event) => void|
     * 
     * Additional information on message format of runtimeEvents is documented in ApiEvents.
     * @param {string} [type='jsEvent'] The basic event type ('jsEvent', 'runtimeEvent', 'runtimeUserEvent', 'polymerEvent').
     * @param {object} [target={}] The event target (this, window, tbody, etc.).
     *
     * Parameter target is used/optional depending on type:
     *
     * |type|used|optional|
     * |---|---|---|
     * |'jsEvent'|yes|no|
     * |'runtimeEvent'|no|-|
     * |'runtimeUserEvent'|no|-|
     * |'polymerEvent'|yes|no| 
     * @param {object} [options={}] The event options.
     *
     * Parameter options is used/optional depending on type:
     *
     * |type|used|optional|
     * |---|---|---|
     * |'jsEvent'|yes|yes|
     * |'runtimeEvent'|no|-|
     * |'runtimeUserEvent'|no|-|
     * |'polymerEvent'|no|-|
     * @returns {number|boolean} In case of runtimeEvent being added the UID of Runtime event will be returned. False is returned if the parameters are wrong.
     */
    sigAddEventListener(
        event: string | Event | runtimeEventObject,
        handler: ((event: globalThis.Event) => void) |
            ((event: globalThis.CustomEvent<any>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.TapEventDetail>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.DownEventDetail>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.UpEventDetail>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.TrackEventDetail>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.LongPressEventDetail>) => void) |
            ((event: globalThis.CustomEvent<SigUtils.Gestures.PinchZoomEventDetail>) => void) |
            ((maId: number, miId: number, message: any) => void),
        type?: eventTypes,
        target?: object,
        options?: object
    ): number | boolean

    /**
     * Removes event listener and removes the event from the registered events array.
     * @param {string|object} event A case-sensitive string representing the event type ('mouseout', 'APPROUTE_CHG', 'LANGUAGE_CHG', etc.) or an object containing major and minor ID for the runtime event.
     * When the type of event listener is runtimeEventById, event is an object with maId and miId.
     * @param {Function|number} handler The event handler or UID for runtimeEvent.
     * @param {string} [type='jsEvent'] The basic event type ('jsEvent', 'runtimeEvent', 'runtimeUserEvent', 'polymerEvent').
     * @param {object} [target={}] The event target (this, window, tbody, etc.).
     *
     * Parameter target is used/optional depending on type:
     *
     * |type|used|optional|
     * |---|---|---|
     * |'jsEvent'|yes|no|
     * |'runtimeEvent'|no|-|
     * |'runtimeUserEvent'|no|-|
     * |'polymerEvent'|yes|no|
     * @param {object} [options={}] The event options.
     *
     * Parameter options is used/optional depending on type:
     *
     * |type|used|optional|
     * |---|---|---|
     * |'jsEvent'|yes|yes|
     * |'runtimeEvent'|no|-|
     * |'runtimeUserEvent'|no|-|
     * |'polymerEvent'|no|-|
     * @returns {boolean} True if the event listener was removed, otherwise false.
     */
    sigRemoveEventListener(
        event: string | Event | runtimeEventObject,
        handler: Function | number,
        type?: eventTypes,
        target?: object,
        options?: object
    ): boolean

    /**
     * De-registers/unsubscribes/removes ALL event listeners defined in the registeredEvents property. Clears the registeredEvents property afterwards.
     * @returns {boolean} True if event listeners were cleared, otherwise false.
     */
    sigRemoveAllEventListeners(): boolean

    /**
      * Calls sigUtils API to set interval.
      * @param {Function} handler Interval handler.
      * @param {number} [interval=0] The interval in milliseconds.
      * @returns {number} The interval ID.
     */
    sigSetInterval(handler: Function, interval?: number): number | null

    /**
     * Calls sigUtils API to clear given interval.
     * @param {number} intervalID The ID of the interval to be cleared.
     * @returns {boolean} True, if the interval was cleared.
    */
    sigClearInterval(intervalID: number): boolean

    /**
     * Calls sigUtils API to clear all intervals set in this context.
     * @returns {boolean} True if intervals were cleared, otherwise false.
    */
    sigClearAllIntervals(): boolean

    /**
     * Calls sigUtils API to set timeout.
     * @param {Function} handler Timeout handler.
     * @param {number} [delay=0] The timeout in milliseconds.
     * @returns {number} The timeout ID.
    */
    sigSetTimeout(handler: Function, delay?: number): number | null

    /**
    * Calls sigUtils API to clear given timeout.
    * @param {number} timeoutID The ID of the timeout to be cleared.
    * @returns {boolean} True, if the timeout was cleared.
    */
    sigClearTimeout(timeoutID: number): boolean

    /**
     * Calls sigUtils API to clear all timeouts set in this context.
     * @returns {boolean} True if timeouts were cleared, otherwise false.
    */
    sigClearAllTimeouts(): boolean

    /**
     * Calls sigUtils API to register a promise.
     * @param {Promise} promise The promise that is to be registered.
     * @param {Function} [resolveFcn] The resolve function of the promise. Optional, if the promise object contains resolvePromise().
     * @param {Function} [rejectFcn] The reject function of the promise. Optional, if the promise object contains rejectPromise().
     * @returns {boolean} Returns true if the promise was registered, false if the parameters were wrong.
    */
    sigRegisterPromise(promise: Promise<any>, resolveFcn?: Function, rejectFcn?: Function): boolean

    /**
     * Calls sigUtils API to clear all registered promises in the given context. 
     * @returns {boolean} True if promises were rejected, otherwise false.
    */
    sigRejectAllPendingPromises(): boolean

    /**
     * Clears all event listeners, timeouts, intervals and rejects all pending promises of the component.
     * @returns {boolean} True, if the context is defined, otherwise false.
    */
    sigClearAll(): boolean
}

export { UtilsMixin, UtilsMixinConstructor, eventTypes, runtimeEventObject }