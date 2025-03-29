// Importando dependências
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

// Inicializando app e banco de dados
const app = express();
const db = new sqlite3.Database('./users.db');

// Configurando middlewares
app.use(cors());
app.use(bodyParser.json());

// Criando tabela de usuários
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});

// Rota para cadastrar usuário
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, 
            [name, email, hashedPassword], 
            (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao cadastrar usuário!' });
                }
                res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Erro interno!' });
    }
});

// Rota para listar usuários
app.get('/users', (req, res) => {
    db.all('SELECT id, name, email FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao buscar usuários!' });
        }
        res.json(rows);
    });
});

// Inicializando o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
