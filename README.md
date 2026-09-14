# Site Oficial do DK — Death Knights

Site completo do DK em Belo Horizonte, desenvolvido com Next.js, TypeScript e Supabase.

## Funcionalidades

### Área pública

- Página Inicial estável com calendário dinâmico
- Sobre o DK e Como Participar
- Swordplay/Boffering
- Tipos de Atividades
- Jogos em cards expansíveis
- Graduações
- Mídias em linha do tempo
- Publicações individuais com galerias
- Eventos internos, externos, geek e aniversários
- Rodapé centralizado com Instagram, WhatsApp e YouTube
- Layout responsivo

### Área do membro

- Login seguro
- Cadastro somente por convite
- Aprovação administrativa
- Nome, apelido, patente, ordem, casa, camisa e builds
- Identificação automática do signo pela data de nascimento
- Painel interno e perfil do membro

### CMS

- ADM Principal: acesso completo
- ADM de Mídias: publicações
- ADM de Atividades: calendário
- ADM de Membros: cadastros, convites e exclusão
- Controle por Row Level Security no banco

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Supabase Auth e PostgreSQL
- CSS responsivo
- Lucide Icons

## Executar

    npm install
    cp .env.example .env.local
    npm run dev

O site público funciona inicialmente com dados demonstrativos. Para ativar login e CMS, siga docs/SETUP.md.

## Estrutura

    app/                  páginas e rotas
    components/           componentes públicos, autenticação e CMS
    lib/                  conteúdo, tipos e clientes Supabase
    public/               favicon e futuros arquivos públicos
    supabase/             banco, políticas e dados iniciais
    docs/SETUP.md         instalação detalhada

## Segurança

- Cadastro somente com convite válido.
- Cadastros começam com status pendente.
- Aprovação obrigatória para acesso.
- Permissões administrativas verificadas no servidor e no banco.
- Service role utilizada somente em rotas de servidor.

## Links do DK

- Instagram: https://www.instagram.com/dkbhmg/
- WhatsApp: https://chat.whatsapp.com/FEH19lTq3LIJDWBzBDkE7J
