// export const wechatAppId = process.env.NODE_ENV==='development'?'wx0fc3fae0228c9ab3':'wxb41532ec5bb06e9f';
// export const host = process.env.NODE_ENV==='development'?'http://blinder-dev.hui51.cn': 'http://blinder.hui51.cn';
export const wechatAppId = 'wxb41532ec5bb06e9f';
export const host = 'http://blinder.hui51.cn';
export const apiHost = `${host}/api`;
export const debugInfo = (...args)=>{
  if(process.env.NODE_ENV==='development' || window.isDebug) {
    console.log(`[DEBUG]`,...args);
  }
}