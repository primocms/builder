export default pluralize;
/**
 * Pluralize or singularize a word based on the passed in count.
 *
 * @param  {string}  word      The word to pluralize
 * @param  {number}  count     How many of the word exist
 * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
 * @return {string}
 */
declare function pluralize(word: string, count: number, inclusive: boolean): string;
declare namespace pluralize {
    let plural: Function;
    let isPlural: Function;
    let singular: Function;
    let isSingular: Function;
    /**
     * Add a pluralization rule to the collection.
     *
     * @param {(string|RegExp)} rule
     * @param {string}          replacement
     */
    function addPluralRule(rule: string | RegExp, replacement: string): void;
    /**
     * Add a singularization rule to the collection.
     *
     * @param {(string|RegExp)} rule
     * @param {string}          replacement
     */
    function addSingularRule(rule: string | RegExp, replacement: string): void;
    /**
     * Add an uncountable word rule.
     *
     * @param {(string|RegExp)} word
     */
    function addUncountableRule(word: string | RegExp): void;
    /**
     * Add an irregular word definition.
     *
     * @param {string} single
     * @param {string} plural
     */
    function addIrregularRule(single: string, plural: string): void;
}
