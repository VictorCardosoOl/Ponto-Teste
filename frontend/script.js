document.addEventListener('DOMContentLoaded', function () {
    const nomeInput = document.getElementById('nome');
    const tipoSelect = document.getElementById('tipo');
    const baterPontoBtn = document.getElementById('baterPonto');
    const downloadBtn = document.getElementById('downloadBtn');
    const tabelaBody = document.getElementById('tabelaBody');
    const paginationDiv = document.getElementById('pagination');

    let pontosSalvos = [];
    let pontosFiltrados = [];
    let paginaAtual = 1;
    const pontosPorPagina = 5;

    baterPontoBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const nome = nomeInput.value.trim();
        const tipo = tipoSelect.value;
        const data = new Date().toLocaleDateString('pt-BR');
        const hora = new Date().toLocaleTimeString('pt-BR');
        const categoria = document.querySelector('input[name="categoria"]:checked')?.value;

        if (!nome || !categoria) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const ponto = { nome, categoria, tipo, data, hora };

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
            carregarPontos(); 
        })
        .catch(error => console.error('Erro ao registrar ponto:', error));
    });

    function carregarPontos() {
        fetch('http://localhost:3000/pontos')
            .then(response => response.json())
            .then(pontos => {
                pontosSalvos = pontos;
                aplicarFiltros(); 
            })
            .catch(error => console.error('Erro ao carregar pontos:', error));
    }

    function atualizarTabela() {
        tabelaBody.innerHTML = '';
        const startIndex = (paginaAtual - 1) * pontosPorPagina;
        const endIndex = startIndex + pontosPorPagina;

        pontosFiltrados.slice(startIndex, endIndex).forEach(ponto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ponto.data}</td>
                <td>${ponto.nome}</td>
                <td>${ponto.categoria}</td>
                <td>${ponto.Entrada || ''}</td>
                <td>${ponto['Café 1'] || ''}</td>
                <td>${ponto['Retorno Café 1'] || ''}</td>
                <td>${ponto.Almoço || ''}</td>
                <td>${ponto['Retorno Almoço'] || ''}</td>
                <td>${ponto['Café 2'] || ''}</td>
                <td>${ponto['Retorno Café 2'] || ''}</td>
                <td>${ponto.Saída || ''}</td>
                <td>
                    <button onclick="editarPonto(${JSON.stringify(ponto)}, this.closest('tr'))">Editar</button>
                </td>
            `;
            tabelaBody.appendChild(row);
        });

        atualizarPaginas();
    }

    function aplicarFiltros() {
        const nomeFiltro = document.getElementById('filtroNome').value.toLowerCase();
        const mesFiltro = document.getElementById('mesFiltro').value;
        const tipoPontoFiltro = document.getElementById('tipoPontoFiltro').value;
        const tipoColaboradorFiltro = document.getElementById('tipoColaboradorFiltro').value;

        pontosFiltrados = pontosSalvos.filter(ponto => {
            const nomeMatch = ponto.nome.toLowerCase().includes(nomeFiltro);
            const mesMatch = mesFiltro ? new Date(ponto.data).getMonth() == mesFiltro : true;
            const tipoMatch = tipoPontoFiltro ? ponto.tipo === tipoPontoFiltro : true;
            const colaboradorMatch = tipoColaboradorFiltro ? ponto.categoria === tipoColaboradorFiltro : true;

            return nomeMatch && mesMatch && tipoMatch && colaboradorMatch;
        });

        pontosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data)); // Ordena por data decrescente
        atualizarTabela();
    }

    window.editarPonto = function(ponto, row) {
        const novoValor = prompt("Insira o novo valor para " + ponto.tipo + ":");
        if (novoValor) {
            ponto[ponto.tipo] = novoValor;
            fetch(`http://localhost:3000/pontos/${ponto.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ponto),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao editar ponto.');
                }
                return response.json();
            })
            .then(data => {
                carregarPontos(); 
            })
            .catch(error => console.error('Erro ao editar ponto:', error));
        }
    };

    document.getElementById('filtroNome').addEventListener('input', aplicarFiltros);
    document.getElementById('mesFiltro').addEventListener('change', aplicarFiltros);
    document.getElementById('tipoPontoFiltro').addEventListener('change', aplicarFiltros);
    document.getElementById('tipoColaboradorFiltro').addEventListener('change', aplicarFiltros);

    function atualizarPaginas() {
        const totalPaginas = Math.ceil(pontosFiltrados.length / pontosPorPagina);
        paginationDiv.innerHTML = '';

        for (let i = 1; i <= totalPaginas; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.addEventListener('click', () => {
                paginaAtual = i;
                atualizarTabela();
            });
            paginationDiv.appendChild(pageButton);
        }
    }

    carregarPontos();
});
