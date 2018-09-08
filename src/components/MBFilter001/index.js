/* @flow */
import React from 'react'
import moment from 'moment'

 export const MBFilter001 = ({date,format='YYYY年MM月DD日',...inputProps}) => {
   let dval = date;
   try{
      let parseVal = JSON.parse(dval);
      if(parseVal) {
        dval = parseVal;
      }
    }catch(e){};
  let d = new Date(dval);
  if(d==='Invalid Date') {
    d = new Date();
  }
  let formatedTime = moment(d).format(format)
  return (
    <span className={"c4 fs1"} {...inputProps} >
      {formatedTime}
    </span>
  )
}

// MBFilter001.propTypes = {
//   format: React.PropTypes.string,
//   date: React.PropTypes.node,
// }


export default MBFilter001
