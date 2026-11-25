export declare type ImeSuggestionObject = {
    /** The suggestion text */
    suggestion: string
    /** Determines if the input phrase should be finished after the user selected the suggestion. */
    finishPhrase: boolean
    /** If the suggestion will not finish the phrase, this is the number of characters replaced by the suggestion starting from the left side of the active phrase. */
    lengthOfReplacement: number
}

export declare type ImeKeyboardOptionsObject = {
    /** The current ISO language code of the keyboard. */
    activeLanguage: string
    /** The id of active layer of the keyboard */
    activeLayer: string
    /** A abort signal which indicates that the promise should be canceled. */
    abortSignal: AbortSignal | undefined
}

declare type KeyBindingEvents = 'init' | 'localeChange'
declare type KeyBindingKeyboardTypes = 'alpha' | 'numeric' | 'ipv4' | 'date' | 'time'
declare type KeyBindingPropsObject = Record<string, any>

export declare type KeyBindingDataObject = {
    /* The dom ref of the keyboard. */
    keyboard: HTMLElement;
    /* Optional data object passed to the update function. */
    props?: null | KeyBindingPropsObject
}

export declare type KeyBindingUpdateFunction = (
    /* The dom ref of the key which should be updated. */
    key: HTMLElement,
    /* The binding definition object. */
    binding: KeyBindingObject,
    /* The name of the key which provides the binding. */
    name: string,
    /* The name of the event which triggered the update */
    event: string,
    /* Optional data passed to the update function. */
    data: KeyBindingDataObject
) => Promise<void>

export declare type KeyBindingObject = {
    /** The keyboard [types]{@link KeyBindingKeyboardTypes} to which the binding is bound to. */
    types?: KeyBindingKeyboardTypes[],
    /* A valid CSS Selector, which targets all keys that should be updated. */
    selector: string
    /** All [event names]{@link KeyBindingEvents} which should trigger an update of this binding. */
    subscribe?: KeyBindingEvents[],
    /** 
     * This function is called when a event triggers an update. 
     * If set to a string the keyboard uses an internal function to handle the update.
    */
    update: string | KeyBindingUpdateFunction
}

/**
 * Implements the Sigmatek IME Extension Base Class
 * @export
 * @version 01.00.003
 * @class SigImeExtension
 */
export class SigImeExtension {

    /**
     * Returns the id of the IME Extension.
     * 
     *  0 ...... 1000    Sigmatek Internal Range.
     *  1001.... 10000   Sigmatek Application Range.
     *  >10001 	         Customer Range.
     * 
     * @readonly
     * @static
     * @returns {number} The id of the IME Extensions.
     */
    static get id(): number

    /**
     * Returns an array of ISO language codes handled by the IME Extension.
     * @readonly
     * @static
     * @returns {string[]} An array of ISO language codes handled by the IME Extension.
     */
    static get languages(): string[]

    /**
     * Returns an array of suggestions objects for a given phrase.
     * This function is called by the keyboard while the user types in a phrase.
     * @param {string} phrase The phrase to return the suggestions for.
     * @param {ImeKeyboardOptionsObject} options An object with the following structure: {activeLanguage: string, activeLayer: string, abortSignal: AbortSignal}
     * @returns {Promise<ImeSuggestionObject[]|null>} Returns a promise which resolves an array of suggestions objects. []{suggestion: string, finishPhrase: boolean, lengthOfReplacement: number}
     */
    getSuggestions(phrase: string, options: ImeKeyboardOptionsObject): Promise<ImeSuggestionObject[] | null>

    /**
     * This function is called by the keyboard after the user selected a suggestion.
     * @param {ImeSuggestionObject} suggestion The suggestions object of the suggestion the user selected.
     * @param {ImeKeyboardOptionsObject} options  A object with the following structure: {activeLanguage: string, activeLayer: string}
     */
    selectedSuggestion(suggestion: ImeSuggestionObject, options: ImeKeyboardOptionsObject): void

    /**
     * Returns a replacement character for the given original character.
     * @param {string} original The original character to replace.
     * @returns {string|null} The replacement character or null if no replacement was found.
     */
    replaceMapping(original: string): string | null

    /**
     * This function is called if a key binding should be updated.
     * @param {KeyBindingObject} binding The binding object.
     * @param {string} name The name of the key which provided the binding.
     * @param {string} event The name of the event which triggered the update. 
     * @param {KeyBindingDataObject} data An object containing additional data.
     * @return {boolean} Returning true indicates that the update function of the binding itself will not be called by the keyboard. 
     * @memberof SigImeExtension
     */
    updateKeyBinding(binding: KeyBindingObject, name: string, event: KeyBindingEvents, data: KeyBindingDataObject): boolean
}

/**
 * Registers an IME Extension class.
 * @export
 * @param {object} imeExtension The IME Extension class to register.
 * @returns {boolean} Returns true if the extension has been registered, otherwise false.
 */
export declare function registerImeExtension(imeExtension: object): boolean
