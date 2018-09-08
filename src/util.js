export const isAndroid = () => {
  var u = navigator.userAgent;
  return u.indexOf('Android') > -1;
}

export const isIos = () => {
  return (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

export const getScrollTop = () => {
  return document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
}

export const isWeChatBroswer = () => {
  var ua = navigator.userAgent.toLowerCase();
  return ua.match(/MicroMessenger/i) && (ua.match(/MicroMessenger/i)[0] === "micromessenger" || ua.match(/MicroMessenger/i) === "micromessenger");
}