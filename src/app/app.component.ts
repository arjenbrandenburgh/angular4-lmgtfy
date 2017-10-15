import { Component, ViewChild, OnInit, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { animate, AnimationBuilder, AnimationPlayer, style, trigger, transition } from '@angular/animations';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('stepSlideIn', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate(350)
      ]),
    ])
  ],
})
export class AppComponent implements OnInit {
  @ViewChild('inputBox') inputBox: ElementRef;
  @ViewChild('fakePointer') fakePointer: ElementRef;
  @ViewChild('submitButton') submitButton: ElementRef;

  animationPlayer: AnimationPlayer;

  steps: any[] = [];
  step: number = 1;

  stringToType: string = "";
  stringCount: number = 0;
  buttonClicked: boolean = false;

  sub: any;

  constructor(private _route: ActivatedRoute,
              private _animBuilder: AnimationBuilder,
              private _renderer: Renderer) {
  }


  ngOnInit() {
    // Get the query string
    this._route.queryParams.subscribe(params => {
        this.stringToType = params['q'];
    });

    this.animationOrchestrator(); // Start animations
    this.steps.push('Visit Google.com and click the input field');
  }

  addCharacterToInput() {
    this.stringCount++;

    this.inputBox.nativeElement.value = this.stringToType.substring(0, this.stringCount);

    // We've now entered the entire string, and can unsubcribe and start the next animation
    if (this.stringCount >= this.stringToType.length) {
      this.animationOrchestrator();
      this.steps.push(`Click the button`);
      this.sub.unsubscribe();
    }
  }

  movePointer(x, y, speed, opacity): void {
    const moveBallAnimation = this._animBuilder.build([
      animate(`${speed}ms ease`, style({
          'top': `${y}px`,
          'left': `${x}px`,
          'opacity': opacity
      }))
    ]);

    this.animationPlayer = moveBallAnimation.create(this.fakePointer.nativeElement);
    this.animationPlayer.onDone(() => this.animationOrchestrator() );
    this.animationPlayer.play();
  }

  animationOrchestrator(): void {
    if (this.step === 1) {
      const x = this.inputBox.nativeElement.offsetLeft;
      const y = this.inputBox.nativeElement.offsetTop + (this.inputBox.nativeElement.offsetHeight / 2);
      this.movePointer(x, y, 3500, 1);

    } else if (this.step === 2) {
      const x = this.inputBox.nativeElement.offsetLeft;
      const y = this.inputBox.nativeElement.offsetTop + (this.inputBox.nativeElement.offsetHeight / 2);
      this.movePointer(x, y, 250, 0);

    } else if (this.step === 3) {
      this.sub = Observable.interval(100).takeWhile(() => true).subscribe(() => this.addCharacterToInput());
      this.steps.push(`Type your question`);

    } else if (this.step === 4) {
      const x = this.submitButton.nativeElement.offsetLeft + (this.submitButton.nativeElement.offsetWidth / 2);
      const y = this.submitButton.nativeElement.offsetTop + (this.submitButton.nativeElement.offsetHeight / 2);
      this.movePointer(x, y, 3000, 1);

    } else if (this.step === 5) {
      this.buttonClicked = true;
      this.steps.push(`That's it! Was that so hard?`);
      Observable.timer(500).subscribe(() => this.buttonClicked = false );

      const url = `https://www.google.nl/search?q=${encodeURIComponent(this.stringToType)}`;
      // Only redirect in production, since it kinda sucks for development
      if (environment.production) {
        Observable.timer(3000).subscribe(() => window.location.href = url);
      }
    }

    this.step++;
  }

}
