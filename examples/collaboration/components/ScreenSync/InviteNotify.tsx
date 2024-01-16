import React from 'react';
import './ScreenSync.less'
import { useTranslation } from "react-i18next";

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const { leaderName} = props;
  return (
    <>
     <div className='leader-invite-wrap'>
        <div className="tip-des">{t("leaderName invites you to follow", {leaderName})}</div>
        <div className="event-btn" onClick={()=>props.acceptInvited()}>{t("Accept")}</div>
        <div className="event-btn" onClick={()=>props.RejectInvited()}>{t("Reject")}</div>
      </div>
    </>
  );
};
