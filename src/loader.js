/**
 * Module contains implementation of abstract class DeltaLoader
 *
 * @module loader
 */

const matches = function (el, selector) {
    // noinspection Annotator
    const f = el.matches || el.matchesSelector || el.msMatchesSelector
        || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector;

    return f && f.call(el, selector);
};

/**
 * Abstract class represents dynamic component loader.
 * If your application has modules with components-like classes, DeltaLoader will ensure that these components are bound to the specified elements.
 *
 */
export class DeltaLoader{
    /**
     * Create loader instance
     *
     * @param targetAttributeName {String}
     */
    constructor(targetAttributeName){
        this._attributeName = targetAttributeName;
    }

    get attributeName (){
        return this._attributeName;
    }

    get selector (){
        return `[${this.attributeName}]`;
    }
    createControl(module, controlClass, element, options, url){
        throw "Not implemented";
    }

    /**
     * Used to resolve URL
     * @param url {string}
     */
    resolve(url){
        return url;
    }

    importModule(url){
        return import(/* webpackMode: "eager" */url ).catch(err=>{
            //#DEBUG
            console.error(`loader.loadControl: Reject module \"${url}\". Error: `, err);
            //#ENDDEBUG
            throw err;
        });
    }

    parseUrl(url){
        const parts = url.split("#");
        return {url: parts[0], className: parts[1]};
    }


    /**
     * Loads control and binds to DOM element dynamically
     *
     * @param element {HTMLElement}
     * @param options {Object}
     * @param url {string}
     * @return {Promise}
     */
    async loadControl(element, options, url){
        if (!url){
            url = element.getAttribute(this.attributeName);
        }
        const urlInfo = this.parseUrl(url);
        const loadedModule = (await this.importModule(this.resolve(urlInfo.url)));

        /*if (!loadedModule){
            throw `Invalid module specified. URL: \"${url}\".`;
        }*/
        const controlClass = urlInfo.className ? loadedModule[urlInfo.className] : loadedModule.default;

        if (!controlClass){
            throw `Module does not contain valid class export. URL: \"${urlInfo.url}\". Class not found: \"${urlInfo.className || "default"}\"`;
        }
        return await this.createControl(loadedModule, controlClass, element, options, urlInfo.url).catch(err=>{
            throw err;
        });
    }

    /**
     * Returns list of elements matching the specified group of selectors, as well as the root element, if it matches selector rules
     *
     * @param root {HTMLElement}
     * @param selector {string} A DOMString containing one or more selectors to match against
     * @return {HTMLElement[]} Array containing elements matching selector rules
     */
    queryAndSelf(root, selector){
        let elements = Array.prototype.slice.call(root.querySelectorAll(selector));
        if (matches(root, this.selector)){
            elements.push(root);
        }
        return elements;
    }

    /**
     * Internal method. Do not override it.
     *
     * @param root {HTMLElement}
     * @param loadedSet {Set<HTMLElement>}
     * @return {Promise}
     */
    loadElementControls(root, loadedSet){
        let elements = this.queryAndSelf(root, this.selector);
        let controls = elements.filter(v=>{
            if (loadedSet.has(v)){
                return false;
            }
            loadedSet.add(v);
            return v;
        }).map(e=>this.loadControl(e, {}));
        return Promise.all(controls);

    }

    /**
     * The root DOM element or the selector of root DOM elements, inside which the components are searched for
     *
     * @param selector {string|HTMLElement} Represents DOM element or CSS selector of nodes
     * @return {Promise} Promise object represents loaded components
     */
    load(selector){
        let roots = typeof(selector) === "string" ?
            this.queryAndSelf(document.body, selector) :
            [selector];
        if (!roots || !roots.length){
            throw "loader: Root not found";
        }
        let loadedSet = new Set();
        return Promise.all(
            roots.map(v=>{
                return this.loadElementControls(v, loadedSet);
            })
        );


    }
}


