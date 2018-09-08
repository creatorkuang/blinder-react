import React, { Component } from 'react';
import WithApi from '../../containers/WithApi';
import './style.css';
import {
  debugInfo,
  host,
} from '../../Config';
import WechatInit from '../../components/WechatInit'
import { Redirect } from "react-router-dom";
// import { renderCanvasContent } from '../PhotoMark/Mark';
import {
  isAndroid
  // , isIos 
} from '../../util';
import BuyModal from './BuyModal';

class DownloadPhoto extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: null,
      showDialog: false,
      showToast: false,
      toastTxt: '成功',
      submiting: false,
      showPreview: false,
      focusIdx: 0,
      faceNameMap: {},
      faceHistorys: [],
      showInfo: false,
      infoTitle: '',
      infoContent: '',
      hideInfoFooter: false,
      shouldZip: false,
      showPay: false,
      imageUrl: '',
      addTag: false,
      removeBrand: false
    }
  }
  componentWillMount() {
    this.isUpdate = false;
  }
  render() {
    const {
      data,
      error,
      height,
      location
    } = this.props;
    if (error) {
      if (error === '您未登录或登录已过期') {
        return <Redirect
          to={`/login?redirect=${location.pathname}${location.search}`}
        />
      }
      return <div className="pam text-danger">数据加载出错啦：{error}</div>
    }
    if (!data) {
      return <div className="malg center">数据加载中...</div>
    }

    const self = this;
    debugInfo('get data', data)
    const colorMap = {};
    if (data.faces) {
      for (let i = 0; i < data.faces.length; i++) {
        let color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
        const face = data.faces[i];
        colorMap[face._id] = color;
      }
    }

    // const sizeM = Math.ceil(data.filesize / 1024 / 1024);
    let qrcodeSize = 160;
    let gap = 20;
    let logoFs = 26;
    if (data.width > 1600) {
      qrcodeSize = Math.ceil(data.width / 10);
      logoFs = Math.ceil(0.0225 * data.width);
      gap = Math.ceil(logoFs * 5 / 9);
    }
    const me = data.me;
    console.log('get me', me, self.state.imageUrl);
    if (self.state.imageUrl) {
      return (
        <div className="bgc1" style={{ height, overflow: "hidden" }}>
          <div className="mblg pamd center">
            点击下面图片长按可保存图片或发送图片给其他人
            </div>
          <img src={self.state.imageUrl + '!medium_800'} alt="图片" style={{ width: '100%' }} onClick={() => {
            window.wx.previewImage({
              current: self.state.imageUrl,
              urls: [self.state.imageUrl]
            })
          }} />
        </div>
      )
    }
    return (
      <div className="bgc1" style={{ height, overflow: "hidden" }}>
        {data && (<div className="">
          <div className="mblg scroll" style={{ maxHeight: 300 }}>
            <img src={data.url + '!medium_800'} alt="图片" style={{ width: '100%' }} onClick={() => {
              window.wx.previewImage({
                current: data.url,
                urls: [data.url]
              })
            }} />
          </div>
          <div className="palg">
            <div className="mbmd">下载原图合成图选项（多选）：</div>
            <div className="">
              <div className={`btn btn-primary${this.state.addTag ? '' : '-reverse'} box center plsm prsm mrmd inline pointer`}
               style={{width:105,height:30,lineHeight:'30px',fontSize:12}} onClick={() => {
                this.setState({
                  addTag: !this.state.addTag
                })
              }}> 显示私有标签</div>
              <div className={`btn btn-primary${this.state.removeBrand ? '' : '-reverse'} center box plsm prsm inline pointer`}
               style={{width:105,height:30,lineHeight:'30px',fontSize:12}} onClick={()=>{
                this.setState({
                  removeBrand: !this.state.removeBrand
                })
              }}>移除品牌信息</div>
            </div>
            <div className="btn btn-primary center ptsm pbsm mtlg" onClick={() => {
              // self.previewPhoto(colorMap);
              // 检查是否有权限直接下载，如果没有，需要先付费购买当天权限 
              let now = new Date().getTime();
              if (me.isVip && now < me.vipExpiredAt) {
                self.showSave(colorMap, false);
              } else {
                // 显示充值的Modal
                self.setState({
                  showPay: true
                })
              }
            }}
            >
              生成合成图
            </div>
            {/* <div className="btn btn-primary center ptsm pbsm mblg" onClick={() => {
              // self.previewPhoto(colorMap);
              // 检查是否有权限直接下载，如果没有，需要先付费购买当天权限 
              let now = new Date().getTime();
              if (me.isVip && now < me.vipExpiredAt) {
                self.showSave(colorMap, false);
              } else {
                // 显示充值的Modal
                self.setState({
                  showPay: true
                })
              }
            }}
            >
              下载原图合成图(约{sizeM}M)
            </div>
            <div className="btn btn-primary center ptsm pbsm  mblg">
              移除脸盲品牌信息
            </div>
            <div className="btn btn-primary center ptsm pbsm  mblg">
              添加标签
            </div> */}

          </div>

          <canvas id="photoOutCanvas" width={this.state.shouldZip ? 1600 : data.width} height={(this.state.shouldZip ? data.height * 1600 / data.width : data.height) + qrcodeSize + gap} style={{
            position: 'fixed',
            top: `${data.height + 1000}px`
          }}></canvas>
        </div>)}


        <WechatInit ApiHost={host} />

        {this.state.showToast && <div className="toast">
          <div className="centered center toastBox">
            {this.state.toastTxt}
          </div>
        </div>}

        {/* {data && this.state.showPreview && (
          <div className="previewBox" >
            <div className="scroll" style={{ maxHeight: height-50, overflowX: 'scroll' }}>
                <img src={this.state.previewImg} id="canvasOut" alt="canvas"/>
            </div>
            <div className="c1 center pasm">
            <div className="btn btn-warning btn-sm inline mrsm" onClick={()=>{
                 
                }}>移除脸盲Logo</div>
                <a className="btn btn-primary btn-sm inline" id="download-canvas" onClick={()=>{
                    self.showSave()
                  }}>
                 直接保存
                </a>
            </div>
          </div>
        )} */}
        {this.state.showInfo && <div className="dialog">
          <div className="dialog-body">
            <div className="dialog-title">{this.state.infoTitle} <span className="close" onClick={() => {
              this.setState({
                showInfo: false
              })
            }}>x</span></div>
            <div className="dialog-content">
              {this.state.infoContent}
            </div>
            {this.state.hideInfoFooter || <div className="dialog-footer">
              <div className="btn btn-primary btn-w-m center" onClick={() => {
                self.saveToLocal();
              }}>我知道啦!</div>
            </div>}
          </div>
        </div>}

        {this.state.showPay && (
          <BuyModal show={this.state.showPay} onOk={() => {
            self.showToast('支付成功！');
            self.showSave(colorMap, false);
          }} />
        )}
      </div>
    )
  }
  saveToLocal() {
    // var canvas = document.getElementById("photoOutCanvas");
    // var cxt = canvas.getContext("2d");
    var self = this;
    var fileSize = this.props.data.filesize;
    // var shouldZip = this.state.shouldZip;
    var sizeM = Math.ceil(fileSize / 1024 / 1024);
    this.setState({
      hideInfoFooter: true,
      infoTitle: '生成中...',
      infoContent: `图片生成中，${sizeM > 2 ? '您的图片大于2M，可能需要等比较长的时间，' : ''}请稍后...`,
    })
    // if (!shouldZip && sizeM > 2) {

    // } else {
    //   renderCanvasContent(cxt, this.state.data || this.props.data, this.state.colorMap, shouldZip, false, async () => {
    //     let url = canvas.toDataURL('image/png');
    //     if (isIos()) {
    //       // 直接preview
    //       self.setState({
    //         showInfo: false,
    //         imageUrl: url
    //       })
    //       window.wx.previewImage({
    //         current: url,
    //         urls: [url]
    //       })
    //     } else {
    //       try {
    //         const result = await self.props.base64ToPng({
    //           value: url
    //         });
    //         self.setState({
    //           showInfo: false,
    //           imageUrl: result.data
    //         })
    //         if (isAndroid()) {
    //           window.wx.previewImage({
    //             current: result.data,
    //             urls: [result.data]
    //           })

    //         } else {
    //           var a = document.createElement('a');
    //           a.href = result.data;
    //           a.download = "脸盲助手合照.png";
    //           a.target = "_blank";
    //           document.body.appendChild(a);
    //           a.click();
    //           document.body.removeChild(a);

    //         }

    //       } catch (e) {
    //         console.error(e);
    //         alert('图片转码失败，请稍后再试或通过脸盲助手服务号联系我们。')
    //       }
    //     }

    //   }); renderCanvasContent(cxt, this.state.data || this.props.data, this.state.colorMap, shouldZip, false, async () => {
    //     let url = canvas.toDataURL('image/png');
    //     if (isIos()) {
    //       // 直接preview
    //       self.setState({
    //         showInfo: false,
    //         imageUrl: url
    //       })
    //       window.wx.previewImage({
    //         current: url,
    //         urls: [url]
    //       })
    //     } else {
    //       try {
    //         const result = await self.props.base64ToPng({
    //           value: url
    //         });
    //         self.setState({
    //           showInfo: false,
    //           imageUrl: result.data
    //         })
    //         if (isAndroid()) {
    //           window.wx.previewImage({
    //             current: result.data,
    //             urls: [result.data]
    //           })

    //         } else {
    //           var a = document.createElement('a');
    //           a.href = result.data;
    //           a.download = "脸盲助手合照.png";
    //           a.target = "_blank";
    //           document.body.appendChild(a);
    //           a.click();
    //           document.body.removeChild(a);

    //         }

    //       } catch (e) {
    //         console.error(e);
    //         alert('图片转码失败，请稍后再试或通过脸盲助手服务号联系我们。')
    //       }
    //     }

    //   });
    // }
    // 3M
    const genCanvas = async () => {
      try {
        const result = await self.props.genCanvas({
          addTag: self.state.addTag,
          removeBrand: self.state.removeBrand
        });
        self.setState({
          showInfo: false
        })
        console.log('get result', result)
        if (result.statusCode === 200) {
          self.setState({
            imageUrl: result.data
          })
          window.wx.previewImage({
            current: result.data,
            urls: [result.data]
          })

        } else if (result.statusCode === 400) {
          self.setState({
            showToast: true,
            toastTxt: result.message
          })
          setTimeout(() => {
            self.setState({
              showToast: false
            })
          }, 3000)
        }
      } catch (e) {
        console.error(e);
        alert('图片生成失败，请稍后再试或通过脸盲助手服务号联系我们。')
      }
    }
    genCanvas();


  }
  showSave(colorMap, shouldZip) {
    this.setState({
      showInfo: true,
      infoTitle: '保存须知',
      hideInfoFooter: false,
      infoContent: isAndroid() ? '请在将要打开的页面点击右上角即可发送给朋友或者保存到相册' : '请在将要打开的页面长按图片即可发送给朋友或者保存到相册',
      colorMap,
      shouldZip,
    })
  }
  showToast(text) {
    this.setState({
      showToast: true,
      toastTxt: text
    })
    const self = this;
    setTimeout(() => {
      self.setState({
        showToast: false
      })
    }, 2000)
  }
  // previewPhoto(colorMap) {
  //   var canvas = document.getElementById("photoOutCanvas");
  //   var cxt = canvas.getContext("2d");
  //   var self = this;
  //   renderCanvasContent(cxt, this.state.data|| this.props.data, colorMap, false, false, ()=>{
  //     let url = canvas.toDataURL('image/png');
  //     self.setState({
  //       showPreview: true,
  //       previewImg: url
  //     })
  //   });

  // }
}

export default WithApi(DownloadPhoto, {
  query: {
    uri: ({ query }) => `/photo/${query.photoId}/base`,
    skip: ({ query }) => !query.photoId,
    options: {}
  },
  mutations: [
    {
      name: 'genCanvas',
      uri: ({ query }) => `/photo/${query.photoId}/genCanvas`
    },
    {
      name: 'base64ToPng',
      uri: ({ query }) => `/photo/${query.photoId}/base64ToPng`
    }
  ]
})
