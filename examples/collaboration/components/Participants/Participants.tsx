import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import './Participants.less';
import { message } from 'antd';
import { lang } from '../../locales';
import { useCurrentCollaboration } from '../../context/collaboration';
import { useCurrentUser } from '../../context/user';
import { randomHexColor } from '../../utils/utils';
import SetCommentPermission from '../SetCommentPermission/SetCommentPermission';

export default (props) => {
  const { t } = useTranslation('translation', {keyPrefix: 'Collaboration'});
  const { collaboration } = useCurrentCollaboration();
  const [collabMembers, setcollabMembers] = useState<any>([]);
  const { currentUser } = useCurrentUser();
  useEffect(() => {
    getDocMembers();
  }, [collaboration]);

  useEffect(() => {
    setcollabMembers(props.collaborationMembers);
  }, [props.collaborationMembers]);

  const getDocMembers = async () => {
    collaboration
      ?.getMembers()
      .then((collabMembers) => {
        setcollabMembers(collabMembers);
      })
      .catch(() => {
        message.error(t("getMembersError"));
      });
  };
  const setAnnotPermission = async (key: string, item: any) => {
    let members = [
      {
        id: item.id,
        isAllowComment: key === 'Comment',
      },
    ];
    if (collaboration) {
      try {
        let isUpdated = await collaboration.updateMemberPermission(members);
        if (isUpdated) {
          getDocMembers();
        } else {
          message.error(t("CollabAuthor.permissionSetError"));
        }
      } catch {
        message.error(t("CollabAuthor.permissionSetError"));
      }
    }
  };
  return (
    <div className="participants-wrap">
      <div className="title">{t("Participants")}</div>
      <div className="participant-list-wrap">
        {collabMembers &&
          collabMembers.map((item: any) => {
            return (
              <div className="participant-list" key={item.id}>
                <div
                  className="portrait"
                  style={
                    item.lastRead === 'null'
                      ? { background: '#ccc' }
                      : { background: randomHexColor(item.id) }
                  }
                >
                  {item.userName.charAt(0).toUpperCase()}
                </div>
                <div
                  className="nickName"
                  title={item.userName}
                  style={
                    item.lastRead === 'null'
                      ? { color: '#ccc' }
                      : { color: '#333333' }
                  }
                >
                  {item.userName}
                </div>
                {item!.id === collaboration?.authorId ? (
                  <div className="comment owner-des">[{t("Owner")}]</div>
                ) : currentUser!.id === item.id ? (
                  <div className="comment owner-des">[{t("You")}]</div>
                ) : props.isShowPermissionDrop ? (
                  <div className="comment-wrap">
                    <SetCommentPermission
                      isComment={item.isAllowComment ? 'Comment' : 'View'}
                      isParticipantsUse={true}
                      setCommentPermission={(key: string) => {
                        setAnnotPermission(key, item);
                      }}
                    />
                  </div>
                ) : (
                  <div className="comment owner-des">
                    {item.isAllowComment ? t('Can Comment') : t('Can View')}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
