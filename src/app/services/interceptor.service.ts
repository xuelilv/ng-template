import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { mergeMap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { HttpService } from './http.service';
import { environment } from '../../environments/environment';

/**
 * 默认HTTP拦截器
 */
@Injectable()
export class SimpleHttpInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {
  }

  get msg(): NzMessageService {
    return this.injector.get(NzMessageService);
  }

  private goTo(url: string) {
    setTimeout(() => this.injector.get(Router).navigateByUrl(url));
  }

  private handleData(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
    // 可能会因为 `throw` 导出无法执行 `HttpService` 的 `end()` 操作
    this.injector.get(HttpService).end();
    switch (event.status) {
      case 200:
        if (event instanceof HttpResponse) {
          const body: any = event.body;
          if (body && body.hasOwnProperty('code') && body.code !== 0 && body.code !== '200') {
            this.msg.error(body.msg || body.message);
            // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
            // this.http.get('/').subscribe() 并不会触发
            return ErrorObservable.throw(event);
          } else {
            // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
            return of(new HttpResponse(Object.assign(event, { body: body })));
          }
        }
        break;
      case 401: // 未登录状态码
        this.goTo('/login');
        break;
      case 403:
      case 404:
      case 500:
        //this.goTo(`/${event.status}`);
        //break;
      default:
        (event instanceof HttpErrorResponse) && (this.msg.error(event.message));
        break;
    }
    return of(event);
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    // 统一加上服务端前缀
    let url = req.url;
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
      url = environment.server_url + url;
    }

    const newReq = req.clone({
      url: url
    });
    return next.handle(newReq).pipe(
      mergeMap((event: any) => {
        // 允许统一对请求错误处理，非200的情况
        if (event instanceof HttpResponse && event.status === 200) return this.handleData(event);
        return of(event);
      }),
      catchError((err: HttpErrorResponse) => this.handleData(err))
    );
  }
}
