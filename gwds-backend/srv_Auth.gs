var AuthService = (function() {
  function requireUser(e) {
    var email = Session.getActiveUser().getEmail();
    if (!email) _throw(401, 'Não autenticado', 'Inicie sessão com a sua conta Google.');
    var u = UtilizadorRepo.byEmail(email);
    if (!u) _throw(403, 'Acesso não autorizado', email + ' não está cadastrado no sistema.');
    return u;
  }
  function requirePerfil(user, perfis) {
    if (perfis.indexOf(user.perfil) < 0) _throw(403, 'Permissão insuficiente', 'Perfil necessário: ' + perfis.join(' ou '));
  }
  return { requireUser: requireUser, requirePerfil: requirePerfil };
})();
