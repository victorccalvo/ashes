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

- Dois atos na mesma expedição: Mosteiro sem Sol e Catedral Submersa, cada um com nove elites e um chefe. O primeiro chefe oferece três aprimoramentos **lendários** (escolha um), dois pontos e recuperação de 40% da vida. A essência continua pendente até a morte ou conclusão do segundo ato.
- Ato II: vida de 1900 a 3740 nos elites e 5670 no chefe; dano básico de 38 a 62 nos elites e 65 no chefe. Cada inimigo tem ritual próprio a cada 7s. O chefe lunar muda o ritual em 66% e 33% de vida. São valores iniciais de balanceamento, a validar com partidas e níveis diferentes de legado.
- Saves antigos continuam válidos. O índice de encontro aceita 0–19 e o melhor avanço até 20. O jogo inicia depois de carregar os dados e comportamentos dos dois atos.

- Expansão: oito habilidades por classe (40 no total), mantendo três espaços. Novas opções incluem Ruptura de Pedra, Juramento Restaurador e Égide; Reabrir Feridas, Ímpeto e Uivo; Raio, Cometa e Prisma; Marca, Salva e Pacto; Colheita, Prisão e Espectro. O catálogo mostra as novas fórmulas e interações.
- Dezessete opções de legado por personagem: cinco básicas e doze de estilo. Oito novas por classe custam 30 + 18 por nível (as nove anteriores mantêm os preços). Saves de cinco ou nove opções são ampliados sem perder compras. São 85 opções e até 425 níveis de compra entre as cinco classes.
- Efeitos de habilidade desenhados na cena: estacas de gelo, explosões de fogo, relâmpagos, contornos de escudo, cães/servos espectrais, partículas de cura, runas e cortes. Substituem os símbolos que voavam na arena; a barra de habilidades continua usando símbolos para identificação. Ainda são efeitos e silhuetas sobre as poses existentes, não animações quadro a quadro do corpo completo.
- Números sobre o inimigo mostram vida efetivamente removida, crítico, fonte e dano absorvido. Ataques diretos aparecem individualmente; dano periódico é agrupado para evitar dezenas de números por segundo. Elementos visuais têm limite de quantidade e são removidos após a animação.

- Atualização da Barreira Arcana: potência +15% em relação ao ajuste anterior e teto de 23% da vida máxima. Conjura normalmente com qualquer escudo existente: substitui a parcela anterior da própria barreira e preserva as demais fontes, respeitando o limite total. Recarga de 14s e duração de 5s mantidas.
- Resultados agora permanecem por 7 segundos, com botão para avançar imediatamente e contagem regressiva. A derrota conduz ao resultado/legado, com retorno ao menu; vitórias intermediárias levam aos aprimoramentos.
- Ataques básicos têm arma/projétil separado e animado: espada, dois machados, flecha e projéteis mágicos. Incluem preparação, golpe e recuperação do corpo. São efeitos sobre as artes existentes, não sprites desenhados quadro a quadro.

- Vitória e derrota têm uma transição de 1,45s antes do popup (0,45s sem movimento quando movimento reduzido está ativo). O resultado é salvo imediatamente para evitar recompensas duplicadas ao recarregar. Na derrota há um botão **Voltar ao menu**.
- Cartões de escolhas compartilham as linhas de raridade, título e descrição com CSS subgrid, mantendo alinhamento mesmo com textos de tamanhos diferentes.
- Barreira Arcana: base 8 + 1,2 × Foco + 0,6 × Defesa; recarga base 14s; duração 5s; no máximo 20% da vida máxima por aplicação; substitui a própria barreira anterior. Outras fontes de proteção continuam sujeitas ao limite total de escudos.
- Dezesseis modificadores comportamentais para as quatro classes além do Guardião: limpeza de sangramento, conversão de dano em proteção, detonação de queimaduras, conjuração tripla, sinergia cão/veneno, vulnerabilidade, contra-ataque evasivo e proteção pelo servo. Cada modificador aparece apenas para uma habilidade aprendida e pode ser escolhido uma vez na run. Bônus de potência comuns continuam disponíveis.

- Cada classe oferece nove upgrades permanentes: cinco básicos preservados de versões anteriores e quatro exclusivos do seu estilo. Os novos níveis são inicializados em zero ao carregar saves antigos. Os efeitos de estilo são copiados para a próxima run, mantendo uma run já em andamento intacta.
- Guardião: escudo inicial, cura ao interromper, maior limite de barreira e espinhos. Berserker: roubo de vida, sangramento, execução e limiar de fúria. Arcanista: queimadura, conversão de dano em barreira, primeira conjuração e lentidão. Caçador: cura pelo cão, veneno, Tiro Preciso e controle no quinto ataque. Necromante: dano do servo, drenagem, duração de maldição e barreira pelo servo.
- Cada personagem tem um botão **Ver habilidades** na seleção. O catálogo mostra passiva, todas as habilidades, efeitos, escala e recarga base, sem trocar o personagem selecionado.
- Janelas opcionais fecham pelo clique no fundo; escolhas obrigatórias de habilidade e aprimoramento não fecham por clique fora, Escape ou X. Cartões de aprimoramento usam borda, fundo e faixa inteiros na cor da raridade, além do nome escrito.

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

### Balanceamento da abertura e custos do legado
- Cada nível do mesmo upgrade custa o dobro do anterior: slots 0–8 custam 12/24/48/96/192; slots 9–16 custam 30/60/120/240/480 essências. Compras existentes e saldos são preservados.
- Ataque básico: 2 × Poder. Armadura do Porteiro reduz básicos em 20%; primeiro elite com 240 HP e 12 de dano. Os demais inimigos mantêm seus atributos.
- Retaliação: 2,4 × Poder + 1,2 × Defesa. Segundo Fôlego ativa abaixo de 60% da vida, uma vez por duelo. Barreira Arcana tem base 12, mantendo limites e duração.
- `node balance-test.cjs`: 40 escolhas iniciais isoladas, sem legado, em 21 cenários (sem críticos e 20 sementes), exigindo vitória com pelo menos 50% de HP antes do descanso. `node smoke-test.cjs` mantém as regressões gerais.

### Caçador: mobilidade e matilha
- Base: Vitalidade 9 / Poder 10 / Defesa 7 / Agilidade 10 / Foco 4 (40 pontos, 210 HP). Básicos recebem +0,45 × Agilidade; a quinta flecha mantém o dano extra e cura 3% da vida máxima.
- Cão ganha scaling de Agilidade, cura 2% da vida por investida e protege contra presas marcadas. Armadilha marca, interrompe e atrasa; Passo Evasivo remove sangramento; Veneno enfraquece ataques físicos; Pacto cura, protege e limpa sangramento mesmo sem o cão.
- Marca dura 8s, aplica vulnerabilidade de 18% por 6s e fortalece Tiro Preciso/Salva. Todos os oito slots de habilidade continuam compatíveis com saves e upgrades existentes.
- `node hunter-test.cjs` verifica interações e quatro builds em dez encontros, sem legado nem críticos. O cenário distribui 1 Agilidade + 1 Vitalidade por vitória e alterna aprimoramentos comuns de Poder/Vitalidade após completar a build; não garante vitória com qualquer escolha aleatória.

### Ficha, Defesa e desafio abissal
- A ficha acessível pelo topo e pelo painel lateral pausa o combate e mostra atributos, dano direto/contínuo, crítico, cura, escudo e recarga atuais. Usa as mesmas funções de potência e modificadores, em modo de consulta sem alterar a run. Efeitos condicionais usam o estado do instante consultado; limites e defesas inimigas ainda se aplicam.
- Histórico registra aprimoramentos (raridade, efeito e encontro) e pontos de atributo, persistidos no save. Runs anteriores continuam funcionando; o histórico anterior à atualização não pode ser reconstruído, mas os bônus de potência/evoluções ativos são consultáveis.
- Defesa mantém a fórmula `3D/(100+3D)`. D=10 reduz 23,08%; D=20 reduz 37,5%; D=30 reduz 47,37%; D=50 reduz 60%. O próximo ponto ganha respectivamente 1,74 / 1,15 / 0,82 / 0,47 pontos percentuais. Isso equivale a +3% da vida base de resistência efetiva por ponto contra dano físico, sem outros efeitos.
- Ato II: HP `2800 + 340 × índice`, com +2000 no boss (7860 HP); dano `52 + 4 × índice` (88 no boss). Além do ritual individual, a pressão abissal causa 18% da vida máxima a cada 7s, absorvível por escudos.
- Cada nível comprado no legado do personagem reduz a pressão em 0,8% (limite 65%) e os demais danos do Ato II em 0,48% (limite 39%). O legado da run é fixado no início. Saves antigos recebem a resistência correspondente ao seu legado; encontros abissais em andamento migram os HP inimigos proporcionalmente.
- `node status-test.cjs` verifica Defesa de 0 a 100, consulta das 40 habilidades sem mutações, histórico e saves antigos. `node act-balance-test.cjs` simula cinco builds em 0/2/5 níveis por upgrade: nenhuma sem legado conclui Ato II; todas com legado completo concluem. São cenários planejados de atributos/aprimoramentos comuns, não prova de impossibilidade matemática de toda combinação de drops.

### Organização da página de combate
- Cabeçalho compacto com ficha, menu, classes, opções, velocidade e pausa. No celular, os seis controles ocupam uma grade regular de duas linhas.
- Informações do inimigo e a dica de combate ficam no botão `i` junto ao nome. O próximo golpe e sua barra continuam visíveis abaixo da arena.
- Backup e instruções ficam em “Opções e ajuda”; a galeria de classes abre em seu próprio diálogo. A crônica é recolhível. O antigo quadro de expedição foi removido.
- Menus de consulta pausam o combate, fecham pelo botão, Escape ou clique fora e preservam o estado de pausa até Retomar.

## Campanha de quatro atos — versão atual

A expedição tem 40 encontros: nove elites e um soberano por ato. Os três primeiros chefes dão uma escolha lendária garantida e abrem o próximo mapa na mesma run; a essência só é recebida ao morrer ou concluir o Ato IV. Saves anteriores permanecem compatíveis, sem reset.

- **III — A Forja do Sol Morto:** bronze, carvão e máquinas. HP 8500 + 650 por encontro; Hélion tem 19350 HP. Dano 95 + 6 por encontro. Pressão regional de 22% da vida a cada 7s, antes da resistência do legado.
- **IV — O Jardim do Último Eclipse:** marfim, raízes e entidades lunares. HP 25000 + 1200 por encontro; a Regente tem 41800 HP. Dano 145 + 8 por encontro. Pressão de 27% a cada 6s, antes da resistência. Após 180s nos novos atos, o colapso regional causa dano crescente para evitar impasses infinitos.
- Artes originais: `assets/act3-atlas.png`, `assets/act4-atlas.png` e `assets/minion-atlas.png`. Prompts e origem em `assets/CAMPAIGN-ART.md`. O jogo recorta os sprites no canvas, com alternativa por background CSS para arquivos locais que bloqueiem exportação do canvas.

### Invocações

No máximo duas por batalha, com vida, dano, Defesa, intervalo e escudo próprios. HP por ato: 24/42/72/110; dano: 3/5/8/12. São fracas em comparação ao elite. Quatro modelos: Acólito Menor, Brasa Viva, Eco Lunar e Cão de Espinhos. Invocações aparecem no Mosteiro, na Catedral e em vários elites/chefes novos. Não geram essência separada e somem quando o elite cai. Os básicos as priorizam; habilidades atingem o elite. Redemoinho, Ruptura de Pedra, Cometa, Salva e Peste também causam 35% do valor direto nas invocações. O estado delas é salvo e restaurado em pausa.

### Abertura mais exigente

O primeiro encontro continua acessível. Os encontros 2–10 do Ato I ganharam 25% de vida e 15% de dano. O excesso de cura e controle do Caçador foi reduzido; Corte Profundo, Sede de Sangue e Grito de Guerra foram ajustados para viabilizar a rota do Berserker.

`node search-campaign.cjs` avalia 280 combinações sem legado e sem críticos, com um plano fixo de pontos e aprimoramentos comuns. Foram 20 vitórias; não é prova de exclusividade de build, pois outras distribuições, ordens, críticos e drops alteram o resultado. Cinco rotas de margem estreita são verificadas em `campaign-balance.cjs`:

| Classe | Habilidades na ordem de aprendizagem | Vida restante aproximada |
|---|---|---|
| Guardião | Golpe de Escudo / Bastião / Juramento Restaurador | 8% |
| Berserker | Corte Profundo / Grito de Guerra / Sede de Sangue | 3% |
| Arcanista | Lança de Gelo / Barreira Arcana / Raio de Tormenta | 1% |
| Caçador | Flecha Venenosa / Investida do Companheiro / Pacto da Matilha | 6% |
| Necromante | Peste / Armadura de Ossos / Prisão de Ossos | 8% |

O cenário usa 1 Vitalidade e 1 atributo principal por vitória; o atributo principal é Defesa para Guardião, Foco para Arcanista/Necromante e Agilidade para Caçador/Berserker. Após três habilidades, alterna aprimoramentos comuns de Vitalidade e do atributo ofensivo (Defesa/Foco/Poder). O resultado não promete sobreviver com qualquer escolha nem com toda semente aleatória.

`campaign-progression.cjs` usa um plano diferente: recarga e aprimoramentos defensivos/ofensivos, drops comuns no começo, raros após o Ato II e lendários nos chefes. As cinco builds com legado completo concluem os quatro atos; nenhuma sem legado conclui. Testes de transição, rituais únicos, limite de minions, alvo automático, dano em área e validação de saves estão em `campaign-test.cjs`.

## Modo infinito

A seleção de personagem oferece **Campanha · quatro atos** e **Modo infinito**, sem requisito de desbloqueio. O botão de metaprogressão agora se chama **Legado**.

- Entrada direta: uma build nova, atributos base e legado da classe. A referência de dificuldade é calculada uma vez na entrada, considerando Poder, Agilidade, Foco, vida e níveis de legado; ganhar atributos durante a run não recalibra a referência para anular os upgrades.
- Após a Regente: a vitória abre uma decisão obrigatória. **Receber recompensa e voltar ao menu** concede a recompensa integral da campanha uma vez. **Continuar no infinito** preserva atributos, skills, aprimoramentos e essência pendente, recupera 40% da vida e oferece dois pontos de atributo e uma escolha lendária. O primeiro eco tem mais HP e dano que a Regente.
- O conjunto procedural reutiliza as quarenta criaturas e suas artes, com rituais adaptados ao poder atual do encontro e cinco modificadores: Fortificado, Veloz, Vampírico, Invocador e Incandescente. Invocações também são reescaladas. Vida cresce ao menos 8% e dano ao menos 4,5% por encontro, independentemente da criatura sorteada. Após 120s em um duelo, o eco causa dano crescente para evitar impasses.
- Recompensa por vitória: `min(12, 1 + floor(sqrt(profundidade) × 0,7))` de essência. É menor por encontro que na campanha; o total continua acumulando conforme o jogador avança. Não há bônus por abandonar ou morrer sem vitórias. Em **Opções e ajuda → Encerrar infinito**, o jogador pode receber a essência dos encontros concluídos e voltar à seleção.
- Ao continuar da campanha, o bônus final de 35 essências é transferido para o saldo pendente, sem pagar a campanha duas vezes. A essência só é recebida ao morrer ou encerrar. A melhor profundidade é salva por personagem, separadamente do avanço da campanha.
- Fonte sorteada, atributos do eco, semente, profundidade, build e histórico são salvos. Recarregar mantém o mesmo adversário e pausa a luta. Saves anteriores sem os novos campos continuam válidos.

`node endless-test.cjs` cobre escolha após a campanha, entrada direta, geração de 1000 encontros progressivamente mais fortes usando todas as quarenta criaturas, recompensa reduzida, cancelamento/encerramento voluntário, ausência de pagamento duplicado e recarga pela ordem real de scripts do HTML. A abertura foi simulada em 200 casos: cinco classes, dois níveis de legado e vinte sementes diversificadas, com uma habilidade ofensiva inicial por classe. Esses testes não garantem vitória para toda build ou toda profundidade.

## Equipamentos, espólios e rerolls

O menu mantém Legado junto de cada personagem, sem o botão global adicional. Campanha recebeu um ícone de estandarte e perdeu o subtítulo “quatro atos”; Infinito usa um símbolo próprio e a paleta violeta. O personagem selecionado oferece o botão **Equipamentos**, com acesso ao inventário compartilhado.

- Cinco espaços: arma/escudo, capacete, armadura, calças e um anel. Peças universais podem ser transferidas entre classes; cada peça tem um único dono no loadout. Escudos são exclusivos do Guardião; machados do Berserker; cajados do Arcanista; arcos do Caçador; varinhas do Necromante.
- Cada chefe real da campanha deixa um item aleatório, além da escolha lendária de aprimoramento. Cópias no infinito não contam como chefes de ato. O item entra imediatamente no inventário, sem poder ser equipado no meio da run. Recarregar não repete o drop.
- Itens comuns concedem 2+2 pontos de atributos; incomuns 4+3; raros 7+5; lendários 12+8. Há variantes universais com pares de atributos diferentes. Armas e escudos têm duas variantes por classe, com bônus de potência de skill e efeitos adicionais de cura, barreira, recarga, controle, marca ou duração de dano contínuo.
- Raridades por chefe (Comum/Incomum/Raro/Lendário): I = 60/27/11/2%; II = 45/34/18/3%; III = 25/42/27/6%; IV = 10/40/40/10%. Cada drop tem 70% de chance de peça universal e 30% de arma/escudo; armas favorecem a classe em uso, mas também podem pertencer a outra.
- Os equipamentos são fixados ao iniciar a primeira luta. Ao morrer, apenas os cinco itens usados nessa run (ou os espaços preenchidos) são destruídos e removidos dos loadouts. Itens guardados e espólios novos que não foram usados permanecem. Terminar a campanha, abandonar uma expedição vivo ou encerrar o infinito vivo preserva os itens. Continuar da campanha para o infinito mantém a mesma carga e o mesmo risco de perda.
- Os itens e seus loadouts são salvos no mesmo arquivo de progresso. A migração preserva o legado anterior e cria um inventário vazio, sem reset.

**Rito da segunda escolha** é a 18ª opção de Legado de cada personagem: três níveis, custando 30/60/120 essências. Cada nível concede um reroll individual por run. O botão sob cada oferta de habilidade substitui somente essa oferta por outra da classe, ainda não aprendida nem oferecida nos demais cartões. Não altera as outras duas escolhas e não serve para aprimoramentos. Cargas gastas persistem ao recarregar; continuar no infinito não as repõe. Novas runs repõem até três, conforme o legado da classe.

`node equipment-test.cjs` verifica peças universais, propriedade única, restrições de arma, bônus sem empilhamento indevido, dez efeitos de armas, drops idempotentes, morte removendo a carga inteira e preservando espólios novos, sobrevivência/encerramento vivo, migração, retomada pela ordem real de scripts e rerolls individuais persistentes. Os ícones de equipamento e de modo seguem o sistema SVG em grade de pixels já usado pela interface.

### Espólios e fogueiras
- Após a transição de vitória de um chefe da campanha, uma tela de loot permite equipar o item agora ou enviá-lo ao baú. Um espaço ocupado abre a comparação dos dois itens; a peça substituída fica no baú. Armas de outra classe só podem ser guardadas. Equipamentos usados durante a run, inclusive novos drops equipados, são perdidos na morte.
- Cada encontro da campanha, do quinto ao décimo de cada ato, tem 30% de chance de revelar uma fogueira após a vitória. O sorteio é salvo e não se repete ao recarregar. A fogueira restaura toda a vida e oferece um ponto de atributo e uma escolha entre três aprimoramentos compatíveis. Essa recompensa é adicional à do combate. Não aparece no modo infinito.
- Fluxo: animação de vitória → loot do chefe, se houver → fogueira, se sorteada → recompensa normal / decisão final da campanha. As decisões e os benefícios persistem no save.
- Arcanista e Necromante usam Poder para dano e Defesa para barreiras. A Marca da Presa do Caçador usa Agilidade. Todas as habilidades dessas três classes deixam de escalar sua potência com Foco, incluindo Quarta Palavra; Foco continua afetando recarga.
- A fogueira usa `assets/bonfire.png`, sprite original gerada para o projeto com fundo transparente.
