module.exports = function (source) {
    return source.replace(/(require.*node_modules[/\\]+art-template[/\\]+lib[/\\]+runtime.js)/g, (word) => {
        return word.replace(/[/\\]+/g, '/');
    });
};