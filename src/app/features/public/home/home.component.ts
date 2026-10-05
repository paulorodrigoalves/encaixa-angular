import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { GavetaSvgComponent } from '../../../shared/components/gaveta-svg/gaveta-svg.component';
import { MedidasGaveta, LayoutGerado, CatalogoCompletoDTO } from '../../../core/models/models';
import { ApiCatalogoService } from '../../../core/services/api-catalogo.service';
import { ApiLayoutService } from '../../../core/services/api-layout.service';

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

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private catalogoService: ApiCatalogoService,
    private layoutService: ApiLayoutService
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
