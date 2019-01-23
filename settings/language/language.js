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
    const debug = require("debug")("redmanager:flow:core:settings:language");
    const fill = "blue";
    const shape = "dot";

    function selectLanguage(config) {
        if (config.language === "") return process.env.LANG.split("_")[0];
        else return config.language.split("_")[0];
    }

    function LanguageSelector(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.context().flow.language = selectLanguage(config);
        node.status({
            fill,
            shape,
            text: this.context().flow.language
        });
    }
    RED.nodes.registerType("language", LanguageSelector);
};