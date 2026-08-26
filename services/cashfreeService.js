const { Cashfree, CFEnvironment } = require("cashfree-pg");

const cashfree = new Cashfree(
    CFEnvironment.SANDBOX,
    "TEST430329ae80e0f32e41a393d78b923034",
    "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

module.exports = cashfree;