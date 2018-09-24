/**
 * Module contains implementation of class DeltaControlLoader
 *
 * @module control-loader
 */

import {DeltaLoader} from "./loader.js";

const DELTA_CONTROL_ATTRIBUTE_NAME = "data-control";
const DELTA_APPLICATION_ATTRIBUTE_NAME = "data-app";

const _controlMap = new WeakMap();

/**
 * Represents loader for DeltaJS controls
 */
export class DeltaControlLoader extends DeltaLoader{
    /**
     * Internal property. Do not use it.
     * @return {WeakMap<HTMLElement, Control>}
     */
    static get controlMap(){
        return _controlMap;
    }

    /**
     * Creates instance of control loader
     */
    constructor(){
        super(DELTA_APPLICATION_ATTRIBUTE_NAME);
    }

    /**
     * Returns attribute name that used to load control
     * @return {string}
     */
    get controlAttributeName(){
        return DELTA_CONTROL_ATTRIBUTE_NAME;
    }
    /**
     * Returns DeltaJS control bound to specified element
     *
     * @param element {HTMLElement}
     * @return {Control}
     */
    getControl(element) {
        return _controlMap.get(element);
    }

    /**
     * Internal method. Do not use it.
     * @param element {HTMLElement}
     * @return {string}
     */
    getControlUrl(element){
        return element.getAttribute(this.controlAttributeName) ||
            element.getAttribute(this.attributeName);
    }

    /**
     * Binds control to specified DOM element. Checks if this element has control binding
     *
     * @param control {Control}
     * @param element {HTMLElement}
     */
    attachControl(control, element){
        if (_controlMap.has(element)) {
            throw `Invalid element data. Control already bound: ${element.tagName}[${this.getControlUrl(element)}]`;
        }
        _controlMap.set(element, control);
    }
    /**
     * Unbinds control from the specified DOM element
     *
     * @param element {HTMLElement}
     */
    detachControl(element){
        _controlMap.delete(element);
    }

    /**
     * Creates Control instance and binds it to specified element
     *
     * @param loadedModule {Object} Represents loaded ES2015 module
     * @param controlClass Represents control class
     * @param element {HTMLElement}
     * @param options {Object} Control options
     * @param url {string} URL used to load control
     * @return {PromiseLike}
     */
    createControl(loadedModule, controlClass, element, options, url){
        return (new controlClass(this, element, options)).promise;
    }



}