/**
 * Module contains implementation of class Control
 *
 * @module control
 */

import {extractElementOptions} from "./utilities/element-options.js";
import {IndexDefinition, AttributeIndexDefinition} from "./utilities/indexes.js";


const indexCache = {};

/**
 *
 */
export class Control {

    /**
     * Getter for control options
     * @returns {*}
     */
    get options() {
        return this._options;
    }

    /**
     * Getter for child element
     * @returns {string}
     */
    get nameAttribute() {
        return "data-name";
    }

    /**
     * Represents control's asynchronous state
     *
     * @return {Promise}
     */
    get promise() {
        return this._promise;
    }
    /**
     * Represents control's topmost DOM element in control hierarchy
     *
     * @return {HTMLElement}
     */
    get scope(){
        return this._scope || this.originalContext;
    }

    /**
     * Represents DOM element to which the control is bound
     * @return {HTMLElement}
     */
    get context(){
        return this.originalContext;
    }

    /**
     * Returns control index definitions. By default only {@link module:utilities/indexes.AttributeIndexDefinition|AttributeIndexDefinition} is included
     *
     * @return {Object}
     * @see {@link module:utilities/indexes.AttributeIndexDefinition|AttributeIndexDefinition}
     */

    get indexDefinitions() {
        if (this._indexDefinitions){
            return this._indexDefinitions;
        }
        let nameAttribute = this.nameAttribute,
            indexDefinition = indexCache[nameAttribute];
        if (!indexDefinition){
            indexDefinition = new AttributeIndexDefinition(nameAttribute);
        }
        this._indexDefinitions = {
            "names": indexDefinition
        };
        return this._indexDefinitions;
    }

    /**
     * Returns a reference to the topmost control in the control hierarchy.
     * Usually the application is this control.
     *
     * @return {Control} Topmost control
     */
    get top() {
        return this._scope ? this.loader.getControl(this._scope) : this;
    }

    /**
     * Internal method. Do not use it directly.
     *
     * @return {Promise} Promise object represents current control state
     */
    async doInit(){
        await this.initialize();
        await this.render();
        await this.createChildControls();
        await this.on();
        return this;
    }

    /**
     * Internal constructor. Do not use it directly. Use .loader.loadControl method instead.
     *
     * @param loader {DeltaControlLoader} Parent loader object initiating current control instance
     * @param element {HTMLElement} DOM element to which you want to bind control
     * @param options {Object} Initial parameters
     * @see {@link module:loader.DeltaLoader#load|DeltaLoader.load}
     */
    constructor(loader, element, options) {
        const self = this;
        this.loader = loader;
        this.originalContext = element;
        //#DEBUG
        this._DEBUG_URI = loader.getControlUrl(element);
        /*console.log("Create control: ", this._DEBUG_URI);*/
        //#ENDDEBUG

        options = Object.assign({}, self.getElementOptions(element), options);
        const parent = options.parent;
        self._options = options;
        self._scope = parent ? parent.top.originalContext : undefined;
        self.parent = parent;
        self.loader = loader;
        self.indexes = self.createIndexes();
        self.named = this.indexes.names;
        self.attach(element);
        self._promise = self.doInit().catch(err=>{
            throw err;
        });
    }

    /**
     * Method for control initialization.
     *
     * @returns {Promise|undefined}
     */
    initialize() {}

    /**
     * Method for control content rendering.
     *
     * @returns {Promise|undefined}
     */
    render() {}

    /**
     * Use this method for setting up DOM event listeners
     * @returns {Promise|undefined}
     */
    on() {}

    /**
     * Creates control indexes from index definitions.
     * Indexes are objects containing DOM elements that must be accessible by a given identifier.
     *
     * @returns {Object} Object with named indexes
     */
    createIndexes() {
        return Object.keys(this.indexDefinitions).reduce((acc, def) => {
            acc[def] = {};
            return acc;
        }, {});
    }

    /**
     * Replace given DOM element with another in all indexes. This method used in .moveTo method
     *
     * @param oldElement {HTMLElement} DOM element to be replaced
     * @param newElement {HTMLElement} New DOM element value
     */
    replaceElementIndex(oldElement, newElement) {
        let indexes = this.indexes;
        Object.keys(indexes).forEach(v => {
            let index = indexes[v];
            Object.keys(index).forEach(v=>{
                if (index[v] === oldElement){
                    index[v] = newElement;
                }
            });
        });
    }

    /**
     * Called when attached to DOM element
     *
     * @param element {HTMLElement}
     */
    attach(element) {
        this.loader.attachControl(this, element);
    }

    /**
     * Called when detached from DOM element
     *
     * @param element {HTMLElement}
     */
    detach(element) {
        this.loader.detachControl(element);
    }

    /**
     * Binds current control with new DOM element
     *
     * @param newElement {HTMLElement} The element to bind control to
     */
    moveTo(newElement) {
        let ctx = this.originalContext,
            attrName = this.loader.controlAttributeName,
            ctrlUrl = ctx.getAttribute(attrName);
        if (this.parent) {
            this.parent.replaceElementIndex(ctx, newElement);
        }
        ctx.removeAttribute(attrName);
        this.originalContext = newElement;
        newElement.setAttribute(attrName, ctrlUrl);
        this.detach(ctx);
        this.attach(newElement);
    }

    /**
     * Service method. Used for child DOM tree traversal
     *
     * @param elem {HTMLElement} Element whose child nodes will be visited
     * @param callback {Function} Callback function that is executed when a node is visited
     */
    traverseChildren(elem, callback) {
        let item = elem.firstElementChild;
        while (item) {
            let res = callback(item);
            if (res !== false) {
                this.traverseChildren(item, callback);
            }
            item = item.nextElementSibling;
        }
    }


    /**
     * Service method. Called when visiting nodes in a DOM tree.
     * Override this method to control DOM traversing flow.
     *
     * @param item
     * @returns {boolean} If false, prevents further traversal
     */
    shouldVisitElement(item) {
        return true;
    }
    wrapIndexedElement(item){
        return item;
    }

    /**
     * Updates the indexes of the control, if required. Called when traversing a DOM tree.
     *
     * @param item
     */
    updateIndexes(item){
        let definitions = this.indexDefinitions;
        Object.keys(definitions).forEach(idx => {
            this.indexes[idx] = this.indexes[idx] || {};
            let definition = definitions[idx];
            if (!(definition instanceof IndexDefinition)) {
                throw {message: "Invalid index definition. Subclass of IndexDefinition expected."}
            }
            if (definition.match(item)) {
                this.indexes[idx][definition.id(item)] = this.wrapIndexedElement(item);
            }
        });
    }


    /**
     * Determines whether you want to load the child control elements. Default value: true
     *
     * @returns {boolean}
     */
    get canHaveChildren(){
        return true;
    }

    /**
     * Represents options passed to child controls in createChildControls method
     *
     * @return {Object}
     */
    get childOptions(){
        return {parent: this};
    }

    /**
     * Returns a list of DOM elements for further loading of child controls
     *
     * @returns {HTMLElement[]} Array containing DOM elements
     */
    getControlElements(){
        let controls = [],
            self = this,
            stopAttrName = self.loader.attributeName,
            attrName = self.loader.controlAttributeName;
        this.traverseChildren(this.originalContext, item => {
            if (self.shouldVisitElement(item) === false) {
                return false;
            }
            self.updateIndexes(item);
            if (item.hasAttribute(attrName)) {
                controls.push(item);
                return false;
            } else if (item.hasAttribute(stopAttrName)) {
                return false;
            }
        });
        return controls;
    }

    /**
     * Traverses the DOM tree and creates the DeltaJS child controls.
     *
     * @returns {Promise} Promise object represents loaded child controls
     */
    createChildControls() {

        if (!this.canHaveChildren){
            return Promise.resolve();
        }
        let controls = this.getControlElements();

        if (!controls.length) {
            return Promise.resolve();
        }
        const options = this.childOptions;

        let loadedControls = controls.map((element) => {
            const url = element.getAttribute(this.loader.controlAttributeName);
            return this.loader.loadControl(element, options, url).catch(err => {
                /*//#DEBUG
                console.error("sys/control:loadControl: Reject module \"%s\". Error: ", url, err);
                //#ENDDEBUG*/
                throw {error: err, url: url};
            });
        });
        return Promise.all(loadedControls);
    }

    /**
     * Reads DOM element's data-* attributes and builds control options
     *
     * @param element {HTMLElement} DOM element whose attributes should be read
     */
    getElementOptions(element) {
        let controlAttrName = this.loader.controlAttributeName;
        return extractElementOptions(element,
            "data-", attrName => {
                return attrName !== controlAttrName
            }
        );
    }


}
