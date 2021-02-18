import { Component } from '@angular/core';
import { GPU } from 'gpu.js'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-gpujs-demo';

  inputNumber = Number.parseInt((Math.random().toString()))
  power = Number.parseInt((Math.random().toString()));

  result = '';
  gpuResult = '';

  inputData = '';
  numbers = new Array<number>();
  count = 10;
  randomLimit = 100;
  gpu: GPU;
  matrixSize = 3;
  matrices: Array<Array<Array<number>>> = [[], []]
  cpuProduct: number[][];
  gpuProduct: number[][];

  cpuTime = '';
  gpuTime = '';

  vendor = '';
  renderer = '';

  loading = false;
  statusMessage = '';
  matricesGenerated = false;

  constructor() {
    this.gpu = new GPU();
    console.log(this.gpu);
    this.cpuProduct = [];
    this.gpuProduct = [];
  }

  ngOnInit() {
    let canvas = document.getElementById('dummyCanvas') as HTMLCanvasElement;
    let gl = canvas.getContext('webgl') as WebGLRenderingContext;

    let debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info;
    this.vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    this.renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

  }

  generateMatrices() {
    this.matrices = new Array<Array<Array<number>>>();
    this.matrices = [[], []];
    this.cpuProduct = [[], []];
    this.gpuProduct = [[], []];
    this.cpuTime = '';
    this.gpuTime = '';

    this.loading = true;
    this.statusMessage = "Generating matrices..."

    for (let y = 0; y < this.matrixSize; y++) {
      this.matrices[0].push([])
      this.matrices[1].push([])
      for (let x = 0; x < this.matrixSize; x++) {
        const value1 = parseInt((Math.random() * 10).toString())
        const value2 = parseInt((Math.random() * 10).toString())
        this.matrices[0][y].push(value1)
        this.matrices[1][y].push(value2)
      }
    }
    console.log('matrices generated...');
    this.statusMessage = "Matrices generated!";
    this.loading = false;
    this.matricesGenerated = true;

    // return matrices
  }


  cpuMutiplyMatrix() {
    const startTime = performance.now();
    console.time('cpu-multiply-matrix');
    const a = this.matrices[0];
    const b = this.matrices[1];

    let productRow = Array.apply(null, new Array(this.matrixSize)).map(Number.prototype.valueOf, 0);
    let product = new Array(this.matrixSize);
    for (let p = 0; p < this.matrixSize; p++) {
      product[p] = productRow.slice();
    }

    for (let i = 0; i < this.matrixSize; i++) {
      for (let j = 0; j < this.matrixSize; j++) {
        for (let k = 0; k < this.matrixSize; k++) {
          product[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    console.timeEnd('cpu-multiply-matrix');
    const endTime = performance.now();
    this.cpuTime = (endTime - startTime) + " ms";
    this.cpuProduct = product;
  }

  gpuMultiplyMatrix() {
    const gpu = new GPU();
    const multiplyMatrix = gpu.createKernel(function (a: number[][], b: number[][], matrixSize: number) {
      let sum = 0;
      for (let i = 0; i < matrixSize; i++) {
        sum += a[this.thread.y][i] * b[i][this.thread.x];
      }
      return sum;
    }).setOutput([this.matrixSize, this.matrixSize])

    const startTime = performance.now();
    console.time('gpu-multiply-matrix');
    const resultMatrix = multiplyMatrix(this.matrices[0], this.matrices[1], this.matrixSize);
    console.timeEnd('gpu-multiply-matrix');
    const endTime = performance.now();
    this.gpuTime = (endTime - startTime) + " ms";

    this.gpuProduct = resultMatrix as number[][];
  }
}
