import React from 'react';
import { randomHexColor } from '../../utils/utils';
import './ScreenSync.less';
import { useTranslation } from "react-i18next";

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
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
            {member.isAllowComment ? t('Can Comment') : t('Can View')}
          </div>
        ) : (
          <div className="currentName">[{t("YOU")}]</div>
        )}
      </div>
    </>
  );
};
