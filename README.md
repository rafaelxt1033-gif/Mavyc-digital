sequenceDiagram
    autonumber
    actor O as Operador/Gerente
    participant N as Navegador (PDV Mavyc)
    participant LS as Banco Local (LocalStorage)
    participant GH as GitHub API (Nuvem)

    Note over N,GH: FASE 1: Inicialização (Leitura Híbrida)
    N->>LS: Solicita dados em `estoque_mercado`
    LS-->>N: Retorna catálogo instantaneamente (Zero delay)
    N->>GH: Fetch `precos.json` (Requisição Assíncrona)
    GH-->>N: Retorna pacote de dados da nuvem
    N->>LS: Atualiza `estoque_mercado` local (se houver internet)

    Note over O,LS: FASE 2: Frente de Caixa (100% Offline)
    O->>N: Bipa código de barras / Pesa fração (Balança)
    N->>LS: Grava nova venda em `vendas_realizadas`
    LS-->>N: Confirmação de persistência local

    Note over O,GH: FASE 3 e 4: Painel ADM & Upload Silencioso
    O->>N: Atualiza preços no Painel Administrativo
    N->>LS: Atualiza `estoque_mercado` (Dispara Gatilho)
    N->>N: Sanitização UTF-8: btoa(unescape(encodeURIComponent()))
    N->>GH: HTTP PUT: forcarSincronizacaoNuvemSilenciosa() + Token
    GH-->>N: Substitui `precos.json` com sucesso (Backup Confirmado)

    Note over O,LS: FASE 5: Fechamento Diário
    O->>N: Clica em "Fechar Caixa do Dia"
    N->>O: Exibe métricas e Dashboard Administrativa
    N->>LS: Zera o array `vendas_realizadas`
    LS-->>N: Memória local liberada para o próximo turno
