var AuthController = (function() {
  function me(c) {
    return { email: c.user.email, nome: c.user.nome, perfil: c.user.perfil };
  }
  return { me: me };
})();
