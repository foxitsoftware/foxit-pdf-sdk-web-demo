import React, { PureComponent } from 'react';
import './Participants.less'
import { randomHexColor } from '../../utils';
import DropByAnnotPermission from '../DropByAnnotPermission/DropByAnnotPermission';
import { MemberContext, PermissionContext, UserContext } from '../../context';
interface IState {

}

class Participants extends PureComponent<any, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
    }
  }
  setAnnotPermission(key:string,item:any){
    this.props.setUserPermission(key,item)
  }
  render() {
    const {isShowPermissionDrop } = this.props;
    return (
      <UserContext.Consumer>
          {user => (
            <MemberContext.Consumer>
                {collabMembers => (
                  <div className="participants-wrap">
                    <div className="title">Participants</div>
                    <div className="participant-list-wrap">
                      {
                        collabMembers && collabMembers.map((item: any) => {
                          return (<div className="participant-list" key={item.id}>
                            <div className="portrait" style={item.lastRead === "null" ? { background: "#ccc" } : user!.id===item.id? { background: "#9C35EE" }:{ background: randomHexColor(item.id) }}>{item.userName.charAt(0).toUpperCase()}</div>
                            <div className="nickName" title={item.userName} style={item.lastRead === "null" ? { color: "#ccc" } : { color: "#333333" }}>{item.userName}</div>
                            {
                              user!.id === item.id?<div className="comment owner-des">[You]</div>:
                                isShowPermissionDrop?
                                <div className="comment-wrap">
                                  <DropByAnnotPermission
                                    isComment={item.isAllowComment?"Comment":"View"}
                                    isParticipantsUse={true}
                                    setPermission={(key:string)=>{this.setAnnotPermission(key,item)}}
                                  />
                                </div>:
                                <div className="comment owner-des">{item.isAllowComment?"Can Comment":"Can View"}</div>
                            }
                          </div>)
                        })
                      }
                    </div>
                  </div>
                )}
            </MemberContext.Consumer>
          )}
      </UserContext.Consumer>

    );
  }
}
export default Participants;
Participants.contextType=PermissionContext
