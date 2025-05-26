import React from 'react';
import Link from 'next/link';


const FoodailyDashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 gap-4 p-10">
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-2xl">Rockfeller Franchising Brasil</h1>
          <div className="flex items-center space-x-4">
            <span className="font-semibold">Today</span>
            <span className="text-gray-500">Oct 10, 2023</span>
            <Link href="/" className="flex items-center gap-2 bg-blue-700 text-white rounded px-4 py-2">
            Criar Chatbot
           </Link>
          </div>
        </header>
        <div className='mb-6'>
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Total Chatbots</h2>
              <p className="text-sm text-gray-500">5</p>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Mensagens enviadas hoje</h2>
              <p className="text-sm text-gray-500">15</p>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-xl shadow-sm">
              <h2 className="text-sm font-semibold">Modelo mais utilizado</h2>
              <p className="text-sm text-gray-500">Groq</p>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-xl shadow-sm flex items-center gap-4">
              <div>
                <h2 className="text-sm font-semibold">Tempo de resposta</h2>
                <p className="text-sm text-gray-500">2.81 s</p>
              </div>
            </div>
          </section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Métricas - EM BREVE</h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">Last 30 days</span>
                <button className="bg-gray-300 text-white rounded px-4 py-2">Exportar</button>
              </div>
            </div>
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KpiCard title="Tokens consumidos hoje" value="0.00" change="+0.0%" />
          <KpiCard title="Tokens consumidos total" value="0.00" change="-0.0%" />
          <KpiCard title="Tempo médio de resposta" value="0.00" change="0.0%" />
          <KpiCard title="Erros nas conversas" value="0.00" change="0.0%" />
        </section>

        {/* Sales Analytics */}
        <section className="grid grid-cols-1 md:grid-cols-2 bg-white rounded shadow p-6 mb-6 gap-4">
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <h2 className="text-xl font-semibold mb-4">EM BREVE - Gráfico de mensagens por dia</h2>
          </div>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <h2 className="text-xl font-semibold mb-4">EM BREVE - Consumo de tokens por hora/dia</h2>
          </div>
        </section>
            
      </main>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string; change: string }> = ({ title, value, change }) => (
  <div className="bg-blue-100 rounded shadow p-4">
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-green-700">{change}</p>
  </div>
);

export default FoodailyDashboard;
