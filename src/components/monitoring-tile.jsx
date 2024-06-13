import "@ui5/webcomponents-icons/dist/AllIcons.js";
import {Text} from '@ui5/webcomponents-react';
const MonitoringTile = props => {
  const style = {
    color:  props.textColor
  }
  return (
    <div className="monitoring-tile" onClick={props.onClick}>
      <div className='tile-header'>
        <Text className='tile-header-text'>Messages</Text>
      </div>
      <div className='tile-text' style={style}>
        <span className='tile-text-text'>{props.type}</span>
      </div>
      <div className='tile-number'>
        <span className='tile-number-text'>134</span>
        <span className='tile-number-uom'>count</span>
      </div>
  </div>
  );
}
export default MonitoringTile;