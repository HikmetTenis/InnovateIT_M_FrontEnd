import BaseRenderer from 'bpmn-js/dist/bpmn-navigated-viewer.production.min.js';
const HIGH_PRIORITY = 1500;
export default class CustomRenderer extends BaseRenderer {
    
    constructor(eventBus) {
        super(eventBus, HIGH_PRIORITY);
    }
}