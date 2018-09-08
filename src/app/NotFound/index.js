import React from 'react';
import {Link} from 'react-router-dom';


const NotFound = ()=>{
  return (
    <div className="pasm">
      404, 您到了位置领域哦！ 点我 <Link to={`/`}>返回首页</Link>
    </div>
  )
}

export default NotFound
