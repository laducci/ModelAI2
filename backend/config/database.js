const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10, // Máximo de conexões simultâneas
            serverSelectionTimeoutMS: 5000, // Timeout para seleção do servidor
            socketTimeoutMS: 45000, // Timeout do socket
            family: 4, // Use IPv4, evitar problemas de DNS
            bufferCommands: false // Não usar buffer de comandos
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/modelai', mongoOptions);

        console.log(`🍃 MongoDB conectado: ${conn.connection.host}`);
        
        // Event listeners para conexão
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro na conexão MongoDB:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('🔌 MongoDB desconectado');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔒 Conexão MongoDB fechada devido ao encerramento da aplicação');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
