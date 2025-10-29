import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { HistoryData } from '../types';

export interface UnitData {
  selectedUnit: string;
  target: number;
  currentAmount: number;
  history: HistoryData[];
  lastUpdated: string;
}

/**
 * Salva os dados de uma unidade no Firestore
 */
export const saveUnitData = async (
  unitName: string,
  data: Partial<UnitData>
): Promise<void> => {
  try {
    const unitRef = doc(db, 'units', unitName);
    const dataToSave = {
      ...data,
      selectedUnit: unitName,
      lastUpdated: new Date().toISOString()
    };

    await setDoc(unitRef, dataToSave, { merge: true });
    console.log('Dados salvos com sucesso no Firestore:', unitName);

    // Mantém backup no localStorage
    localStorage.setItem(`financialTarget_${unitName}`, JSON.stringify(data.target || 0));
    localStorage.setItem(`currentAmount_${unitName}`, JSON.stringify(data.currentAmount || 0));
    localStorage.setItem(`financialHistory_${unitName}`, JSON.stringify(data.history || []));
  } catch (error) {
    console.error('Erro ao salvar dados no Firestore:', error);
    // Fallback: salva apenas no localStorage se houver erro
    if (data.target !== undefined) {
      localStorage.setItem(`financialTarget_${unitName}`, JSON.stringify(data.target));
    }
    if (data.currentAmount !== undefined) {
      localStorage.setItem(`currentAmount_${unitName}`, JSON.stringify(data.currentAmount));
    }
    if (data.history !== undefined) {
      localStorage.setItem(`financialHistory_${unitName}`, JSON.stringify(data.history));
    }
    throw error;
  }
};

/**
 * Recupera os dados de uma unidade do Firestore
 */
export const loadUnitData = async (unitName: string): Promise<UnitData | null> => {
  try {
    const unitRef = doc(db, 'units', unitName);
    const docSnap = await getDoc(unitRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as UnitData;
      console.log('Dados carregados do Firestore:', unitName);

      // Atualiza o localStorage com os dados do Firestore
      localStorage.setItem(`financialTarget_${unitName}`, JSON.stringify(data.target || 0));
      localStorage.setItem(`currentAmount_${unitName}`, JSON.stringify(data.currentAmount || 0));
      localStorage.setItem(`financialHistory_${unitName}`, JSON.stringify(data.history || []));

      return data;
    } else {
      console.log('Nenhum dado encontrado no Firestore, tentando localStorage:', unitName);
      // Fallback: tenta carregar do localStorage
      return loadFromLocalStorage(unitName);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do Firestore:', error);
    // Fallback: carrega do localStorage se houver erro
    return loadFromLocalStorage(unitName);
  }
};

/**
 * Carrega dados do localStorage (fallback)
 */
const loadFromLocalStorage = (unitName: string): UnitData | null => {
  const savedTarget = localStorage.getItem(`financialTarget_${unitName}`);
  const savedAmount = localStorage.getItem(`currentAmount_${unitName}`);
  const savedHistory = localStorage.getItem(`financialHistory_${unitName}`);

  if (savedTarget || savedAmount || savedHistory) {
    return {
      selectedUnit: unitName,
      target: savedTarget ? JSON.parse(savedTarget) : 6000000,
      currentAmount: savedAmount ? JSON.parse(savedAmount) : 0,
      history: savedHistory ? JSON.parse(savedHistory) : [],
      lastUpdated: new Date().toISOString()
    };
  }

  return null;
};

/**
 * Atualiza apenas a meta de uma unidade
 */
export const updateTarget = async (unitName: string, newTarget: number): Promise<void> => {
  await saveUnitData(unitName, { target: newTarget });
};

/**
 * Atualiza o valor atual e histórico de uma unidade
 */
export const updateCurrentAmount = async (
  unitName: string,
  newAmount: number,
  history: HistoryData[]
): Promise<void> => {
  await saveUnitData(unitName, {
    currentAmount: newAmount,
    history
  });
};
