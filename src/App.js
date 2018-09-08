import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Routes from "./Routes";
import './App.css';


function isWeChatBroswer() {
  var ua = navigator.userAgent.toLowerCase();
  return ua.match(/MicroMessenger/i) && ua.match(/MicroMessenger/i)[0] === 'micromessenger' ? true : false;
}

const Auth = async () => {
  // 后面改为通过API获取me,如果me未0，就是未登录，否则就是已经登录
  if (window.localStorage.token) {
    let out = {}
    try {
      out = JSON.parse(window.localStorage.profile)
    } catch (e) {
      console.log('get parase error')
    }
    return out
  } else {
    return false
  }
}

const getQueryByLocation = (location) => {
  let query = {}
  if (location.search) {
    let pairs = location.search.split('?')[1].split('&')
    let len = pairs.length;
    for (let i = 0; i < len; i++) {
      let keyVals = pairs[i].split('=')
      query[keyVals[0]] = keyVals[1];
    }
  }
  return query;
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLogin: false,
      isAuthenticating: true,
      profile: '',
      width: 375,
      height: 667,
      query: {},
      errorMsg: ''
    };
  }
  async componentDidMount() {
    if (/Android 4\.[0-3]/.test(navigator.appVersion)) {
      window.addEventListener("resize", function () {
        if (document.activeElement.tagName === "INPUT") {
          window.setTimeout(function () {
            document.activeElement.scrollIntoViewIfNeeded();
          }, 0);
        }
      })
    }
    this.setState({
      isWechat: isWeChatBroswer(),
      width: window.innerWidth,
      height: window.innerHeight,
      getFrame: () => {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      query: getQueryByLocation(window.location)
    });
    try {
      const authResult = await Auth();
      if (authResult) {
        this.setState({
          isLogin: true,
          profile: authResult,
        })
      }
    } catch (e) {
      // 验证出错，可能没有登录或者服务器有问题
      console.log('get e', e)
    }
    this.setState({ isAuthenticating: false })
  }
  render() {
    const { isAuthenticating, ...otherProps } = this.state;
    const self = this;
    const childProps = {
      ...otherProps,
      updateMe: (isLogin, profile) => {
        this.setState({
          isLogin: isLogin,
          profile: profile
        })
      },
      flashErr: (errMsg, time) => {

        self.setState({
          errorMsg: errMsg
        })
        setTimeout(() => {
          self.setState({
            errorMsg: ''
          })
        }, time || 3000)
      }
    }
    return (
      !this.state.isAuthenticating && <div>
        <img src="/logo.jpeg" alt="logo" style={{ display: 'none' }} />
        {this.state.errorMsg && (
          <div className="c1 center" style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: 'rgba(255,100,116,0.8)' }}>
            <div className="dt">
              <div className="dtc w">
                {this.state.errorMsg}
              </div>
              <div className="dtc close" style={{ width: 28 }} onClick={() => {
                this.setState({
                  errorMsg: ''
                })
              }}>
                x
              </div>
            </div>
          </div>
        )}
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);
