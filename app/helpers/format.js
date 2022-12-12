let formatLink = (value) => {
    if(value[1] == "/") {
        value = value.substr(1);
    };
    return value;
}

module.exports = {
    formatLink: formatLink
}