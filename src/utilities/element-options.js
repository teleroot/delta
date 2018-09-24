/**
 * Converts "kebab case" string to "camel case".
 * @example
 * camelCase("my-property") // returns "myProperty"
 *
 * @param value {string} String in kebab case format
 * @return {string} String in camel case.
 */
export function camelCase(value) {
    return value.replace(/-([a-z])/g,
            g => { return g[1].toUpperCase(); });
}

/**
 * Extracts options from DOM element
 *
 * @param element {HTMLElement} DOM element which options to be extracted
 * @param prefix {string} Prefix of attribute names, from which parameters are extracted
 * @param validAttributeFunc {Function=} Predicate, to test each attribute of element. Return true to accept the attribute, false otherwise.
 * It accepts attribute name as parameter.
 * @param formatMemberNameFunc {Function=} Optional predicate, to specify option field name. Function {@link camelCase|camelCase} used by default. If accepts attribute name without prefix as parameter.
 *
 * @return {Object} Plain Javascript object containing collected attribute values
 *
 * @example
 *
 * <div id="any_id" data-text-to-show="Hello, world!" data-my-property="my value" />
 * <script>
 * var options = extractElementOptions(document.getElementById("any_id"), "data-");
 * // options = {textToShow: "Hello, world!", myProperty="my value"}
 * </script>
 *
 */
export function extractElementOptions (element, prefix, validAttributeFunc, formatMemberNameFunc) {
    formatMemberNameFunc = formatMemberNameFunc || camelCase;
    let options = {};

    let attrs = Array.prototype.slice.call(element.attributes),
        attrName,
        dl = prefix.length;
    attrs.forEach(attr=>{
        attrName = attr.nodeName;
        if (attrName.substr(0, dl) === prefix && (!validAttributeFunc || validAttributeFunc(attrName))) {
            attrName = attrName.substr(dl, attrName.length);
            attrName = formatMemberNameFunc(attrName);
            options[attrName] = attr.nodeValue;
        }
    });
    return options;
}