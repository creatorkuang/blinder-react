import React, { Component } from 'react';
import WechatLogin from '../../components/WechatLogin';
import {
  wechatAppId,
  host,
  debugInfo
} from '../../Config'
class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      expiredSec: 25,
      isExpired: false
    }
  }
  componentDidMount() {
    let self = this;
    let interalId = window.setInterval(() => {
      if (self.state.expiredSec > 0) {
        self.setState({
          expiredSec: self.state.expiredSec - 1
        })
      } else {
        self.setState({
          isExpired: true
        })
        window.clearInterval(interalId);
      }
    }, 1000)
  }
  render() {
    const { updateMe, isWechat } = this.props;
    const self = this;
    return (
      <div className="pasm center">
        {!isWechat && (
          <div className="">
            <img src="/logo.jpeg" alt="logo" style={{ width: '200px', marginTop: 100}} />
            <div className="mbmd mtlg c4" style={{ fontSize: "26px" }}>请使用微信扫码完成登录</div>
          </div>
        )}
        {this.state.isExpired || <WechatLogin
          appId={wechatAppId}
          isOpenQrcode={true}
          apiHost={host}
          redirect_uri={`${host}/login`}
          expiresDays={7}
          onOk={(e) => {
            debugInfo('登录成功：', e)
            let profile = {
              _id: e._id,
              name: e.name,
              avatar: e.avatar,
              role: e.role
            }
            window.localStorage.profile = JSON.stringify(profile)
            updateMe(true, profile)
            // redirect
          }} />}
        {this.state.isExpired && (
          <div className="mtsm center">
            <div className="fs4 c4">二维码已过期！</div>
            <button className="btn btn-danger btn-lg mtlg" onClick={() => {
              self.setState({
                isExpired: false,
                expiredSec: 20
              })
            }}>刷新</button>
          </div>
        )}

        {this.state.isExpired || <div className="mtsm fs4 c4">二维码将于{this.state.expiredSec}秒后失效！</div>}
      </div>
    )
  }
}

export default Login
