import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutGerado, MedidasGaveta } from '../../core/models/models';

@Component({
  selector: 'app-gaveta-svg',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gaveta-svg.component.html',
  styleUrls: ['./gaveta-svg.component.scss']
})
export class GavetaSvgComponent {
  @Input({ required: true }) layout: LayoutGerado | null = null;
  @Input({ required: true }) medidas: MedidasGaveta | null = null;

  get viewBox(): string {
    if (!this.layout) return '0 0 100 100';
    return `0 0 ${this.layout.larguraTotalMm} ${this.layout.profundidadeTotalMm}`;
  }
}
