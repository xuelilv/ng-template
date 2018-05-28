import { Injectable } from '@angular/core';

@Injectable()
export class Util {
    getFileExt(name: string): string {
        return name.substring(name.lastIndexOf('.')+1, name.length);
    }

    isPlainObject(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Object]';
    }

    isArray(value) {
        return value instanceof Array;
    }

    isNumber(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Number]';
    }

    isString(value) {
        return !!value && Object.prototype.toString.call(value) === '[object String]';
    }

    isFunction(value) {
        return !!value && Object.prototype.toString.call(value) === '[object Function]';
    }
}