import {isWeChatBroswer} from '../../util';
import React from 'react';
import {host} from '../../Config';
import MBQrcode from '../../components/MBQrcode';
import MBWechatPay from '../../components/MBWechatPay';



const serialize = (obj, prefix) => {
  return Object.keys(obj).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`).join('&');
};

const callPrepay = (query,callback) => {
  return fetch(`${host}/api/weixin/scanPrepay`,{
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json','Authorization': 'user '+ window.localStorage.token},
    body: serialize(query)
  }).then((res)=>res.json()).then((json)=>{
    callback(null,json.data)
  })
}


const callPayResult = (tradeNo,callback)=>{
  return fetch(`${host}/api/weixin/payResult/`+tradeNo,{
    method: 'GET',
    headers: {'Accept': 'application/json','Authorization': 'user '+window.localStorage.token},
  }).then((res)=>res.json()).then((json)=>{
    callback(null,json.data)
  }).catch((err)=>{
    console.log('get pay error')
    callback(err,null)
  })
}

let rid;
const initCheck = (tradeNo,cb)=>{
  rid = window.setInterval(()=>{
    callPayResult(tradeNo, (err,result)=>{
      if(result){
        console.log('finish pay',result);
        window.clearInterval(rid);
        cb(null,'ok');
      } else {
        console.log('get errr',err);
        cb(err,null);
      }
    });
  },2000)
}


class CheckoutBtn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPay: false,
      QrcodeUrl: false,
      startPrepay: false
    }
  }
  
  render() {
    const {style,className='btn btn-sm btn-primary ptxs pbxs center',price=1,type='一天',photoIds,onOk}= this.props;  
    let text =`${price && price>0 ? price : 1}元下载原图`
    if(this.props.text) {
      text = this.props.text
    }
    let prepayQuery = {
      type,
      price
    }
    
    const self = this;
    const clickBtn = (e)=>{
      e.stopPropagation();
      if(isWeChatBroswer()) {
        self.setState({startPrepay:true})
      } else {
        // show wechat screan pay
        callPrepay(prepayQuery,(err,data)=>{
          if(data && data.url){
            self.setState({
              showPay: true,
              QrcodeUrl: data.url
            })
            // 5s后开始检车
            setTimeout(function(){
              initCheck(data.tradeNo,(err,result)=>{
                if(result){
                  self.setState({
                    showPay:false
                  })
                  if(onOk && typeof onOk==='function') {
                    onOk(result)
                  }
                }
              });
            }, 5000);
            return;
          } else {
            alert('支付Url不存在，请联系管理员')
          }
        });
      }
    }
    return (
      <div>
        <div style={style||{}} className={className} onClick={(e)=>clickBtn(e)}>
          {text}
        </div>
        
        <div className={`modal fade ${this.state.showPay?'in':''}`} style={{display:this.state.showPay?'block':'none'}}
        onClick={()=>{
          self.setState({showPay: false});
          window.clearInterval(rid);
        }}
        >
          <div className="modal-dialog" onClick={(e) => {
                e.stopPropagation();
              }}>
              <div className="modal-content palg center" style={{paddingTop: '50px',position: 'relative',lineHeight: 1, color: '#333',marginTop:100}}>
              <div style={{position: 'absolute',top: '20px',right: '20px',fontSize: '20px',fontWeight: 300,color: '#666',cursor: 'pointer'}}
                onClick={()=>{
                  self.setState({showPay: false});
                  window.clearInterval(rid);
                }}
                >x</div>
                <div className="fs4">请使用微信扫码完成支付</div>
                
                <div className="mtmd">
                  <MBQrcode value={self.state.QrcodeUrl} size={8} />
                </div>
                <div className="mtmd fs4 ">
                  您需支付<span className="mlxs mrxs" style={{color:'#1ab394',fontSize:25}}>{price}</span>元
                </div>
              </div>

            </div>
        </div>
       <MBWechatPay prepayQuery={{
         type,
         price,
         photoIds: photoIds && photoIds.join(',')
       }} 
        prepayUrl={`${host}/api/weixin/prepay`}
        startPrepay={this.state.startPrepay} onOk={()=>{
          console.log('支付成功!')
          self.setState({
            startPrepay: false,
            showPay: false
          })
          if(onOk && typeof onOk==='function') {
            onOk()
          }
          
        }}
        onCancel={()=>{
          self.setState({
            startPrepay: false
          })
        }} 
        onError={(err)=>{
          console.error(err)
          self.setState({
            startPrepay: false
          })
        }}/>
      </div>
      
    )
  }
}

export default CheckoutBtn