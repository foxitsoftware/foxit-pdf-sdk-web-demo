import React, { PureComponent,Fragment } from 'react';
import './DropByAnnotPermission.less';
import { Menu, Dropdown } from 'antd';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';
import { PermissionContext } from '../../context';
interface IState {
  isComment: string
}

class DropByAnnotPermission extends PureComponent<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isComment: this.props.isComment
    }
  }
  selectPermissionFn(key: string) {
    this.setState({
      isComment: key
    })
    if(this.props.isParticipantsUse){
      this.props.setPermission(key)
    }else{
      this.context.editAnnotPermissionByDoc(key)
    }
  }
  render() {
    const {isParticipantsUse } = this.props;
    let isComment=this.props.isComment
    let dropDisabled = isParticipantsUse ? false : this.context.isPublic ? false : true
    if(!isParticipantsUse){
      isComment=this.context.isDocComment?"Comment":"View";
    }
    const menu = (
      <Menu
        onClick={({ key }) => this.selectPermissionFn(key)}
        items={[
          {
            key: 'Comment',
            label: (
              <div className={isParticipantsUse?"annot-drop-title drop-item annot-participants-drop-title":"annot-drop-title drop-item"}>
                can comment
                {
                  isComment === "Comment" && <img className={isParticipantsUse?"annot-arrow-icon annot-participants-check-icon":"annot-arrow-icon"} src={checkIcon} />
                }

              </div>
            ),
          },
          {
            key: 'View',
            label: (
              <div className={isParticipantsUse?"annot-drop-title drop-item annot-participants-drop-title":"annot-drop-title drop-item"}>
                can view
                {
                  isComment === "View" && <img className={isParticipantsUse?"annot-arrow-icon annot-participants-check-icon":"annot-arrow-icon"} src={checkIcon} />
                }
              </div>
            ),
          }
        ]}
      />
    );
    return (
      <Fragment>
        <Dropdown overlay={menu} placement="bottom" trigger={['click']} disabled={dropDisabled}>
          <div className="annot-drop-wrap" style={{ opacity: dropDisabled ? "0.6" : "1" }}>
            <div className={isParticipantsUse?"annot-drop-title annot-participants-drop-title":"annot-drop-title"}>
              {isComment === 'Comment' ? "can comment" : "can view"}
              <img className={isParticipantsUse?"annot-arrow-icon annot-participants-arrow-icon":"annot-arrow-icon"} src={bottomArrow} />
            </div>
          </div>
        </Dropdown>
      </Fragment>
    );
  }
}
export default DropByAnnotPermission;
DropByAnnotPermission.contextType=PermissionContext
