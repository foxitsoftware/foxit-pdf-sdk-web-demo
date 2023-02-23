import React from 'react';
import { randomHexColor } from '../../utils/utils';
import './ScreenSync.less';

export default (props) => {
  const { member } = props;
  return (
    <>
      <div className="member-info">
        <div
          className="portrait"
          style={{ background: randomHexColor(member.id) }}
        >
          {member.userName.charAt(0).toUpperCase()}
        </div>
        <div className="nickName" title={member.userName}>
          {member.userName}
        </div>
        {typeof member.isAllowComment === 'boolean' ? (
          <div className="comment">
            {member.isAllowComment ? 'Can Comment' : 'Can View'}
          </div>
        ) : (
          <div className="currentName">[YOU]</div>
        )}
      </div>
    </>
  );
};
