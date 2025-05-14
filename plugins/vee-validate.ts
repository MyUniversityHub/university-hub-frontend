import { defineNuxtPlugin } from '#app';
import { defineRule, configure } from 'vee-validate';
import * as rules from '@vee-validate/rules';
import {validateMessage} from '../utils/messageValidate';

export default defineNuxtPlugin((nuxtApp) => {
    // Định nghĩa rules
    defineRule('alpha', rules.alpha);
    defineRule('alpha_spaces', rules.alpha_spaces);
    defineRule('digits', rules.digits);
    defineRule('not_one_of', rules.not_one_of);
    defineRule('one_of', rules.one_of);
    defineRule('is_not', rules.is_not);
    defineRule('min_value', rules.min_value);
    defineRule('max_value', rules.max_value);
    defineRule('required', rules.required);
    defineRule('alpha_dash', rules.alpha_dash);
    defineRule('between', rules.between);
    defineRule('dimensions', rules.dimensions);
    defineRule('ext', rules.ext);
    defineRule('integer', rules.integer);
    defineRule('length', rules.length);
    defineRule('mimes', rules.mimes);
    defineRule('numeric', rules.numeric);
    defineRule('size', rules.size);
    defineRule('alpha_num', rules.alpha_num);
    defineRule('confirmed', rules.confirmed);
    defineRule('email', rules.email);
    defineRule('image', rules.image);
    defineRule('max', rules.max);
    defineRule('is', rules.is);
    defineRule('min', rules.min);
    defineRule('regex', rules.regex);
    defineRule('url', rules.url);

    // const t = nuxtApp.vueApp.config.globalProperties.$t;

    configure({
        generateMessage: (context) => {
            const fieldLabel = context.label || context.field;
            const ruleName = context.rule?.name;
            const ruleParams = context.rule?.params || [];
            if (!ruleName) {
                return `The field ${fieldLabel} is invalid.`;
            }

            const messages = {
                size: `${fieldLabel} không được vượt quá ${(ruleParams[0] / 1024).toFixed(2)} MB.`,
            };

            return ruleParams.length === 0
                ? (messages[ruleName] || validateMessage(ruleName, fieldLabel))
                : ((messages[ruleName] || validateMessage(ruleName, fieldLabel, ...ruleParams)));

        },
    });

    defineRule('phone', (value) => {
        return /^[0-9]{10,11}$/.test(value) || 'Số điện thoại không hợp lệ!';
    });

    defineRule('no_emojis', (value) => {
        return !/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}]/u.test(value) || 'Không được sử dụng biểu tượng cảm xúc!';
    });

    defineRule('noSpecialChars', (value) => {
        return !/[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{1F900}-\u{1F9FF}|\u{1FA70}-\u{1FAFF}]/u.test(value) || 'Không được sử dụng biểu tượng cảm xúc!';
    });


    defineRule('noSpaces', (value) => {
        return !/\s/.test(value) || 'Không được chứa dấu cách!';
    });

    defineRule('noVietnamese', (value) => {
        return /^[\x00-\x7F]*$/.test(value) || 'Không được chứa ký tự đặc biệt!';
    });

    defineRule('passwords_match', (value, [target]) => {
        if (value === target) {
            return true;
        }
        return 'Mật khẩu không khớp!';
    });

    defineRule('requiredDateRange', (value) => {
        if (!value || value.length !== 2 || value[0] === null || value[1] === null) {
            return 'Vui lòng chọn khoảng ngày hợp lệ';
        }
        return true;
    });

    defineRule('latin_numbers_only', (value) => {
        if (!/^[A-Za-z0-9]+$/.test(value)) {
            return 'Chỉ được nhập chữ cái Latin và số, không chứa ký tự đặc biệt!';
        }
        return true;
    });

    defineRule('only_letters', (value) => {
        if (!/^[\p{L}\s]+$/u.test(value)) {
            return 'Chỉ được nhập chữ cái, không cho phép số hoặc ký tự đặc biệt!';
        }
        return true;
    });

    defineRule('valid_department_name', (value) => {
        if (!/^[\p{L}\s-]+$/u.test(value)) {
            return 'Tên không hợp lệ, chỉ cho phép chữ cái và dấu gạch ngang!';
        }
        return true;
    });

});
