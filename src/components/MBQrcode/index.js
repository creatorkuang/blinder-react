import React from 'react'

const loadJs = (url, fn) => {
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

class Qrcode extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      qrcodeUrl: '',
      qrcode: ''
    }
  }
  getValue() {
    return document.getElementById(this.props.id).src
  }
  renderQrcode(props) {
    const {size, value, style, className} = props;
    const qrcodeUrl = window.qr.toDataURL({size, value})
    if (qrcodeUrl) {
      this.setState({qrcode: <img src={qrcodeUrl} alt="qrcode" width={size * 25} height={size * 25} style={style} className={className}/>})
    }
  }
  componentDidMount() {
    // inject qr js
    let self = this;
    if (!window.qr) {
      loadJs('/qr.min.js', () => {
        // console.log('get window qr', window.qr);
        self.renderQrcode(self.props)
      })
    } else {
      this.renderQrcode(this.props);
    }
  }
  componentWillReceiveProps(np) {
    if (window.qr) {
      this.renderQrcode(np);
    }
  }
  render() {
    return this.state.qrcode ||< span className = 'c4' > 生成中 ...</span>
  }
}

Qrcode.DefaultProps = {
  size: 4
}

export default Qrcode
