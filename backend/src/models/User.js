// backend/src/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: [true, 'El nombre de usuario es requerido.'], 
        unique: true 
    },
    email: { 
        type: String, 
        required: [true, 'El correo es requerido.'], 
        unique: true,
        match: [/.+@.+\..+/, 'Por favor, ingrese un correo válido.']
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es requerida.'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    // timestamp agrega campos 'createdAt' y 'updatedAt' automáticamente
    timestamps: true 
});

// Middleware PRE-SAVE: Hashea la contraseña antes de guardarla
UserSchema.pre('save', async function(next) {
    // Solo hashea si el campo 'password' ha sido modificado (o es nuevo)
    if (!this.isModified('password')) {
        return next();
    }
    // Genera un 'salt' (valor aleatorio) y hashea la contraseña
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas (usado en la ruta de login)
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);