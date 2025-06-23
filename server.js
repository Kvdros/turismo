// importar los frameworks necesarios para ejecutar la app
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

// crear una instancia de la aplicación web
const app = express();
const PORT = process.env.PORT || 3000; // USA EL PUERTO QUE ASIGNE RAILWAY O LOCAL 3000


// habilitar cors y body parser
app.use(cors());
app.use(bodyParser.json());

// servir archivos estáticos si es necesario
app.use(express.static('public'));

// conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/turismo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión a MongoDB exitosa'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Esquemas y modelos
const UsuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);

const GuiaSchema = new mongoose.Schema({
    nombre: String,
    especialidad: String
});
const Guia = mongoose.model('Guia', GuiaSchema);

const LugarSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String
});
const Lugar = mongoose.model('Lugar', LugarSchema);

const PaqueteSchema = new mongoose.Schema({
    nombre: String,
    incluye: String
});
const Paquete = mongoose.model('Paquete', PaqueteSchema);

const PrecioSchema = new mongoose.Schema({
    paquete: String,
    valor: Number
});
const Precio = mongoose.model('Precio', PrecioSchema);

// Rutas de autenticación
app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const nuevoUsuario = new Usuario({ nombre, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).send('Usuario registrado');
    } catch (err) {
        res.status(500).send('Error al registrar usuario');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(401).send('Usuario no encontrado');

        const valid = await bcrypt.compare(password, usuario.password);
        if (!valid) return res.status(401).send('Contraseña incorrecta');

        res.send('Bienvenido ' + usuario.nombre);
    } catch (err) {
        res.status(500).send('Error en el inicio de sesión');
    }
});

// --- CRUD para cada colección ---

// GUÍAS
app.get('/api/guias', async (req, res) => {
    const guias = await Guia.find();
    res.json(guias);
});
app.post('/api/guias', async (req, res) => {
    const nuevo = new Guia(req.body);
    await nuevo.save();
    res.status(201).send('Guía creada');
});
app.delete('/api/guias/:id', async (req, res) => {
    await Guia.findByIdAndDelete(req.params.id);
    res.send('Guía eliminada');
});

// LUGARES
app.get('/api/lugares', async (req, res) => {
    const lugares = await Lugar.find();
    res.json(lugares);
});
app.post('/api/lugares', async (req, res) => {
    const nuevo = new Lugar(req.body);
    await nuevo.save();
    res.status(201).send('Lugar creado');
});
app.delete('/api/lugares/:id', async (req, res) => {
    await Lugar.findByIdAndDelete(req.params.id);
    res.send('Lugar eliminado');
});

// PAQUETES
app.get('/api/paquetes', async (req, res) => {
    const paquetes = await Paquete.find();
    res.json(paquetes);
});
app.post('/api/paquetes', async (req, res) => {
    const nuevo = new Paquete(req.body);
    await nuevo.save();
    res.status(201).send('Paquete creado');
});
app.delete('/api/paquetes/:id', async (req, res) => {
    await Paquete.findByIdAndDelete(req.params.id);
    res.send('Paquete eliminado');
});

// PRECIOS
app.get('/api/precios', async (req, res) => {
    const precios = await Precio.find();
    res.json(precios);
});
app.post('/api/precios', async (req, res) => {
    const nuevo = new Precio(req.body);
    await nuevo.save();
    res.status(201).send('Precio creado');
});
app.delete('/api/precios/:id', async (req, res) => {
    await Precio.findByIdAndDelete(req.params.id);
    res.send('Precio eliminado');
});

// USUARIOS (solo lectura en este ejemplo)
app.get('/api/usuarios', async (req, res) => {
    const usuarios = await Usuario.find({}, { password: 0 }); // ocultar contraseña
    res.json(usuarios);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
