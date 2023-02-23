import React from 'react';
import './SetCommentPermission.less'
import { Menu, Dropdown } from 'antd';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';

export default  (props) => {
  const menu = (
    <Menu
      onClick={({ key }) => props.setCommentPermission(key)}
      items={[
        {
          key: 'Comment',
          label: (
            <div className={props.isParticipantsUse?"annot-drop-title drop-item annot-participants-drop-title":"annot-drop-title drop-item"}>
              Can Comment
              {
                props.isComment === "Comment" && <img className={props.isParticipantsUse?"annot-arrow-icon annot-participants-check-icon":"annot-arrow-icon"} src={checkIcon} />
              }

            </div>
          ),
        },
        {
          key: 'View',
          label: (
            <div className={props.isParticipantsUse?"annot-drop-title drop-item annot-participants-drop-title":"annot-drop-title drop-item"}>
              Can View
              {
                props.isComment === "View" && <img className={props.isParticipantsUse?"annot-arrow-icon annot-participants-check-icon":"annot-arrow-icon"} src={checkIcon} />
              }
            </div>
          ),
        }
      ]}
    />
  );
  return (

    <Dropdown overlay={menu} placement="bottom" trigger={['click']} disabled={props.dropDisabled===true}>
      <div className="annot-drop-wrap" style={{ opacity: props.dropDisabled===true ? "0.6" : "1" }}>
        <div className={props.isParticipantsUse?"annot-drop-title annot-participants-drop-title":"annot-drop-title"}>
          {props.isComment === 'Comment' ? "Can Comment" : "Can View"}
          <img className={props.isParticipantsUse?"annot-arrow-icon annot-participants-arrow-icon":"annot-arrow-icon"} src={bottomArrow} />
        </div>
      </div>
    </Dropdown>
  );
}
