import React, { PureComponent } from 'react';
import { useTranslation } from "react-i18next";
import './OnlineMembers.less'
import { Dropdown, Menu } from 'antd';
import { randomHexColor } from '../../utils';


class OnlineMembers extends PureComponent<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
    }
  }
  render() {
    const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
    const { onlineMembers,user } = this.props;
    const menu = (
      <Menu
        items={[
          {
            key: '',
            label: (
              <div>
                {
                  onlineMembers.map((item: any) => {
                    return (
                      <div className="online-drop-item" key={item.id}>
                        <div className="left-wrap">
                          <div className="portrait" style={ item.id===user.id ? {background: "#9C35EE"} : { background: randomHexColor(item.id)} }>{item.userName.charAt(0).toUpperCase()}</div>
                          <div className="nickName" title={item.userName}>{item.userName}</div>
                        </div>
                        <div className="comment">{item.isAllowComment?t("Can Comment"):t("Can View")}</div>
                      </div>)
                  })
                }
              </div>
            ),
          }
        ]}
      />
    );
    let displayMembers = onlineMembers.slice(0, 4)
    return (
      <div className="online-wrap">
        <Dropdown
          overlay={menu}
          placement="bottom"
          arrow={{
            pointAtCenter: true,
          }}
        >
          <div className="online-list-wrap">
            {
              displayMembers.map((item: any) => {
                return (
                  <div className="portrait" key={item.id} style={ item.id===user.id ? {background: "#9C35EE"} : { background: randomHexColor(item.id)} }>{item.userName.charAt(0).toUpperCase()}</div>)
              })
            }
            {
              onlineMembers.length > 4 && <div className="portrait" style={{ background: "#707070D6" }}>+{onlineMembers.length - 4}</div>
            }
          </div>

        </Dropdown>
      </div>
    );
  }
}
export default OnlineMembers;
