const mongoose = require('mongoose');

const empreendimentoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  incorporadora: {
    type: String,
    required: true,
    trim: true
  },
  tabelaVendas: {
    valorImovel: { type: Number, default: 0 },
    entradaValor: { type: Number, default: 0 },
    entradaPercent: { type: Number, default: 0 },
    entradaParcelas: { type: Number, default: 1 },
    parcelasValor: { type: Number, default: 0 },
    parcelasPercent: { type: Number, default: 0 },
    parcelasQtd: { type: Number, default: 1 },
    reforcoValor: { type: Number, default: 0 },
    reforcoPercent: { type: Number, default: 0 },
    reforcoQtd: { type: Number, default: 1 },
    reforcoFrequencia: { type: Number, default: 6 },
    nasChavesValor: { type: Number, default: 0 },
    nasChavesPercent: { type: Number, default: 0 },
    nasChavesMes: { type: Number, default: 24 },
    nasChavesDesagio: { type: Number, default: 0 }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
empreendimentoSchema.index({ user: 1 });
empreendimentoSchema.index({ nome: 1, user: 1 });

module.exports = mongoose.model('Empreendimento', empreendimentoSchema);
