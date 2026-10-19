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

export interface OrcamentoPreviewDTO {
  valorMaterial: number;
  valorDivisorias: number;
  valorVolume: number;
  valorTotal: number;
}

export interface PreviewLayoutResponse {
  larguraTotalMm: number;
  profundidadeTotalMm: number;
  alturaTotalMm: number;
  divisorias: DivisoriaRenderDTO[];
  objetosPosicionados: ObjetoPosicionadoDTO[];
  espessuraDivisoriaMm: number;
  orcamento: OrcamentoPreviewDTO;
}

export interface CriarProjetoRequest {
  larguraMm: number;
  profundidadeMm: number;
  alturaMm: number;
  materialId: string;
  templateId?: string;
  itensObjeto?: ItemObjetoSelecionado[];
  quantidade?: number;
}

export interface EtapaClienteDTO {
  nomeEtapa: string;
  observacao: string | null;
  criadoEm: string;
}

export interface ProjetoSalvoResponse {
  id: string;
  compraId: string;
  statusCompra: string;
  larguraMm: number;
  profundidadeMm: number;
  alturaMm: number;
  espessuraMaterialMm: number;
  margemSegurancaMm: number;
  quantidade: number;
  status: string;
  materialNome: string;
  templateNome: string;
  totalCompartimentos: number;
  valorTotal: number;
  transportadora: string | null;
  valorFrete: number;
  prazoFreteDias: number | null;
  criadoEm: string;
  etapaAtual: string | null;
  codigoRastreio: string | null;
  prazoEstimadoDias: number | null;
  historicoEtapas: EtapaClienteDTO[];
}

export interface EnderecoDTO {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface PacoteEstimadoDTO {
  larguraCm: number;
  alturaCm: number;
  profundidadeCm: number;
  pesoKg: number;
}

export interface OpcaoFreteDTO {
  transportadora: string;
  valorFrete: number;
  prazoDias: number;
}

export interface CotacaoFreteResponse {
  compraId: string;
  totalItens: number;
  subtotalProjetos: number;
  pacote: PacoteEstimadoDTO;
  opcoesFrete: OpcaoFreteDTO[];
  telefoneAtual: string | null;
  enderecoAtual: EnderecoDTO | null;
}

export interface FinalizarCheckoutRequest {
  telefone: string;
  endereco: EnderecoDTO;
  transportadora: string;
  valorFrete: number;
  prazoFreteDias: number;
}

export interface RegraPrecificacaoDTO {
  id: string;
  precoPorLitro: number;
  precoPorCm2Divisoria: number;
  vigenteDesde: string;
  criadoPor: string;
}

export interface EtapaProducaoDTO {
  id: string;
  nome: string;
  ordem: number;
  usaRastreio: boolean;
}

export interface PedidoEtapaHistoricoDTO {
  id: string;
  nomeEtapa: string;
  observacao: string | null;
  criadoEm: string;
}

export interface CompraAdminDTO {
  compraId: string;
  clienteNome: string;
  clienteEmail: string;
  statusCompra: string;
  valorTotal: number;
  totalProjetos: number;
  criadoEm: string;
  pedidoId: string | null;
  etapaAtual: string | null;
  codigoRastreio: string | null;
  historicoEtapas: PedidoEtapaHistoricoDTO[];
}

export interface RegistrarEtapaRequest {
  etapaId: string;
  observacao?: string;
  codigoRastreio?: string;
}

export interface PecaCorteDTO {
  descricao: string;
  quantidade: number;
  comprimentoMm: number;
  alturaMm: number;
  espessuraMm: number;
}

export interface CompartimentoCorteDTO {
  indice: number;
  posXMm: number;
  posYMm: number;
  larguraInternaMm: number;
  profundidadeInternaMm: number;
}

export interface PlanoCorteProjetoDTO {
  projetoId: string;
  materialNome: string;
  tipoMaterialNome: string;
  quantidadeOrganizadores: number;
  larguraGavetaMm: number;
  profundidadeGavetaMm: number;
  alturaGavetaMm: number;
  margemSegurancaMm: number;
  espessuraMaterialMm: number;
  larguraExternaOrganizadorMm: number;
  profundidadeExternaOrganizadorMm: number;
  pecasCorte: PecaCorteDTO[];
  compartimentos: CompartimentoCorteDTO[];
}

// Aliases para manter compatibilidade com o componente SVG atual
export type MedidasGaveta = { larguraMm: number; profundidadeMm: number; alturaMm: number };
export type LayoutGerado = PreviewLayoutResponse;
export type DivisoriaRender = DivisoriaRenderDTO;
export type ObjetoPosicionado = ObjetoPosicionadoDTO;
