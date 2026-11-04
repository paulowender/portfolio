# NFS-e em homologação

Escopo autorizado: integrar ao dashboard existente, reaproveitando XML fornecido pelo usuário como modelo fiscal, com revisão de competência, valor e descrição antes da emissão manual. Somente SEFIN de produção restrita; nenhuma URL de produção configurável. Automação mensal será posterior à homologação.

Modelo e tentativas pertencem ao usuário autenticado. Certificado A1 PFX/P12 e senha ficam em variáveis/arquivo privado no servidor, associados a um único usuário autorizado por NFSE_OWNER_USER_ID. Não importar o certificado do Firefox automaticamente. Não versionar XML real ou credenciais.

Montar nova DPS 1.01 a partir da DPS do XML, remover assinatura original, substituir identificador, número, série, ambiente, emissão, competência, valor e descrição. Preservar campos fiscais do exemplo e exigir conferência do contador quando necessário. Assinar com XMLDSIG e enviar JSON gzip/base64 usando mTLS.

Persistir tentativa antes de transmitir, número próprio e restrição única modelo/competência. Falha de rede mantém resultado desconhecido e consultas posteriores reconciliam pela DPS sem gerar outro número. Sem reenvio automático. API e tela só permitem ao proprietário configurado usar o certificado.

Limites: teste real depende de certificado instalado no servidor e migração de banco; XML antigo pode precisar de atualização conforme regras atuais da SEFIN. Não prometer homologação sem resposta autorizada do serviço.
