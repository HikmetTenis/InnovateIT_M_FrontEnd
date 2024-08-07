import Modeling from 'diagram-js/lib/features/modeling/Modeling.js'
import CommandStack from 'diagram-js/lib/command/CommandStack.js'

export var CustomCommandStackModule = {
    __init__: [ 'customCommandStack' ],
    customCommandStack: [ 'type', CommandStack ]
}

var CustomModeling = {
    __init__: [ 'modeling' ],
    customModeling: [ 'type', Modeling ]
}

CustomModeling.$inject = [ 'eventBus', 'elementFactory', 'customCommandStack' ]

export default CustomModeling