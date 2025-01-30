// @ts-check

export const themes = [
    {
        name: "default",
        tokens: {
            functions: "#61AFEF",
            classes: "#f27c0c",
            brackets: "#ABB2BF",
            keywords: "#C678DD",
            comments: "#5C6370",
            strings: "#98C379",
            numbers: "#f27c0c",
            variables: "#E06C75",
            types: "#E5C07B",
            operators: "#56B6C2",
            punctuation: "#ABB2BF",
            attributes: "#f27c0c",
            tags: "#E06C75",
            text: "#ABB2BF",
            background: "#282C34",
            constants: "#f27c0c",
            decorators: "#C678DD",
            regex: "#98C379",
            foreground: "#ABB2BF",
        },
        associations: {
            functions: /function\s*|=>\s*/g,
            classes: /\b[A-Z]\w*\b/g,
            brackets: /[\(\)\[\]\{\}]/g,
            keywords:
                /\b(?:let|const|var|if|else|for|while|do|switch|case|break|continue|return|import|export|default|from|as|class|extends|super|this|new|try|catch|finally|throw|typeof|instanceof|void|delete|in|of|with|yield|async|await|constructor)\b/g,
            constants: /\b[A-Z_][A-Z0-9_]*\b/g,
            decorators: /@\w+/g,
            regex: /\/(\\\/|[^\/\n])+\/[gimsuy]*/g,
            strings: /"(\\.|[^"\\])*"|'(\\.|[^'\\])*'/g,
            punctuation: /[\.,;:]/g,
        },
    },
];
