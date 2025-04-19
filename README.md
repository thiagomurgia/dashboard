# Dashboard de Análise de Tickets de Suporte - Documentação

## Visão Geral

Este dashboard interativo em React permite analisar o desempenho da equipe de suporte técnico, fornecendo KPIs essenciais, gráficos detalhados e insights para tomada de decisão.

## Funcionalidades

- **Upload de planilhas** para atualização dinâmica dos dados
- **KPIs essenciais** para gestão da equipe de suporte
- **Gráficos interativos** gerais e por analista
- **Filtro de período** para selecionar o intervalo de análise
- **Personalização de cores** dos gráficos
- **Cálculo de custo por chamado** baseado nos salários dos analistas
- **Análise de adequação dos níveis de suporte** (N1, N2 e N3)
- **Projeção de necessidade de analistas** baseada no crescimento estimado
- **Insights dinâmicos** sobre o desempenho da equipe

## Instalação

### Requisitos

- Node.js 14.0 ou superior
- Servidor web para hospedar os arquivos estáticos

### Opção 1: Instalação a partir do código-fonte

1. Descompacte o arquivo ZIP em uma pasta de sua escolha
2. Instale as dependências:

```bash
cd dashboard
pnpm install
```

3. Execute o servidor de desenvolvimento:

```bash
pnpm run dev
```

4. Acesse o dashboard em seu navegador através do endereço: http://localhost:5173

### Opção 2: Hospedagem dos arquivos de build

1. Descompacte o arquivo ZIP em uma pasta de sua escolha
2. Copie o conteúdo da pasta `dist` para o diretório raiz do seu servidor web
3. Configure seu servidor web para servir o arquivo `index.html` para todas as rotas

## Guia de Uso

### Upload de Planilhas

1. Na seção "Upload de Planilhas", clique na área demarcada ou arraste um arquivo Excel/CSV
2. O dashboard processará automaticamente os dados e atualizará todos os gráficos e KPIs
3. O formato do arquivo deve conter as colunas essenciais:
   - Created (data de criação)
   - Resolved (data de resolução)
   - Assignee (analista responsável)
   - Status (situação do ticket)

### Filtros e Configurações

- **Período de Análise**: Selecione o intervalo de datas para análise dos tickets
- **Esquema de Cores**: Personalize as cores dos gráficos conforme sua preferência
- **Salários dos Analistas**: Configure os salários por nível para cálculo de custo por ticket
- **Projeção de Crescimento**: Defina a porcentagem estimada de crescimento para projeções futuras

### Cálculo de Custo por Ticket

O dashboard calcula automaticamente o custo por ticket resolvido com base nos salários configurados:

1. O custo é calculado dividindo o salário mensal do analista pela quantidade de tickets resolvidos
2. Os valores são atualizados automaticamente quando você altera os salários
3. O sistema valida os valores inseridos e exibe mensagens de erro quando necessário

### Projeção de Necessidade de Analistas

A projeção é calculada automaticamente com base no crescimento estimado:

1. O sistema analisa o volume atual de tickets por nível de suporte
2. Aplica o percentual de crescimento configurado
3. Calcula quantos analistas serão necessários para manter a operação saudável
4. Exibe quantos analistas adicionais serão necessários por nível

### Insights e Recomendações

O dashboard gera automaticamente insights baseados nos dados:

1. Identifica o analista mais eficiente
2. Detecta níveis de suporte sobrecarregados
3. Analisa o melhor custo-benefício entre os níveis
4. Fornece recomendações personalizadas para melhorar a operação

## Níveis de Suporte

O dashboard reconhece automaticamente os seguintes níveis de suporte:

- **Nível 1**: Matheus Paleari, Vitor Pereira
- **Nível 2**: Laura Almeida, Valdinei Costa, Luiz Magalhães
- **Nível 3**: Agatha Anunciação

## Solução de Problemas

- **Erro ao carregar planilha**: Verifique se o formato do arquivo é compatível (Excel ou CSV) e contém as colunas necessárias
- **Campos de salário em branco**: O sistema tratará automaticamente campos vazios, mas é recomendável inserir valores válidos
- **Gráficos não atualizam**: Certifique-se de que o período selecionado contém dados

## Tecnologias Utilizadas

- React para interface de usuário
- Recharts para visualização de dados
- Tailwind CSS para estilização
- Context API para gerenciamento de estado
- XLSX para processamento de planilhas
