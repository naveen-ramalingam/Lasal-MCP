/**
 * Declares mixin properties and functions to override child opacity in container controls.
 * @mixin
 * @version 01.00.000
 */
declare function OverrideChildOpacityMixin<T extends new (...args: any[]) => {}>(base: T): T & OverrideChildOpacityMixinConstructor

interface OverrideChildOpacityMixinConstructor {
    new(...args: any[]): OverrideChildOpacityMixin
}

interface OverrideChildOpacityMixin {
    /**
     * When this option is enabled, the opacity of inactive child elements is overwritten with the value 1
     * to ensure that the resulting total opacity does not cause child elements to become invisible.
     */
    overrideinactivechildopacity: boolean;
};

export { OverrideChildOpacityMixin, OverrideChildOpacityMixinConstructor };
