# Ashes

Protótipo de roguelike idle para navegador. Abra `index.html` diretamente no navegador. Não exige instalação, servidor ou conexão (as fontes externas têm alternativas locais).

## Publicação no GitHub Pages

O workflow `.github/workflows/pages.yml` executa os testes e publica o jogo após pushes para `main` ou `master`. No repositório GitHub, selecione **Settings → Pages → Source → GitHub Actions** antes da primeira publicação.

Para conferir o pacote localmente, execute `node scripts/build-site.cjs`. A pasta `dist/` contém apenas os arquivos do jogo e as artes, sem testes nem documentos de produção. Ela é gerada pelo workflow e não precisa ser versionada.

O progresso de cada jogador fica no próprio navegador. A versão publicada tem armazenamento independente da versão aberta por arquivo local; use exportação/importação para transferir um progresso existente. O jogo é individual e não tem contas ou sincronização entre dispositivos.

## Nova abertura e reset solicitado

A versão 06 abre em uma tela própria de seleção dos cinco personagens, antes das habilidades. Runs salvas podem ser continuadas por essa tela; uma run ativa bloqueia a troca de classe. Ao encerrar uma run e preparar a próxima, a seleção reaparece.

Na seleção de personagem, uma run ativa também oferece **Nova expedição**, ao lado de **Continuar expedição**. Um aviso e uma confirmação explicam que a run será descartada sem recompensa, incluindo a essência pendente. Confirmar volta à preparação com habilidades e atributos reiniciados, preservando o legado comprado e a essência já recebida. Cancelar mantém a run intacta.

Para o início de testes do zero solicitado em 11/11/2026, esta versão remove uma única vez as chaves `vigilia-save-v1`, `ashes-save-v2` e `ashes-save-v3`, marcando a conclusão em `ashes-reset-20261111`. O novo progresso usa `ashes-save-v3` e persiste normalmente nas próximas aberturas. O reset ocorre quando o jogo for aberto em cada navegador/origem; backups externos não são apagados.

Cada um dos nove elites e o chefe tem uma arte própria e um cartão com tipo, nome de golpe, condição de ativação e efeito. A barra de intenção mostra a próxima ativação e a preparação de golpes interrompíveis. A interface e a abertura usam preto azulado, pedra fria, osso e ouro apagado, com ícones em grade de pixels.

## Primeiro recorte

- Metaprogressão em uma janela exclusiva da seleção de personagem. O botão e os cartões de classe indicam compras possíveis de acordo com a essência e os níveis atuais. Não se compram melhorias durante uma run ativa. Compras feitas na preparação atualizam os valores iniciais antes da partida; dados existentes são preservados.
- Três habilidades em uma barra junto à arena, fixa ao rolar a área de combate. Mostra símbolos próprios, contagem de recarga, progresso, condições reativas e destaque de ativação. Clique em um símbolo para consultar a descrição e a escala; durante o combate, isso pausa a run.
- Cada uma das 25 habilidades tem símbolo e configuração visual próprios: trajetórias, cores, duração, rotação e escala, com cortes, projéteis, proteção, invocações, cura e maldições. São efeitos gráficos e movimentos sobre as artes existentes, respeitando movimento reduzido. O nome e símbolo da ação atual aparecem sobre a arena. Em telas estreitas, o combate vem antes dos atributos.

- Cinco classes jogáveis, cada uma com 40 pontos base, uma passiva e cinco habilidades próprias. Três espaços por run. Vida máxima = 75 + Vitalidade × 15 + bônus permanente (225 para o Guardião sem legado).
- Berserker: fúria em pouca vida, machados, sangramento e recuperação. Arcanista: recarga acelerada, fogo, gelo e barreiras. Caçador: ataques de precisão, veneno, cão e armadilhas. Necromante: cura ao conjurar, servo ossudo, peste e maldição. As invocações são ações periódicas nesta versão, sem entidades visuais independentes.
- Passiva inata Tenacidade: abaixo de 40% de vida, reduz em 15% o dano físico recebido. Compra de outras passivas fica para uma etapa futura.
- Vitalidade aumenta vida e cura; Poder aumenta ataque básico e habilidades ofensivas; Defesa reduz dano físico e fortalece proteção e retaliação; Agilidade acelera apenas ataques básicos; Foco acelera recargas e fortalece Bastião. Fórmulas e valores atuais aparecem na interface.
- Golpe de Escudo escala com Poder e Defesa; Bastião com Defesa e Foco; Retaliação com Poder e Defesa; Espinhos com Defesa; Segundo Fôlego com Vitalidade e vida máxima. Bônus de dano permanente e críticos são aplicados depois do valor base mostrado.
- Escolhas de habilidades, aprimoramentos, atributos e resultado final em modal acessível, com opção de fechar e reabrir. Habilidades indicam ativação, barra de recarga, contagem de ataques ou consumo por duelo, conforme o gatilho. Vida inimiga numérica e barra em destaque.
- Começa sem habilidades. Escolha uma entre três no início e após os dois primeiros duelos, até preencher três espaços. O conjunto provisório contém cinco habilidades para garantir três opções não aprendidas em cada escolha.
- Nove elites com padrões próprios e um chefe com segunda fase.
- Dois pontos de atributo entre duelos. Após completar as habilidades, escolhas de aprimoramento comum, incomum, raro ou lendário, compatíveis com a build. Chance por opção: lendário 0,3% + 0,15 ponto percentual por índice do elite derrotado; raro 2,5% + 0,6 ponto percentual; incomum 18% + 0,8 ponto percentual; restante comum. O primeiro elite tem índice zero. Chances independentes, sem garantia de raro ou lendário.
- Cinco melhorias permanentes, com cinco níveis cada, compradas com essência.
- Essência dos elites permanece pendente durante a run. O crédito ao legado acontece apenas na morte ou vitória final, uma única vez.
- Pausa, velocidades 1×/2×/4× e pausa automática ao ocultar a aba.
- Metaprogressão e essência vinculadas ao personagem. Troca de classe no modal inicial, painel lateral ou galeria, disponível na preparação e após o fim da run. Uma run ativa precisa terminar antes da troca. Saves antigos do Guardião são preservados; os demais perfis começam vazios.
- Animações simples de avanço, recuo de impacto, conjuração e proteção via Web Animations API, sobre as poses existentes. Respeitam a preferência de movimento reduzido. Não são animações de sprites quadro a quadro.
- Atributos em grade com linhas separadas para título/ícone, valor/botão e explicação, mantendo alinhamento no modal e no painel lateral.
- Salvamento automático da run, escolhas e legado em localStorage a cada decisão e a cada dois segundos de combate. Recarregar restaura o combate pausado, sem progresso offline. Exportação/importação de backup JSON, com validação e confirmação antes da substituição.
- Migração automática da essência e melhorias da versão anterior para o Guardião. A run antiga não pode ser migrada por causa das novas regras.
- O armazenamento depende do navegador e da origem/caminho do arquivo. Exporte backups para mover o progresso entre navegadores ou computadores.

## Verificação

Execute `node smoke-test.cjs`. Testa atributos, escolhas sem repetição, três espaços, compatibilidade de aprimoramentos, limites de raridade, pausa, restauração, validação de backup, recompensas sem duplicação, as 25 habilidades, troca de classe e separação do legado. Não substitui inspeção visual ou balanceamento com partidas reais.

## Direção

Fantasia sombria original: mosteiro abandonado, juramentos, cinzas, pedra e ouro envelhecido. Cinco artes de personagens, nove elites individuais e um chefe em `assets/`. Ícones em grade de pixels. Cada encontro é um duelo contra um inimigo significativo. O combate termina com a morte do personagem ou do inimigo; ambos mortos na mesma etapa resulta em derrota.

## Próximas iterações

Validar dificuldade das cinco classes em partidas reais; expandir cada classe para dez habilidades; criar artes individuais dos elites; adicionar animações quadro a quadro, invocações visuais independentes e áudio.
