import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { GavetaSvgComponent } from '../../../shared/components/gaveta-svg/gaveta-svg.component';
import { MedidasGaveta, LayoutGerado, CatalogoCompletoDTO } from '../../../core/models/models';
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
  
  catalogo: CatalogoCompletoDTO | null = null;
  layout: LayoutGerado | null = null;
  medidasGaveta: MedidasGaveta | null = null;
  isLoading = false;
  isSaving = false;
  erroSalvar: string | null = null;

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
      templateId: ['', Validators.required]
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
      },
      error: (err) => console.error('Erro ao carregar catálogo', err)
    });

    this.form.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        filter(() => this.form.valid),
        switchMap(valores => {
          this.isLoading = true;
          this.medidasGaveta = {
            larguraMm: valores.larguraMm,
            profundidadeMm: valores.profundidadeMm,
            alturaMm: valores.alturaMm
          };
          return this.layoutService.gerarPreview(valores);
        })
      )
      .subscribe({
        next: (preview) => {
          this.layout = preview;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao gerar layout', err);
          this.isLoading = false;
        }
      });
  }

  salvarProjeto(): void {
    if (this.form.invalid) return;

    if (!keycloak.authenticated) {
      keycloak.login({ redirectUri: window.location.href });
      return;
    }

    this.isSaving = true;
    this.erroSalvar = null;

    this.projetoService.salvarProjeto(this.form.value).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/app/projetos']);
      },
      error: (err) => {
        console.error('Erro ao salvar projeto', err);
        this.erroSalvar = 'Não foi possível salvar o projeto. Verifique se você está logado.';
        this.isSaving = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
