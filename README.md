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
- Separação entre Membro e Oficial
- Patentes padronizadas de Recruta a General de Exército
- Graduações Bronze, Prata e Ouro com acesso progressivo
- Documentos e PDFs privados conforme o nível de acesso
- Confirmação de presença em atividades, convidados e observações
- Lista formatada para compartilhamento no WhatsApp
- Nome, apelido, patente, ordem, casa, camisa e builds
- Identificação automática do signo pela data de nascimento
- Painel interno e perfil do membro

### CMS

- ADM Principal: acesso completo
- ADM de Mídias: publicações
- ADM de Atividades: calendário
- ADM de Membros: cadastros, convites e exclusão
- ADM Principal: documentos privados e atribuição dos quatro papéis de ADM
- Controle por Row Level Security no banco

## Tecnologias

- Next.js 16
- React 19
- TypeScript
- Supabase Auth e PostgreSQL
- CSS responsivo
- Lucide Icons

## Executar

    npm.cmd install
    Copy-Item .env.example .env.local
    npm.cmd run dev

O site público funciona inicialmente com dados demonstrativos. Para ativar login e CMS, siga docs/SETUP.md.

Depois da configuração, valide as permissões seguindo `docs/TESTES-ACESSO.md`.

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
- Chave secreta utilizada somente em rotas de servidor.
- PDFs armazenados em bucket privado e liberados por links temporários.
- Acesso a documentos verificado também no banco por Row Level Security.

## Links do DK

- Instagram: https://www.instagram.com/dkbhmg/
- WhatsApp: https://chat.whatsapp.com/FEH19lTq3LIJDWBzBDkE7J
