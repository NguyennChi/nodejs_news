const util  = require('util');
const notify= require(__path_configs + 'notify');

const options = {
    username: { min: 5, max: 30 },
    status: { value: 'novalue' }
}

module.exports = {
    validator: (req) => {
        // NAME
        req.checkBody('username', util.format(notify.ERROR_NAME, options.username.min, options.username.max) )
            .isLength({ min: options.username.min, max: options.username.max })

        // STATUS
        req.checkBody('status', notify.ERROR_STATUS)
            .isNotEqual(options.status.value);
    }
}