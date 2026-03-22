/**
 * Componente Stats - Estadísticas de la lista
 * Muestra: total de items, comprados, presupuesto y progreso
 */

interface StatsProps {
  stats: {
    total: number;
    purchased: number;
    totalBudget: number;
    purchasedBudget: number;
    progress: number;
  };
}

/**
 * Formatea un número como moneda mexicana
 */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-MX")}`;
}

export function Stats({ stats }: StatsProps) {
  return (
    <>
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="text-slate-400 text-xs sm:text-sm mb-1 uppercase tracking-wider">Total</div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="text-slate-400 text-xs sm:text-sm mb-1 uppercase tracking-wider">Comprados</div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{stats.purchased}</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="text-slate-400 text-xs sm:text-sm mb-1 uppercase tracking-wider">Presupuesto</div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">{formatCurrency(stats.totalBudget)}</div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="text-slate-400 text-xs sm:text-sm mb-1 uppercase tracking-wider">Gastado</div>
          <div className="text-xl sm:text-2xl font-bold text-violet-400">{formatCurrency(stats.purchasedBudget)}</div>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 sm:p-5 mb-8 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
          <span className="text-white font-bold text-sm">{stats.progress}%</span>
        </div>
      </div>
    </>
  );
}
