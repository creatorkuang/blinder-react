import React from 'react';
import CheckoutBtn from '../../components/CheckoutBtn';
import './style.css';

class BuyModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showPay: props.show
    }
  }
  componentWillReceiveProps(np) {
    if(np.show!==this.props.show) {
      this.setState({
        showPay: np.show
      })
    }
  }
  render() {
    const self = this;
    const {
      onOk
    } = this.props;
    if(!this.state.showPay) {
      return <div className=""></div>
    }
    return (
      <div className="dialog">
        <div className="dialog-body">
          <div className="dialog-title">购买会员<span className="close" onClick={() => {
            this.setState({
              showPay: false
            })
          }}>x</span></div>
          <div className="dialog-content">
              此功能是会员功能哦，你需要购买会员后才能使用。
                <div className="palg">
              <div className="bgc7 c1 center ptsm pbsm br2 ">

                <CheckoutBtn text={'1元 +1天'} className='' type="一天" price={1} onOk={() => {
                  if(typeof onOk==='function') {
                    onOk()
                  }
                  self.setState({
                    showPay: false
                  })
                 
                }} />
              </div>
              <div className="bgc7 c1 center ptsm pbsm br2 mtlg">

                <CheckoutBtn text={'5元 +7天'} className='' type="一周" price={5} onOk={() => {
                  if(typeof onOk==='function') {
                    onOk()
                  }
                  self.setState({
                    showPay: false
                  })
                }} />
              </div>
              <div className="bgc7 c1 center ptsm pbsm br2 mtlg">

                <CheckoutBtn text={'20元 +30天'} className='' type="30天" price={20} onOk={() => {
                  if(typeof onOk==='function') {
                    onOk()
                  }
                  self.setState({
                    showPay: false
                  })
                }} />
              </div>
              <div className="bgc7 c1 center ptsm pbsm br2 mtlg">
                <CheckoutBtn text={'200元 +一年'} className='' type="一年" price={200} onOk={() => {
                  if(typeof onOk==='function') {
                    onOk()
                  }
                  self.setState({
                    showPay: false
                  })
                }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
}

export default BuyModal;