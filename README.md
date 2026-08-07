# MMS Confeitaria

Site institucional e catálogo da MMS Confeitaria, com carrinho no navegador e finalização de encomendas pelo WhatsApp.

## Produção

- Site: https://juninhoorec.github.io/mms-confeitaria/
- Hospedagem: GitHub Pages
- Publicação: automática após envio para a branch `main`

O site é estático: não há servidor próprio, banco de dados ou pagamento on-line. O pedido só é enviado quando a pessoa escolhe finalizar pelo WhatsApp. A encomenda depende da confirmação da MMS.

## Estrutura

- `index.html`: página inicial, catálogo e carrinho
- `nossos-destaques/`, `bolos-caseiros/`, `doces/`, `sobre-nos/`: páginas internas
- `politica-de-privacidade/` e `termos-de-encomenda/`: documentos de transparência
- `style.css`, `enhancements.css`, `pages.css`: estilos
- `script.js`: catálogo, carrinho, opções, datas e mensagem do pedido
- `commerce-shell.js`: estrutura compartilhada do carrinho nas páginas internas
- `assets/` e `imagens mms/`: imagens, fontes e ícones
- `robots.txt`, `sitemap.xml` e `404.html`: indexação e tratamento de rota inexistente
- `tests/audit.mjs`: verificação de referências locais, produtos, IDs e sintaxe JavaScript

## Uso local

O projeto pode ser aberto diretamente pelo `index.html`. Para executar a auditoria automatizada, instale uma versão atual do Node.js e rode:

```text
npm test
```

## Atualizações comerciais

Antes de alterar preços, produtos, horários, endereço, formas de pagamento ou telefone, obtenha aprovação da responsável pela MMS. Produtos e preços aparecem no HTML e no cadastro existente em `script.js`; ambos devem permanecer consistentes. Depois da alteração:

1. revise todas as páginas afetadas;
2. teste carrinho, quantidades, opções e datas;
3. finalize um pedido de teste e confira a mensagem no WhatsApp;
4. execute `npm test`;
5. envie a alteração para `main` e confira a publicação.

## Carrinho e privacidade

O navegador utiliza `localStorage` apenas para manter carrinho, observações e opções no próprio dispositivo. Nome, telefone, endereço, data e pagamento são usados para montar a mensagem de WhatsApp e não são enviados a um servidor deste site. Consulte a Política de Privacidade publicada para a descrição destinada ao usuário.

## Publicação e reversão

O workflow em `.github/workflows/static.yml` publica o conteúdo no GitHub Pages. Confirme o resultado na aba Actions e abra a URL de produção em janela anônima. Se uma publicação apresentar problema, reverta o commit responsável por meio de um novo commit; não reescreva o histórico da branch principal.

## Checklist de entrega

- validar conteúdo e dados comerciais com a cliente;
- realizar pedido completo em celular e desktop;
- conferir links, imagens, carrinho, WhatsApp e páginas legais;
- conferir `robots.txt`, `sitemap.xml` e página 404 em produção;
- registrar a versão entregue com tag ou release;
- definir responsável por conteúdo, acesso ao GitHub, suporte e período de garantia;
- manter cópia das autorizações de uso de fotos, logo, fontes e demais assets.

## Suporte

O atendimento comercial ao consumidor ocorre pelo WhatsApp informado no site. A responsabilidade técnica, credenciais, prazo de suporte e garantia devem constar no termo de entrega firmado entre cliente e desenvolvedor; esses dados não são presumidos neste repositório.
