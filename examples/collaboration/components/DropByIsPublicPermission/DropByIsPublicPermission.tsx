import React, { PureComponent,Fragment } from 'react';
import './DropByIsPublicPermission.less';
import { Menu, Dropdown } from 'antd';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';
import lockIcon from 'assets/icon/lock-icon.svg';
import unlockIcon from 'assets/icon/unlock-icon.svg';
import { PermissionContext } from '../../context';
interface IState {
  isPublic: string
}
class DropByIsPublicPermission extends PureComponent<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isPublic: this.props.isPublic
    }
  }
  selectPermissionFn(key: string) {
    this.setState({
      isPublic: key
    })
    this.context.editIsPublic(key)
  }
  render() {
    let isPublic=this.context.isPublic?"Anyone" : "NoAnyone";
    const menu = (
      <Menu
        onClick={({ key }) => this.selectPermissionFn(key)}
        items={[
          {
            key: 'NoAnyone',
            label: (
              <div className="drop-title drop-item">
                Only people invited to this file
                <img className="permission-icon" src={lockIcon} />
                {
                  isPublic === "NoAnyone" && <img className="arrow-icon" src={checkIcon} />
                }

              </div>
            ),
          },
          {
            key: 'Anyone',
            label: (
              <div className="drop-title drop-item">
                Anyone with the link
                <img className="permission-icon" src={unlockIcon} />
                {
                  isPublic === "Anyone" && <img className="arrow-icon" src={checkIcon} />
                }
              </div>
            ),
          }
        ]}
      />
    );
    return (
      <Fragment>
        <Dropdown overlay={menu} placement="bottom" trigger={['click']}>
          <div className="drop-wrap">
            <div className="drop-title">
              {isPublic === 'Anyone' ? "Anyone with the link" : "Only people invited to this file"}
              <img className="permission-icon" src={isPublic === 'Anyone' ? unlockIcon : lockIcon} />
              <img className="arrow-icon" src={bottomArrow} />
            </div>
          </div>
        </Dropdown>
      </Fragment>
    );
  }
}
export default DropByIsPublicPermission;
DropByIsPublicPermission.contextType=PermissionContext
