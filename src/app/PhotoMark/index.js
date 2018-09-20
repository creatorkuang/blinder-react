import React, { Component } from 'react';
import './style.css';
import WithApi from '../../containers/WithApi';
import AutoForm from '../../components/AutoForm';
import Mark from './Mark';
import {
  debugInfo,
  host,
} from '../../Config';
import WechatInit from '../../components/WechatInit'
import MBFilter001 from '../../components/MBFilter001';
import { Redirect } from "react-router-dom";
// import { renderCanvasContent } from './Mark';
// import { isAndroid, isIos } from '../../util';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import BuyModal from '../DownloadPhoto/BuyModal';
import { filterSubmit } from './util';



class PhotoMark extends Component {
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
      showShare: false,
      showTag: false,
      showPay: false
    }
  }
  componentWillMount() {
    this.isUpdate = false;
  }
  componentDidMount() {
    window.setShare({
      title: '快来帮忙标注合照',
      desc: '大家协作标注合照名字，生成带名字的合照',
      link: window.location.href.split('#')[0],
      imgUrl: 'http://blinder.hui51.cn/logo.jpeg'
    }, () => {
      // should inc share log here
      // debugInfo("success")
    })
  }
  componentWillReceiveProps(np, ns) {
    debugInfo('get isUpdate', this.isUpdate)
    if (!this.isUpdate && np.data && np.data.faces) {
      var faceNameMap = {}
      let faceHistorys = this.state.faceHistorys;
      let nameArr = [];
      for (let i = 0; i < np.data.faces.length; i++) {
        let face = np.data.faces[i];
        faceNameMap[face._id] = face.name;
        if (face.name !== '未命名') {
          nameArr.push(face.name);
        }
        for (let j = 0; j < face.profileHistory.length; j++) {
          const history = face.profileHistory[j];
          faceHistorys.push({
            faceId: face._id,
            name: history.payload.name,
            faceImage: face.imageData,
            uid: history.uid,
            avatar: history.avatar,
            username: history.name,
            updatedAt: history.updatedAt,
          })
        }
      }
      let soj = { faceNameMap, faceHistorys }
      let rkeys = Object.keys(np.data.privateTags);
      if (rkeys.length > 0) {
        soj['showTag'] = true;
      }
      this.setState(soj);
      this.isUpdate = true;
      // 修改分享文字
      const unNameCount = np.data.faces.length - nameArr.length;
      try {
        window.setShare({
          title: `脸盲助手认出图片有${np.data.faces.length}人`,
          desc: nameArr.length === 0 ? `还没认出任何人哦，点此帮忙认人` :
            `已认出${nameArr.splice(0, 5).join(',')}等人，还有${unNameCount}人未命名，点此帮忙认人`,
          link: window.location.href.split('#')[0],
          imgUrl: np.data.url + '!shareLogo_100',
        }, () => {
          // share ok
        })
      } catch (e) {
        debugInfo('get set share error', e)
      }

    }
  }
  render() {
    const {
      data,
      error,
      height,
      width,
      fixProfile,
      location,
      refetch,
      markPhoto,
      followMark
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
    debugInfo('get refetc', typeof refetch)

    const self = this;
    debugInfo('get data', data)
    let formDatas = []
    let defaultForm = {};
    let faceMap = {};
    const colorMap = {};
    let faceHistorys = this.state.faceHistorys;
    if (data.faces) {
      for (let i = 0; i < data.faces.length; i++) {
        let color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`
        const face = data.faces[i];
        formDatas.push({
          // label: `人物${i + 1}`,
          label: (
            <img src={face.imageData} alt={face.name} className={'avatar'} />
          ),
          name: face._id,
          placeholder: face.name,
          // labelColor: color,
          onFocus: () => {
            self.setState({
              focusIdx: i
            })
          }
        })


        formDatas.push({
          // label: `人物${i + 1}`,
          label: "私人标签",
          name: 'tags_' + face._id,
          itemStyle: { display: this.state.showTag ? 'table' : 'none' },
          placeholder: '标签用逗号分隔',
          labelColor: '#23c6c8',
          onFocus: () => {
            self.setState({
              focusIdx: i
            })
          }
        })



        if (face.name !== '未命名') {
          defaultForm[face._id] = face.name;
        }
        defaultForm['tags_' + face._id] = data.privateTags[face._id] ? data.privateTags[face._id].join(',') : '';


        // defaultForm['tags_' + face._id] = face.tags ? face.tags.join(',') : ''
        colorMap[face._id] = color;
        faceMap[face._id] = face
      }
    }
    debugInfo('defaultForm', defaultForm);
    // sortBy updateAt
    const compare = ((a, b) => {
      return a.updatedAt < b.updatedAt;
    });
    faceHistorys = faceHistorys.sort(compare);
    debugInfo('get faceHistories', faceHistorys);
    const faceAvatars = uniq(map(faceHistorys, 'avatar'));

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
    return (
      <div className="bgc1" style={{ height, overflow: "hidden" }}>
        {data && (<div className="">
          <div className="relative">
            <Mark photo={this.state.data || data} colorMap={colorMap} width={width} height={height} focusIdx={self.state.focusIdx} />
            {/* <div className="imgBtn">
              <div className="btn btn-success center mrmd inline" onClick={() => {
                // self.previewPhoto(colorMap);
                self.showSave(colorMap, true);
              }}
                style={{ height: 30, lineHeight: '30px', padding: '0 10px' }}>
                预览合成图
                      </div>
              {sizeM > 2 && <div className="btn btn-info center inline" onClick={() => {
                // self.previewPhoto(colorMap);
                self.showSave(colorMap, false);
              }}
                style={{ height: 30, lineHeight: '30px', padding: '0 10px' }}>
                保存合成图(约{sizeM}M)
                      </div>}
            </div> */}

          </div>
          <div className="scroll" style={{ height: 360 }} >

            <div className="pasm">
              {faceAvatars.map((item, key) => (
                <img src={item} className={`avatar mrsm`} alt='头像' key={key} />
              ))}
            </div>

            {faceHistorys.length > 0 && <div className="pasm box" style={{ borderBottom: "1px solid #ccc" }}>
              {faceHistorys.map((item, key) => {
                return (
                  <div className="mbsm dt" key={key}>
                    <div className="dtc">
                      <span>{item.username}</span> 认出了<span className="text-info">{item.name}</span>

                    </div>
                    <div className="dtc" style={{ width: 130 }}>
                      <MBFilter001 date={item.updatedAt} className="right text-warning" format={'YYYY-MM-DD HH:mm'} />
                    </div>

                  </div>
                )
              })}
            </div>}
            {/* <div className="tips">分享此链接可邀请其他人帮忙一起完善哦：）</div> */}
            <div className="ptmd center pbmd bgc2">
              <button className="btn btn-primary btn-sm" onClick={() => {
                this.setState({
                  showShare: true
                })
              }}>邀请朋友完善</button>
              <button className="btn btn-info btn-sm mlmd" onClick={() => {

                // 检查是否会员
                let now = new Date().getTime();
                debugInfo('get', me.isVip, now < me.vipExpiredAt)
                if (me.isVip && now < me.vipExpiredAt) {
                  this.setState({
                    showTag: !this.state.showTag
                  })
                } else {
                  // 显示充值的Modal
                  self.setState({
                    showPay: true
                  })
                }
              }}>加私人标签</button>
            </div>
            <hr />
            {/* <div className="dt">
              <div className="dtc center" style={{ width: 130 }}>
                当前选中头像
                <div className="mtsm">
                      <img alt={'选中头像'} src={data.faces[self.state.focusIdx].imageData} style={{ width: 120, height: 120, borderRadius: "20%" }} />
                      <div className="mtxs">
                        {self.state.faceNameMap[data.faces[self.state.focusIdx]._id]}
                      </div>
                    </div>
                </div>
              <div className="dtc">
                
              </div>
            </div> */}
            <div >
              <AutoForm formDatas={formDatas} rightClass={'vam'} defaultForm={defaultForm}
                // onChange={(e) => {
                //   debugInfo('get e',e)
                //   self.setState({
                //     faceNameMap: e
                //   })
                // }}
                onSubmit={async (oj) => {
                  debugInfo('get form oj', oj)
                  if (self.state.submiting) {
                    return;
                  }
                  self.setState({
                    submiting: true
                  })
                  const { shouldUpdateArr, newFaces } = filterSubmit(defaultForm, faceMap, oj);
                  if (shouldUpdateArr.length > 0) {
                    for (let i = 0; i < shouldUpdateArr.length; i++) {
                      try {
                        await fixProfile(shouldUpdateArr[i]);
                        // hasUpdate = true;
                      } catch (e) {
                        debugInfo('get fix profile error', e);
                      }
                    }
                    let nData = {
                      ...data,
                      faces: newFaces
                    }
                    self.setState({
                      data: nData,
                      showToast: true,
                      toastTxt: '成功',
                      submiting: false
                    })
                    setTimeout(() => {
                      self.setState({ showToast: false })
                    }, 2000)
                  }
                }}
                contentClass="formContent"
                contentStyle={{ borderBottom: '1px solid #ccc' }}
                submitBtn={(
                  <div className='right prmd ptmd pbmd bgc2'>
                    <div className="btn btn-info btn-sm  mrmd inline" onClick={async () => {
                      debugInfo('isFollowWechat', data.me.isFollowWechat)
                      if (data.me.isFollowWechat) {
                        if (self.state.showTag) {
                          self.setState({
                            showSend: true
                          })
                          
                        } else {
                          // 直接发送
                          try {
                            const result = await markPhoto({
                              addTag: false
                            })
                            self.setState({
                              showSend: false
                            })
                            if (result.statusCode === 200) {
                              alert('发送成功，请到脸盲助手服务号中查看：）')
                            } else if (result.statusCode === 400) {
                              alert('发送失败,原因:' + result.message)
                            }

                          } catch (e) {
                            debugInfo('get mark error', e)
                            alert('发送失败，原因未知');
                          }
                        }
                      } else {
                        // send follow mark 
                        await followMark();
                        self.setState({
                          showDialog: true
                        })
                      }

                    }}>
                      发送合成图
                    </div>
                    <button className="btn btn-primary btn-sm center" type="submit" >更新信息</button>

                  </div>
                )}
              />
            </div>
          </div>

          <canvas id="photoOutCanvas" width={this.state.shouldZip ? 1600 : data.width} height={(this.state.shouldZip ? data.height * 1600 / data.width : data.height) + qrcodeSize + gap} style={{
            position: 'fixed',
            top: `${data.height + 1000}px`
          }}></canvas>
        </div>)}


        <WechatInit ApiHost={host} />
        {this.state.showDialog && <div className="dialog">
          <div className="dialog-body">
            <div className="dialog-title">关注脸盲助手 <span className="close" onClick={() => {
              this.setState({
                showDialog: false
              })
            }}>x</span></div>
            <div className="dialog-content">
              <img src='/qrcode.jpg' alt="qrcode" style={{ width: '100%' }} />
              <div className="mtsm center">
                您需要关注服务号后才能给您发送图片，请长按识别二维码关注脸盲助手
              </div>
            </div>
          </div>
        </div>}
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
              }}>朕知道啦!</div>
            </div>}
          </div>
        </div>}
        {this.state.showShare && this.renderShareModal()}
        {this.state.showPay && <BuyModal show={this.state.showPay} onOk={() => {
          self.setState({
            showToast: true,
            toastTxt: '支付成功!',
            showPay: false
          })
          setTimeout(() => {
            self.setState({
              showToast: false
            })
          }, 2000)
          refetch();
        }} />}
        {this.state.showSend && this.renderSendModal()}
      </div>
    )
  }
  renderShareModal() {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: "rgba(0,0,0,0.8)" }} onClick={() => {
        this.setState({
          showShare: false
        })
      }}>
        <img src={'/jiantou.png'} alt={'分享箭头'} style={{ position: 'fixed', top: 10, right: 10, width: 150 }} />
        <div className="c1" style={{ position: 'fixed', top: 180, right: 50, fontSize: '24px' }}>
          点击右上角调出分享
        </div>
      </div>
    )
  }
  renderSendModal() {
    const {
      markPhoto
    } = this.props;
    const self = this;
    const sendPhoto = async (addTag) => {
      try {
        const result = await markPhoto({
          addTag: addTag
        })
        self.setState({
          showSend: false
        })
        if (result.statusCode === 200) {
          alert('发送成功，请到脸盲助手服务号中查看：）')
        } else if (result.statusCode === 400) {
          alert('发送失败,原因:' + result.message)
        }

      } catch (e) {
        debugInfo('get mark error', e)
        alert('发送失败，原因未知');
      }

    }
    return (
      <div className="dialog">
        <div className="dialog-body">
          <div className="dialog-title">发送合成图</div>
          <div className="dialog-content center">
            <div className="btn btn-primary ptxs pbxs mblg" onClick={() => {
              sendPhoto(false)
            }}>无标签的合成图</div>
            <div className="btn btn-info ptxs pbxs mblg" onClick={() => {
              sendPhoto(true)
            }}>带私人标签的合成图</div>
          </div>
        </div>
      </div>
    )
  }
  // saveToLocal() {
  //   var canvas = document.getElementById("photoOutCanvas");
  //   var cxt = canvas.getContext("2d");
  //   var self = this;
  //   var fileSize = this.props.data.filesize;
  //   var shouldZip = this.state.shouldZip;
  //   var sizeM = Math.ceil(fileSize / 1024 / 1024);
  //   this.setState({
  //     hideInfoFooter: true,
  //     infoTitle: '生成中...',
  //     infoContent: `图片生成中，${sizeM > 3 ? '您的图片大于2M，可能需要等比较长的时间，' : ''}请稍后...`,
  //   })
  //   if (!shouldZip && sizeM > 3) {
  //     // 3M
  //     const genCanvas = async () => {
  //       try {
  //         const result = await self.props.genCanvas();
  //         self.setState({
  //           showInfo: false
  //         })
  //         window.wx.previewImage({
  //           current: result.data,
  //           urls: [result.data]
  //         })
  //       } catch (e) {
  //         console.error(e);
  //         alert('图片生成失败，请稍后再试或通过脸盲助手服务号联系我们。')
  //       }
  //     }
  //     genCanvas();
  //   } else {
  //     renderCanvasContent(cxt, this.state.data || this.props.data, this.state.colorMap, shouldZip, false, async () => {
  //       let url = canvas.toDataURL('image/png');
  //       if (isIos()) {
  //         // 直接preview
  //         self.setState({
  //           showInfo: false
  //         })
  //         window.wx.previewImage({
  //           current: url,
  //           urls: [url]
  //         })
  //       } else {
  //         try {
  //           const result = await self.props.base64ToPng({
  //             value: url
  //           });
  //           self.setState({
  //             showInfo: false
  //           })
  //           if (isAndroid()) {
  //             window.wx.previewImage({
  //               current: result.data,
  //               urls: [result.data]
  //             })
  //           } else {
  //             var a = document.createElement('a');
  //             a.href = result.data;
  //             a.download = "脸盲助手合照.png";
  //             a.target = "_blank";
  //             document.body.appendChild(a);
  //             a.click();
  //             document.body.removeChild(a);
  //           }

  //         } catch (e) {
  //           console.error(e);
  //           alert('图片转码失败，请稍后再试或通过脸盲助手服务号联系我们。')
  //         }
  //       }

  //     });
  //   }


  // }
  // showSave(colorMap, shouldZip) {
  //   this.setState({
  //     showInfo: true,
  //     infoTitle: '保存须知',
  //     hideInfoFooter: false,
  //     infoContent: isAndroid() ? '请在将要打开的页面点击右上角即可发送给朋友或者保存到相册' : '请在将要打开的页面长按图片即可发送给朋友或者保存到相册',
  //     colorMap,
  //     shouldZip,
  //   })
  // }
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

export default WithApi(PhotoMark, {
  query: {
    uri: ({ match }) => `/photo/${match.params.photoId}`,
    skip: ({ match }) => !match.params.photoId,
    options: {}
  },
  mutations: [
    {
      name: 'fixProfile',
      uri: (props, body) => `/profile/${body._id}`
    },
    {
      name: 'markPhoto',
      uri: ({ match }) => `/photo/${match.params.photoId}/mark`
    },
    {
      name: 'genCanvas',
      uri: ({ match }) => `/photo/${match.params.photoId}/genCanvas`
    },
    {
      name: 'base64ToPng',
      uri: ({ match }) => `/photo/${match.params.photoId}/base64ToPng`
    },
    {
      name: 'followMark',
      uri: ({ match }) => `/photo/${match.params.photoId}/followMark`
    }
  ]
})
