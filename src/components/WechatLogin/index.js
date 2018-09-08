import React from 'react';
import 'whatwg-fetch';


class WechatLogin extends React.Component{
  constructor(props){
    super(props)
    this.state= {
      url: ''
    }
  }
  componentDidMount() {
    const {onOk,onErr,appId,redirect_uri,isOpenQrcode,expiresDays,notRun, apiHost,banRedirect, webScanExpired=30} = this.props;

    const self = this;
    var jz = {
      appId:appId,
      getParameterByName: function(name) {
        var url = window.location.href;
        name = name.replace(/[[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
      },
      isWeChatBroswer: function() {
        var ua = navigator.userAgent.toLowerCase();
        return ua.match(/MicroMessenger/i) && ua.match(/MicroMessenger/i)[0] === "micromessenger"
      },
      isTokenExpired: function (day) {
        var lastTime = parseInt(window.localStorage.authTime, 10) || 0;
        var now = new Date().getTime();
        var timeLen = day * 24 * 3600 * 1000;
        return now - lastTime > timeLen
      },
      loadJs: function (url, fn) {
          var script = document.createElement("script");
          script.type = "text/javascript";
          var isJs = /(\.js)$/.exec(url);
          if (script.readyState) {
              script.onreadystatechange = function() {
                  if (script.readyState === "loaded" || script.readyState === "complete") {
                      script.onreadystatechange = null;
                      fn instanceof Function && fn.call();
                      !isJs && script.parentNode.removeChild(script)
                  }
              }
          } else {
              script.onload = function() {
                  fn instanceof Function && fn.call();
                  !isJs && script.parentNode.removeChild(script)
              }
          }
          script.src = encodeURI(url);
          document.getElementsByTagName("head")[0].appendChild(script)
      }
    }

    function getQrcodeUrl (value){

      return window.qr.toDataURL({
          size: 10,
          value: value
      });
    }
    const genTempUrl = ()=>{
      let tempUrl = getQrcodeUrl('此二维码仅用作编辑模式的测试占位')
      this.setState({url: tempUrl});
      return
    }
    if(notRun) {
      if(!window.qr) {
        jz.loadJs("/qr.min.js", function() {
          genTempUrl()
        })
      } else {
        genTempUrl()
      }
      return
    }

    function saveToLocal(name, val) {
        window.localStorage.setItem(name, val)
    }
    function getFromLocal(name) {
        return window.localStorage[name]
    }
    function setCookie(name,value,Days) {
      var exp = new Date();
      exp.setTime(exp.getTime() + Days*24*60*60*1000);
      document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    }
    function saveUser(data) {
        saveToLocal("token", data.token);
        saveToLocal("authTime", new Date().getTime());
        setCookie('token',data.token,expiresDays);
        if(onOk && typeof onOk ==='function') {
          onOk(data);
        }

        // saveToLocal("uid", data._id);
        // saveToLocal("avatar", data.avatar);
        // saveToLocal("nickname", data.nickname);

        // setCookie('token',data.token);
        if(!banRedirect){
          var wrd = window.localStorage["wrd"]||'/';
          if(wrd.indexOf('http')>-1) {
            window.location.href = wrd  
          } else {
            window.location.href = window.location.protocol + "//" + window.location.hostname + wrd;
          }
        }
    }
    function sendRequest (url,oj,cb) {
      // let qoj = oj||{method:"GET"};
      fetch(apiHost?apiHost+url:url,oj||{})
      .then((response)=>{
        return response.json()
      }).then((json)=>{
        cb(json);
      }).catch((err)=>{
        console.log('wechat login request',url,err);
        if(onErr && typeof onErr ==='function') {
          onErr(err)
        }
      })
    }

    function loginWechat(code) {
        sendRequest("/api/weixin/oauth",{
          method:'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code
          })
        },(json)=>{
          if (json.statusCode === 200) {
              saveUser(json.data)
          }
        })
    }
    var internalId;
    function webLogin(sceneId) {
        sendRequest("/api/weixin/getUserWithSceneId/" + sceneId,null,(json)=>{
          if (json.statusCode === 200) {
              saveUser(json.data)
              clearInterval(internalId);
          }
        })
    }

    function startWebwechatLogin() {
        sendRequest("/api/weixin/qrcodeLogin",{method:'POST'},(json)=>{
          if (json.statusCode === 200) {
              console.log("get login data", json.data);
              var url = json.data.url;
              var sceneId = json.data.sceneId;
              var qrurl = getQrcodeUrl(url)
              // $("#qrImgBox").show();
              // $("img#qrImg")[0].src = qrurl;
              self.setState({url:qrurl})

              setTimeout(function() {
                  internalId = window.setInterval(function() {
                      webLogin(sceneId)
                  }, 2000)
              }, 5000);
              window.setTimeout(function() {
                  clearInterval(internalId)
              }, webScanExpired*1000)
          }
        })
    }
    var path = jz.getParameterByName("redirect") || getFromLocal("wrd")||'/';
    saveToLocal("wrd", path  + window.location.hash);
    if (getFromLocal("token") && !jz.isTokenExpired(expiresDays)) {
      if(!banRedirect) {
        window.location.href = window.location.protocol + "//" + window.location.hostname + path + window.location.hash
      }
    } else {
      if (jz.isWeChatBroswer()) {
          var code = jz.getParameterByName("code");
          if (code) {
              loginWechat(code)
          } else {
              //var redirect_uri = location.protocol + "//" + location.hostname + "/wechatAuth.html";

              var authUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + jz.appId + "&redirect_uri=" + encodeURIComponent(redirect_uri) + "&response_type=code&scope=snsapi_userinfo&state=rd#wechat_redirect";
              window.location.href = authUrl
          }
      } else {
        if(isOpenQrcode) {
          if(!window.qr) {
            jz.loadJs("/qr.min.js", function() {
                startWebwechatLogin()
            })
          } else {
            startWebwechatLogin()
          }
        }
      }
    }

  }
  render(){
    const {style} = this.props;
    return (
      <div id="qrImgBox" style={{...{display:this.state.url?'block':"none",textAlign:"center",color:"#666"},style}}>
        <img src={this.state.url} alt="qrcode" width="250" height="250" id="qrImg"/>
      </div>
    )
  }
}

export default WechatLogin
