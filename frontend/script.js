document.addEventListener('DOMContentLoaded', function () {
    const nomeInput = document.getElementById('nome');
    const categoriaV = document.getElementById('categoria-v');
    const categoriaI = document.getElementById('categoria-i');
    const tipoSelect = document.getElementById('tipo');
    const baterPontoBtn = document.getElementById('baterPonto');
    const downloadBtn = document.getElementById('downloadBtn');
    const tabelaBody = document.getElementById('tabelaBody');

    let categoriaSelecionada = '';

    // Função para selecionar a categoria (V ou I)
    function selectCategoria(categoria) {
        categoriaSelecionada = categoria;
        categoriaV.classList.remove('selected');
        categoriaI.classList.remove('selected');

        if (categoria === 'V') categoriaV.classList.add('selected');
        if (categoria === 'I') categoriaI.classList.add('selected');
    }

    // Associa eventos de clique aos botões de categoria
    categoriaV.addEventListener('click', () => selectCategoria('V'));
    categoriaI.addEventListener('click', () => selectCategoria('I'));

    // Função para adicionar um novo ponto
    baterPontoBtn.addEventListener('click', () => {
        const nome = nomeInput.value.trim(); // Remove espaços extras
        const tipo = tipoSelect.value;
        const data = new Date().toLocaleDateString('pt-BR'); // Formata data no padrão 'DD/MM/AAAA'
        const hora = new Date().toLocaleTimeString('pt-BR'); // Formata hora no padrão 'HH:MM:SS'

        if (!nome || !categoriaSelecionada) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        // Cria o objeto de ponto para ser enviado
        const ponto = { nome, categoria: categoriaSelecionada, tipo, data, hora };

        // Envia os dados para o backend e trata a resposta
        fetch('http://localhost:3000/pontos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ponto),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao registrar ponto.');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message);
                carregarPontos(); // Atualiza a tabela após o registro
            })
            .catch(error => console.error('Erro ao registrar ponto:', error));
    });

    // Função para carregar pontos e atualizar a tabela
    function carregarPontos() {
        fetch('http://localhost:3000/pontos')
            .then(response => response.json())
            .then(pontos => {
                // Limpa a tabela antes de adicionar os dados atualizados
                tabelaBody.innerHTML = '';

                pontos.forEach(ponto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${ponto.data}</td>
                        <td>${ponto.nome}</td>
                        <td>${ponto.categoria}</td>
                        <td>${ponto.Entrada || ''}</td>
                        <td>${ponto.Café || ''}</td>
                        <td>${ponto['Retorno Café'] || ''}</td>
                        <td>${ponto.Almoço || ''}</td>
                        <td>${ponto['Retorno Almoço'] || ''}</td>
                        <td>${ponto.Saída || ''}</td>
                    `;
                    tabelaBody.appendChild(row);
                });
            })
            .catch(error => console.error('Erro ao carregar pontos:', error));
    }

    // Função para baixar a planilha dos pontos
    downloadBtn.addEventListener('click', () => {
        window.open('http://localhost:3000/exportar', '_blank');
    });

    // Carrega os pontos ao iniciar a página
    carregarPontos();
});
