import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import GroundedSearch from './components/GroundedSearch';
import LiveChat from './components/LiveChat';
import LocationModal from './components/LocationModal';
import Logo from './components/Logo';
import KpiCard from './components/KpiCard';
import RevenueByProfessionalChart from './components/RevenueByProfessionalChart';
import TopProceduresChart from './components/TopProceduresChart';
import AdminPanel from './components/AdminPanel';
import ProgressCircle from './components/ProgressCircle';
import HistoryChart from './components/HistoryChart';
import AdminLoginModal from './components/AdminLoginModal';
import type { ProcedureData, HistoryData } from './types';
import { loadUnitData, updateTarget as saveTarget, updateCurrentAmount } from './services/dataService';

interface KpiData {
  faturamentoTotal: number;
  ticketMedio: number;
}

interface ChartRow {
  name: string;
  faturamento: number;
}

const App: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [target, setTarget] = useState<number>(6000000);
  const [currentAmount, setCurrentAmount] = useState<number>(0);
  const [history, setHistory] = useState<HistoryData[]>([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [revenueByProfessional, setRevenueByProfessional] = useState<ChartRow[]>([]);
  const [topProcedures, setTopProcedures] = useState<ChartRow[]>([]);

  // Load data from Firestore when unit changes
  useEffect(() => {
    if (selectedUnit) {
      loadUnitData(selectedUnit).then(data => {
        if (data) {
          setTarget(data.target || 6000000);
          setCurrentAmount(data.currentAmount || 0);
          setHistory(data.history || []);

          if (data.currentAmount > 0) {
            setKpis({ faturamentoTotal: data.currentAmount, ticketMedio: 0 });
          } else {
            setKpis(null);
          }
        } else {
          // Valores padrão se não houver dados salvos
          setTarget(6000000);
          setCurrentAmount(0);
          setHistory([]);
          setKpis(null);
        }
        setRevenueByProfessional([]);
        setTopProcedures([]);
        setError(null);
      }).catch(error => {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados salvos. Usando valores padrão.');
        setTarget(6000000);
        setCurrentAmount(0);
        setHistory([]);
        setKpis(null);
      });
    }
  }, [selectedUnit]);
  
  const handleAdminLogin = (code: string) => {
    if (code === 'nortradio123') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setLoginError(null);
    } else {
      setLoginError('Código incorreto. Por favor, tente novamente.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSetTarget = async (newTarget: number) => {
    if (!selectedUnit) return;
    setTarget(newTarget);
    try {
      await saveTarget(selectedUnit, newTarget);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      setError('Erro ao salvar a meta. Por favor, tente novamente.');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!selectedUnit) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        range: 2,
      });

      if (jsonData.length < 2) {
        throw new Error("O arquivo parece estar vazio ou não contém dados suficientes.");
      }
      
      const headers: string[] = jsonData[0].map(h => String(h).trim());
      const rows = jsonData.slice(1);

      let mappedData = rows.map(row => {
          const obj: { [key: string]: any } = {};
          headers.forEach((header, index) => {
              if(header) obj[header] = row[index];
          });
          return obj;
      });

      mappedData = mappedData.map(row => ({
          ...row,
          'Preço': typeof row['Preço'] === 'string' 
              ? parseFloat(row['Preço'].replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
              : typeof row['Preço'] === 'number' ? row['Preço'] : 0
      })).filter(row => row['Preço'] && !isNaN(row['Preço']));

      const cleanedData = mappedData.filter(
        (row: any) => row['Responsável tecnico'] && String(row['Responsável tecnico']).toLowerCase().trim() !== 'total'
      ) as ProcedureData[];

      const faturamentoDoArquivo = cleanedData.reduce((sum, row) => sum + row['Preço'], 0);
      if(faturamentoDoArquivo === 0) {
        throw new Error("Nenhum faturamento válido encontrado no arquivo.");
      }
      const totalProcedimentosDoArquivo = cleanedData.length;
      const ticketMedioDoArquivo = totalProcedimentosDoArquivo > 0 ? faturamentoDoArquivo / totalProcedimentosDoArquivo : 0;
      
      const newCurrentAmount = currentAmount + faturamentoDoArquivo;
      setCurrentAmount(newCurrentAmount);

      const month = new Date().toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace(' de ','/');
      const newHistory = [...history, { month, amount: newCurrentAmount }];
      setHistory(newHistory);

      try {
        await updateCurrentAmount(selectedUnit, newCurrentAmount, newHistory);
      } catch (err) {
        console.error('Erro ao salvar dados no Firestore:', err);
        // Os dados já estão salvos no localStorage como fallback
      }

      setKpis({ faturamentoTotal: newCurrentAmount, ticketMedio: ticketMedioDoArquivo });
      
      const revenueByPro = cleanedData.reduce((acc, row) => {
        const name = row['Responsável tecnico'];
        if(name) acc[name] = (acc[name] || 0) + row['Preço'];
        return acc;
      }, {} as { [key: string]: number });

      setRevenueByProfessional(Object.entries(revenueByPro)
        .map(([name, faturamento]) => ({ name, faturamento }))
        .sort((a, b) => b.faturamento - a.faturamento));

      const revenueByProc = cleanedData.reduce((acc, row) => {
        const name = row['Procedimento'];
        if(name) acc[name] = (acc[name] || 0) + row['Preço'];
        return acc;
      }, {} as { [key: string]: number });

      setTopProcedures(Object.entries(revenueByProc)
          .map(([name, faturamento]) => ({ name, faturamento }))
          .sort((a, b) => b.faturamento - a.faturamento)
          .slice(0, 10));

    } catch (e: any) {
      setError(e.message || "Ocorreu um erro ao processar o arquivo.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedUnit, currentAmount, history]);
  
  const handleSelectUnit = (unit: string) => {
    setSelectedUnit(unit);
  };

  const handleGoBack = () => {
    setSelectedUnit(null);
  };

  if (!selectedUnit) {
    return <LocationModal onSelectUnit={handleSelectUnit} />;
  }

  const hasData = currentAmount > 0;

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={handleGoBack} className="text-brand-yellow hover:text-amber-500 transition-colors" aria-label="Voltar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v0a5 5 0 01-5 5H6" />
              </svg>
            </button>
            <div>
              <div className='w-48 mb-2'>
                <Logo />
              </div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">Portal de Acompanhamento</h1>
              <p className="text-text-secondary mt-1">Unidade: <span className="font-semibold text-brand-yellow">{selectedUnit}</span></p>
            </div>
          </div>
          <button 
            onClick={() => { setShowAdminLogin(true); setLoginError(null); }} 
            className="text-text-secondary hover:text-brand-yellow transition-colors p-2 rounded-full hover:bg-base-200" 
            aria-label="Acesso Administrativo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {!hasData ? (
               <div className="text-center py-16 px-6 bg-base-200 rounded-lg h-full flex flex-col justify-center items-center">
                  <h2 className="text-2xl font-bold text-text-primary mb-4">Bem-vindo ao Portal de Acompanhamento</h2>
                  {isAdmin ? (
                    <p className="text-text-secondary mb-8 max-w-lg mx-auto">Para começar, defina uma meta financeira e carregue seu primeiro relatório no <span className="font-semibold text-brand-yellow">Painel Administrativo</span> à direita.</p>
                  ) : (
                    <p className="text-text-secondary mb-8 max-w-lg mx-auto">Aguardando o carregamento dos dados. Volte em breve para ver o progresso da unidade.</p>
                  )}
               </div>
            ) : (
              <>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-base-200 p-6 rounded-lg">
                  <ProgressCircle current={currentAmount} target={target} />
                  <div className="space-y-6">
                    {kpis && (
                      <>
                        <KpiCard 
                           title="Faturamento Total Acumulado" 
                           value={formatCurrency(kpis.faturamentoTotal)}
                           icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                         />
                         <KpiCard 
                           title="Ticket Médio (Último Relatório)" 
                           value={kpis.ticketMedio > 0 ? formatCurrency(kpis.ticketMedio) : '-'}
                           icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                         />
                      </>
                    )}
                  </div>
                </section>
                
                <HistoryChart data={history} />
                
                {revenueByProfessional.length > 0 && <RevenueByProfessionalChart data={revenueByProfessional} />}
                {topProcedures.length > 0 && <TopProceduresChart data={topProcedures} />}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {isAdmin && (
              <AdminPanel 
                onFileUpload={handleFileUpload} 
                isLoading={isProcessing}
                error={error}
                currentTarget={target}
                onSetTarget={handleSetTarget}
              />
            )}
            <GroundedSearch />
            <LiveChat />
          </aside>
        </main>
      </div>
      <AdminLoginModal 
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onLogin={handleAdminLogin}
        error={loginError}
      />
    </div>
  );
};

export default App;