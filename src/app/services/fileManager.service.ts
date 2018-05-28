import { Injectable } from '@angular/core';
import { ProgressHttp } from '../../progress-http';
import { Observable } from 'rxjs';
import { NzMessageService,NzNotificationService } from 'ng-zorro-antd';
import { environment } from '../../../environments/environment';

@Injectable()
export class FileUploadAndDownloadSerivce {
  tasks = [];
  finished = [];
  constructor(
    private http: ProgressHttp,
    private message: NzMessageService,
    private notice: NzNotificationService
  ) {
  }

  add(opt) {
    if (!opt.url) {
      return false;
    }
    opt.handle = (opt) => {this.handleHttp(opt)};
    this.tasks.push(opt);
    this.handleHttp(opt);
  }

  handleHttp(opt) {
    opt.status = Status.unstart;
    this.http
      .withUploadProgressListener(progress => {
        opt.progress = progress;
        opt.status = Status.progress;
      })
      .withDownloadProgressListener(progress => {
        opt.progress = progress;
        opt.status = Status.progress;
      })
      .post(environment.server_url + opt.url, opt.form || null, opt.type === 'download' ? {
        responseType: 2
      } : null)
      .subscribe((r: any) => {
        this.finished.push(opt);
        opt.status = Status.end;
        opt.file && this.message.success(opt.file.name + (opt.type === 'upload' ? '上传成功' : '下载成功'));
        opt.type === 'download' && this.downloadFile(r, opt);
      }, err => {
        opt.status = Status.error;
        this.message.error(err.statusText);
      });
  }

  downloadFile(res, opt) {
    const blob = new Blob([res]);
    const fileName = opt.file.name;
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      link.target = '_blank';

      //兼容fixfox
      document.body.appendChild(link);

      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", false, false);
      link.dispatchEvent(evt);

      document.body.removeChild(link);
      window.URL.revokeObjectURL(res);
    }
    this.notice.blank('文件密钥', fileName + '的解压密钥为：111', {
      nzDuration: 0
    });
  }
}

enum Status {
  unstart = 'unstart',
  progress = 'progress',
  end = 'end',
  error = 'error'
}
