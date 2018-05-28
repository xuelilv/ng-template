import {Component, OnInit, Inject} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {HttpService} from '../../services/http.service';
import {SERVICE_TOKEN, ITokenService} from '../../auth';
import { NzMessageService } from 'ng-zorro-antd';
import urls from '../../urls/index';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  now = new Date().getTime();

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private http: HttpService,
              private message: NzMessageService,
              @Inject(SERVICE_TOKEN) private tokenServer: ITokenService) {

  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [false],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.message.error('请输入用户名和密码');
      return false;
    }
    this.http.post(urls.login, Object.assign(this.loginForm.value, {nowTime: this.now}), null, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .subscribe((res: any) => {
        this.tokenServer.set(res.gempileToken);
        window.localStorage.setItem('garnetFileToken', res.garnetToken);
        this.router.navigateByUrl('/index/fileList');
      });
  }

}
