import jsonwebtoken from 'jsonwebtoken';
import UserDataToken from '../domain/UserDataToken';

export default function getUserWithToken(token: string) {
  return jsonwebtoken.decode(token) as UserDataToken;
}
