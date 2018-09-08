import {
  Component,
  createElement,
} from 'react';
import {
  apiHost,
} from '../Config'

const hoistNonReactStatics = require('hoist-non-react-statics');

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}


const fetchWithApi = (uri, options) => {
  let queryOj = {
    method: 'GET',
    ...options,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
      Authorization: `user ${window.localStorage.token}`,
      ...options.headers
    }
  }
  if (options.body && typeof options.body === 'object') {
    queryOj['body'] = JSON.stringify(options.body)
  }
  return fetch(uri, queryOj).then((response) => {
    return response.json();
  }).then((json) => {
    return json
  }).catch((e) => {
    throw new Error(e)
  })
}

const sendReqByOption = (query, props, isMutation, cb) => {
  let out = {}
  if (!query.uri) {
    if (isMutation) {
      console.log('WithApi Query uri not exsit', query)
      return
    }
    throw new Error('WithApi Query uri not exsit');
  }
  let url = query.uri;
  if (typeof query.uri === 'function') {
    if(!isMutation) {
      url = query.uri(props);
    }
  }
  if (!query.isExternal && !isMutation) {
    url = apiHost + url;
  }
  if (!isMutation) {
    let skip = query.skip;
    if (typeof skip === 'function') {
      skip = query.skip(props);
    }
    if (!skip) {
      try {
        fetchWithApi(url, query.options).then((data)=> {
          if (data.statusCode === 400) {
            out = {
              data: null,
              error: data.message
            }
          } else if (data.statusCode === 401) {
            out = {
              data: null,
              error: '您未登录或登录已过期'
            }
            window.localStorage.removeItem('token');
            window.location.reload()
            // @todo 应该要删除掉 token
          } else if (data.statusCode === 200) {
            out = {
              data: data.data,
              error: null
            }
          } else {
            out = {
              data: data,
              error: null
            }
          }
          cb(out);
        });
        

      } catch (e) {
        console.log('get error', e)
        out = {
          data: null,
          error: e
        }
      }

    } else {
      out = {
        data: null,
        error: null
      }
    }
    cb(out);
  } else {
    const mutation = (body, headers) => {
      let op = { method: 'POST' }
      if (body) {
        op['body'] = body
      }
      if (headers) {
        op = [
          ...op,
          ...headers
        ]
      }
      if(typeof query.uri==='function') {
        url = apiHost + query.uri(props, body)
      }
      console.log('call mutaion', op)
      return fetchWithApi(url, op);
    }
    return mutation
  }

}


const WithApi = (WrappedComponent, option, async) => {
  const withDisplayName = `WithApi(${getDisplayName(WrappedComponent)})`;
  class WithApi extends Component {
    static displayName = withDisplayName;
    static WrappedComponent = WrappedComponent;
    constructor(props, context) {
      super(props, context);
      this.state = {
        [option.query.name || 'data']: null
      }
    }
    componentWillMount() {
      let self = this;
      const { query } = option;
      const reqByOption = (queryOpt) =>{
        sendReqByOption(queryOpt, self.props, false, (out)=>{
          const outState = { [queryOpt.name || 'data']: out.data, error: out.error, loading: false, refetch: (variable)=>{
            if(variable && typeof variable==='object') {
              queryOpt['options']['body'] = variable
            }
            reqByOption(queryOpt);
          } }
          self.setState(outState)
        });
      }
      reqByOption(query)
    }
    render() {
      const mProps = {};
      const { mutations } = option;
      if (mutations) {
        let mlen = mutations.length;
        if (mlen > 0) {
          for (let i = 0; i < mlen; i++) {
            const item = mutations[i];
            if (!item.name) {
              console.error('mutation require name', i);
              return
            }
            mProps[item.name] = sendReqByOption(item, this.props, true)
          }
        }
      }
      let props = {
        ...this.props,
        ...this.state,
        ...mProps,
      };

      return createElement(WrappedComponent, props);
    }
  }
  // Make sure we preserve any custom statics on the original component.
  return hoistNonReactStatics(WithApi, WrappedComponent, {});
}

export default WithApi;
