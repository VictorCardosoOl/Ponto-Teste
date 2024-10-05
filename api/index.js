const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Caminho do arquivo pontos.json (certifique-se de que o arquivo pontos.json exista)
const dataFilePath = path.join(__dirname, 'pontos.json');

// Middleware para permitir requisições CORS e parseamento de JSON
app.use(cors());
app.use(express.json());

// Função para carregar os pontos do arquivo pontos.json
function loadPontos() {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath, 'utf8'); // Adicionado 'utf8' para ler corretamente
        return JSON.parse(rawData);
    } else {
        return [];
    }
}

// Função para salvar os pontos no arquivo pontos.json
function savePontos(pontos) {
    fs.writeFileSync(dataFilePath, JSON.stringify(pontos, null, 2), 'utf8'); // Adicionado 'utf8' para salvar corretamente
}

// Rota para obter todos os pontos
app.get('/pontos', (req, res) => {
    const pontos = loadPontos();
    res.json(pontos);
});

// Rota para registrar um novo ponto
app.post('/pontos', (req, res) => {
    const { nome, categoria, tipo, data, hora } = req.body;

    // Verificar se todos os campos obrigatórios estão presentes
    if (!nome || !categoria || !tipo || !data || !hora) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const pontos = loadPontos();

    // Procurar se já existe uma entrada para o mesmo dia e nome
    const pontoExistente = pontos.find(ponto => ponto.nome === nome && ponto.data === data);
    if (pontoExistente) {
        // Atualizar a marcação do dia existente (p.ex., Entrada, Café, etc.)
        pontoExistente[tipo] = hora;
    } else {
        // Criar uma nova linha para a marcação
        const novoPonto = { data, nome, categoria, [tipo]: hora };
        pontos.push(novoPonto);
    }

    savePontos(pontos);
    res.status(201).json({ message: 'Ponto registrado com sucesso' });
});

// Rota para exportar pontos como planilha Excel
app.get('/exportar', (req, res) => {
    const pontos = loadPontos();
    const XLSX = require('xlsx');

    // Criar uma nova planilha
    const ws = XLSX.utils.json_to_sheet(pontos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pontos');

    // Gerar buffer e enviar como resposta
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Definir o cabeçalho para download do arquivo
    res.setHeader('Content-Disposition', 'attachment; filename="controle_pontos.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Enviar o buffer para download
    res.send(excelBuffer);
});

// Rota para servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, 'frontend'))); // Certifique-se de que 'frontend' está no mesmo diretório do servidor

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
