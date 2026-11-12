# ASHES — primeira direção de arte

Gerado com a ferramenta integrada de imagens (não via CLI). Os PNGs originais selecionados foram copiados para esta pasta e integrados ao jogo. São artes de pose única, ainda sem animações quadro a quadro. Os ícones em `art-ui.js` usam uma grade SVG de 24 pixels.

## Arquivos

- `class-guardian.png`: armadura, escudo colossal e espada.
- `class-berserker.png`: cabelos longos, tecido e dois machados de uma mão.
- `class-arcanist.png`: mago encapuzado e cajado.
- `class-hunter.png`: arqueiro acompanhado de um cachorro.
- `class-necromancer.png`: esqueleto em trapos e varinha.
- `enemy-elite.png`: Porteiro de Ferro.
- `enemy-widow.png`, `enemy-penitent.png`, `enemy-thorn.png`, `enemy-abbess.png`, `enemy-executioner.png`, `enemy-beast.png`, `enemy-hollow.png`, `enemy-hand.png`: visuais próprios dos outros oito elites, com identidade e equipamento relacionados aos seus golpes.
- `enemy-boss.png`: Soberano das Cinzas.

## Prompts das classes

Prefixo comum utilizado em cada geração:

> Use case: stylized-concept. Asset type: production game character sprite for ASHES, a gothic dark-fantasy idle roguelike. Original design inspired by the oppressive medieval pixel-art atmosphere of Blasphemous, without copying any existing character. TRUE crisp chunky pixel art, limited muted 24-color palette, visible square pixel clusters, no smooth digital painting, no antialiasing, no text. Full body, single idle pose, three-quarter view facing right, feet aligned near bottom, centered, whole weapon visible, ample transparent margin. Transparent background, no floor or scenery. Consistent sprite scale: character approximately 100 logical pixels tall enlarged with nearest-neighbor, restrained ash grey, tarnished brass, bone and dried crimson, strong readable silhouette and dramatic rim lighting. Subject:

Sufixos, um por imagem:

- Guardian: a massive enclosed medieval knight in weathered plate armor, closed flat helm, heavy dark cape and an exceptionally large tall tower shield covering most of his body, short sword in the other hand. Shield dominates the silhouette, pale steel with faded brass sun engraving.
- Berserker: a fierce long-haired warrior with flowing dark auburn hair, rough cloth armor, worn fabric wraps and ragged burgundy tunic, holding TWO one-handed axes, exactly one axe in each hand, no plate armor. Wide powerful stance.
- Arcanist: a mysterious elderly wizard in layered ragged midnight-blue and ash robes, deep hood, long crooked wooden STAFF topped with a dim pale amber crystal, book and small charms on belt. Tall narrow silhouette.
- Hunter: a hooded medieval ARCHER in weathered moss-grey leather and cloth, holding a longbow, quiver of arrows on back, and a faithful large dark hunting DOG standing immediately beside the archer, both fully visible. The dog has no armor.
- Necromancer: an explicitly SKELETAL humanoid, exposed bone skull and bony hands, draped in shredded tattered desaturated black-green RAGS, holding a small slender WAND with a faint sickly green spark, hunched eerie silhouette. No staff, no scythe.

## Prompts dos inimigos

Prefixo comum:

> Use case: stylized-concept. Asset type: enemy sprite for the gothic pixel-art game ASHES. Crisp chunky pixel clusters, limited palette, medieval religious horror atmosphere reminiscent of Blasphemous but entirely original character, no copied design. Single full-body character idle combat pose facing LEFT three-quarter view, isolated on genuinely transparent background. No text, no floor, no scenery, no soft painting, clear silhouette, weathered bone, tarnished brass, ash-grey steel and dried crimson. Whole figure and weapon in frame with transparent padding. Subject:

- Elite: An undead monastery gatekeeper, hunched in corroded dark iron armor and a cage-like helmet, ragged dirty wax-grey tabard, carrying a massive battered execution poleaxe. Menacing, asymmetrical shoulder armor, restrained amber light in visor.
- Boss: The Sovereign of Ashes, tall skeletal ruined king wearing a broken golden crown, a large shredded dark crimson royal mantle, blackened ornate plate armor, holding a long jagged greatsword downward. Eerie bone-white face, imposing original regal silhouette, larger shoulder silhouette than the knight.

## Integração e balanceamento

Atributos permanecem em 40 pontos. A vida base aumentou de 60 para 75, levando o Guardião de 210 para 225 de vida inicial sem legado. Runs antigas recebem o ajuste uma única vez ao restaurar, usando `balanceVersion`. As descrições de atributos mencionam apenas efeitos sobre o personagem; fórmulas das habilidades continuam nos próprios cartões.

As cinco classes possuem combate implementado. A abertura usa uma tela de escolha de personagem em pedra fria e preto azulado; nela há um bestiário com os dez adversários. O combate apresenta o tipo e golpe característico de cada um e uma barra de intenção. Próximo passo visual: padronização de resolução lógica e animações quadro a quadro de ataque, impacto e morte.
