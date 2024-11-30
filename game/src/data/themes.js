// @ts-check

export const themes = [
    {
        name: "default",
        tokens: {
            functions: "#569CD6",
            classes: "#3DC9B0",
            brackets: "#FFD700",
            keywords: "#569CD6",
            comments: "#00FF00",
            strings: "#FF00FF",
            numbers: "#FFFF00",
            variables: "#00FFFF",
            types: "#FFA500",
            operators: "#A52A2A",
            punctuation: "#808080",
            attributes: "#FFC0CB",
            tags: "#800080",
            text: "#000000",
            background: "#FFFFFF",
        },
        associations: {
            // functions: /(?:function\s+(\w+)|(\w+)\s*=\s*\(.*\)\s*=>)/g,
            functions: /function\s*|=>\s*/g,
            // for words starting with a capital letter
            classes: /\b[A-Z]\w*\b/g,
            brackets: /[\(\)\[\]\{\}]/g,
            keywords:
                /\b(?:let|const|var|if|else|for|while|do|switch|case|break|continue|return|import|export|default|from|as|class|extends|super|this|new|try|catch|finally|throw|typeof|instanceof|void|delete|in|of|with|yield|async|await)\b/g,
        },
    },
];
