export interface MaterialDTO {
  id: string;
  nome: string;
  cor: string;
  valorFixoAdicional: number;
  tipoMaterialId: string;
  tipoMaterialNome: string;
  espessuraMm: number;
  margemMm: number;
}

export interface TemplateDTO {
  id: string;
  nome: string;
  categoria: string;
  thumbnailUrl: string;
  tagsObjetos: string[];
}

export interface TipoObjetoDTO {
  id: string;
  nome: string;
  categoria: string;
  larguraMinMm: number;
  larguraMaxMm: number;
  profundidadeMinMm: number;
  profundidadeMaxMm: number;
  alturaMinMm: number;
}

export interface CatalogoCompletoDTO {
  materiais: MaterialDTO[];
  templates: TemplateDTO[];
  tiposObjeto: TipoObjetoDTO[];
}

export interface ItemObjetoSelecionado {
  tipoObjetoId: string;
  quantidade: number;
}

export interface PreviewLayoutRequest {
  larguraMm: number;
  profundidadeMm: number;
  alturaMm: number;
  materialId: string;
  templateId?: string;
  itensObjeto?: ItemObjetoSelecionado[];
}

export interface DivisoriaRenderDTO {
  xMm: number;
  yMm: number;
  larguraMm: number;
  profundidadeMm: number;
  orientacao: 'VERTICAL' | 'HORIZONTAL';
}

export interface ObjetoRenderDTO {
  id: string;
  nome: string;
  corHex: string;
}

export interface ObjetoPosicionadoDTO {
  objeto: ObjetoRenderDTO;
  xMm: number;
  yMm: number;
  larguraRealMm: number;
  profundidadeRealMm: number;
}

export interface PreviewLayoutResponse {
  larguraTotalMm: number;
  profundidadeTotalMm: number;
  alturaTotalMm: number;
  divisorias: DivisoriaRenderDTO[];
  objetosPosicionados: ObjetoPosicionadoDTO[];
  espessuraDivisoriaMm: number;
}

// Aliases para manter compatibilidade com o componente SVG atual
export type MedidasGaveta = { larguraMm: number; profundidadeMm: number; alturaMm: number };
export type LayoutGerado = PreviewLayoutResponse;
export type DivisoriaRender = DivisoriaRenderDTO;
export type ObjetoPosicionado = ObjetoPosicionadoDTO;
