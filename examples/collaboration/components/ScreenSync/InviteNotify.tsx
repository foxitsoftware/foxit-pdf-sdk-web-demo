import React from 'react';
import './ScreenSync.less'

export default (props) => {
  const { leaderName} = props;
  return (
    <>
     <div className='leader-invite-wrap'>
        <div className="tip-des">{`${leaderName} invites you to follow`}</div>
        <div className="event-btn" onClick={()=>props.acceptInvited()}>Accept</div>
        <div className="event-btn" onClick={()=>props.RejectInvited()}>Reject</div>
      </div>
    </>
  );
};
