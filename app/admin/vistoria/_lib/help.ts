/** Conteúdo de ajuda do módulo (textos didáticos, em linguagem simples). */
export interface StepHelp { title: string; goal: string; how: string[]; tip: string }

export const STEP_HELP: StepHelp[] = [
  {
    title: 'Dados do imóvel',
    goal: 'Identifique o imóvel e o tipo de vistoria.',
    how: [
      'Escolha o tipo: Entrada (início do contrato), Saída (devolução) ou Periódica.',
      'Digite o CEP: rua, bairro e cidade são preenchidos sozinhos.',
      'Anote a leitura dos medidores e as chaves entregues (abaixo, nesta mesma página).',
    ],
    tip: 'Para vistoria de saída, crie-a pela Biblioteca (“Criar saída”): os dados e as leituras da entrada já vêm prontos.',
  },
  {
    title: 'Partes envolvidas',
    goal: 'Diga quem são o locador, o locatário e quem fez a vistoria.',
    how: [
      'Preencha nome, CPF/CNPJ e telefone. O CPF/CNPJ é conferido na hora.',
      'Os campos “Vistoriadora” e “Solicitante” podem vir de Configurações.',
    ],
    tip: 'Não sabe um dado agora? Deixe em branco e volte depois — o laudo é salvo automaticamente.',
  },
  {
    title: 'Cômodos',
    goal: 'Liste os ambientes que serão vistoriados.',
    how: [
      'Use os atalhos (Sala, Quarto, Cozinha…) ou crie um nome próprio.',
      'Use nomes diferentes para cômodos parecidos: QUARTO 1, QUARTO 2.',
      'Inclua áreas externas, garagem e varanda se existirem.',
    ],
    tip: 'Quanto mais fiel a lista ao imóvel real, mais fácil comparar a saída com a entrada.',
  },
  {
    title: 'Inventário e problemas',
    goal: 'Registre o que existe em cada cômodo e o estado de conservação.',
    how: [
      'Marque os móveis e equipamentos presentes.',
      'Anote avarias (riscos, manchas, infiltrações) e o estado de piso, paredes, tomadas e janelas.',
      'Preferiu fotografar primeiro? Pule para “Fotos” e deixe a IA preencher; depois volte e confira.',
    ],
    tip: 'Seja objetivo e descreva só o que vê. Evite opinião: “mancha de umidade no teto, ~30 cm”.',
  },
  {
    title: 'Fotos',
    goal: 'Fotografe cada cômodo e deixe a IA descrever.',
    how: [
      'Toque em “Abrir câmera guiada”: ela avisa se falta luz, se está tremendo ou torto e mostra o que fotografar.',
      'Tire de 4 a 8 fotos por cômodo: visão geral, cantos, teto, piso e detalhes das avarias.',
      'A IA procura móveis, aparelhos (fogão, micro-ondas, cama…) e defeitos (riscos, trincas, descascados…). Tudo aparece numa tela de revisão: você marca o que vale e edita o texto antes de entrar no laudo.',
      'Toque numa foto para marcar um ponto com um comentário (ex.: “Rachadura na parede”).',
    ],
    tip: 'Boa luz e fotos sem tremer fazem a IA acertar mais. Se ela avisar “faltam fotos”, siga a dica.',
  },
  {
    title: 'Finalizar',
    goal: 'Revise, assine e gere o laudo.',
    how: [
      'Veja a Revisão de qualidade: ela mostra o que ainda falta e leva você até o ponto certo.',
      'Peça à IA para redigir as considerações finais, ou escreva/dite você mesmo.',
      'Colete as assinaturas na tela e toque em “Gerar laudo”. Depois imprima ou salve em PDF.',
    ],
    tip: 'Com avarias registradas, use “Estimar com IA” para ter uma faixa de custo de reparo (apenas referência).',
  },
];

export const FAQ: { q: string; a: string }[] = [
  { q: 'Preciso salvar manualmente?', a: 'Não. O laudo é salvo automaticamente neste aparelho a cada alteração. O botão “Salvar” só força o salvamento na hora.' },
  { q: 'Funciona sem internet?', a: 'Sim, para preencher, fotografar e salvar. A IA, a busca de CEP e a geração do PDF precisam de internet.' },
  { q: 'Onde ficam meus laudos?', a: 'Neste navegador (armazenamento local). Faça backup periodicamente em Biblioteca → Exportar, principalmente antes de limpar dados do navegador ou trocar de aparelho.' },
  { q: 'A câmera guiada não abre. E agora?', a: 'Ela precisa de permissão de câmera e de conexão segura (https). Se for negada, libere nas configurações do navegador ou use “Escolher da galeria”.' },
  { q: 'A IA grava coisas no laudo sozinha?', a: 'Não. Itens e avarias detectados ficam como sugestões: você aceita, edita o texto ou descarta. Só o que for aceito entra no laudo. Itens com confiança média vêm desmarcados e com “Possível …”.' },
  { q: 'A IA pode errar?', a: 'Pode. Ela é uma ajuda para ganhar tempo: confira sempre o que ela sugeriu antes de gerar o laudo. Você manda no resultado final.' },
  { q: 'Como faço a vistoria de saída?', a: 'Na Biblioteca, abra o menu do laudo de entrada e escolha “Criar saída”. Depois use “Entrada x Saída” para ver o que mudou, inclusive com análise da IA.' },
  { q: 'Como gero o PDF?', a: 'No último passo, toque em “Gerar laudo” e depois em “Abrir para imprimir”. No navegador, escolha “Salvar como PDF”.' },
  { q: 'A IA não funciona. O que fazer?', a: 'Abra Configurações → Inteligência artificial e use “Testar conexão”. É preciso ter a chave configurada no servidor ou informar a sua.' },
];

export const GLOSSARY: { term: string; meaning: string }[] = [
  { term: 'Vistoria de entrada', meaning: 'Registro do estado do imóvel quando o inquilino recebe as chaves.' },
  { term: 'Vistoria de saída', meaning: 'Registro na devolução, para comparar com a entrada.' },
  { term: 'Locador / locadora', meaning: 'Quem aluga o imóvel (proprietário).' },
  { term: 'Locatário', meaning: 'Quem aluga o imóvel (inquilino).' },
  { term: 'Avaria', meaning: 'Qualquer dano ou defeito: risco, mancha, quebra, infiltração.' },
  { term: 'Desgaste normal', meaning: 'Efeito do uso comum e do tempo, sem dano causado.' },
  { term: 'Contestação', meaning: 'Prazo para as partes discordarem de algum item do laudo.' },
];
