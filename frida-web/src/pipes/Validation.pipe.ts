import {
    ArgumentMetadata,
    Injectable,
    PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';
import { CommonException, ErrorCode, ErrorType } from 'src/package/common/exception/CommonException';
const queryDebug = require('debug')('queryValidate.pipe:')

@Injectable()
export class QueryValidationPipe implements PipeTransform<any> {
    async transform(value: any, metadata: ArgumentMetadata) {
        const { metatype } = metadata;
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = plainToClass(metatype, value);
        const errors = await validate(object);
        if (errors.length > 0) {
            // 遍历全部的错误信息,返回给前端
            const errorMessage = errors.map(item => {
                return {
                    currentValue: item.value,
                    [item.property]: _.values(item.constraints)[0],
                    message: `当前参数:${item.property}->${item.value},${_.values(item.constraints)[0]}`
                };
            });
            queryDebug(errorMessage[0].message);
            throw new CommonException(ErrorType.PARAMES_ERROR, errorMessage[0].message, ErrorCode.PARAMES_ERROR);
        }
        return value;
    }

    private toValidate(metatype: any): boolean {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
}