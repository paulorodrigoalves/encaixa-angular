export interface MedidasGaveta {
  larguraMm: number;
  profundidadeMm: number;
  alturaMm: number;
  espessuraMaterialMm: number;
  margemFolgaMm: number;
}

export interface ObjetoUsuario {
  id: string;
  nome: string;
  larguraMm: number;
  profundidadeMm: number;
  alturaMm?: number;
  corHex?: string;
}

export interface DivisoriaRender {
  xMm: number;
  yMm: number;
  larguraMm: number;
  profundidadeMm: number;
  orientacao: 'VERTICAL' | 'HORIZONTAL';
}

export interface ObjetoPosicionado {
  objeto: ObjetoUsuario;
  xMm: number;
  yMm: number;
  larguraRealMm: number;
  profundidadeRealMm: number;
}

export interface LayoutGerado {
  larguraTotalMm: number;
  profundidadeTotalMm: number;
  alturaTotalMm: number;
  divisorias: DivisoriaRender[];
  objetosPosicionados: ObjetoPosicionado[];
  espessuraDivisoriaMm: number;
}
