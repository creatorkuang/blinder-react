import React, { Component } from 'react';



export const renderCanvasContent = (ctx, photo, colorMap, zip, removeBrand, cb) => {
  var bgImgSrc = photo.url;
  var faceLocations = photo.faces;

  var hasTagsItems = [];
  for (let i = 0; i < faceLocations.length; i++) {
    let item = faceLocations[i];
    if (item.tags && item.tags.length>0) {
      hasTagsItems.push({
        name: item.name,
        avatar: item.imageData,
        tags: item.tags
      })
    }
  }
  var tagBoxHeight = 0;
  if (hasTagsItems.length > 0) {
    tagBoxHeight = 60 * hasTagsItems.length + 20;
  }
  var bgImg = new Image();
  bgImg.crossOrigin = 'Anonymous';
  bgImg.src = bgImgSrc;
  if (zip && photo.width && photo.width > 1600) {
    console.log('work here')
    bgImg.src = bgImgSrc + '!medium_1600';
  }
  const charLen = (text) => {
    var r = /[^\x00-\xff]/g;
    return text.replace(r, "mm").length;
  }
  bgImg.onload = function () {
    var radius = photo.width / photo.height;
    var canvasWidth = photo.width;
    if (photo.width > 1600) {
      canvasWidth = 1600;
    }
    var photoHeight = canvasWidth / radius;
    var qrcodeSize = 80;
    var gap = 10;
    var logoFs = 18;

    if (!zip) {
      radius = 1;
      canvasWidth = photo.width;
      photoHeight = photo.height;
    }
    if (canvasWidth > 1600) {
      qrcodeSize = Math.ceil(canvasWidth / 10);
      logoFs = Math.ceil(0.0225 * canvasWidth);
      gap = Math.ceil(logoFs * 5 / 9)
    }
    let canvasHeight = photoHeight + tagBoxHeight;
    if (!removeBrand) {
      canvasHeight = photoHeight + qrcodeSize + gap
    }
    ctx.drawImage(this, 0, 0, canvasWidth, photoHeight);



    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    var scale = canvasWidth / photo.width;
    if (!zip) {
      scale = 1;
    }

    for (var i = 0; i < faceLocations.length; i++) {
      let item = faceLocations[i];

      // ctx.fillStyle = '#1ab394';
      ctx.fillStyle = colorMap[item._id];
      var fontSize = Math.floor(item.location.w * 0.12 + 8);
      ctx.font = fontSize + "px 微软雅黑";
      ctx.globalAlpha = 0.6;
      var sinCharLen = fontSize * 0.5
      var title = `${i + 1}. ${item.name}`;
      if (item.name === '未命名') {
        title = `${i + 1}`;
      }
      if (zip) {
        title = item.name;
      }
      var boxWidth = Math.floor(charLen(title) * sinCharLen + sinCharLen * 1.5);
      var boxHeight = Math.floor(sinCharLen * 3);
      // var hasTags = item.tags && item.tags.length>0? true: false;

      ctx.fillRect((item.location.x + item.location.w / 2) * scale - boxWidth / 2, item.location.y * scale - boxHeight, boxWidth, boxHeight)
      ctx.fillStyle = "#fff"; //文字颜色
      ctx.globalAlpha = 1;
      ctx.fillText(title, (item.location.x + item.location.w / 2) * scale, item.location.y * scale - boxHeight);
    }
    // console.log('get hasTagsItems',hasTagsItems)
    // if (hasTagsItems.length > 0) {
    //   // 需要
    //   var tagBaseHeight = photoHeight + 15;
    //   console.log('ge tag baseHeight', tagBaseHeight)
    //   const drawAvatar = (item, j)=>{
    //     ctx.save();
    //     var avatar = new Image();
    //     avatar.onload = function() {
    //       console.log('avatar load')
    //       ctx.drawImage(avatar, 10, tagBaseHeight + j * 60, 50, 50);
    //       ctx.textAlign='left';
    //       ctx.textBaseline='top';
    //       ctx.fillStyle='#666666';
    //       ctx.font = "18px Microsoft Yahei"
    //       ctx.fillText(item.name, 70, tagBaseHeight + j * 60);
    //       var tagLenSum = 0;
    //       // 填写标签
    //       for(var k=0;k<item.tags.length;k++) {
    //         // 画出标签的底色框
    //         var tag = item.tags[k];
    //         var tagLen = charLen(tag);
    //        var tagWidth = tagLen * 8 + 10
    //         var tagX = 70 + tagLenSum + k * 5;
    //         ctx.fillStyle='#1ab394';
    //         ctx.fillRect(tagX, tagBaseHeight + j * 60 + 30, tagWidth, 20);
    //         ctx.fillStyle = '#fff';
    //         ctx.font="14px Microsoft Yahei";
    //         ctx.fillText(tag, tagX+ 8,tagBaseHeight + j * 60 + 30 )
    //         tagLenSum += tagWidth
    //         ctx.restore()
    //       }
    //     }
    //     avatar.src = item.avatar;
       
    //   }
    //   for(var j=0;j<hasTagsItems.length;j++) {
    //     var item = hasTagsItems[j];
    //     drawAvatar(item, j);
    //   }
    // }
    // 品牌信息
    if (!removeBrand) {
      // 品牌信息
      ctx.textBaseline = "middle";
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f5f5f5';
      ctx.font = `${logoFs}px Microsoft YaHei`;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, canvasHeight - qrcodeSize - gap + tagBoxHeight, canvasWidth, qrcodeSize + gap);
      ctx.fillStyle = '#999';
      ctx.fillText('脸盲助手，您身边的智能认人助手!', qrcodeSize + 2 * gap, canvasHeight - qrcodeSize + 2 * gap + tagBoxHeight)
      ctx.fillText('长按识别二维码，告别脸盲。', qrcodeSize + 2 * gap, canvasHeight - qrcodeSize + 5 * gap + tagBoxHeight)
      const qrcode = new Image();
      qrcode.onload = function () {
        ctx.drawImage(qrcode, gap, canvasHeight - qrcodeSize - gap / 2 + tagBoxHeight, qrcodeSize, qrcodeSize);
        cb()
      }
      qrcode.src = '/qrcode.jpg';
    } else {
      cb();
    }
  }
}

class Mark extends Component {
  renderCanvas(photo, colorMap) {
    var canvas = document.getElementById("photoCanvas");
    var ctx = canvas.getContext("2d");

    renderCanvasContent(ctx, photo, colorMap, true, false, () => {
      
    })
  }
  componentDidMount() {
    this.renderCanvas(this.props.photo, this.props.colorMap)
  }
  componentWillReceiveProps(np) {
    try {
      this.renderCanvas(np.photo, this.props.colorMap)
      // move the 
      // calulate x, y scroll
      var canvasWidth = np.photo.width;
      if (canvasWidth > 1600) {
        canvasWidth = 1600;
      }
      var radius = canvasWidth / np.photo.width;
      var item = np.photo.faces[np.focusIdx];
      var x = (item.location.x + item.location.w / 2) * radius - np.width / 2
      var y = item.location.y * radius - 150;
      var ele = document.getElementById('markCanva');
      if (ele && ele.scrollTo && typeof ele.scrollTo === 'function') {
        ele.scrollTo(x, y + 60);
      }
    } catch (e) {
      console.log('get render error', e);
    }


  }
  // componentDidUpdate(np) {
  //   var ele = document.getElementById('markCanva');
  //   console.log('get ele', ele);
  // }
  render() {
    const { photo, height } = this.props;
    console.log('get this.props', this.props);
    let radius = 1;
    let photoWidth = photo.width;
    if (photo.width > 1600) {
      radius = 1600 / photo.width
      photoWidth = 1600;
    }
    var tagBoxHeight = 0
    // for (let i = 0; i < photo.faces.length; i++) {
    //   let item = photo.faces[i];
    //   if (item.tags) {
    //     tagBoxHeight += 60;
    //   }
    // }
    // if(tagBoxHeight>0) {
    //   tagBoxHeight+= 20;
    // }

    let photoHeight = Math.floor(photo.height * radius) + 90 + tagBoxHeight;

    return (
      <div className="scroll" id="markCanva" style={{ maxHeight: height - 360, overflowX: 'scroll' }}>
        <canvas id="photoCanvas" width={photoWidth} height={photoHeight}></canvas>
      </div>
    )
  }
}

export default Mark;