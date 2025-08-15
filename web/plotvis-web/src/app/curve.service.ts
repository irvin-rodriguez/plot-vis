import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type Point = { x: number; y: number };
type CurveResponse = { series: Point[] };

@Injectable({ providedIn: 'root' })
export class CurveService {
  // change 5000 if your API prints a different port on startup
  private base = 'http://localhost:5119';

  constructor(private http: HttpClient) {}

  getCurve(path?: string): Observable<CurveResponse> {
    const url = path
      ? `${this.base}/api/curve?path=${encodeURIComponent(path)}`
      : `${this.base}/api/curve`;
    return this.http.get<CurveResponse>(url);
  }
}
