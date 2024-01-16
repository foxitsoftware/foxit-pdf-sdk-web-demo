import React from 'react';
import './SetPublicPermission.less'
import { useTranslation } from "react-i18next";
import { Menu, Dropdown } from 'antd';
import bottomArrow from 'assets/icon/bottom-arrow.svg';
import checkIcon from 'assets/icon/check-icon.svg';
import lockIcon from 'assets/icon/lock-icon.svg';
import unlockIcon from 'assets/icon/unlock-icon.svg';

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const menu = (
    <Menu
      onClick={({ key }) =>{
        props.setPublicPermissionFn(key)
      }}
      items={[
        {
          key: 'NoAnyone',
          label: (
            <div className="drop-title drop-item">
              {t("Only people invited to this file")}
              <img className="permission-icon" src={lockIcon} />
              {
                props.isPublic === "NoAnyone" && <img className="arrow-icon" src={checkIcon} />
              }

            </div>
          ),
        },
        {
          key: 'Anyone',
          label: (
            <div className="drop-title drop-item">
              {t("Anyone with the link")}
              <img className="permission-icon" src={unlockIcon} />
              {
                props.isPublic === "Anyone" && <img className="arrow-icon" src={checkIcon} />
              }
            </div>
          ),
        }
      ]}
    />
  );
  return (
    <Dropdown overlay={menu} placement="bottom" trigger={['click']}>
      <div className="drop-wrap">
        <div className="drop-title">
          {props.isPublic === 'Anyone' ? t("Anyone with the link") : t("Only people invited to this file")}
          <img className="permission-icon" src={props.isPublic === 'Anyone' ? unlockIcon : lockIcon} />
          <img className="arrow-icon" src={bottomArrow} />
        </div>
      </div>
    </Dropdown>
  );
}
