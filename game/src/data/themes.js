// @ts-check

export const themes = [
    {
        name: "default",
        tokens: {
            functions: "#41a7fa",
            classes: "#E5C07B",
            brackets: "#ABB2BF",
            keywords: "#C678DD",
            comments: "#5C6370",
            strings: "#98C379",
            numbers: "#D19A66",
            variables: "#fc5360",
            types: "#fca400",
            operators: "#71e6f5",
            punctuation: "#ABB2BF",
            attributes: "#D19A66",
            tags: "#E06C75",
            text: "#d5dff2",
            background: "#282C34",
            constants: "#D19A66",
            decorators: "#C678DD",
            regex: "#98C379",
            foreground: "#a1bcf0",
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
