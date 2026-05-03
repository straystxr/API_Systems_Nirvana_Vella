import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticleModalComponent } from './article-modal.component';

describe('ArticleModalComponent', () => {
  let component: ArticleModalComponent;
  let fixture: ComponentFixture<ArticleModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ArticleModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
