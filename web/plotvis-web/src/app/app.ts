import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurveService } from './curve.service';
import {
  Chart,
  LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title,
  Tooltip, Legend
} from 'chart.js';

// Register Chart.js pieces (legend/tooltip included)
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],           // enables [(ngModel)] in app.html
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  chart?: Chart;
  status = '';
  csvPath = '';

  constructor(private svc: CurveService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.status = 'Loading...';
    this.svc.getCurve(this.csvPath || undefined).subscribe({
      next: (res) => {
        const series = res.series; // [{x, y}, ...]

        if (this.chart) this.chart.destroy();
        this.chart = new Chart(this.canvas.nativeElement, {
          type: 'line',
          data: {
            // use true x,y pairs via parsing keys
            datasets: [{
              label: 'Stress–strain curve',
              data: series,
              parsing: { xAxisKey: 'x', yAxisKey: 'y' },
              borderColor: 'rgba(220, 20, 60, 1)',     // crimson line
              backgroundColor: 'rgba(220, 20, 60, 0.15)', // faint fill (set fill:true to show)
              borderWidth: 2,
              pointRadius: 2,
              fill: false
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true },
              tooltip: {
                enabled: true,
                callbacks: {
                  label: (ctx) => {
                    const p = ctx.raw as { x: number, y: number };
                    return `ε = ${p.x.toFixed(4)}, σ = ${p.y.toFixed(1)} MPa`;
                  }
                }
              },
              title: { display: false }
            },
            scales: {
              x: {
                type: 'linear',
                title: { display: true, text: 'Strain' },
                ticks: { callback: (v) => Number(v).toFixed(4) }
              },
              y: {
                title: { display: true, text: 'Stress (MPa)' }
              }
            }
          }
        });

        this.status = `Points loaded: ${series.length}`;
      },
      error: (err) => {
        this.status = `Error: ${err?.error?.error || err.message}`;
      }
    });
  }
}
