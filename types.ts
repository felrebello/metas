export interface HistoryData {
  month: string;
  amount: number;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ProcedureData {
  'Responsável tecnico': string;
  'Procedimento': string;
  'Preço': number;
}
