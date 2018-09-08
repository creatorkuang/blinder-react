import React, { Component } from 'react';

const setDash = (dashArr, oj, value) => {
  let len = dashArr.length;
  let nkey = dashArr[0];
  if (len === 1) {
    // check if array
    let lidx = nkey.indexOf('[');
    let ridx = nkey.indexOf(']');
    if (lidx > -1 && ridx > -1 && ridx > lidx) {
      let num = parseInt(nkey.substr(lidx + 1, ridx - lidx - 1), 10);
      let key = nkey.substr(0, lidx);
      if (!oj[key]) {
        oj[key] = []
      }
      oj[key][num] = value;
    } else {
      if (!oj[nkey]) {
        oj[nkey] = {}
      }
      oj[nkey] = value;
    }
    return oj;
  }

  dashArr.shift();

  oj[nkey] = setDash(dashArr, oj[nkey]||{}, value);
  return oj
}

const getValByDash = (dashArr, oj) => {
  let len = dashArr.length;
  let nkey = dashArr[0];
  if (len === 1) {
    // check if array
    let lidx = nkey.indexOf('[');
    let ridx = nkey.indexOf(']');
    if (lidx > -1 && ridx > -1 && ridx > lidx) {
      let num = parseInt(nkey.substr(lidx + 1, ridx - lidx - 1), 10);
      let key = nkey.substr(0, lidx);
      return oj[key][num]
    } else {
      return oj[nkey]
    }
  }

  dashArr.shift();

  return getValByDash(dashArr, oj[nkey]||{});
}

class AutoForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      form: props.defaultForm || {}
    }
    this.handleChange = this.handleChange.bind(this)
  }
  handleChange(value, key) {
    const form = { ...this.state.form };
    // check if key has dash
    const keyArr = key.split('.');
    const nform = setDash(keyArr, form, value);
    this.setState({ form:  nform});
    if(typeof this.props.onChange === 'function') {
      this.props.onChange(nform);
    }
  }
  render() {
    const { formDatas, labelWidth, submitBtn, rightClass, onSubmit,contentClass, contentStyle } = this.props;
    const formNode = [];
    const len = formDatas.length;
    const self = this;
    for (let i = 0; i < len; i++) {
      let ftype = 'text'
      let item = formDatas[i];
      if (item.type) {
        ftype = item.type
      }
      let input = '';
      const { name, label, type, labelColor, itemStyle, ...otherParams } = item;
      const dashArr = item.name.split('.');
      const onChangeFunc = (e) => {
        let val = e.target.value;
        if(item.type==='singleCheckbox') {
          val = e.target.checked
        }
        self.handleChange(val, item.name)
      }
      if(ftype==='singleCheckbox') {
        let dfv = getValByDash(dashArr, this.state.form);
        formNode.push(
          <div key={i} className="mbsm">
            <input type="checkbox" onChange={onChangeFunc} checked={dfv} />
            <span className="mllg">{item.label}</span>
          </div>
        )
      } else {
        const formParams = {
          onChange: onChangeFunc,
          ...otherParams,
          defaultValue: getValByDash(dashArr, this.state.form),
        }
        switch (ftype) {
          case 'textarea':
            input = <textarea type="text" {...formParams} />
            break;
          case 'number':
            input = <input type="number" {...formParams} />
            break;
          case 'text':
          default:
            input = <input type="text" {...formParams} />
            break;
        }
        const leftStyle = { width: 80 }
        if (labelWidth) {
          leftStyle['width'] = labelWidth;
        }
        if (item.labelColor) {
          leftStyle['color'] = item.labelColor
        }
        formNode.push(
          <div className="dt mbsm" key={i} style={itemStyle||{}} >
            <div className="dtc vat" style={leftStyle} >{item.label}</div>
            <div className={`dtc ${rightClass||''}`}>{input}</div>
          </div>
        )
      }
     
    }
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        if (typeof onSubmit === 'function') {
          onSubmit(this.state.form)
        }
      }}>
        <div className={contentClass||''} style={contentStyle||{}}>{formNode}</div>
        {submitBtn}
      </form>
    );
  }
}

export default AutoForm