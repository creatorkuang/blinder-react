import React from 'react'

const serialize = (obj, prefix) => {
  return Object.keys(obj).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
};

const callInit = (ApiHost,url,callback) => {
  return fetch(ApiHost+'/api/weixin/initJssdk',{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'},
    body: serialize({url: url})
  }).then((res)=>res.json()).then((json)=>{
    callback(null,json.data)
  })
}

class WechatInit extends React.Component {
  componentDidMount() {
    let {ApiHost} =this.props;
    let url = window.location.href.split('#')[0]
    callInit(ApiHost,url,(err,data)=>{
      if(data){
        const apis = ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ',
         'onMenuShareWeibo', 'onMenuShareQZone','previewImage','chooseWXPay']
       if (window.wx) {
        window.wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: data.appId, // 必填，公众号的唯一标识
          timestamp: data.timestamp, // 必填，生成签名的时间戳
          nonceStr: data.nonceStr, // 必填，生成签名的随机串
          signature: data.signature, // 必填，签名，见附录1
          jsApiList: apis,
        })
       }
      }
    })
  }
  render () {
    return <div></div>
  }
}

export default WechatInit
