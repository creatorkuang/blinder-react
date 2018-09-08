import React, { Component } from 'react';
import WithApi from '../../containers/WithApi';
import AutoForm from '../../components/AutoForm';
import {
  debugInfo,
} from '../../Config';
import './style.css';

const SectionBox = ({ title, content }) => {
  return (
    <div className="mtsm">
      <div className="sectionTitle">{title}</div>
      <div className="pasm">
        {content}
      </div>
    </div>
  )
}

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showForm: props.query.showEdit || false
    }
  }
  render() {
    const {
      data,
      error,
      height,
    } = this.props;
    if (error) {
      return <div className="pam text-danger">数据加载出错啦：{error}</div>
    }
    debugInfo('get data', data)
    return (
      <div className="bgc1" style={{ height }}>
        {!this.state.showForm && data && this.renderProfile(data)}
        {this.state.showForm && data && this.renderForm(data)}
      </div>
    )
  }
  renderProfile(data) {
    return (
      <div className="bgc1" id="profile">
        <div id="profileBg">
          <div style={{ position: 'absolute', bottom: 0, width: '100%' }} >
            <div className="center centered" style={{ width: 120 }}>
              <img alt={data.name} src={data.imageData} className="bigAvatar" />
            </div>
          </div>
        </div>
        <div className="mtsm center">
          <div className="bold fs4">{data.name}</div>
        </div>
        {data.profile &&<SectionBox title="基本信息" content={(
          <div className="">
            <div className=""><label>职位：</label> {data.profile.position}</div>
            <div className=""><label>单位：</label> {data.profile.company}</div>
          </div>
        )}/>}
        {data.profile && data.profile.service && <SectionBox title={'产品/服务'} content={data.profile.service} />}

        {/* <hr className='mtsm mbsm' /> */}
        {/* <div className="btn btn-primary center centered bigActionBtn" >我想认识Ta</div> */}
      </div>
    )
  }
  renderForm(data) {
    const { imageData, _id, ...defaultForm } = data;
    const { fixProfile } = this.props;
    return (
      <div className="bgc1 pasm">
        <AutoForm
          defaultForm={defaultForm}
          formDatas={[
            { label: '姓名', name: 'name' },
            { label: '职位', name: 'profile.position' },
            { label: '单位', name: 'profile.company' },
            { label: '产品/服务', name: 'profile.service', type: 'textarea', rows: 3, placeholder: '如：我们可以提供人脸识别的API' },
            { label: '我有他联系方式，可提供对接服务', name: 'profile.canContract', type: 'singleCheckbox', },
          ]}
          onSubmit={async (oj) => {
            debugInfo('get form oj', oj)
            try {
              await fixProfile(oj);
              this.setState({
                showForm: false
              })
            } catch (e) {
              debugInfo(e)
              this.props.flashErr(e)
            }
          }}
          submitBtn={(
            <div className="right">
              <button className="btn btn-success center" type="submit" style={{ width: 100 }}>保存</button>
            </div>
          )} />
      </div>
    )
  }
}

export default WithApi(Profile, {
  query: {
    uri: ({ query }) => `/profile/${query.faceId}`,
    skip: (props) => !props.query.faceId,
    options: {}
  },
  mutations: [{
    name: 'fixProfile',
    uri: ({ query }) => `/profile/${query.faceId}`
  }]
})
