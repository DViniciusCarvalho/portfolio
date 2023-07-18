const splitCommand = (
    command
) => {

    const parts = [];
  
    let currentWord = '';
    let insideString = false;

    let isSingleQuote = false;
    let isDoubleQuote = false;

    for (let i = 0; i < command.length; i++) {
        const char = command[i];

        const isSingleQuoteStringStart = char === '\'' && !insideString;
        const isSingleQuoteStringEnd = char === '\'' && insideString && isSingleQuote;

        const isDoubleQuoteStringStart = char === '"' && !insideString;
        const isDoubleQuoteStringEnd = char === '"' && insideString && isDoubleQuote;

        const isSpace = char === ' ';

        if (isSingleQuoteStringStart) {
            insideString = true;
            isSingleQuote = true;
            currentWord += char;
            continue;
        }
        else if (isDoubleQuoteStringStart) {
            insideString = true;
            isDoubleQuote = true;
            currentWord += char;
            continue;
        }
        else if (isSingleQuoteStringEnd) {
            insideString = false;
            isSingleQuote = false;
            currentWord += char;
        }
        else if (isDoubleQuoteStringEnd) {
            insideString = false;
            isDoubleQuote = false;
            currentWord += char;
        }
        else if (isSpace) {
            if (insideString) {
                currentWord += char;
                continue;
            }
            else {

            }
        }
        else {
            currentWord += char;
            continue;
        }

        parts.push(currentWord);
        currentWord = '';
    }
  
    return parts.filter(part => part !== '');

}

console.log(splitCommand('cd /home/slaoq "porra menor se fode krl" && mkdir "pasta2 aaaaaaaaaa"'))