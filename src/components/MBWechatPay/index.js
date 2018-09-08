import React from 'react';

const ApiFetch = (url,query)=>{
  return fetch(url,{
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {'Authorization': `User ${window.localStorage['token']}`, 'content-type': 'application/json'},
      body: JSON.stringify(query)
  })
  .then((res)=>res.json())
  .then((json)=>{
    return json
  })
}

function detectWeixinApi(callback){
  if(typeof window.WeixinJSBridge === undefined || typeof window.WeixinJSBridge.invoke === undefined){
      setTimeout(function(){
          detectWeixinApi(callback);
      },200);
  }else{
      callback();
  }
}

class MBWechatPay extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      isStart:false
    }
  }
  wxPay (order) {
    // let self = this
    let {onOk,onError,onCancel} = this.props;
    detectWeixinApi(function() {
      window.wx.chooseWXPay({
        timestamp: parseInt(order.timeStamp, 10), // 支付签名时间戳
        nonceStr: order.nonceStr, // 支付签名随机串，不长于 32 位
        package: order.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
        signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
        paySign: order.paySign, // 支付签名
        success: function (res) {
          // 支付成功后的回调函数
          if (res.errMsg === 'chooseWXPay:ok') {
            if(onOk && typeof onOk==='function') {
              onOk()
            }
          } else {
            if(onError && typeof onError ==='function') {
              onError()
            }
          }
        },
        cancel: function (res) {
          if(onCancel && typeof onCancel ==='function') {
            onCancel()
          }
        }
      })
    })
  }
  getPrepay(){
    let {prepayUrl,prepayQuery} = this.props;
    let self = this;
    ApiFetch(prepayUrl,prepayQuery).then((order)=>{
      if(order.statusCode) {
        self.wxPay(order.data)
      } else {
        self.wxPay(order);
      }
    })
  }
  componentWillReceiveProps(np) {
    if(np.startPrepay===true) {
      this.getPrepay()
    }
  }
  render(){
    return (
      <div>
      </div>
    )
  }
}

MBWechatPay.defaultProps = {
  prepayUrl:'/api/weixin/prepay',
  prepayQuery:{}
}

export default MBWechatPay
