const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: [true, 'El nombre de usuario es requerido.'], unique: true },
    email: { type: String, required: [true, 'El correo es requerido.'], unique: true },
    password: { 
        type: String, 
        required: [true, 'La contraseña es requerida.'],
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres.'] // <-- VALIDACIÓN AGREGADA
    },
    createdAt: { type: Date, default: Date.now }
});

// Middleware PRE-SAVE: Hashea la contraseña antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas (usado en la ruta de login)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);