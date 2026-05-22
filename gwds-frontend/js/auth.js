import { Api } from './api.js';

let _user = null;

export const Auth = {
  current() { return _user; },
  async load() {
    try {
      _user = await Api.me();
      return _user;
    } catch (e) {
      _user = null;
      throw e;
    }
  },
  hasPerfil(...perfis) { return _user && perfis.includes(_user.perfil); },
  logout() { _user = null; window.location.hash = '#/login'; }
};
