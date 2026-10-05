import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GavetaSvgComponent } from './shared/components/gaveta-svg/gaveta-svg.component';
import { LayoutGerado, MedidasGaveta } from './core/models/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GavetaSvgComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'encaixa-angular';

  // Dados mockados para exibir a Gaveta logo na tela inicial!
  medidasMock: MedidasGaveta = {
    larguraMm: 600,
    profundidadeMm: 450,
    alturaMm: 100,
    espessuraMaterialMm: 6,
    margemFolgaMm: 2
  };

  layoutMock: LayoutGerado = {
    larguraTotalMm: 596, // 600 - (2 * 2 margem)
    profundidadeTotalMm: 446,
    alturaTotalMm: 100,
    espessuraDivisoriaMm: 6,
    divisorias: [
      { xMm: 198, yMm: 0, larguraMm: 6, profundidadeMm: 446, orientacao: 'VERTICAL' },
      { xMm: 396, yMm: 0, larguraMm: 6, profundidadeMm: 446, orientacao: 'VERTICAL' },
      { xMm: 0, yMm: 220, larguraMm: 198, profundidadeMm: 6, orientacao: 'HORIZONTAL' }
    ],
    objetosPosicionados: [
      {
        objeto: { id: '1', nome: 'Relógio', larguraMm: 80, profundidadeMm: 80, corHex: '#fee2e2' },
        xMm: 20, yMm: 20, larguraRealMm: 80, profundidadeRealMm: 80
      },
      {
        objeto: { id: '2', nome: 'Óculos', larguraMm: 160, profundidadeMm: 60, corHex: '#e0e7ff' },
        xMm: 210, yMm: 50, larguraRealMm: 160, profundidadeRealMm: 60
      }
    ]
  };
}
