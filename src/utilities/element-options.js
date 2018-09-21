
export function camelCase(value) {
    return value.replace(/-([a-z])/g,
            g => { return g[1].toUpperCase(); });
}


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