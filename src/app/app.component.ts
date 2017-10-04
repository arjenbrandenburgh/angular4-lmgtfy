import { Component, ViewChild, OnInit, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('moveToInput', [
      transition('bottomRight => atInput', animate('4000ms ease-in', keyframes([
        style({opacity: 1, left: 'calc(100% - 100px)', top: 'calc(100% - 100px)', offset: 0}),
        style({opacity: 1, left: 'calc(50% - 190px)', top: '275px',  offset: 0.8}),
        style({opacity: 0, left: 'calc(50% - 190px)', top: '275px', offset: 1.0})
      ]))),
    ]),
    trigger('moveToButton', [
      transition('onInput => atButton', animate('2500ms ease-in', keyframes([
        style({opacity: 1, left: 'calc(50% - 190px)', top: '275px', offset: 0}),
        style({opacity: 1, left: 'calc(50% - 90px)', top: '315px',  offset: 0.8}),
        style({opacity: 0, left: 'calc(50% - 90px)', top: '315px', offset: 1.0})
      ]))),
    ]),
    trigger('stepSlideIn', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate(350)
      ]),
    ])
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('inputBox') inputBox: ElementRef;
  
  state: string = 'bottomRight';
  state2: string = 'onInput';

  steps: any[] = [];

  stringToType: string = "";
  stringCount: number = 0;
  buttonClicked: boolean = false;

  sub: any;

  constructor(private _route: ActivatedRoute,
              private _renderer: Renderer) {
  }


  ngOnInit() {
    // Get the query string
    this._route.queryParams.subscribe(params => {
        this.stringToType = params['q'];
    });
  }

  ngAfterViewInit() {
    this.state = 'atInput';
    this.steps.push('Visit Google.com and click the input field');
  }

  addCharacterToInput() {
    this.stringCount++;

    this.inputBox.nativeElement.value = this.stringToType.substring(0, this.stringCount);

    // We've now entered the entire string, and can unsubcribe and start the next animation
    if (this.stringCount >= this.stringToType.length) {
      this.state2 = 'atButton';
      this.steps.push(`Click the button`);
      this.sub.unsubscribe();
    }
  }

  onMoveDone(event) {
    if (event.fromState !== 'void') {
      this.sub = Observable.interval(100).takeWhile(() => true).subscribe(() => this.addCharacterToInput());
      this._renderer.invokeElementMethod(this.inputBox.nativeElement, 'focus');
      this.steps.push(`Type your question`);
    }
  }

  onMoveDone2(event) {
    if (event.fromState !== 'void') {
      const url = `https://www.google.nl/search?q=${encodeURIComponent(this.stringToType)}`;
      this.buttonClicked = true;
      this.steps.push(`That's it! Was that so hard?`);
      
      Observable.timer(500).subscribe(() => this.buttonClicked = false );
      Observable.timer(2000).subscribe(() => window.location.href = url);
    }
  }

}
