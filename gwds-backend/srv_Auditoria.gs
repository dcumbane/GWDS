var AuditoriaService = (function() {
  function track(user, op, entidade, id, detalhes) {
    LogRepo.log({
      utilizador: user.email,
      operacao: op,
      entidade: entidade,
      entidade_id: id,
      ip: '',
      detalhes: detalhes
    });
  }
  return { track: track };
})();
