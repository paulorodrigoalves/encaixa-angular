import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { GavetaSvgComponent } from '../../../shared/components/gaveta-svg/gaveta-svg.component';
import {
  MedidasGaveta,
  LayoutGerado,
  CatalogoCompletoDTO,
  ItemObjetoSelecionado,
  LayoutNaoCabeErro,
  PreviewLayoutRequest
} from '../../../core/models/models';
import { ApiCatalogoService } from '../../../core/services/api-catalogo.service';
import { ApiLayoutService } from '../../../core/services/api-layout.service';
import { ApiProjetoService } from '../../../core/services/api-projeto.service';
import { keycloak } from '../../../core/keycloak/keycloak.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GavetaSvgComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  form: FormGroup;
  modoOrigem: 'TEMPLATE' | 'OBJETOS' = 'TEMPLATE';

  catalogo: CatalogoCompletoDTO | null = null;
  layout: LayoutGerado | null = null;
  medidasGaveta: MedidasGaveta | null = null;

  quantidadesObjetos: Record<string, number> = {};

  isLoading = false;
  isSaving = false;
  erroLayout: string | null = null;
  erroNaoCabe: LayoutNaoCabeErro | null = null;
  erroSalvar: string | null = null;
  estrategiaSelecionada = 'AUTO';

  private triggerPreview$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private catalogoService: ApiCatalogoService,
    private layoutService: ApiLayoutService,
    private projetoService: ApiProjetoService
  ) {
    this.form = this.fb.group({
      larguraMm: [600, [Validators.required, Validators.min(50), Validators.max(1200)]],
      profundidadeMm: [450, [Validators.required, Validators.min(50), Validators.max(1200)]],
      alturaMm: [100, [Validators.required, Validators.min(30), Validators.max(300)]],
      materialId: ['', Validators.required],
      templateId: ['']
    });
  }

  ngOnInit(): void {
    this.catalogoService.obterCatalogo().subscribe({
      next: (dados) => {
        this.catalogo = dados;
        if (dados.materiais.length > 0 && dados.templates.length > 0) {
          this.form.patchValue({
            materialId: dados.materiais[0].id,
            templateId: dados.templates[0].id
          });
        }
        // Pré-seleciona 2 itens para quando o usuário alternar para a aba "Por Objetos"
        if (dados.tiposObjeto.length > 0) {
          this.quantidadesObjetos[dados.tiposObjeto[0].id] = 2;
          if (dados.tiposObjeto.length > 1) {
            this.quantidadesObjetos[dados.tiposObjeto[1].id] = 1;
          }
        }
      },
      error: (err) => console.error('Erro ao carregar catálogo', err)
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.triggerPreview$.next());

    this.triggerPreview$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(350),
        switchMap(() => {
          const payload = this.montarPayload();
          if (!payload) {
            this.layout = null;
            return of(null);
          }

          this.isLoading = true;
          this.erroLayout = null;
          this.erroNaoCabe = null;
          this.medidasGaveta = {
            larguraMm: payload.larguraMm,
            profundidadeMm: payload.profundidadeMm,
            alturaMm: payload.alturaMm
          };

          return this.layoutService.gerarPreview(payload).pipe(
            catchError((err) => {
              this.isLoading = false;
              this.layout = null;
              this.erroLayout = err?.error?.erro || 'Medidas incompatíveis com o layout selecionado.';
              this.erroNaoCabe = err?.error && (err.error.larguraMinimaSugeridaMm || err.error.profundidadeMinimaSugeridaMm || err.error.camadas?.length)
                ? err.error
                : null;
              return of(null);
            })
          );
        })
      )
      .subscribe((preview) => {
        this.isLoading = false;
        if (preview) {
          this.layout = preview;
        }
      });
  }

  alternarModo(novoModo: 'TEMPLATE' | 'OBJETOS'): void {
    if (this.modoOrigem === novoModo) return;
    this.modoOrigem = novoModo;
    this.estrategiaSelecionada = 'AUTO';
    this.erroLayout = null;
    this.erroNaoCabe = null;
    this.triggerPreview$.next();
  }

  selecionarEstrategia(est: string): void {
    if (this.estrategiaSelecionada === est) return;
    this.estrategiaSelecionada = est;
    this.triggerPreview$.next();
  }

  aplicarMedidasSugeridas(): void {
    if (!this.erroNaoCabe) return;
    const patch: Record<string, number> = {};
    if (this.erroNaoCabe.larguraMinimaSugeridaMm) {
      patch['larguraMm'] = this.erroNaoCabe.larguraMinimaSugeridaMm;
    }
    if (this.erroNaoCabe.profundidadeMinimaSugeridaMm) {
      patch['profundidadeMm'] = this.erroNaoCabe.profundidadeMinimaSugeridaMm;
    }
    this.form.patchValue(patch);
  }

  obterQuantidade(tipoId: string): number {
    return this.quantidadesObjetos[tipoId] || 0;
  }

  alterarQuantidade(tipoId: string, delta: number): void {
    const atual = this.obterQuantidade(tipoId);
    const novo = Math.max(0, Math.min(20, atual + delta));
    this.quantidadesObjetos[tipoId] = novo;
    this.triggerPreview$.next();
  }

  get totalObjetosSelecionados(): number {
    return Object.values(this.quantidadesObjetos).reduce((acc, q) => acc + q, 0);
  }

  private montarPayload(): PreviewLayoutRequest | null {
    if (this.form.invalid) return null;
    const v = this.form.value;

    if (this.modoOrigem === 'TEMPLATE') {
      if (!v.templateId) return null;
      return {
        larguraMm: v.larguraMm,
        profundidadeMm: v.profundidadeMm,
        alturaMm: v.alturaMm,
        materialId: v.materialId,
        templateId: v.templateId
      };
    } else {
      const itens: ItemObjetoSelecionado[] = Object.entries(this.quantidadesObjetos)
        .filter(([, qtd]) => qtd > 0)
        .map(([tipoObjetoId, quantidade]) => ({ tipoObjetoId, quantidade }));

      if (itens.length === 0) {
        this.erroLayout = 'Selecione ao menos 1 objeto para calcular o layout.';
        return null;
      }

      return {
        larguraMm: v.larguraMm,
        profundidadeMm: v.profundidadeMm,
        alturaMm: v.alturaMm,
        materialId: v.materialId,
        itensObjeto: itens,
        estrategiaLayout: this.estrategiaSelecionada
      };
    }
  }

  salvarProjeto(): void {
    const payload = this.montarPayload();
    if (!payload) return;

    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }

    this.isSaving = true;
    this.erroSalvar = null;

    this.projetoService.salvarProjeto(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/app/projetos']);
      },
      error: (err) => {
        console.error('Erro ao salvar projeto', err);
        this.erroSalvar = err?.error?.erro || 'Não foi possível salvar o projeto.';
        this.isSaving = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
