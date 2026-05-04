import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

//every article in the app must have exactly these fields
export interface Article {
  id: string; // unique identifier generated when article is created
  title: string; 
  body: string; 
  category: string;
  lat: number; //latitude of the pin on the map
  lng: number; //longitude of the pin on the map
  authorName: string; //name entered by the user in the form
  createdAt: Date; //timestamp set automatically when article is saved / could be used for filtering as a future development
  url: string;
  source: string;
  status: string;
  verification_status: string;
}

//@Injectable marks this class as something Angular can inject into other classes
//providedIn: 'root' means one single shared instance exists across the whole app so every component that injects ArticleService gets the same data
@Injectable({ providedIn: 'root' })
export class ArticleService {

  //it starts as an empty array and emits a new array every time articles change
  private articles$ = new BehaviorSubject<Article[]>([]);

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.articles$.asObservable();
  }

  // this prevents the caller from accidentally setting their own id
  addArticle(data: Omit<Article, 'id' | 'createdAt'>): Article {

    //build the complete article object by spreading the incoming data then adding the two fields the caller is not responsible for
    const article: Article = {
      ...data,    //title, body, category, lat, lng, authorName
      //randomUUID() will be used for OWASP API security specifically 1. Broken Object Level Authorization
      id: crypto.randomUUID(),    //generates a unique ID e.g. '550e8400-e29b-41d4-a716'
      createdAt: new Date(), //date
    };

    //adding the new article to the existing list, getValue() gets the current array out of the BehaviorSubject
    //spread it into a new array rather than mutating the original then next() pushes the new array to all subscribers
    this.articles$.next([...this.articles$.getValue(), article]);

    //early return the completed article so the caller can use its generated id
    return article;
  }

   //saves to database
  submitArticle(data: Omit<Article, 'id' | 'createdAt'>): Observable<any> {
  return this.http.post(`${environment.apiUrl}/add-article.php`, data);
}

  //method to find a single article by its id returns undefined if no match found
  getById(id: string): Article | undefined {
    return this.articles$.getValue().find(a => a.id === id);
  }
}