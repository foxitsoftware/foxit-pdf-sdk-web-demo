import { request, Response } from './common';
import { formatUserResult, Member } from '../types/index';
export let currentToken: string = '';
export async function getLocalDocList(username: string) {
  const result: Response<any> = await request({
    url: '/api/files/list',
    method: 'get',
    params: {
      username,
    },
  });
  if (result.ret !== 0) return Promise.reject(result);
  return result.data;
}
export async function getUser(): Promise<Member> {
  const result = await request({
    url: '/api/user',
    method: 'get',
  });

  return formatUserResult(result.data);
}

export async function loginAnonymously(userName: string): Promise<string> {
  const result = await request({
    url: '/api/user/login-anonymously',
    method: 'post',
    data: {
      user_name: userName,
    },
  });

  const { token } = result.data;
  currentToken = token;
  return token;
}
