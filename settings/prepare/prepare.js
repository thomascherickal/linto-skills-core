/*
 * Copyright (c) 2017 Linagora.
 *
 * This file is part of Business-Logic-Server
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function (RED) {
    const debug = require("debug")("redmanager:flow:core:settings:prepare");

    function prepareFlow(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        if (this.context().flow.get('language') === undefined)
            this.context().flow.language = process.env.DEFAULT_LANGUAGE

        if (this.context().flow.register === undefined)
            this.context().flow.register = {
                "intent": []
            }

        node.on('input', function (msg) {
            let data = msg.topic.split('/')
            msg.topic = data[0] + "/tolinto/" + data[2] + "/nlp/file/" + data[5]
            node.send(msg)
        })
    }
    RED.nodes.registerType("prepare", prepareFlow);
};