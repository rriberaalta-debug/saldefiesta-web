
import React, { useState } from 'react';
import { X, Search, Loader2, Info } from 'lucide-react';
import { FiestaEvent } from '../types';
import { findFiestasWithAI } from '../services/geminiService';

interface FiestaFinderProps {
  onClose: () => void;
}

const FiestaCard: React.FC<{ fiesta: FiestaEvent }> = ({ fiesta }) => {
  const getTagColor = (type: FiestaEvent['type']) => {
    switch (type) {
      case 'Fiesta Patronal': return 'bg-blue-500/20 text-blue-300';
      case 'Feria Cultural': return 'bg-purple-500/20 text-purple-300';
      case 'Festival de Música': return 'bg-pink-500/20 text-pink-300';
      case 'Carnaval': return 'bg-yellow-500/20 text-yellow-300';
      case 'Tradición Histórica': return 'bg-green-500/20 text-green-300';
      case 'Evento Gastronómico': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-white">{fiesta.name}</h3>
          <p className="text-sm text-sky-300 font-semibold">{fiesta.city}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTagColor(fiesta.type)}`}>{fiesta.type}</span>
      </div>
      <p className="text-sm font-medium text-gray-300 mt-2">{fiesta.dates}</p>
      <p className="text-sm text-gray-400 mt-2">{fiesta.description}</p>
    </div>
  );
};

const FiestaFinder: React.FC<FiestaFinderProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FiestaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const fiestas = await findFiestasWithAI(query);
      setResults(fiestas);
    } catch (err) {
      setError('Ha ocurrido un error al buscar. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Buscador de Fiestas y Eventos</h2>
        <p className="text-center text-gray-400 text-sm mb-6">Busca por ciudad, tipo de fiesta o mes. Ej: "Carnavales en Andalucía", "Fiestas en pueblos de Asturias en agosto".</p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe tu búsqueda aquí..."
            className="w-full bg-white/10 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-festive-orange"
            autoFocus
          />
          <button type="submit" disabled={isLoading} className="bg-festive-orange font-bold py-3 px-5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center">
            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>
        </form>

        <div className="overflow-y-auto pr-2 flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="animate-spin text-festive-orange mb-4" size={48} />
              <p className="text-lg font-semibold">Buscando con IA...</p>
              <p className="text-sm text-gray-400">Esto puede tardar unos segundos.</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 p-8">
              <p>{error}</p>
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Info className="text-sky-400 mb-4" size={48} />
                <p className="text-lg font-semibold">No se encontraron resultados</p>
                <p className="text-sm text-gray-400">Prueba con otra búsqueda más específica.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((fiesta, index) => (
                <FiestaCard key={index} fiesta={fiesta} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FiestaFinder;
