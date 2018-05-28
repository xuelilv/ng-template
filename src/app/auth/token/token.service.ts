import { Injectable, Optional, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { share } from 'rxjs/operators';
import { ITokenService, ITokenModel } from './interface';
import { STORE_TOKEN, IStore } from '../store/interface';
import { AuthConfig } from '../auth.config';

@Injectable()
export class TokenService implements ITokenService {
  private change$: BehaviorSubject<ITokenModel> = new BehaviorSubject<ITokenModel>(null);
  private data: ITokenModel;
  private _redirect: string;

  constructor(
    private options: AuthConfig,
    @Inject(STORE_TOKEN) private store: IStore
  ) {}

  get login_url(): string {
    return this.options.login_url;
  }

  set redirect(url: string) {
    this._redirect = url;
  }

  get redirect() {
    return this._redirect || '/';
  }

  set(data: ITokenModel): boolean {
    this.change$.next(data);
    return this.store.set(this.options.store_key, data);
  }

  get(type?: any);
  get<T extends ITokenModel>(type?: { new (): T }): T {
    const data = this.store.get(this.options.store_key);
    return type ? (Object.assign(new type(), {token: data}) as T) : (data as T);
  }

  clear() {
    this.change$.next(null);
    this.store.remove(this.options.store_key);
  }

  change(): Observable<ITokenModel> {
    return this.change$.pipe(share());
  }
}
