import { InputManager } from "./input.manager";

export class InputService {

    private inputManager: InputManager;

    constructor(
        private htmlInputElement: any,
        private options: any) {
        this.inputManager = new InputManager(htmlInputElement);
    }

    addNumber(keyCode: number): void {
        if (!this.rawValue) {
            this.rawValue = this.applyMask(false, "0");
        }
        let keyChar = String.fromCharCode(keyCode);
        let selectionStart = this.inputSelection.selectionStart;
        let selectionEnd = this.inputSelection.selectionEnd;
        const lengthStringOld = this.rawValue.length;
        if (selectionStart < lengthStringOld) {
            this.rawValue = this.rawValue.substring(0, selectionStart) + keyChar + this.rawValue.substring(selectionEnd, this.rawValue.length);
        }
        if ((lengthStringOld - this.rawValue.length) > 0 &&
            (lengthStringOld - this.rawValue.length) < this.options.precision) {
            const countCharRomve = lengthStringOld - this.rawValue.length;
            for (let index = 0; index < countCharRomve; index++) {
                this.rawValue += '0';
            }
        }
        let positionStartPrecision = this.rawValue.length - 1 - this.options.precision;
        let positionEndPrecision = this.rawValue.length - 1;
        if (selectionStart >= positionStartPrecision && selectionStart <= positionEndPrecision) {
            if (this.rawValue && selectionStart == 0 && this.options.precision > 0) {
                this.rawValue = this.rawValue + '.';
                for (let index = 0; index < this.options.precision; index++) {
                    this.rawValue += '0';
                }
            }
            this.updateFieldTypingPrecision(selectionStart, this.options.precision);
        } else {
            this.updateFieldValue(selectionStart + 1);
        }
        //this.updateFieldValue(selectionStart + 1);
    }

    applyMask(isNumber: boolean, rawValue: string): string {
        let { allowNegative, decimal, precision, prefix, suffix, thousands } = this.options;
        rawValue = isNumber ? new Number(rawValue).toFixed(precision) : rawValue;
        let onlyNumbers = rawValue.replace(/[^0-9]/g, "");
        if (!onlyNumbers) {
            return "";
        }

        let integerPart = onlyNumbers.slice(0, onlyNumbers.length - precision).replace(/^0*/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
        if (integerPart == "") {
            integerPart = "0";
        }

        let newRawValue = integerPart;
        let decimalPart = onlyNumbers.slice(onlyNumbers.length - precision);
        if (precision > 0) {
            decimalPart = "0".repeat(precision - decimalPart.length) + decimalPart;
            newRawValue += decimal + decimalPart;
        }

        let isZero = parseInt(integerPart) == 0 && (parseInt(decimalPart) == 0 || decimalPart == "");
        let operator = (rawValue.indexOf("-") > -1 && allowNegative && !isZero) ? "-" : "";

        return operator + prefix + newRawValue + suffix;
    }

    clearMask(rawValue: string): number {
        if (rawValue == null || rawValue == "") {
            return null;
        }

        let value = rawValue.replace(this.options.prefix, "").replace(this.options.suffix, "");

        if (this.options.thousands) {
            value = value.replace(new RegExp("\\" + this.options.thousands, "g"), "");
        }

        if (this.options.decimal) {
            value = value.replace(this.options.decimal, ".");
        }

        return parseFloat(value);
    }

    changeToNegative(): void {
        console.log("changeToNegative");
        if (this.options.allowNegative && this.rawValue != "" && this.rawValue.charAt(0) != "-" && this.value != 0) {
            let selectionStart = this.inputSelection.selectionStart;
            this.rawValue = "-" + this.rawValue;
            this.updateFieldValue(selectionStart + 1);
        }
    }

    changeToPositive(): void {
        let selectionStart = this.inputSelection.selectionStart;
        this.rawValue = this.rawValue.replace("-", "");
        this.updateFieldValue(selectionStart - 1);

    }

    //Select all part precision of number
    changeToSelectPrecision(): void {
        let { allowNegative, decimal, precision, prefix, suffix, thousands } = this.options;
        this.updateFieldPresitionValue(precision);
    }

    //Move to position in input element
    movePositionCursor(posion: number): void {
        this.inputManager.setCursorAt(posion);
    }

    fixCursorPosition(forceToEndPosition?: boolean): void {
        let currentCursorPosition = this.inputSelection.selectionStart;

        //if the current cursor position is after the number end position, it is moved to the end of the number, ignoring the prefix or suffix. this behavior can be forced with forceToEndPosition flag
        if (currentCursorPosition > this.getRawValueWithoutSuffixEndPosition() || forceToEndPosition) {
            this.inputManager.setCursorAt(this.getRawValueWithoutSuffixEndPosition());
            //if the current cursor position is before the number start position, it is moved to the start of the number, ignoring the prefix or suffix
        } else if (currentCursorPosition < this.getRawValueWithoutPrefixStartPosition()) {
            this.inputManager.setCursorAt(this.getRawValueWithoutPrefixStartPosition());
        }
    }

    getRawValueWithoutSuffixEndPosition(): number {
        return this.rawValue.length - this.options.suffix.length;
    }

    getRawValueWithoutPrefixStartPosition(): number {
        return this.value != null && this.value < 0 ? this.options.prefix.length + 1 : this.options.prefix.length;
    }

    removeNumber(keyCode: number): void {
        let { decimal, thousands } = this.options;
        let selectionEnd = this.inputSelection.selectionEnd;
        let selectionStart = this.inputSelection.selectionStart;

        if (selectionStart > this.rawValue.length - this.options.suffix.length) {
            selectionEnd = this.rawValue.length - this.options.suffix.length;
            selectionStart = this.rawValue.length - this.options.suffix.length;
        }

        //there is no selection
        if (selectionEnd == selectionStart) {
            //delete key and the target digit is a number
            if ((keyCode == 46 || keyCode == 63272) && /^\d+$/.test(this.rawValue.substring(selectionStart, selectionEnd + 1))) {
                selectionEnd = selectionEnd + 1;
            }

            //delete key and the target digit is the decimal or thousands divider
            if ((keyCode == 46 || keyCode == 63272) && (this.rawValue.substring(selectionStart, selectionEnd + 1) == decimal || this.rawValue.substring(selectionStart, selectionEnd + 1) == thousands)) {
                selectionEnd = selectionEnd + 2;
                selectionStart = selectionStart + 1;
            }

            //backspace key and the target digit is a number
            if (keyCode == 8 && /^\d+$/.test(this.rawValue.substring(selectionStart - 1, selectionEnd))) {
                selectionStart = selectionStart - 1;
            }

            //backspace key and the target digit is the decimal or thousands divider
            if (keyCode == 8 && (this.rawValue.substring(selectionStart - 1, selectionEnd) == decimal || this.rawValue.substring(selectionStart - 1, selectionEnd) == thousands)) {
                selectionStart = selectionStart - 2;
                selectionEnd = selectionEnd - 1;
            }
        }

        this.rawValue = this.rawValue.substring(0, selectionStart) + this.rawValue.substring(selectionEnd, this.rawValue.length);

        // if ((selectionEnd - selectionStart) === 1) {
        //     let positionEnd = this.rawValue.length + 1;
        //     let positionStart = this.rawValue.length - this.options.precision + 2;
        //     if (selectionEnd <= positionEnd && selectionEnd >= positionStart) {
        //         this.rawValue = this.rawValue + '0';
        //     }
        // }
        if (selectionEnd > selectionStart) {
            let countCharRomve = selectionEnd - selectionStart;
            let positionEnd = this.rawValue.length + countCharRomve;
            let positionStart = this.rawValue.length - this.options.precision + countCharRomve + 1;
            if (selectionEnd <= positionEnd && selectionEnd >= positionStart) {
                for (let index = 0; index < countCharRomve; index++) {
                    this.rawValue = this.rawValue + '0';
                }
            }
        }
        this.updateFieldValue(selectionStart);
    }

    updateFieldHandlePase(selectionStart?: number): void {
        var regexp = new RegExp('^[0-9]*(\\.[0-9]{0,2})?$', 'g');
        if (regexp.test(this.rawValue)) {
            const getPrecision = this.rawValue.split('.')[1];
            if (getPrecision) {
                const countPrecision = this.options.precision - getPrecision.length;
                for (let index = 0; index < countPrecision; index++) {
                    this.rawValue += '0';
                }
            } else {
                this.rawValue += '.';
                for (let index = 0; index < this.options.precision; index++) {
                    this.rawValue += '0';
                }
            }
        }
        let newRawValue = this.applyMask(false, this.rawValue || "");
        selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart);
    }

    updateFieldValue(selectionStart?: number): void {
        let newRawValue = this.applyMask(false, this.rawValue || "");
        selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart);
    }

    updateFieldPresitionValue(precision: number): void {
        let newRawValue = this.applyMask(false, this.rawValue || "");
        this.inputManager.setSelectRange(this.rawValue.length - precision, this.rawValue.length);
    }

    updateFieldTypingPrecision(selectionStart: number, precision: number) {
        let newRawValue = this.applyMask(false, this.rawValue || "");
        selectionStart = selectionStart == undefined ? this.rawValue.length : selectionStart;
        this.inputManager.updateValueAndCursor(newRawValue, this.rawValue.length, selectionStart);
        console.log('selectionStart:' + selectionStart);
        if (selectionStart == 0) {
            this.inputManager.setCursorAt(selectionStart + 1);
        } else {
            this.inputManager.setSelectRange(selectionStart + 1, this.rawValue.length);
        }
    }

    updateOptions(options: any): void {
        let value: number = this.value;
        this.options = options;
        this.value = value;
    }

    get canInputMoreNumbers(): boolean {
        return this.inputManager.canInputMoreNumbers;
    }

    get inputSelection(): any {
        return this.inputManager.inputSelection;
    }

    get rawValue(): string {
        return this.inputManager.rawValue;
    }

    set rawValue(value: string) {
        this.inputManager.rawValue = value;
    }

    get storedRawValue(): string {
        return this.inputManager.storedRawValue;
    }

    get value(): number {
        return this.clearMask(this.rawValue);
    }

    set value(value: number) {
        this.rawValue = this.applyMask(true, "" + value);
    }
}