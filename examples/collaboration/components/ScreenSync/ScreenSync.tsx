import React, { useEffect, useState } from 'react';
import { Button, message, Modal, notification, Popover } from 'antd';
import { useTranslation } from "react-i18next";
import './ScreenSync.less';
import { lang } from '../../locales';
import {
  storageGetItem,
  storageRemoveItem,
  storageSetItem,
  randomHexColor,
} from '../../utils/utils';
import {
  onFollowingStatus, toStartLocation,
} from '../../utils/collab-utils';
import { PUBLIC_PATH } from '../../config';
import MemberInfo from './MemberInfo';
import InviteNotify from './InviteNotify';
import { useCurrentUser } from '../../context/user';

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const { currentUser } = useCurrentUser()
  const [ collaboration, setCollaboration ] = useState<any>(null);
  const [frontOnlineMembers, setFrontOnlineMember] = useState([]);
  const [remainOnlineMembers, setRemainOnlineMembers] = useState([]);
  const [switchFollower, setSwitchFollower] = useState<any>(null);
  const [switchVisible, setSwitchVisible] = useState(false);
  const [isInScreenSync, setIsInScreenSync] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [showPopover, setShowPopover] = useState<string|null>(null);
  const [spotLight, setSpotLight] = useState(false);
  const [isWaitInvited, setIsWaitInvited] = useState(false);
  const [cancelScreenSyncVisible, setCancelScreenSyncVisible] = useState(false);
  const [sessionCreatorId, setSessionCreatorId] = useState<string|null>(null);
  const [screenSyncSession, setScreenSyncSession] = useState<any>(null);
  const [currentFollowersNum, setCurrentFollowersNum] = useState<number>(0);
  const [leader, setLeader] = useState<any>(null);
  const [screenSyncTip, setScreenSyncTip] = useState<any>(
    t('Waiting for followers...'),
  );
  useEffect(() => {
    (async () => {
      if (!props.eventData || !collaboration) return;
      const { action, actionData } = props.eventData;
      if (action === 'screen-sync-created') {
          setIsWaitInvited(true)
          notification.open({
            message: null,
            key:actionData.screenSyncId,
            description: <InviteNotify
              leaderName={actionData.leader.user_name}
              acceptInvited={() => acceptInvited(actionData)}
              RejectInvited={() => rejectInvited(actionData)}
            />,
            placement:"top",
            top:130,
            duration:null,
            className:"request-wrap"
          });
        return
      }
      if (action === 'screen-sync-member-joined') {
        if (!screenSyncSession) {
          let screenSync = await collaboration.getScreenSync(
            actionData.screenSyncId,
          );
          storageSetItem(localStorage, 'screenSyncId', actionData.screenSyncId);
          setScreenSyncSession(screenSync);
          onListeningScreenSyncMember();
        } else {
          onListeningScreenSyncMember();
        }
        setSessionCreatorId(actionData.creatorId);
      }
      if (action === 'screen-sync-member-leave') {
        onListeningScreenSyncMember();
        return;
      }
      if (action === 'screen-sync-stopped') {
        restoreCurrentScreenSync();
        onFollowingStatus(false);
        return;
      }
      if (action === 'delete-members') {
        if (actionData.length === 0) {
          if (screenSyncSession) {
            await screenSyncSession.leave();
          }
          toStartLocation()
        }
        return;
      }
    })();
  }, [props.eventData]);
  useEffect(() => {
    (async () => {
      if (collaboration && collaboration.id !== props.collaboration.id) {
        leaveScreenSyncSession();
      }
      setCollaboration(props.collaboration);
    })();
  }, [props.collaboration]);
  useEffect(() => {
    let onlineMembers = props.onlineMembers.filter((member) => {
      return member.id !== currentUser!.id;
    });
    if (onlineMembers.length <= 3) {
      setFrontOnlineMember(onlineMembers);
      setRemainOnlineMembers([]);
    } else {
      setFrontOnlineMember(onlineMembers.slice(0, 3));
      setRemainOnlineMembers(onlineMembers.slice(3, onlineMembers.length));
    }
    if (leader) {
      let leaderIsOnline = props.onlineMembers.filter((user) => {
        return user.id === leader.id;
      });
      if (leaderIsOnline.length == 0) {
        leaveScreenSyncSession();
      }
    };
  }, [props.onlineMembers]);
  useEffect(() => {
    (async () => {
      if (props.collaboration) {
        const currentMember = await props.collaboration.getCurrentUser();
        if (currentMember.isInScreenSync) {
          let screenSyncId = storageGetItem(localStorage, 'screenSyncId');
          if (!screenSyncId) return;
          try {
            let screenSync = await props.collaboration.getScreenSync(
              screenSyncId,
            );
            await screenSync.leave();
          } catch (error: any) {
            if (error.ret === 404) {
              storageRemoveItem(localStorage, 'screenSyncId');
            }
          }
        }
      }
    })();
  }, []);
  const acceptInvited = async (actionData) => {
    try{
      let screenSync = await collaboration!.getScreenSync(actionData.screenSyncId);
      if(screenSyncSession){
        try {
          await leaveScreenSyncSession();
        } catch (ex:any) {
          if (ex && (ex.ret === 404)) {
            
          }
        }
      }
      screenSync.join();
      setScreenSyncTip(`${t("Spotlighting on")} ${actionData.leader.user_name}...`)
      storageSetItem(localStorage, 'screenSyncId', actionData.screenSyncId);
      setScreenSyncSession(screenSync);
      setIsInScreenSync(true);
      setIsWaitInvited(false)
      notification.destroy()
    }catch(error:any){
      setIsWaitInvited(false)
      if(error.ret===404){
        message.error(error.message)
        notification.close(actionData.screenSyncId)
      }
    }
  }
  const rejectInvited = async (actionData) => {
    setIsWaitInvited(false)
    notification.close(actionData.screenSyncId)
  }
  const onListeningScreenSyncMember = async () => {
    if (!screenSyncSession) return;
    let leaderInfo = await screenSyncSession.getMembers('leader');
    let members = await screenSyncSession.getMembers('follower');
    setLeader(leaderInfo[0]);
    if (leaderInfo[0].id === currentUser!.id) {
      setCurrentFollowersNum(members.length);
      if (members.length > 0) {
        setScreenSyncTip(`${members.length} ${t("followers")}`);
      } else {
        setScreenSyncTip(t('Waiting for followers...'));
      }
    } else {
      onFollowingStatus(true, leaderInfo[0].id);
    }
  };

  const restoreCurrentScreenSync = () => {
    setScreenSyncSession(null);
    onFollowingStatus(false);
    setLeader(null);
    setSpotLight(false);
    setCurrentFollowersNum(0);
    setSessionCreatorId(null);
    setScreenSyncTip(t('Waiting for followers...'));
    setIsInScreenSync(false);
    storageRemoveItem(localStorage, 'screenSyncId');
  };
  const FollowMemberFn = async (user) => {
    try {
      let screenSyncInfo = await user.getScreenSyncInfo()
      let screenSync = await collaboration!.getScreenSync(screenSyncInfo.id)
      setScreenSyncSession(screenSync)
      await screenSync.join()
      setSessionCreatorId(currentUser!.id)
      setSwitchVisible(false)
      setIsInScreenSync(true)
      setScreenSyncTip(`${t("Following")} ${user.userName}  ...`)
      storageSetItem(localStorage, 'screenSyncId', screenSyncInfo.id)
      setPopoverVisible(false)
      if(isWaitInvited){
        notification.destroy()
        setIsWaitInvited(false)
      }
    } catch (error: any) {
      if (error.ret === 403) {
        message.error(t("followEachOthor"));
      } else {
        message.error(t("followScreenSyncFailed"));
      }
    }
  };
  const createSpotlight = async () => {
    try {
      let screenSync = await collaboration!.createScreenSync();
      setSessionCreatorId(currentUser!.id);
      setScreenSyncSession(screenSync);
      setLeader(currentUser);
      setSwitchVisible(false);
      setScreenSyncTip(t('Waiting for followers...'));
      setIsInScreenSync(true);
      setPopoverVisible(false);
      setSpotLight(true);
      storageSetItem(localStorage, 'screenSyncId', screenSync.id)
      if(isWaitInvited){
        notification.destroy()
        setIsWaitInvited(false)
      }
      // for testing purpose only
      //@ts-ignore
      window.app.state.screenSync = screenSync;
    } catch (error) {
      message.error(t("createScreenSyncFailed"));
    }
  };
  const spotlightMe = () => {
    setSpotLight(true);
    if (isInScreenSync) {
      setSwitchVisible(true);
    } else {
      createSpotlight();
    }
  };
  const switchFollowerFn = async (member) => {
    setSpotLight(false);
    if (isInScreenSync) {
      setSwitchFollower(member);
      setSwitchVisible(true);
    } else {
      FollowMemberFn(member);
    }
  };
  const switchContinue = async () => {
    if (leader) {
      await leaveScreenSyncSession();
    }
    if (spotLight) {
      createSpotlight();
    } else {
      FollowMemberFn(switchFollower);
    }
  };
  const leaveScreenSyncSession = async () => {
    if (!screenSyncSession) return;
    let isLeaved = await screenSyncSession.leave();
    if (isLeaved) {
      restoreCurrentScreenSync();
    }
  };
  const handleOpenChange = (visible, member) => {
    if (visible) {
      setShowPopover(member.id);
    } else {
      setShowPopover(null);
    }
    setPopoverVisible(visible);
  };
  return (
    <div className="online-list-wrap">
      {frontOnlineMembers.map((member: any) => {
        return (
          <Popover
            placement={'bottom'}
            visible={showPopover === member.id && popoverVisible}
            onVisibleChange={(visible) => handleOpenChange(visible, member)}
            key={member.id}
            title={null}
            content={
              <div className="online-drop-item">
                <div className="userInfo">
                  <MemberInfo member={member}></MemberInfo>
                </div>
                <Button
                  type="primary"
                  style={{ fontWeight: 600, padding: '0 28px' }}
                  disabled={leader && member.id === leader.id}
                  onClick={() => switchFollowerFn(member)}
                >
                  {leader && member.id === leader.id ? t('following') : t('Follow')}
                </Button>
              </div>
            }
            trigger="hover"
          >
            <div
              className="portrait"
              style={{ background: randomHexColor(member.id) }}
            >
              {member?.userName.charAt(0).toUpperCase()}
            </div>
          </Popover>
        );
      })}
      {remainOnlineMembers.length > 0 && (
        <Popover
          placement={'bottom'}
          title={null}
          content={remainOnlineMembers.map((item: any) => {
            return (
              <div className="remain-wrap" key={item.id}>
                <MemberInfo member={item}></MemberInfo>
                <div>
                  <Button
                    type="primary"
                    style={{ fontWeight: 600, padding: '0 28px' }}
                    disabled={leader && item.id === leader.id}
                    onClick={() => switchFollowerFn(item)}
                  >
                    {leader && item.id === leader.id ? t('following') : t('Follow')}
                  </Button>
                </div>
              </div>
            );
          })}
          trigger="hover"
        >
          <div
            className="portrait"
            style={{ background: '#707070D6', cursor: 'pointer' }}
          >
            +{remainOnlineMembers.length}
          </div>
        </Popover>
      )}
      <Popover
        placement={'bottom'}
        title={null}
        visible={showPopover === currentUser!.id && popoverVisible}
        onVisibleChange={(visible) => handleOpenChange(visible, currentUser)}
        content={
          <div className="online-drop-item">
            <div className="userInfo">
              <MemberInfo member={currentUser}></MemberInfo>
            </div>
            {currentFollowersNum > 0 &&
              leader &&
              sessionCreatorId === currentUser!.id && (
                <div className="follower-num" title={currentUser!.userName}>
                  {currentFollowersNum}{t("followers")}
                </div>
              )}
            {
              <Button
                type="primary"
                style={{ fontWeight: 600, padding: '0 28px' }}
                onClick={spotlightMe}
                disabled={spotLight && leader}
              >
                {t("Spotlight me")}
              </Button>
            }
          </div>
        }
        trigger="hover"
      >
        <div
          className="portrait"
          style={{ background: randomHexColor(currentUser!.id) }}
        >
          {currentUser?.userName.charAt(0).toUpperCase()}
        </div>
      </Popover>

      {(leader && leader.id !== currentUser!.id) ||
      (leader && sessionCreatorId === currentUser!.id) ? (
        <div
          className="leader-wait"
          style={{
            background:
              leader.id !== currentUser!.id
                ? randomHexColor(leader.id)
                : '#923094',
          }}
        >
          <div className="tip-des">{screenSyncTip}</div>
          {leader &&
          leader.id === currentUser!.id &&
          currentFollowersNum === 0 ? (
            <div
              className="event-btn"
              onClick={() => setCancelScreenSyncVisible(true)}
            >
              {t("Cancel")}
            </div>
          ) : (
            <div className="event-btn" onClick={leaveScreenSyncSession}>
              {t("Stop")}
            </div>
          )}
        </div>
      ) : null}
      <Modal
        title={t("dialogTitle")}
        visible={switchVisible}
        onCancel={() => {
          setSwitchVisible(false);
          setSpotLight(false);
        }}
        zIndex={100000}
        footer={[
          <Button
            type="primary"
            key={'Continue'}
            onClick={switchContinue}
          >
            {t("Continue")}
          </Button>,
        ]}
        centered
      >
        <div className="collab-modal-wrap">
          <div>
            {leader &&
              (leader.id === currentUser!.id
                ? t('You are currently spotLight')
                : `${t("You are currently following")}  ${leader.userName}`)}
            , {t("do you want to switch to")}{' '}
            {!spotLight
              ? switchFollower && `${t("follow")} ${switchFollower.userName}`
              : t('Spotlight me')}
            ?
          </div>
        </div>
      </Modal>
      <Modal
        title={t("cancelScreenSync")}
        visible={cancelScreenSyncVisible}
        onCancel={() => {
          setCancelScreenSyncVisible(false);
        }}
        zIndex={100000}
        footer={[
          <Button
            type="primary"
            key={'Continue'}
            onClick={() => {
              setCancelScreenSyncVisible(false);
              leaveScreenSyncSession();
            }}
          >
            {t("OK")}
          </Button>,
        ]}
        centered
      >
        <div className="collab-modal-wrap">
          {t('stopSpotlighting')}
        </div>
      </Modal>
    </div>
  );
};
