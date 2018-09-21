/**
 * Module contains implementation of class Control
 *
 * @module utilities/indexes
 */

export class IndexDefinition{
    get id(){
        throw "Not implemented";
    }
    get match(){
        throw "Not implemented";
    }

}
/** Class representing index definition for DeltaJS control than build index by DOM element attribute.
 * */

export class AttributeIndexDefinition extends IndexDefinition{

    /**
     * Create index definition instance
     *
     * @param attributeName {String} Name of attribute that used for index build
     */
    constructor(attributeName){
        super();
        this._attributeName = attributeName;
    }

    /**
     * Get name of indexed attribute
     * @return {String}
     */
    get attributeName(){
        return this._attributeName;
    }

    get id(){
        return item=>{
            return item.getAttribute(this.attributeName);
        }
    }
    get match(){
        return item=>{
            return item.hasAttribute(this.attributeName);
        }
    }
}

